`AUTH_REGRESSION_CHECKLIST.md`

Replace the full file with this updated checklist:

````md
# Auth Regression Checklist

Use this checklist after every auth/security/delivery change and before committing.

This project is currently focused on:

- email-first production readiness
- Nodemailer SMTP delivery
- WhatsApp API readiness after Meta business verification
- SMS/Twilio paused unless a business specifically enables it
- config-driven password policy
- reusable auth system preparation for future merge into reusable-slide-pages

---

## Build Check

- [ ] Run `npm run build`
- [ ] Confirm the build completes without errors
- [ ] Confirm there are no new import warnings
- [ ] Confirm Prisma client is generated if schema changed

```bash
npm run build
```

---

## Signup + Verification

### Email Signup

- [ ] Go to `/signup`
- [ ] Sign up with an email address
- [ ] Confirm account is created
- [ ] Confirm verification starts
- [ ] Confirm verification code/link is sent through the configured email provider
- [ ] Confirm `VerificationCode.code` stores a bcrypt hash, not the raw code
- [ ] Submit the correct verification code
- [ ] Confirm account becomes verified
- [ ] Confirm login works after verification

### Existing Unverified User Signup

- [ ] Create a user but do not verify them
- [ ] Go back to `/signup`
- [ ] Sign up again with the same email or phone
- [ ] Confirm the app does **not** dead-end with only “User already exists”
- [ ] Confirm the app starts verification again
- [ ] Confirm the user receives a fresh verification code/link
- [ ] Confirm the user is routed to `/verify`
- [ ] Complete verification
- [ ] Confirm login works after verification

### Existing Verified User Signup

- [ ] Create and verify a user
- [ ] Try to sign up again with the same verified email or phone
- [ ] Confirm signup is blocked
- [ ] Confirm the user sees “User already exists”

---

## Phone Signup + WhatsApp

- [ ] Go to `/signup`
- [ ] Enter a phone number with country code
- [ ] Confirm phone channel choice appears
- [ ] Confirm WhatsApp is visible and selectable
- [ ] Confirm SMS is visible but disabled if SMS is paused
- [ ] Choose WhatsApp
- [ ] Submit signup
- [ ] Confirm verification starts
- [ ] Confirm delivery attempt is logged

Expected log when WhatsApp is in console mode:

```txt
channel: whatsapp
provider: whatsapp-console
mode: console
status: simulated
```

Expected log when WhatsApp Meta API is active:

```txt
channel: whatsapp
provider: meta-whatsapp
mode: meta
status: sent
```

- [ ] If Meta returns a `wamid`, confirm it is stored as provider message id
- [ ] Confirm the user can complete verification if the code is received

---

## SMS / Twilio Pause Check

SMS is currently paused unless a specific business enables it.

- [ ] Confirm SMS is not required for signup
- [ ] Confirm SMS is not required for forgot-password
- [ ] Confirm SMS option is visible but disabled when paused
- [ ] Confirm disabled SMS has a clear message, such as “SMS verification is not available yet”
- [ ] Confirm server config blocks SMS if disabled
- [ ] Confirm `enabledPhoneChannels` does not include `sms` unless SMS is intentionally enabled

Config location:

```txt
src/customerAccess/config/authRules.js
```

Expected paused config:

```js
verification: {
  enabledPhoneChannels: ["whatsapp"],
}
```

To enable SMS later:

```js
verification: {
  enabledPhoneChannels: ["whatsapp", "sms"],
}
```

---

## Login + Session

- [ ] Go to `/login`
- [ ] Log in with verified email
- [ ] Confirm redirect to `/dashboard`
- [ ] Confirm `/api/session` returns authenticated state
- [ ] Refresh dashboard and confirm session remains active
- [ ] Click logout
- [ ] Confirm session is revoked server-side
- [ ] Confirm session cookie is cleared
- [ ] Confirm `/dashboard` no longer renders when logged out

---

## Unverified Login Flow

- [ ] Create a user but do not verify them
- [ ] Try to log in
- [ ] Confirm login is blocked
- [ ] Confirm message says verification is needed
- [ ] Confirm verification context is saved
- [ ] Confirm user is routed to `/verify`
- [ ] Complete verification
- [ ] Confirm user can log in afterward

---

