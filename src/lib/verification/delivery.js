import { verificationProviders } from "@/customerAccess/config/verificationProviders";
import { verificationContent } from "@/customerAccess/config/verificationContent";
import { sendEmailVerification } from "./providers/emailConsole";
import { sendEmailVerificationWithResend } from "./providers/emailResend";
import { sendSmsVerification } from "./providers/smsConsole";
import { sendSmsVerificationWithTwilio } from "./providers/smsTwilio";
import { createVerificationDeliveryAttempt } from "./audit";
import { buildDeliveryErrorResult, normalizeProviderError } from "./result";

function isEmailIdentifier(identifier) {
  return typeof identifier === "string" && identifier.includes("@");
}

function getChannelKey(identifier) {
  return isEmailIdentifier(identifier) ? "email" : "sms";
}

function resolveContentConfig({ delivery, channel, target = null }) {
  const targetConfig =
    target &&
    verificationContent?.targets?.[target]?.[delivery]?.[channel];

  if (targetConfig) {
    return targetConfig;
  }

  const defaultConfig = verificationContent?.defaults?.[delivery]?.[channel];

  if (defaultConfig) {
    return defaultConfig;
  }

  throw new Error(
    `Missing verification content config for target=${target || "default"}, delivery=${delivery}, channel=${channel}`
  );
}

function getResolvedContent({
  identifier,
  delivery,
  code = null,
  verifyUrl = null,
  target = null,
}) {
  const channel = getChannelKey(identifier);
  const config = resolveContentConfig({
    delivery,
    channel,
    target,
  });

  return {
    channel,
    subject: config.subject || null,
    text: config.getText({ code, verifyUrl, target }),
    html: config.getHtml ? config.getHtml({ code, verifyUrl, target }) : null,
  };
}

function isResendTestInbox(email) {
  return typeof email === "string" && email.toLowerCase().endsWith("@resend.dev");
}

function resolveDevSafeEmailRecipient(provider, identifier) {
  if (!provider.devTestMode) {
    return {
      to: identifier,
      rewritten: false,
      originalTo: identifier,
    };
  }

  if (isResendTestInbox(identifier)) {
    return {
      to: identifier,
      rewritten: false,
      originalTo: identifier,
    };
  }

  return {
    to: provider.devTestInbox,
    rewritten: true,
    originalTo: identifier,
  };
}

async function sendEmailViaProvider({
  provider,
  identifier,
  subject,
  text,
  html,
}) {
  if (provider.mode === "console") {
    return sendEmailVerification({
      to: identifier,
      originalTo: identifier,
      rewritten: false,
      from: provider.from,
      subject,
      text,
      html,
    });
  }

  if (provider.mode === "resend") {
    const recipient = resolveDevSafeEmailRecipient(provider, identifier);

    const finalText = recipient.rewritten
      ? `[DEV TEST MODE] Original recipient: ${recipient.originalTo}\n\n${text}`
      : text;

    const finalHtml =
      recipient.rewritten && html
        ? `<p><strong>[DEV TEST MODE]</strong> Original recipient: ${recipient.originalTo}</p>${html}`
        : html;

    return sendEmailVerificationWithResend({
      to: recipient.to,
      originalTo: recipient.originalTo,
      rewritten: recipient.rewritten,
      from: provider.from,
      subject,
      text: finalText,
      html: finalHtml,
    });
  }

  throw new Error(`Unsupported email provider mode: ${provider.mode}`);
}

async function sendSmsViaProvider({
  provider,
  identifier,
  text,
}) {
  if (provider.mode === "console") {
    return sendSmsVerification({
      to: identifier,
      originalTo: identifier,
      rewritten: false,
      from: provider.from,
      text,
    });
  }

  if (provider.mode === "twilio") {
    return sendSmsVerificationWithTwilio({
      to: identifier,
      originalTo: identifier,
      rewritten: false,
      from: provider.from,
      messagingServiceSid: provider.messagingServiceSid || null,
      text,
    });
  }

  throw new Error(`Unsupported sms provider mode: ${provider.mode}`);
}

function getFallbackProviderName({ channel, provider }) {
  if (channel === "email") {
    return provider.mode === "resend" ? "resend" : "email-console";
  }

  if (provider.mode === "twilio") {
    return "twilio";
  }

  return "sms-console";
}

export async function sendVerificationDelivery({
  identifier,
  delivery,
  code = null,
  verifyUrl = null,
  target = null,
  successRedirect = null,
  verificationCodeId = null,
  verificationTokenId = null,
  contextMetadata = null,
}) {
  if (delivery === "code" && !code) {
    throw new Error("Missing verification code for code delivery.");
  }

  if (delivery === "link" && !verifyUrl) {
    throw new Error("Missing verification URL for link delivery.");
  }

  const content = getResolvedContent({
    identifier,
    delivery,
    code,
    verifyUrl,
    target,
  });

  const provider =
    content.channel === "email"
      ? verificationProviders.email
      : verificationProviders.sms;

  try {
    const result =
      content.channel === "email"
        ? await sendEmailViaProvider({
            provider,
            identifier,
            subject: content.subject,
            text: content.text,
            html: content.html,
          })
        : await sendSmsViaProvider({
            provider,
            identifier,
            text: content.text,
          });

    await createVerificationDeliveryAttempt({
      identifier,
      delivery,
      target,
      successRedirect,
      verificationCodeId,
      verificationTokenId,
      result,
      contextMetadata: {
        ...(contextMetadata || {}),
        contentChannel: content.channel,
      },
    });

    return result;
  } catch (error) {
    const normalized = normalizeProviderError(error);

    const errorResult = buildDeliveryErrorResult({
      provider: getFallbackProviderName({
        channel: content.channel,
        provider,
      }),
      channel: content.channel,
      mode: provider.mode,
      to: identifier,
      originalTo: identifier,
      rewritten: false,
      code: normalized.code,
      message: normalized.message,
      category: normalized.category,
    });

    await createVerificationDeliveryAttempt({
      identifier,
      delivery,
      target,
      successRedirect,
      verificationCodeId,
      verificationTokenId,
      result: errorResult,
      contextMetadata: {
        ...(contextMetadata || {}),
        contentChannel: content.channel,
        exception: true,
      },
    });

    return errorResult;
  }
}