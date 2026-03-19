export const AUTH_RULES = {
  phone: {
    minLength: 10,
    maxLength: 20,
  },
  password: {
    minLength: 8,
    signupMinLength: 8,
    signupMaxLength: 128,
  },
  verification: {
    codeLength: 6,
    resendCooldownSeconds: 60,
    defaultExpiryMinutes: 10,
  },
};