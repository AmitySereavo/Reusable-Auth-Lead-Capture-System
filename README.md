# Reusable Auth + Lead Capture System

A reusable authentication, account access, verification, password reset, delivery, and lead capture system built with **Next.js App Router**, **React**, **PostgreSQL**, **Prisma ORM**, **bcrypt**, **Nodemailer SMTP**, and **database-backed sessions with HTTP-only cookies**.

This project is designed to be adapted across different websites and businesses by centralizing form structure, validation rules, password policy, messages, branding defaults, redirect behavior, verification behavior, delivery behavior, rate limits, and lead capture logic.

The current goal is to polish this system as a standalone reusable auth/account tool first, then copy/merge it into the reusable-slide-pages project later.

---

## Current Feature Set

### Authentication

- User signup
- Login with email or phone
- Verification required before login
- Logout with server-side session revocation
- Protected dashboard route
- Login route redirects authenticated users away
- Forgot password
- Password reset by email link
- Password reset by phone code
- Password reset access grant before final password change
- Existing sessions revoked after successful password reset

### Verification

- Verification by code
- Verification by link
- Confirm-before-consume verification links
- Channel-aware verification
- Phone channel choice for phone identifiers
- Reusable verification session context
- Shared verify page flow
- Main verification codes are bcrypt-hashed before storage
- Config-driven maximum verification code attempts
- Config-driven resend cooldown for verification requests
- Existing unverified users can re-enter signup and continue verification instead of being blocked by “user already exists”

### Lead Capture

- Quick lead capture
- Enriched lead capture
- Extended profile capture
- Channel-aware lead verification
- Already-verified submitted-channel skip logic
- Verified-content redirect support

### Delivery Layer

- Email delivery abstraction
- SMS delivery abstraction
- WhatsApp delivery abstraction
- Console providers for local/dev testing
- Resend email provider
- Nodemailer SMTP email provider
- Meta WhatsApp Cloud API provider
- Twilio SMS support exists but SMS is currently paused/optional
- Dev-safe email inbox rewriting
- Normalized delivery result structure
- Delivery-attempt audit logging

### Email

Email currently supports:

- Console email for local testing
- Resend email provider
- SMTP email provider through Nodemailer
- Gmail SMTP testing through Google App Passwords
- Dev-safe test inbox rewriting through `EMAIL_DEV_TEST_INBOX`

Current preferred direction:

```txt
Primary email provider for self-managed sending:
Nodemailer SMTP
```

### WhatsApp

WhatsApp currently supports:

- Console simulation mode
- Meta WhatsApp Cloud API mode
- Text-message mode
- Template-message mode foundation
- Delivery attempt logging with Meta `wamid` provider message IDs

Current WhatsApp status:

- WhatsApp API sending has been connected and accepted by Meta in testing
- Business verification is pending before production template use
- Authentication templates are planned for production verification-code messages
- SMS is paused until a later date

### Security / Abuse Protection

- bcrypt password hashing
- bcrypt verification-code hashing
- Hashed password reset tokens
- Hashed password reset phone codes
- Hashed password reset access grants
- Config-driven verification code attempt limits
- Config-driven password-reset resend cooldown
- Opportunistic cleanup of expired auth records
- In-memory rate limiting helper
- Rate limiting applied to high-risk auth endpoints
- Password policy enforced client-side and server-side

### Password UX

- Show/hide password toggle on signup password fields
- Show/hide password toggle on reset-password fields
- Live password strength indicator while typing
- Weak / medium / strong password signal
- Config-driven password requirements
- Confirm password paste blocked
- Confirm password drag/drop blocked
- Confirm password note: user must type password again instead of pasting
- Live “passwords match / do not match” signal while typing confirm password

### Reusability

- Centralized auth rules
- Centralized auth messages
- Shared field registry
- Shared reusable auth form shell
- Config-driven forms
- Config-driven flow behavior
- Shared route defaults
- Shared reusable identifier parsing
- Shared reusable phone-channel detection UI
- Extractable delivery provider structure
- Future-ready for copy/merge into reusable-slide-pages

---

## Stack

- Next.js App Router
- React
- PostgreSQL
- Prisma ORM
- bcrypt
- Nodemailer
- Resend
- Meta WhatsApp Business / Cloud API
- Twilio support exists but SMS is paused/optional

---

## Folder Structure