## Password Policy

Password policy config lives in:

```txt
src/customerAccess/config/authRules.js
```

Expected password policy shape:

```js
password: {
  minLength: 8,
  signupMinLength: 8,
  signupMaxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialCharacter: true,
  specialCharacterPattern: "[^A-Za-z0-9]",
  strength: {
    mediumScore: 3,
    strongScore: 5,
  },
}
```

### Signup Password UX

- [ ] Go to `/signup`
- [ ] Confirm password field has Show/Hide toggle
- [ ] Confirm confirm-password field has Show/Hide toggle
- [ ] Type a weak password
- [ ] Confirm live strength says weak
- [ ] Type a medium password
- [ ] Confirm live strength says medium
- [ ] Type a strong password
- [ ] Confirm live strength says strong
- [ ] Confirm requirement checklist updates while typing
- [ ] Confirm missing uppercase is detected
- [ ] Confirm missing lowercase is detected
- [ ] Confirm missing number is detected
- [ ] Confirm missing special character is detected
- [ ] Confirm password shorter than minimum is blocked
- [ ] Confirm password longer than max is blocked if applicable

### Confirm Password UX

- [ ] Confirm password field says user should type the password again instead of pasting
- [ ] Copy password
- [ ] Try to paste into confirm password
- [ ] Confirm paste is blocked
- [ ] Try drag/drop into confirm password
- [ ] Confirm drop is blocked
- [ ] Type a mismatched confirm password
- [ ] Confirm “Passwords do not match yet” appears
- [ ] Type matching confirm password
- [ ] Confirm “✓ Passwords match” appears

### Server-Side Password Policy

- [ ] Submit weak password through signup
- [ ] Confirm server rejects it
- [ ] Submit password missing uppercase
- [ ] Confirm server rejects it if uppercase is required
- [ ] Submit password missing number
- [ ] Confirm server rejects it if number is required
- [ ] Submit password missing special character
- [ ] Confirm server rejects it if special character is required
- [ ] Submit valid password
- [ ] Confirm server accepts it

---

## Verification Code Attempt Limit

- [ ] Request a verification code
- [ ] Enter the wrong code repeatedly
- [ ] Confirm failed attempts increment
- [ ] Confirm attempts are blocked after `AUTH_RULES.verification.maxCodeAttempts`
- [ ] Confirm blocked response uses the configured message
- [ ] Request a new code
- [ ] Confirm new code works

Config location:

```txt
src/customerAccess/config/authRules.js
```

Expected config:

```js
verification: {
  maxCodeAttempts: 5,
}
```

---

## Verification Resend Cooldown

- [ ] Request a verification code
- [ ] Immediately request another verification code
- [ ] Confirm cooldown blocks the second request
- [ ] Confirm response includes `retryAfterSeconds`
- [ ] Wait until cooldown expires
- [ ] Request again
- [ ] Confirm new code/link can be sent

Expected config:

```js
verification: {
  resendCooldownSeconds: 60,
}
```

Production note:

- [ ] For WhatsApp production usage, confirm resend cooldown is tight enough to manage message costs
- [ ] For each business, review resend cooldown before launch

---

## WhatsApp Production Setup Checklist

Use this when a business is ready for WhatsApp verification in production.

- [ ] Confirm Meta Business Account is verified
- [ ] Confirm WhatsApp Business Account is visible in Meta Business settings
- [ ] Confirm app has WhatsApp Business Messaging permission
- [ ] Confirm app has WhatsApp Business Management permission if needed
- [ ] Confirm production phone number is connected
- [ ] Confirm test phone number is replaced with production phone number
- [ ] Confirm WhatsApp message template can be created
- [ ] Confirm WhatsApp template category is Authentication
- [ ] Confirm template name matches `.env`
- [ ] Confirm template language matches `.env`
- [ ] Confirm template body uses the correct variable position for the code
- [ ] Confirm WhatsApp template expiry/validity period matches app verification expiry
- [ ] Confirm app verification expiry is appropriate for this business
- [ ] Confirm resend cooldown is appropriate for this business
- [ ] Confirm verification-start rate limit is appropriate for this business
- [ ] Confirm wrong-code attempt limit is appropriate for this business
- [ ] Confirm SMS is disabled, enabled, or hidden based on this business setup
- [ ] Confirm WhatsApp pricing risk is reviewed before production
- [ ] Confirm delivery is tested on a real phone
- [ ] Confirm delivery failures are logged
- [ ] Confirm customer can complete `/verify` using the WhatsApp code

