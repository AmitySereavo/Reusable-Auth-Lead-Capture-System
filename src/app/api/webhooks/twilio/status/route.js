import { updateVerificationDeliveryAttemptByProviderMessageId } from "@/lib/verification/audit";

function mapTwilioStatusToOk(status) {
  if (!status) return null;

  const normalized = String(status).toLowerCase();

  if (["delivered", "sent"].includes(normalized)) {
    return true;
  }

  if (["failed", "undelivered", "canceled"].includes(normalized)) {
    return false;
  }

  return null;
}

function mapTwilioErrorCategory(errorCode, status) {
  if (!errorCode) {
    if (status === "undelivered" || status === "failed") {
      return "provider";
    }
    return null;
  }

  return "provider";
}

export async function POST(request) {
  try {
    const formData = await request.formData();

    const messageSid = formData.get("MessageSid")?.toString() || null;
    const messageStatus = formData.get("MessageStatus")?.toString() || null;
    const errorCode = formData.get("ErrorCode")?.toString() || null;
    const errorMessage = formData.get("ErrorMessage")?.toString() || null;
    const to = formData.get("To")?.toString() || null;
    const from = formData.get("From")?.toString() || null;

    await updateVerificationDeliveryAttemptByProviderMessageId({
      providerMessageId: messageSid,
      status: messageStatus,
      ok: mapTwilioStatusToOk(messageStatus),
      errorCode,
      errorMessage,
      errorCategory: mapTwilioErrorCategory(errorCode, messageStatus),
      metadataPatch: {
        twilioStatusCallback: true,
        twilioTo: to,
        twilioFrom: from,
        twilioMessageStatus: messageStatus,
        twilioErrorCode: errorCode,
        twilioErrorMessage: errorMessage,
      },
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("TWILIO STATUS WEBHOOK ERROR:", error);
    return new Response("Webhook error", { status: 500 });
  }
}