```txt
prisma/
  migrations/
  schema.prisma

src/
  app/
    api/
      capture/
        lead/
      login/
      logout/
      session/
      signup/
      password/
        forgot/
        verify-code/
        reset/
      verify/
        start/
        check/
        consume-link/
      webhooks/
        twilio/
          status/
    dashboard/
      LogoutButton.jsx
      page.js
    example/
      lead-capture/
        page.js
    forgot-password/
      page.js
      code/
        ForgotPasswordCodePageClient.jsx
        page.js
    login/
      page.js
    reset-password/
      ResetPasswordPageClient.jsx
      page.js
    signup/
      page.js
    verify/
      page.js
      VerifyPageClient.jsx
      link-sent/
        page.js
      verified-lead/
        page.js
    globals.css
    layout.tsx

  customerAccess/
    components/
      AuthForm.jsx
      AuthShell.jsx
      ForgotPasswordForm.jsx
      LeadCaptureForm.jsx
      LoginForm.jsx
      SignupForm.jsx
      VerifyForm.jsx

    config/
      accountSignupConfig.js
      authMessages.js
      authRules.js
      enrichedLeadConfig.js
      extendedProfileConfig.js
      fieldRegistry.js
      forgotPasswordConfig.js
      loginConfig.js
      quickLeadConfig.js
      siteConfig.js
      verificationContent.js
      verificationProviders.js

    styles/
      auth.css

    utils/
      hashPassword.js
      identifier.js
      passwordPolicy.js
      passwordResetSession.js
      validation.js
      verificationSession.js
      verifyPassword.js

  lib/
    auth/
      cleanup.js
      passwordReset.js
      rateLimit.js
      sessionCookie.js
      sessionServer.js
      sessionToken.js
    verification/
      audit.js
      delivery.js
      result.js
      providers/
        emailConsole.js
        emailResend.js
        emailSmtp.js
        smsConsole.js
        smsTwilio.js
        whatsappMeta.js
    prisma.js
```

---

## Core Flows

## Signup Flow

1. User submits signup form
2. Identifier can be email or phone
3. If identifier is a phone number, WhatsApp/SMS choice can appear automatically
4. SMS can be visible but disabled if the business has SMS turned off
5. Account is created
6. Verification starts
7. User completes verification
8. User continues through configured redirect flow

If a user already exists but the submitted channel is not verified:

```txt
/signup
→ API returns success-style response
→ frontend starts verification again
→ user receives a fresh code/link
→ user is routed to /verify
```

If a user already exists and the submitted channel is already verified:

```txt
/signup
→ user receives “User already exists”
```

## Login Flow

1. User enters email/phone and password
2. Server checks credentials
3. Verification state is checked
4. Session is created
5. Session token is stored in an HTTP-only cookie
6. User is redirected to `/dashboard`

If the account is not verified:

```txt
/login
→ login blocked
→ pending verification context saved
→ user routed to /verify
```

## Logout Flow

1. User clicks logout
2. Current session is revoked server-side
3. Session cookie is cleared
4. User is redirected to `/login`
5. Protected routes no longer render for logged-out users

## Forgot Password by Email

1. User opens `/forgot-password`
2. User enters email
3. If the email matches a verified account, a password reset link is sent
4. User opens `/reset-password?token=...`
5. User enters a new password
6. Password policy is validated
7. Password is updated
8. Existing sessions are revoked
9. User returns to login

## Forgot Password by Phone

1. User opens `/forgot-password`
2. User enters phone number
3. WhatsApp/SMS choice appears depending on config
4. A password reset code is sent through the selected enabled channel
5. User enters the code at `/forgot-password/code`
6. Server creates a short-lived reset access grant
7. User is redirected to `/reset-password`
8. User enters a new password
9. Password policy is validated
10. Password is updated
11. Existing sessions are revoked

---

## Verification Design

The main verification flow supports code and link delivery.

### Code path

- a six-digit code is generated
- the raw code is sent to the user
- only a bcrypt hash of the code is stored in the database
- submitted codes are checked with `bcrypt.compare`
- failed attempts increment the verification record attempt counter
- attempts are blocked after the configured limit

### Link path

- a raw token is generated
- only a SHA-256 hash of the token is stored in the database
- the user receives a verification link
- link consumption confirms the identifier after user confirmation

### Verification safety behavior

- older verification records for the same identifier are removed when new records are created
- code and link expiry are enforced
- code attempt limits are enforced
- verification request cooldowns are enforced
- expired records are cleaned opportunistically from auth routes

---

## Password Policy

Password rules live in:

```txt
src/customerAccess/config/authRules.js
```

