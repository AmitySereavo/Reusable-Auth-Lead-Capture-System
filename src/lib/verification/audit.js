import { prisma } from "@/lib/prisma";

export async function createVerificationDeliveryAttempt({
  identifier,
  delivery,
  target = null,
  successRedirect = null,
  verificationCodeId = null,
  verificationTokenId = null,
  result,
  contextMetadata = null,
}) {
  try {
    await prisma.verificationDeliveryAttempt.create({
      data: {
        purpose: "verification",
        delivery,
        channel: result.channel,
        provider: result.provider,
        mode: result.mode,
        identifier,
        to: result.to,
        originalTo: result.originalTo,
        rewritten: Boolean(result.rewritten),
        target,
        successRedirect,
        verificationCodeId,
        verificationTokenId,
        ok: Boolean(result.ok),
        status: result.status,
        providerMessageId: result.providerMessageId || null,
        errorCode: result.error?.code || null,
        errorMessage: result.error?.message || null,
        errorCategory: result.error?.category || null,
        metadata: contextMetadata,
      },
    });
  } catch (error) {
    console.error("VERIFICATION DELIVERY AUDIT LOG ERROR:", error);
  }
}