Suggested production review items per business:

```txt
WhatsApp template validity period
App code expiry time
Resend cooldown
Rate limit
Wrong-code attempts
Enabled phone channels
WhatsApp/SMS visibility
WhatsApp pricing exposure
```

---

## Forgot Password by Email

- [ ] Go to `/forgot-password`
- [ ] Enter a verified email
- [ ] Confirm neutral success message appears
- [ ] Confirm reset link is sent
- [ ] Immediately request another reset link
- [ ] Confirm cooldown blocks repeat request
- [ ] Open reset link
- [ ] Confirm `/reset-password?token=...` opens
- [ ] Confirm password field has Show/Hide toggle
- [ ] Confirm confirm-password field has Show/Hide toggle
- [ ] Confirm password strength appears while typing
- [ ] Confirm confirm-password paste is blocked
- [ ] Confirm confirm-password match/mismatch feedback appears
- [ ] Enter valid new password
- [ ] Confirm password updates
- [ ] Confirm old sessions are revoked
- [ ] Confirm new password works

---

## Forgot Password by WhatsApp

- [ ] Go to `/forgot-password`
- [ ] Enter a verified phone number
- [ ] Confirm WhatsApp/SMS choice appears
- [ ] Confirm SMS is disabled if SMS is paused
- [ ] Choose WhatsApp
- [ ] Confirm reset code is sent through WhatsApp provider
- [ ] Immediately request another reset code
- [ ] Confirm cooldown blocks repeat request
- [ ] Enter the correct reset code at `/forgot-password/code`
- [ ] Confirm reset access cookie is created
- [ ] Confirm redirect to `/reset-password`
- [ ] Enter new password
- [ ] Confirm password updates
- [ ] Confirm new password works

---

## SMTP Email Provider

SMTP provider file:

```txt
src/lib/verification/providers/emailSmtp.js
```

SMTP config:

```txt
src/customerAccess/config/verificationProviders.js
```

Environment variables:

```env
EMAIL_PROVIDER_MODE="smtp"

SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-sender-email@gmail.com"
SMTP_PASS="your-google-app-password"
SMTP_FROM_EMAIL="Amity Sereavo <your-sender-email@gmail.com>"

EMAIL_DEV_TEST_INBOX="paralifetrees@gmail.com"
```

### Gmail SMTP

- [ ] Confirm `SMTP_HOST` is exactly `smtp.gmail.com`
- [ ] Confirm `SMTP_USER` is the sender Gmail account
- [ ] Confirm `SMTP_PASS` is a Google App Password
- [ ] Confirm the App Password belongs to the same Google account in `SMTP_USER`
- [ ] Confirm `SMTP_FROM_EMAIL` matches the sender account
- [ ] Restart the dev server after `.env` changes
- [ ] Trigger signup email verification
- [ ] Confirm delivery attempt logs `provider: smtp`
- [ ] Confirm delivery attempt logs `mode: smtp`
- [ ] Confirm `ok: true`
- [ ] Confirm provider message id exists
- [ ] Confirm email arrives in `EMAIL_DEV_TEST_INBOX`

Common failure check:

```txt
getaddrinfo EAI_FAIL smtp@gmail.com
```

- [ ] If this appears, fix `SMTP_HOST` to `smtp.gmail.com`

---

## Email Dev-Safe Rewrite

In development mode, real recipients can be rewritten to a safe inbox.

- [ ] Set `EMAIL_DEV_TEST_INBOX`
- [ ] Trigger verification for a different email address
- [ ] Confirm `originalTo` stores the real submitted email
- [ ] Confirm `to` stores the dev test inbox
- [ ] Confirm `rewritten: true`
- [ ] Confirm the email arrives in the dev test inbox

Expected behavior:

```txt
originalTo: customer@example.com
to: paralifetrees@gmail.com
rewritten: true
```

---

## Resend Email Provider

Resend remains supported.