Example:

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

Reusable helper:

```txt
src/customerAccess/utils/passwordPolicy.js
```

Current password behavior:

- signup validates password policy client-side
- signup validates password policy server-side
- password reset validates password policy server-side
- password field shows live strength
- password field shows requirement checklist
- confirm password blocks paste/drop
- confirm password gives live match/mismatch feedback

Password strength labels:

```txt
Weak password
Medium password
Strong password
```

Password requirement examples:

```txt
At least 8 characters
No more than 128 characters
At least one uppercase letter
At least one lowercase letter
At least one number
At least one special character
```

---

## Password Reset Design

The reset flow supports two recovery paths.

### Email path

- password reset token is created
- only a hash of the token is stored in the database
- user receives a reset link
- link grants access to the reset-password page

### Phone path

- password reset challenge is created
- code is hashed before storage
- user receives a code by enabled phone channel
- after successful code verification, a short-lived reset access grant is issued
- grant allows access to the reset-password page

### Reset safety behavior

- older unused reset records are invalidated when a new reset starts
- reset links are single-use
- reset access grants are single-use
- password reset resend cooldown is enforced
- existing sessions are revoked after password change

---

## Delivery Provider System

Delivery config lives in:

```txt
src/customerAccess/config/verificationProviders.js
```

Main delivery router:

```txt
src/lib/verification/delivery.js
```

Provider files:

```txt
src/lib/verification/providers/emailConsole.js
src/lib/verification/providers/emailResend.js
src/lib/verification/providers/emailSmtp.js
src/lib/verification/providers/smsConsole.js
src/lib/verification/providers/smsTwilio.js
src/lib/verification/providers/whatsappMeta.js
```

Delivery attempt logging:

```txt
src/lib/verification/audit.js
```

Delivery result normalization:

```txt
src/lib/verification/result.js
```

---

## Email Provider Setup

### Console email

Used for local testing without real delivery.

```env
EMAIL_PROVIDER_MODE="console"
```

### SMTP email with Nodemailer

Preferred self-managed email sending option.

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

For Gmail SMTP:

- `SMTP_HOST` must be `smtp.gmail.com`
- use a Google App Password
- do not use the normal Gmail login password
- the App Password must be created from the same Google account used in `SMTP_USER`
- `SMTP_FROM_EMAIL` should match the sender account

In development mode, email can be rewritten to:

```txt
EMAIL_DEV_TEST_INBOX
```

This means a signup email entered by a user can be safely sent to your test inbox instead of the real user during testing.

### Resend email

Resend remains supported.

```env
EMAIL_PROVIDER_MODE="resend"

RESEND_API_KEY="re_xxxxxxxxx"
RESEND_FROM_EMAIL="Your App <onboarding@resend.dev>"
RESEND_DEV_TEST_EMAIL="delivered@resend.dev"
```

---

## WhatsApp Provider Setup

WhatsApp config lives in:

```txt
src/customerAccess/config/verificationProviders.js
```

Provider:

```txt
src/lib/verification/providers/whatsappMeta.js
```

Current `.env` shape:

```env
WHATSAPP_ACCESS_TOKEN="EAAG..."
WHATSAPP_PHONE_NUMBER_ID="123456789012345"
WHATSAPP_BUSINESS_ACCOUNT_ID="987654321098765"
WHATSAPP_FROM=""

WHATSAPP_MESSAGE_MODE="text"
WHATSAPP_AUTH_TEMPLATE_NAME=""
WHATSAPP_TEMPLATE_LANGUAGE="en_US"
```

### WhatsApp text mode

```env
WHATSAPP_MESSAGE_MODE="text"
```

Text mode can be used for early testing, but it may not reliably deliver verification codes to users who have not messaged the business or who are outside an active WhatsApp customer-service window.

### WhatsApp template mode

```env
WHATSAPP_MESSAGE_MODE="template"
WHATSAPP_AUTH_TEMPLATE_NAME="amity_verification_code"
WHATSAPP_TEMPLATE_LANGUAGE="en_US"
```

Template mode is the preferred production direction for verification codes.

For production, create an approved WhatsApp Authentication template in Meta.

Example template:

```txt
Template name:
amity_verification_code

Category:
Authentication

Template body:
Your Amity Sereavo verification code is {{1}}.
```

The app passes the generated verification code into `{{1}}`.

### Business verification status

Current direction:

