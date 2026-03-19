export const verificationContent = {
  defaults: {
    code: {
      email: {
        subject: "Your verification code",
        getText: ({ code }) => `Your verification code is: ${code}`,
        getHtml: ({ code }) =>
          `<p>Your verification code is: <strong>${code}</strong></p>`,
      },
      sms: {
        getText: ({ code }) => `Your verification code is: ${code}`,
      },
    },

    link: {
      email: {
        subject: "Verify your details",
        getText: ({ verifyUrl }) =>
          `Use this link to verify your details: ${verifyUrl}`,
        getHtml: ({ verifyUrl }) =>
          `<p>Use this link to verify your details:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
      },
      sms: {
        getText: ({ verifyUrl }) =>
          `Use this link to verify your details: ${verifyUrl}`,
      },
    },
  },

  targets: {
    user: {
      code: {
        email: {
          subject: "Verify your account",
          getText: ({ code }) =>
            `Use this verification code to finish setting up your account: ${code}`,
          getHtml: ({ code }) =>
            `<p>Use this verification code to finish setting up your account:</p><p><strong>${code}</strong></p>`,
        },
        sms: {
          getText: ({ code }) =>
            `Use this verification code to finish setting up your account: ${code}`,
        },
      },
    },

    lead: {
      link: {
        email: {
          subject: "Confirm your details",
          getText: ({ verifyUrl }) =>
            `Please confirm your details using this link: ${verifyUrl}`,
          getHtml: ({ verifyUrl }) =>
            `<p>Please confirm your details using this link:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
        },
        sms: {
          getText: ({ verifyUrl }) =>
            `Please confirm your details using this link: ${verifyUrl}`,
        },
      },
    },
  },
};