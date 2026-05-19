# Reusable Auth + Lead Capture System

A reusable authentication and lead capture system built with **Next.js App Router**, **React**, **PostgreSQL**, **Prisma ORM**, **bcrypt**, and **database-backed sessions with HTTP-only cookies**.

This project is designed to be adapted across different websites and businesses by centralizing form structure, validation rules, messages, branding defaults, redirect behavior, verification behavior, delivery behavior, rate limits, and lead capture logic.

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
- Password reset by WhatsApp or SMS when phone is used
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
- Resend integration for email
- Twilio support for SMS
- Meta WhatsApp support
- Console providers for local/dev testing
- Dev-safe Resend test routing
- Normalized delivery result structure
- Delivery-attempt audit logging

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

---

## Stack

- Next.js App Router
- React
- PostgreSQL
- Prisma ORM
- bcrypt
- Resend
- Twilio
- Meta WhatsApp Business / Cloud API

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
4. Account is created
5. Verification starts
6. User completes verification
7. User continues through configured redirect flow

## Login Flow

1. User enters email/phone and password
2. Server checks credentials
3. Verification state is checked
4. Session is created
5. Session token is stored in an HTTP-only cookie
6. User is redirected to `/dashboard`

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
6. Password is updated
7. Existing sessions are revoked
8. User returns to login

## Forgot Password by Phone

1. User opens `/forgot-password`
2. User enters phone number
3. WhatsApp/SMS choice appears
4. A password reset code is sent
5. User enters the code at `/forgot-password/code`
6. Server creates a short-lived reset access grant
7. User is redirected to `/reset-password`
8. User enters a new password
9. Password is updated
10. Existing sessions are revoked

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
- user receives a code by WhatsApp or SMS
- after successful code verification, a short-lived reset access grant is issued
- grant allows access to the reset-password page

### Reset safety behavior

- older unused reset records are invalidated when a new reset starts
- reset links are single-use
- reset access grants are single-use
- password reset resend cooldown is enforced
- existing sessions are revoked after password change

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
- Phone-capable forms can show helper text reminding users to include country code and area code
- Login includes a forgot-password path
- Dashboard is server-protected
- Login page redirects authenticated users away
- Reset-password page only opens with a valid reset token or reset-access cookie
- If a user tries to log in before verification, verification context is saved and the user is routed to verification

---

## Environment Variables

Create a `.env` file in the project root.

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/YOUR_DB_NAME"
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

RESEND_API_KEY="re_xxxxxxxxx"
RESEND_FROM_EMAIL="Your App <onboarding@resend.dev>"
RESEND_DEV_TEST_EMAIL="delivered@resend.dev"

TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_SMS_FROM="+1XXXXXXXXXX"
TWILIO_MESSAGING_SERVICE_SID=""
TWILIO_STATUS_CALLBACK_URL=""

WHATSAPP_ACCESS_TOKEN=""
WHATSAPP_PHONE_NUMBER_ID=""
WHATSAPP_BUSINESS_ACCOUNT_ID=""
WHATSAPP_FROM=""
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

## Current Testing Checklist

### Signup + Verification

1. Go to `/signup`
2. Enter email or phone
3. If phone is entered, confirm WhatsApp/SMS choice appears
4. Complete verification
5. Confirm login is possible afterward
6. Confirm `VerificationCode.code` stores a bcrypt hash, not the raw code
7. Try several wrong verification codes and confirm attempt limit blocks after the configured amount

### Login + Session

1. Go to `/login`
2. Log in with verified credentials
3. Confirm redirect to `/dashboard`
4. Confirm `/api/session` shows authenticated state
5. Log out
6. Confirm `/dashboard` no longer renders
7. Confirm `/login` redirects authenticated users away when already logged in

### Forgot Password by Email

1. Go to `/forgot-password`
2. Enter verified email
3. Confirm reset link is sent
4. Immediately request again and confirm cooldown blocks repeat request
5. Open link
6. Confirm `/reset-password?token=...` opens correctly
7. Reset password
8. Confirm old sessions are revoked
9. Confirm new password works

### Forgot Password by Phone

1. Go to `/forgot-password`
2. Enter verified phone
3. Confirm WhatsApp/SMS choice appears
4. Receive reset code
5. Immediately request again and confirm cooldown blocks repeat request
6. Enter code at `/forgot-password/code`
7. Confirm redirect to `/reset-password`
8. Reset password
9. Confirm new password works

### Rate Limiting

1. Repeatedly submit login attempts with bad credentials
2. Confirm `429 Too Many Requests` appears after the configured limit
3. Repeat for verification start/check and password reset routes
4. Confirm `retryAfterSeconds` is included in the response

### Lead Capture

1. Go to `/example/lead-capture`
2. Submit data with email or phone
3. Complete verification flow
4. Confirm redirect behavior matches config

---

## Recommended Next Improvements

- Add webhook signature verification for Twilio status callbacks
- Continue consolidating remaining hardcoded messages into shared config
- Add richer audit metadata where useful
- Add a dedicated auth regression checklist file in the repo
- Add production-grade Redis/Upstash-backed rate limiting
- Add scheduled cleanup route or deployment cron for expired auth records
- Add account profile editing flow
- Add reusable current-user helper/endpoint for the future reusable-slide-pages merge
- Add integration notes for merging this project into reusable-slide-pages

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

Likely merge direction:

- move `customerAccess/` into reusable-slide-pages
- move auth API routes into reusable-slide-pages
- merge Prisma models into the reusable-slide-pages schema
- keep config-driven auth behavior
- connect slide order/ticket/download records to authenticated users later

---

## Current Project Direction

This repository is currently focused on:

**A reusable signup, login, logout, verification, password-reset, session, rate-limited, and lead-capture system with config-driven forms and reusable delivery channels.**

Practical direction:

- keep the auth system reusable and config-driven
- support both email and phone-first user journeys
- support WhatsApp and SMS where phone is used
- keep email highly reliable
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
