import { prisma } from "@/lib/prisma";
import { AUTH_MESSAGES } from "@/customerAccess/config/authMessages";
import { parseIdentifier } from "@/customerAccess/utils/identifier";

export async function POST(request) {
  try {
    const { identifier, code } = await request.json();

    if (!identifier || !code) {
      return Response.json(
        { error: AUTH_MESSAGES.common.identifierAndCodeRequired },
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

    const { email, phone, normalizedIdentifier, type } = parsed;

    const latestRecord = await prisma.verificationCode.findFirst({
      where: {
        identifier: normalizedIdentifier,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!latestRecord) {
      return Response.json(
        { error: AUTH_MESSAGES.verification.noCodeFound },
        { status: 400 }
      );
    }

    if (latestRecord.expiresAt < new Date()) {
      await prisma.verificationCode.deleteMany({
        where: {
          identifier: normalizedIdentifier,
        },
      });

      return Response.json(
        { error: AUTH_MESSAGES.verification.codeExpired },
        { status: 400 }
      );
    }

    if (latestRecord.code !== code) {
      return Response.json(
        { error: AUTH_MESSAGES.verification.invalidCode },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: email ? { email } : { phone },
    });

    const lead = await prisma.lead.findFirst({
      where: email ? { email } : { phone },
    });

    if (!user && !lead) {
      await prisma.verificationCode.deleteMany({
        where: {
          identifier: normalizedIdentifier,
        },
      });

      return Response.json(
        { error: AUTH_MESSAGES.verification.noMatchingRecord },
        { status: 404 }
      );
    }

    const now = new Date();
    const verificationData =
      type === "email"
        ? { emailVerifiedAt: now }
        : { phoneVerifiedAt: now };

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: verificationData,
      });
    }

    if (lead) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: verificationData,
      });
    }

    await prisma.verificationCode.deleteMany({
      where: {
        identifier: normalizedIdentifier,
      },
    });

    return Response.json({
      message: AUTH_MESSAGES.verification.verificationSuccess,
    });
  } catch (error) {
    console.error("VERIFY CHECK ERROR:", error);

    return Response.json(
      {
        error: AUTH_MESSAGES.common.serverError,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}