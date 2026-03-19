export const quickLeadConfig = {
  mode: "lead-capture",
  target: "lead",

  fields: {
    fullName: { visible: true, required: true },
    identifier: { visible: true, required: true, allow: ["email", "phone"] },
    updatesOptIn: { visible: true, required: false, defaultValue: true },
  },

  verification: {
    required: true,
    autoStart: true,
    method: "same-as-identifier",
    delivery: "link",
    redirectToVerifyPage: false,
    successRedirect: "/verify/verified-lead",
    expiresInMinutes: 15,
    expiresInHours: 24,
  },

  submit: {
    endpoint: "/api/capture/lead",
    buttonLabel: "Join List",
    successMessage: "Thanks. Your info was submitted.",
    successRedirect: "/verify/link-sent",
    redirectDelayMs: 1200,
  },
};