- [ ] Set `EMAIL_PROVIDER_MODE="resend"`
- [ ] Confirm `RESEND_API_KEY` is set
- [ ] Confirm `RESEND_FROM_EMAIL` is set
- [ ] In development, confirm dev-safe routing works
- [ ] Trigger verification email
- [ ] Confirm delivery attempt is logged
- [ ] Confirm provider is `resend`

---

## Console Delivery Providers

### Email Console

- [ ] Set email provider to console
- [ ] Trigger verification email
- [ ] Confirm message logs to server console
- [ ] Confirm normalized delivery result is returned

### WhatsApp Console

- [ ] Remove/disable WhatsApp Meta credentials or set console mode
- [ ] Trigger phone signup with WhatsApp
- [ ] Confirm message logs to server console
- [ ] Confirm delivery attempt logs `provider: whatsapp-console`
- [ ] Confirm status is `simulated`

---

## WhatsApp Meta Provider

Provider file:

```txt
src/lib/verification/providers/whatsappMeta.js
```

Environment variables:

```env
WHATSAPP_ACCESS_TOKEN=""
WHATSAPP_PHONE_NUMBER_ID=""
WHATSAPP_BUSINESS_ACCOUNT_ID=""
WHATSAPP_FROM=""

WHATSAPP_MESSAGE_MODE="text"
WHATSAPP_AUTH_TEMPLATE_NAME=""
WHATSAPP_TEMPLATE_LANGUAGE="en_US"
```

### Text Mode

- [ ] Set `WHATSAPP_MESSAGE_MODE="text"`
- [ ] Confirm WhatsApp token is active
- [ ] Confirm phone number id is correct
- [ ] Trigger phone signup with WhatsApp
- [ ] Confirm delivery attempt logs `provider: meta-whatsapp`
- [ ] Confirm delivery attempt logs `mode: meta`
- [ ] Confirm Meta returns a `wamid`
- [ ] Confirm message is received if Meta allows text message delivery for the test context

### Template Mode

- [ ] Set `WHATSAPP_MESSAGE_MODE="template"`
- [ ] Set `WHATSAPP_AUTH_TEMPLATE_NAME`
- [ ] Set `WHATSAPP_TEMPLATE_LANGUAGE`
- [ ] Confirm template is approved in Meta
- [ ] Trigger phone signup with WhatsApp
- [ ] Confirm delivery attempt logs `provider: meta-whatsapp`
- [ ] Confirm delivery attempt logs `mode: meta`
- [ ] Confirm Meta returns a `wamid`
- [ ] Confirm verification code is received
- [ ] Confirm user can verify successfully

---

## Rate Limiting

Rate-limit helper:

```txt
src/lib/auth/rateLimit.js
```

Rate-limit config:

```txt
src/customerAccess/config/authRules.js
```

Check these endpoints:

```txt
/api/signup
/api/login
/api/verify/start
/api/verify/check
/api/password/forgot
/api/password/verify-code
/api/password/reset
```

For each endpoint:

- [ ] Repeatedly submit requests beyond the configured limit
- [ ] Confirm response status becomes `429`
- [ ] Confirm response includes `retryAfterSeconds`
- [ ] Confirm response includes `Retry-After` header
- [ ] Wait until the window expires
- [ ] Confirm requests work again

Production note:

- [ ] For production, review whether in-memory rate limiting is enough
- [ ] For multi-instance deployment, plan Redis/Upstash or another shared store

---

## Expired Auth Record Cleanup

Cleanup helper:

```txt
src/lib/auth/cleanup.js
```

Routes that should call cleanup:

- [ ] `/api/verify/start`
- [ ] `/api/verify/check`
- [ ] `/api/password/forgot`
- [ ] `/api/password/verify-code`
- [ ] `/api/password/reset`

Manual check:

- [ ] Create expired verification/reset records in database
- [ ] Trigger one of the auth routes
- [ ] Confirm expired records are removed

Records cleaned:

- [ ] expired verification codes
- [ ] expired verification tokens
- [ ] expired password reset tokens
- [ ] expired password reset challenges
- [ ] expired password reset access grants

---

## Lead Capture

- [ ] Go to `/example/lead-capture`
- [ ] Submit quick lead form with email
- [ ] Confirm lead is stored
- [ ] Confirm verification starts if required
- [ ] Complete verification
- [ ] Confirm verified redirect works
- [ ] Repeat with phone/WhatsApp
- [ ] Confirm already-verified submitted-channel skip logic works