- WhatsApp API credentials can be tested
- Meta business verification may be required before template creation and production messaging
- Template setup will be completed after Meta approves the business account
- Email is the primary production-ready channel until WhatsApp template sending is fully approved and tested

---

## SMS / Twilio Status

SMS/Twilio support exists but is currently paused.

Current intended behavior:

- WhatsApp is the preferred phone verification channel
- SMS can remain visible but disabled in the UI
- SMS should not be required for any happy path
- SMS can be re-enabled later through config

Phone channel options are configured from the signup/form config.

Example disabled SMS option:

```js
phoneChannelOptions: [
  {
    value: "whatsapp",
    label: "WhatsApp",
    disabled: false,
  },
  {
    value: "sms",
    label: "SMS",
    disabled: true,
    disabledReason: "SMS verification is not available yet.",
  },
];
```

Server-side enabled phone channels are controlled in:

```txt
src/customerAccess/config/authRules.js
```

Example:

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

## Rate Limiting

The project includes a reusable in-memory rate limiter in:

```txt
src/lib/auth/rateLimit.js
```

Rate limits are configured in:

```txt
src/customerAccess/config/authRules.js
```

The limiter currently protects high-risk auth endpoints such as:

```txt
/api/signup
/api/login
/api/verify/start
/api/verify/check
/api/password/forgot
/api/password/verify-code
/api/password/reset
```

Current limiter behavior:

- tracks attempts by route scope, client IP, and identifier where available
- returns `429 Too Many Requests` when the configured limit is exceeded
- includes `retryAfterSeconds`
- includes a `Retry-After` response header

Important production note:

The current limiter is in-memory. It is useful for local development and simple deployments, but it will reset when the server restarts and will not synchronize across multiple server instances.

For serious production deployment, replace or extend the same helper with Redis, Upstash, or another shared store.

---

## Auth Cleanup

Expired auth records are cleaned opportunistically by:

```txt
src/lib/auth/cleanup.js
```

The helper removes expired:

- verification codes
- verification tokens
- password reset tokens
- password reset challenges
- password reset access grants

This cleanup helper is called from verification and password reset routes.

A future production deployment can also expose this through a scheduled cron route or platform scheduler.

---

## Included Pages

- `/signup`
- `/login`
- `/forgot-password`
- `/forgot-password/code`
- `/reset-password`
- `/dashboard`
- `/verify`
- `/verify/link-sent`
- `/verify/verified-lead`
- `/example/lead-capture`

---

## Included API Routes

### Auth

- `POST /api/signup`
- `POST /api/login`
- `POST /api/logout`
- `GET /api/session`

### Password Reset

- `POST /api/password/forgot`
- `POST /api/password/verify-code`
- `POST /api/password/reset`

### Verification

- `POST /api/verify/start`
- `POST /api/verify/check`
- `POST /api/verify/consume-link`

### Lead Capture

- `POST /api/capture/lead`

### Webhooks

- `POST /api/webhooks/twilio/status`

Twilio webhook support exists but is not a priority while SMS is paused.

---

## Database Models

The project currently includes:

- `User`
- `Session`
- `VerificationCode`
- `VerificationToken`
- `VerificationDeliveryAttempt`
- `Lead`
- `PasswordResetToken`
- `PasswordResetChallenge`
- `PasswordResetAccessGrant`

### VerificationCode

Used for the normal verification-code flow.

Important fields:

- `identifier`
- `code`
- `expiresAt`
- `attempts`
- `createdAt`

The `code` field stores a bcrypt hash, not the raw code.

### VerificationToken

Used for the normal verification-link flow.

The token sent to the user is raw, but only the token hash is stored.

### VerificationDeliveryAttempt

Stores delivery attempt audit records for email, SMS, and WhatsApp verification messages.

Useful fields include:

- channel
- provider
- mode
- status
- provider message id
- recipient
- original recipient
- rewritten status
- metadata
- error code
- error message

### PasswordResetToken

Used for the email reset-link flow.

### PasswordResetChallenge

Used for the phone reset-code flow.

### PasswordResetAccessGrant

Used after successful phone code verification to allow access to the reset-password form.

---

## Current UX Notes

- Identifier fields can accept email or phone depending on flow
- If a phone number is detected in eligible forms, WhatsApp/SMS selection can appear automatically
- SMS can be shown but disabled if unavailable
- Phone-capable forms can show helper text reminding users to include country code and area code
- Login includes a forgot-password path
- Dashboard is server-protected
- Login page redirects authenticated users away
- Reset-password page only opens with a valid reset token or reset-access cookie
- If a user tries to log in before verification, verification context is saved and the user is routed to verification
- Signup with an existing unverified account continues the verification flow
- Password fields support show/hide
- Password fields show live strength
- Confirm password blocks paste/drop
- Confirm password gives live match/mismatch feedback

