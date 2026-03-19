export const verificationProviders = {
  email: {
    mode: process.env.RESEND_API_KEY ? "resend" : "console",
    from: process.env.RESEND_FROM_EMAIL || "no-reply@example.com",
    devTestMode: process.env.NODE_ENV !== "production",
    devTestInbox: process.env.RESEND_DEV_TEST_EMAIL || "delivered@resend.dev",
  },
  sms: {
    mode: process.env.TWILIO_ACCOUNT_SID ? "twilio" : "console",
    from: process.env.TWILIO_SMS_FROM || null,
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID || null,
  },
};