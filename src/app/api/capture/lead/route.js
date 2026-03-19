import { prisma } from "@/lib/prisma";
import { parseIdentifier } from "@/customerAccess/utils/identifier";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      fullName,
      identifier,
      country,
      city,
      addressLine1,
      addressLine2,
      postalCode,
      businessName,
      preferredContactMethod,
      updatesOptIn,
    } = body;

    if (!identifier || String(identifier).trim() === "") {
      return Response.json(
        { error: "Email or phone number is required." },
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

    const existingLead = await prisma.lead.findFirst({
      where: email ? { email } : { phone },
    });

    if (existingLead) {
      return Response.json({
        message: "You are already on the list.",
        lead: existingLead,
      });
    }

    const lead = await prisma.lead.create({
      data: {
        firstName: firstName || null,
        lastName: lastName || null,
        fullName: fullName || null,
        email,
        phone,
        country: country || null,
        city: city || null,
        addressLine1: addressLine1 || null,
        addressLine2: addressLine2 || null,
        postalCode: postalCode || null,
        businessName: businessName || null,
        preferredContactMethod: preferredContactMethod || null,
        updatesOptIn: !!updatesOptIn,
      },
    });

    return Response.json({
      message: "Lead captured successfully.",
      lead,
    });
  } catch (error) {
    console.error("LEAD CAPTURE ERROR:", error);

    return Response.json(
      {
        error: "Server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}