---

## Delivery Attempt Logging

Check `VerificationDeliveryAttempt` after each delivery test.

- [ ] Confirm channel is correct
- [ ] Confirm provider is correct
- [ ] Confirm mode is correct
- [ ] Confirm status is correct
- [ ] Confirm `ok` is correct
- [ ] Confirm recipient is correct
- [ ] Confirm original recipient is preserved
- [ ] Confirm rewritten status is correct
- [ ] Confirm provider message id is saved when available
- [ ] Confirm provider errors are normalized
- [ ] Confirm metadata includes parsed identifier type and requested phone channel

---

## Security Checks

- [ ] Passwords are bcrypt-hashed
- [ ] Main verification codes are bcrypt-hashed
- [ ] Password reset phone codes are bcrypt-hashed
- [ ] Password reset email tokens are hashed
- [ ] Password reset access grants are hashed
- [ ] Session tokens are hashed in database
- [ ] Session cookie is HTTP-only
- [ ] Session cookie uses secure settings in production
- [ ] Reset links are single-use
- [ ] Reset access grants are single-use
- [ ] Old sessions are revoked after password reset
- [ ] Rate limits are active on high-risk routes
- [ ] Verification attempts are limited
- [ ] Password policy is enforced server-side
- [ ] Confirm password paste/drop is blocked client-side

---

## Config-Driven Behavior

Confirm these remain configurable:

- [ ] password length rules
- [ ] password uppercase requirement
- [ ] password lowercase requirement
- [ ] password number requirement
- [ ] password special character requirement
- [ ] password strength thresholds
- [ ] verification code length
- [ ] verification expiry
- [ ] verification resend cooldown
- [ ] verification max attempts
- [ ] enabled phone channels
- [ ] password reset resend cooldown
- [ ] rate limits
- [ ] auth messages
- [ ] route redirects
- [ ] delivery provider choice
- [ ] phone channel behavior
- [ ] SMS enabled/disabled state
- [ ] WhatsApp message mode
- [ ] WhatsApp template name/language

Files:

```txt
src/customerAccess/config/authRules.js
src/customerAccess/config/authMessages.js
src/customerAccess/config/siteConfig.js
src/customerAccess/config/verificationProviders.js
src/customerAccess/config/accountSignupConfig.js
```

---

## Future Merge Readiness for Reusable Slides

Before merging into reusable-slide-pages, confirm:

- [ ] Auth routes are reusable and not tied to one business
- [ ] Customer/account config is centralized
- [ ] Current-user endpoint exists or is planned
- [ ] Protected route helper exists or is planned
- [ ] Prisma auth models can merge cleanly with reusable-slide-pages schema
- [ ] Lead capture can support slide-funnel leads
- [ ] Accounts can later own orders
- [ ] Accounts can later own tickets
- [ ] Accounts can later own download access
- [ ] Ticket owners can later choose meals through verified access
- [ ] Email is production-ready before merge
- [ ] WhatsApp can be added later after Meta business verification
- [ ] SMS remains optional/paused unless needed

---

## Production Readiness Review Per Business

Before using this system for a new business/app:

- [ ] Set business name
- [ ] Set route redirects
- [ ] Set email sender identity
- [ ] Test SMTP sender
- [ ] Confirm dev-safe inbox rewriting is disabled or appropriate for production
- [ ] Review password policy
- [ ] Review verification expiry
- [ ] Review verification resend cooldown
- [ ] Review rate limits
- [ ] Review phone-channel availability
- [ ] Decide whether WhatsApp is enabled
- [ ] Decide whether SMS is enabled
- [ ] Review WhatsApp pricing risk
- [ ] Match WhatsApp template validity period with app code expiry
- [ ] Confirm privacy/contact wording is appropriate
- [ ] Run full checklist before launch

---

## Commit Checklist

Before commit:

- [ ] Run `npm run build`
- [ ] Run the relevant manual flow tests
- [ ] Update README if behavior changed
- [ ] Update this checklist if a new auth flow was added
- [ ] Commit with clear message
- [ ] Push to GitHub
- [ ] Share new SHA as source of truth
````
