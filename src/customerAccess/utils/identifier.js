import { AUTH_RULES } from "../config/authRules";

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

export function normalizeEmail(value) {
  return String(value).trim().toLowerCase();
}

export function normalizePhone(value) {
  return String(value).replace(/[^\d+]/g, "");
}

export function isPhone(value, minLength = AUTH_RULES.phone.minLength) {
  const normalized = normalizePhone(value);
  return normalized.length >= minLength;
}

export function parseIdentifier(
  rawIdentifier,
  minPhoneLength = AUTH_RULES.phone.minLength
) {
  const trimmed = String(rawIdentifier || "").trim();

  if (!trimmed) {
    return {
      valid: false,
      email: null,
      phone: null,
      normalizedIdentifier: "",
      type: null,
    };
  }

  if (isEmail(trimmed)) {
    const email = normalizeEmail(trimmed);

    return {
      valid: true,
      email,
      phone: null,
      normalizedIdentifier: email,
      type: "email",
    };
  }

  const phone = normalizePhone(trimmed);

  if (isPhone(phone, minPhoneLength)) {
    return {
      valid: true,
      email: null,
      phone,
      normalizedIdentifier: phone,
      type: "phone",
    };
  }

  return {
    valid: false,
    email: null,
    phone: null,
    normalizedIdentifier: trimmed,
    type: null,
  };
}