import { buildDeliverySuccessResult } from "../result";

export async function sendSmsVerification({
  to,
  originalTo = to,
  rewritten = false,
  text,
  from,
}) {
  console.log("SMS VERIFICATION");
  console.log({
    to,
    originalTo,
    rewritten,
    from,
    text,
  });

  return buildDeliverySuccessResult({
    provider: "sms-console",
    channel: "sms",
    mode: "console",
    to,
    originalTo,
    rewritten,
    providerMessageId: null,
    status: "simulated",
  });
}