---

## Environment Variables

Create a `.env` file in the project root.

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/YOUR_DB_NAME"
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

EMAIL_PROVIDER_MODE="smtp"

SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-sender-email@gmail.com"
SMTP_PASS="your-google-app-password"
SMTP_FROM_EMAIL="Amity Sereavo <your-sender-email@gmail.com>"
EMAIL_DEV_TEST_INBOX="paralifetrees@gmail.com"

RESEND_API_KEY=""
RESEND_FROM_EMAIL=""
RESEND_DEV_TEST_EMAIL="delivered@resend.dev"

WHATSAPP_ACCESS_TOKEN=""
WHATSAPP_PHONE_NUMBER_ID=""
WHATSAPP_BUSINESS_ACCOUNT_ID=""
WHATSAPP_FROM=""
WHATSAPP_MESSAGE_MODE="text"
WHATSAPP_AUTH_TEMPLATE_NAME=""
WHATSAPP_TEMPLATE_LANGUAGE="en_US"

TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_SMS_FROM=""
TWILIO_MESSAGING_SERVICE_SID=""
TWILIO_STATUS_CALLBACK_URL=""
```

---

## Installation

Install dependencies:

```bash
npm install
```

Generate Prisma client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

Start the development server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

---

## Current Testing Checklist Summary

Detailed checklist lives in:

```txt
AUTH_REGRESSION_CHECKLIST.md
```

Core checks:

- build passes
- signup works
- email verification works
- SMTP sends successfully
- dev-safe email inbox rewrite works
- existing unverified user can continue verification
- login works
- unverified login routes to verification
- logout revokes session
- forgot-password email works
- password reset works
- password policy blocks weak passwords
- show/hide password works
- confirm password paste is blocked
- confirm password match/mismatch signal works
- rate limiting works
- expired auth cleanup works
- lead capture works

---

## Recommended Next Improvements

- Update `AUTH_REGRESSION_CHECKLIST.md` for the new SMTP, WhatsApp, SMS-paused, and password-policy behavior
- Add production setup checklist for WhatsApp template expiry matching app expiry
- Add production setup checklist for verification resend cooldown and rate limits per business
- Add production-grade Redis/Upstash-backed rate limiting
- Add scheduled cleanup route or deployment cron for expired auth records
- Add account profile editing flow
- Add reusable current-user helper/endpoint for the future reusable-slide-pages merge
- Add integration notes for merging this project into reusable-slide-pages
- Add WhatsApp webhook status route later, after WhatsApp production setup is active
- Add WhatsApp authentication template mode production test after Meta business verification is complete
- Decide whether Twilio SMS remains paused, hidden, or enabled per business

---

## Future Merge Direction

This project is intended to be polished as a standalone reusable auth/account tool first, then copied/merged into the reusable-slide-pages project.

The future combined system should support:

- account creation
- login/logout
- verified user sessions
- lead capture
- protected customer pages
- order ownership
- ticket ownership
- ticket-owner meal access
- purchase-gated album downloads
- reusable profile/account pages
- SMTP email notifications
- WhatsApp ticket/meal notifications after WhatsApp production approval

Likely merge direction:

- move `customerAccess/` into reusable-slide-pages
- move auth API routes into reusable-slide-pages
- merge Prisma models into the reusable-slide-pages schema
- keep config-driven auth behavior
- connect slide order/ticket/download records to authenticated users later
- use email first for reusable-slide-pages invitation/account flows
- add WhatsApp later after business verification and template approval

---

## Current Project Direction

This repository is currently focused on:

**A reusable signup, login, logout, verification, password-reset, session, rate-limited, SMTP-capable, WhatsApp-ready, and lead-capture system with config-driven forms and reusable delivery channels.**

Practical direction:

- keep the auth system reusable and config-driven
- support both email and phone-first user journeys
- use email as the main production-ready communication channel right now
- keep WhatsApp connected but wait for business verification before production template sending
- keep SMS/Twilio paused until needed
- keep password rules configurable by business/app
- protect routes server-side
- use database-backed sessions
- keep delivery providers abstracted from route handlers
- keep security rules and limits in config files
- prepare the system for a later merge with reusable-slide-pages

---

## License

Add your preferred license here.

```

```
