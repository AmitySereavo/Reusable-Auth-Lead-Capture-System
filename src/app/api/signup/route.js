import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { AUTH_RULES } from "@/customerAccess/config/authRules";
import { AUTH_MESSAGES } from "@/customerAccess/config/authMessages";
import { parseIdentifier } from "@/customerAccess/utils/identifier";
import {
  checkRateLimit,
  getRateLimitKey,
  rateLimitResponse,
} from "@/lib/auth/rateLimit";


export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier, password, fullName, country, city } = body;

      const rateLimit = checkRateLimit({
      key: getRateLimitKey(request, "signup", identifier),
      ...AUTH_RULES.rateLimit.signup,
    });

    if (!rateLimit.ok) {
      return rateLimitResponse(rateLimit);
    }


    if (!identifier || !password) {
      return Response.json(
        { error: AUTH_MESSAGES.common.identifierAndPasswordRequired },
        { status: 400 }
      );
    }

    // Put the password check HERE
    if (String(password).length < AUTH_RULES.password.minLength) {
      return Response.json(
        {
          error: `Password must be at least ${AUTH_RULES.password.minLength} characters.`,
        },
        { status: 400 }
      );
    }

    const parsed = parseIdentifier(identifier);

    if (!parsed.valid) {
      return Response.json(
        { error: "Enter a valid email or phone number." },
        { status: 400 }
      );
    }

    const { email, phone } = parsed;

    const existingUser = await prisma.user.findFirst({
      where: email ? { email } : { phone },
    });

    if (existingUser) {
      return Response.json(
        { error: AUTH_MESSAGES.signup.userExists },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userCount = await prisma.user.count();
    const adminLevel = userCount === 0 ? 1 : 0;

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        name: fullName || null,
        country: country || null,
        city: city || null,
        adminLevel,
      },
    });

    return Response.json({
      message: AUTH_MESSAGES.signup.accountCreated,
      user,
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);

    return Response.json(
      {
        error: AUTH_MESSAGES.common.serverError,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}