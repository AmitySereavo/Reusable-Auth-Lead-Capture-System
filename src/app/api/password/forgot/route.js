import { AUTH_MESSAGES } from "@/customerAccess/config/authMessages";
import { parseIdentifier } from "@/customerAccess/utils/identifier";
import { prisma } from "@/lib/prisma";
import { sendVerificationDelivery } from "@/lib/verification/delivery";
import {
  createEmailPasswordResetToken,
  createPhonePasswordResetChallenge,
} from "@/lib/auth/passwordReset";

export async function POST(request) {
  try {
    const { identifier, phoneChannel } = await request.json();

    if (!identifier) {
      return Response.json(
        { error: AUTH_MESSAGES.common.identifierRequired },
        { status: 400 }
      );
    }

    const parsed = parseIdentifier(identifier);

    if (!parsed.valid) {
      return Response.json(
        { error: AUTH_MESSAGES.common.invalidIdentifier },
        { status: 400 }
      );
    }

    if (parsed.type === "email") {
      const user = await prisma.user.findFirst({
        where: {
          email: parsed.email,
          emailVerifiedAt: { not: null },
        },
      });

      if (user?.email) {
        const { rawToken } = await createEmailPasswordResetToken(user);

        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        const verifyUrl = `${baseUrl}/reset-password?token=${rawToken}`;

        await sendVerificationDelivery({
          identifier: user.email,
          delivery: "link",
          verifyUrl,
          target: "passwordReset",
          contextMetadata: {
            purpose: "password-reset",
          },
        });
      }

      return Response.json({
        ok: true,
        nextStep: "done",
        message: AUTH_MESSAGES.passwordReset.emailLinkSentNeutral,
      });
    }

    if (!phoneChannel || !["sms", "whatsapp"].includes(phoneChannel)) {
      return Response.json(
        { error: AUTH_MESSAGES.passwordReset.choosePhoneChannel },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        phone: parsed.phone,
        phoneVerifiedAt: { not: null },
      },
    });

    if (user?.phone) {
      const { code } = await createPhonePasswordResetChallenge({
        user,
        identifier: user.phone,
        channel: phoneChannel,
      });

      await sendVerificationDelivery({
        identifier: user.phone,
        delivery: "code",
        code,
        phoneChannel,
        target: "passwordReset",
        contextMetadata: {
          purpose: "password-reset",
        },
      });

      return Response.json({
        ok: true,
        nextStep: "enter-code",
        identifier: user.phone,
        phoneChannel,
        message: AUTH_MESSAGES.passwordReset.codeSent,
      });
    }

    return Response.json({
      ok: true,
      nextStep: "done",
      message: AUTH_MESSAGES.passwordReset.phoneCodeSentNeutral,
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return Response.json(
      {
        error: AUTH_MESSAGES.common.serverError,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}