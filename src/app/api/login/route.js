import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth/sessionServer";
import { AUTH_MESSAGES } from "@/customerAccess/config/authMessages";
import { parseIdentifier } from "@/customerAccess/utils/identifier";

export async function POST(request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return Response.json(
        { error: AUTH_MESSAGES.common.identifierAndPasswordRequired },
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

    const { email, phone, type } = parsed;

    const user = await prisma.user.findFirst({
      where: email ? { email } : { phone },
    });

    if (!user) {
      return Response.json(
        { error: AUTH_MESSAGES.login.invalidCredentials },
        { status: 401 }
      );
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return Response.json(
        { error: AUTH_MESSAGES.login.invalidCredentials },
        { status: 401 }
      );
    }

    if (type === "email" && !user.emailVerifiedAt) {
      return Response.json(
        {
          error: AUTH_MESSAGES.login.verifyEmailFirst,
          needsVerification: true,
        },
        { status: 403 }
      );
    }

    if (type === "phone" && !user.phoneVerifiedAt) {
      return Response.json(
        {
          error: AUTH_MESSAGES.login.verifyPhoneFirst,
          needsVerification: true,
        },
        { status: 403 }
      );
    }

    await createSession(user.id);

    return Response.json({
      message: AUTH_MESSAGES.login.loginSuccess,
      user: {
        id: user.id,
        name: user.name,
        adminLevel: user.adminLevel,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return Response.json(
      {
        error: AUTH_MESSAGES.common.serverError,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}