export const AUTH_MESSAGES = {
  common: {
    serverError: "Server error",
    invalidIdentifier: "Enter a valid email or phone number.",
    identifierRequired: "Email or phone number is required.",
    identifierAndPasswordRequired: "Email or phone number and password are required.",
    identifierAndCodeRequired: "Identifier and code are required.",
  },

  signup: {
    userExists: "User already exists.",
    accountCreated: "Account created successfully.",
    weakPassword: "Password does not meet the minimum requirements.",
  },

  login: {
    invalidCredentials: "Invalid credentials.",
    verifyEmailFirst: "Please verify your email before logging in.",
    verifyPhoneFirst: "Please verify your phone before logging in.",
    loginSuccess: "Login successful",
  },

  verification: {
    codeSent: "Verification code sent",
    noCodeFound: "No verification code found. Please request a new code.",
    codeExpired: "Code expired. Please request a new code.",
    invalidCode: "Invalid code. Please use the most recent code sent to you.",
    verificationSuccess: "Verification successful",
    noMatchingRecord: "No matching user or lead found.",
    noSessionFound: "No verification session found. Please sign up or log in again.",
    noIdentifierForVerification: "No identifier found for verification.",
    incompleteCode: "Please enter the full verification code.",
    autoCodeSent: "A verification code has been sent.",
    resendCodeSent: "A new verification code has been sent.",
  },

  lead: {
    leadExists: "You are already on the list.",
    leadCaptured: "Lead captured successfully.",
  },
};