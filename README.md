# Reusable Auth + Lead Capture System

A reusable authentication and lead capture system built with **Next.js App Router**, **React**, **PostgreSQL**, **Prisma ORM**, **bcrypt**, and **database-backed sessions with HTTP-only cookies**.

This project is designed to be adapted across different websites and businesses by centralizing form structure, validation rules, messages, branding defaults, redirect behavior, verification behavior, delivery behavior, and lead capture logic.

---

## Features

### Authentication

- User signup
- Login with email or phone
- Verification required before login
- Configurable verification flow
  - verification by code
  - verification by link
- Confirm-before-consume verification links
- Secure server-side login sessions
- HTTP-only cookies
- Logout
- Session check endpoint
- Protected-route-ready architecture

### Lead Capture

- Quick lead capture
- Enriched lead capture
- Extended profile capture
- Reusable lead form configs
- Centralized field definitions
- Config-driven lead collection
- Email-first verification support
- Phone / WhatsApp number can be collected as contact data

### Reusability

- Centralized auth rules
- Centralized auth messages
- Centralized site branding and shared route defaults
- Shared field registry
- Config-driven forms
- Config-driven default field values
- Shared validation utilities
- Shared identifier parsing
- Flow-specific verification behavior
- Flow-specific redirect behavior
- Config-driven verification delivery content
- Provider-abstracted verification delivery

### Verification Delivery

- Email delivery abstraction
- SMS delivery abstraction
- Resend integration for email
- Console providers for local/dev testing
- Twilio SMS transport support
- Dev-safe Resend test routing
- Normalized delivery result structure
- Delivery-attempt audit logging in Prisma

---

## Stack

- Next.js (App Router)
- React
- PostgreSQL
- Prisma ORM
- bcrypt
- Resend (email provider integration)
- Twilio (SMS transport support)

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
      verify/
        start/
        check/
        consume-link/
    dashboard/
      page.js
    example/
      lead-capture/
        page.js
    login/
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
      validation.js
      verificationSession.js
      verifyPassword.js

  lib/
    auth/
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
    prisma.js
```

---

## Core System Flow

### Signup Flow

1. User submits signup form
2. User record is created
3. Verification is initiated according to the configured verification settings
4. If the flow uses code verification and redirects to the verify page, the user is sent to `/verify`
5. If the flow uses link verification, the user opens the link they receive and confirms verification on the verify page
6. Verification succeeds
7. The user is redirected according to the configured flow

### Login Flow

1. User enters email/phone and password
2. Credentials are checked
3. Verification status is checked
4. Server creates a session
5. Session token is stored in an HTTP-only cookie
6. User is authenticated
7. User is redirected to `/dashboard`

### Lead Capture Flow

1. User submits a lead form
2. Lead data is validated
3. Lead record is stored
4. Verification may be triggered depending on the form config
5. Verification delivery is started according to the configured flow
6. If link verification is used, the user opens the link and confirms on the verify page
7. If code verification is used, the user enters the code on `/verify`
8. Verification succeeds
9. The user is redirected according to the configured flow

---

## Current Working Verification Behavior

### Lead Flow

Current lead flows are config-driven and can choose:

- verification by `code`
- verification by `link`
- target-aware delivery content
- flow-specific redirect behavior

A lead flow can be configured to:

- collect email
- collect phone / WhatsApp number as contact data
- use email-first verification
- redirect after submit
- redirect after successful verification

### Account Flow

Current account verification flow:

- verification delivery can use `code`
- code entry page: `/verify`
- login redirects to `/dashboard`

### Verify Page Behavior

`/verify` supports two modes:

- **code entry mode** when no token is present
- **token confirmation mode** when `?token=...` is present

When a token is present, the page does **not** auto-consume the link. The user must explicitly click **Verify** to complete verification.

The token mode is handled client-side in:

```txt
src/app/verify/VerifyPageClient.jsx
```

Because `useSearchParams()` is used, `/verify` was split so the client-side token logic can be wrapped safely.

---

## Included Pages

- `/signup`
- `/login`
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

### Verification

- `POST /api/verify/start`
- `POST /api/verify/check`
- `POST /api/verify/consume-link`

### Lead Capture

- `POST /api/capture/lead`

---

## Database Models

The system currently uses these Prisma models:

- `User`
- `Session`
- `VerificationCode`
- `VerificationToken`
- `VerificationDeliveryAttempt`
- `Lead`

### User

Stores registered account data such as:

- email
- phone
- password hash
- name
- country
- city
- verification timestamps
- admin level

### Session

Stores server-side login session data such as:

- hashed session token
- session expiry
- revocation status
- IP address
- user agent

### VerificationCode

Stores verification-code records for code-based verification.

### VerificationToken

Stores hashed verification-link tokens for link-based verification, along with optional redirect context such as:

- verification target
- success redirect path

### VerificationDeliveryAttempt

Stores delivery-attempt audit records for verification sends.

Typical fields include:

- purpose
- delivery type
- channel
- provider
- mode
- identifier
- actual recipient used
- original recipient
- rewritten flag
- target
- success redirect
- related verification code or token record
- normalized send status
- provider message id
- normalized error fields
- metadata
- created timestamp

This provides visibility into:

- console/dev sends
- Resend email sends
- Twilio SMS sends
- normalized provider failures
- dev-safe email rewrites
- verification-linked delivery history

### Lead

Stores lead capture data for reusable marketing, onboarding, or intake flows.

---

## Environment Variables

Create a `.env` file in the project root.

Example:

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
```

Notes:

- `RESEND_API_KEY` enables the Resend email provider
- `RESEND_FROM_EMAIL` is the sender used by the email provider
- `RESEND_DEV_TEST_EMAIL` is the dev-safe test inbox used when email delivery is rewritten in development
- if `RESEND_API_KEY` is missing, email delivery can fall back to console mode depending on config
- SMS can use console mode or Twilio depending on config/env
- for the current project direction, email is the recommended active verification channel while SMS remains optional infrastructure
- Twilio SMS sending requires proper sender setup and may be restricted on trial accounts

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

Run database migrations:

```bash
npx prisma migrate dev
```

Start the development server:

```bash
npm run dev
```

---

## Prisma Client

This project uses a generated Prisma client.

Do not depend on committing generated Prisma output to Git.
Generate it locally with:

```bash
npx prisma generate
```

If the schema changes, run:

```bash
npx prisma migrate dev
npx prisma generate
```

---

## Reusability Design

This system is built to be reused by editing configuration rather than rewriting the whole flow.

### Centralized Rules

Edit:

```txt
src/customerAccess/config/authRules.js
```

Use this file to control things like:

- phone rules
- password policy for signup
- verification code length
- resend cooldown
- default verification expiry

### Centralized Messages

Edit:

```txt
src/customerAccess/config/authMessages.js
```

Use this file to customize:

- signup messages
- login messages
- verification messages
- common error messages

### Shared Field Registry

Edit:

```txt
src/customerAccess/config/fieldRegistry.js
```

Use this file to define shared field properties such as:

- field names
- labels
- input types
- placeholders
- select options
- reusable metadata for generic forms

### Flow-Specific Configs

Edit:

```txt
src/customerAccess/config/accountSignupConfig.js
src/customerAccess/config/loginConfig.js
src/customerAccess/config/quickLeadConfig.js
src/customerAccess/config/enrichedLeadConfig.js
src/customerAccess/config/extendedProfileConfig.js
```

Use these files to:

- choose which fields appear
- define field defaults
- control verification requirements
- choose verification delivery by flow
- choose whether to redirect to `/verify`
- control post-submit redirects
- control post-verification redirects
- adapt the same system to different business contexts

### Shared Site Defaults

Edit:

```txt
src/customerAccess/config/siteConfig.js
```

Use this file to define shared site-level defaults such as:

- business name
- footer links
- common route paths
- shared defaults used by reusable auth and lead components

This helps keep business-specific branding and repeated route values out of generic components and page files.

### Verification Content

Edit:

```txt
src/customerAccess/config/verificationContent.js
```

Use this file to define centralized verification message content for:

- code delivery
- link delivery
- email content
- SMS content
- target-specific overrides such as `user` and `lead`

### Verification Provider Settings

Edit:

```txt
src/customerAccess/config/verificationProviders.js
```

Use this file to control things like:

- provider mode for email
- provider mode for SMS
- sender defaults
- dev-safe email rewrite settings
- Twilio sender settings

### Example: Lead Flow

Lead flows can be configured to:

- capture a minimal or enriched set of lead fields
- collect email and/or phone / WhatsApp contact info
- choose code or link verification
- redirect after submit
- require explicit verification on `/verify`
- redirect after successful verification

---

## Validation Design

Validation is shared and centralized through:

```txt
src/customerAccess/utils/validation.js
src/customerAccess/utils/identifier.js
src/customerAccess/config/authRules.js
```

### Important Design Note

Signup and login do not have to enforce the same password rules.

For example:

- signup can require the current password policy
- login should only require a password to be entered and let the server verify it against the database

This allows older or imported accounts to continue logging in even if they were created under different password rules.

---

## Verification Design

Verification is designed to be flow-driven rather than hardcoded into one path.

### Current Capabilities

- verification by code
- verification by link
- resend cooldown support
- identifier normalization before lookup
- DB-backed verification records
- flow-specific success redirects for link verification
- confirm-before-consume verification links
- provider-abstracted verification delivery
- normalized verification delivery results
- delivery-attempt audit logging

### Current Storage

- code verification uses `VerificationCode`
- link verification uses `VerificationToken`
- delivery auditing uses `VerificationDeliveryAttempt`

### Current UI Pieces

Verification UI currently centers around:

```txt
src/customerAccess/components/VerifyForm.jsx
src/app/verify/VerifyPageClient.jsx
src/app/verify/link-sent/page.js
src/app/verify/verified-lead/page.js
src/customerAccess/components/AuthShell.jsx
src/customerAccess/styles/auth.css
```

These pieces now share consistent shell layout, feedback styling, and message-state handling for info, success, and error states.

### Current Redirect Design

Redirect behavior is not fixed globally.
It can vary by flow, for example:

- submit redirect after lead capture
- verify-page redirect for code-based flows
- success redirect after link verification

---

## Verification Delivery Design

Verification delivery is abstracted so route handlers do not contain provider-specific logic.

### Delivery Layer

Main files:

```txt
src/lib/verification/audit.js
src/lib/verification/delivery.js
src/lib/verification/result.js
src/lib/verification/providers/emailConsole.js
src/lib/verification/providers/emailResend.js
src/lib/verification/providers/smsConsole.js
src/lib/verification/providers/smsTwilio.js
src/customerAccess/config/verificationProviders.js
src/customerAccess/config/verificationContent.js
```

### Current Provider Behavior

- **email**
  - Resend in provider-enabled mode
  - console provider fallback path available by configuration
  - dev-safe recipient rewriting in development

- **sms**
  - console provider
  - Twilio provider support

### Current Product Direction

Although Twilio transport support exists, the current recommended live direction is:

- use **email** as the active verification channel
- collect **phone / WhatsApp number** as contact data where needed
- leave SMS as supported infrastructure for later expansion

This keeps the reusable system extensible while avoiding unnecessary delivery/regulatory complexity early.

### Dev-Safe Email Testing

In development, email delivery can be rewritten to a safe Resend test inbox instead of the original recipient.

Typical behavior:

- original recipient is preserved in the normalized delivery result
- actual test delivery goes to `delivered@resend.dev`
- the message content includes a dev note showing the original intended recipient

This makes it possible to test the real provider integration before using a verified custom domain.

### Normalized Delivery Result

Verification delivery returns a normalized result structure that can be surfaced in API responses for debugging.

Typical fields include:

- provider
- channel
- mode
- actual recipient used
- original recipient
- rewritten flag
- provider message id
- status
- normalized error info

This makes delivery behavior easier to inspect in DevTools, server logs, and audit records.

### Delivery-Attempt Audit Logging

Each verification send attempt can be persisted in Prisma through `VerificationDeliveryAttempt`.

This allows you to inspect:

- successful sends
- simulated console sends
- provider-returned failures
- thrown provider/config errors that are normalized by the delivery layer
- verification code / token linkage
- target and redirect context

This provides a stronger foundation for:

- provider debugging
- operational visibility
- future retry logic
- channel expansion
- delivery analytics

---

## Session Design

This project uses **database-backed sessions**, not frontend-stored auth tokens.

### Session Behavior

- a random session token is created on login
- only a hash of the session token is stored in the database
- the raw token is stored in an HTTP-only cookie
- the browser cannot read the cookie through JavaScript
- the session can be revoked on logout
- expired or revoked sessions can be invalidated server-side

### Files

Session logic is handled in:

```txt
src/lib/auth/sessionCookie.js
src/lib/auth/sessionServer.js
src/lib/auth/sessionToken.js
```

---

## Styling

Auth and lead form styling is mainly handled through:

```txt
src/customerAccess/styles/auth.css
```

Shared auth-style layouts are handled through:

```txt
src/customerAccess/components/AuthShell.jsx
```

Global app-wide styles are handled through:

```txt
src/app/globals.css
```

---

## Testing the System

### Signup + Verify by Code

1. Go to `/signup`
2. Create an account
3. Redirect to `/verify` if the configured signup flow uses code verification with verify-page redirect
4. Enter the verification code
5. Confirm redirect based on the configured flow

### Lead Capture + Verify by Link

1. Go to `/example/lead-capture`
2. Submit lead data
3. Trigger verification according to the current lead flow config
4. Click the verification link from terminal, email, or SMS provider output if applicable
5. Click **Verify** on the verify page
6. Confirm the lead is marked verified
7. Confirm redirect to the configured success page

### Login + Session

1. Go to `/login`
2. Log in with verified credentials
3. Confirm successful session creation
4. Check `/api/session`
5. Log out and confirm session is cleared

### Email Delivery in Dev Mode

1. Configure `RESEND_API_KEY`
2. Use `RESEND_FROM_EMAIL="Your App <onboarding@resend.dev>"`
3. Keep `RESEND_DEV_TEST_EMAIL="delivered@resend.dev"`
4. Start a verification flow using an email identifier
5. Confirm the response includes provider and normalized delivery result data
6. Confirm the email appears in the Resend testing flow instead of assuming it reached the original inbox
7. Confirm a `VerificationDeliveryAttempt` row is created

### SMS Delivery Testing

1. Leave SMS in console mode for local/dev-safe testing, or
2. configure Twilio correctly if you want transport-level testing
3. trigger a phone-based verification flow
4. confirm the normalized delivery result
5. confirm a `VerificationDeliveryAttempt` row is created

---

## Production Readiness Status

### Already Implemented

- bcrypt password hashing
- verification required before login
- HTTP-only cookie sessions
- server-side session storage
- logout route
- reusable config-driven forms
- centralized validation rules
- centralized identifier parsing
- resend cooldown support
- verification by code
- verification by link
- confirm-before-consume verification links
- hashed verification-link tokens
- redirect context for link verification
- config-driven default field values
- centralized site defaults for branding and common routes
- shared verification UI feedback states
- provider-abstracted verification delivery
- flow-aware verification delivery content
- Resend email integration
- normalized verification delivery result structure
- delivery-attempt audit logging in Prisma
- Twilio SMS transport support

### Recommended Next Improvements

- hash verification codes instead of storing plaintext
- add rate limiting to signup, login, verify, and lead endpoints
- add brute-force protection
- add Twilio delivery status callback / webhook logging
- stop exposing verification codes and links in production logs
- continue consolidating remaining hardcoded API response messages into shared config where appropriate
- add provider-backed delivery status handling beyond the current synchronous send result
- add richer flow metadata in delivery audit records where useful
- add spam protection to lead capture endpoints
- add protected-route examples
- add file upload hardening if uploads are introduced later
- design and add WhatsApp delivery support when ready

---

## Development Notes

### If authentication breaks after changing the schema

Run:

```bash
npx prisma migrate dev
npx prisma generate
```

### If the generated Prisma client is missing

Run:

```bash
npx prisma generate
```

### If styling changes are not showing

Try:

- restarting the dev server
- hard refreshing the browser
- checking that `src/customerAccess/styles/auth.css` is imported through the auth shell or relevant component

### If environment variable changes are not picked up

Restart the dev server after editing `.env`.

### If Resend rejects your sender in development

Use a dev-safe sender such as:

```env
RESEND_FROM_EMAIL="Your App <onboarding@resend.dev>"
```

and pair it with:

```env
RESEND_DEV_TEST_EMAIL="delivered@resend.dev"
```

### If Twilio SMS is not arriving

Check:

- whether you are using a valid Twilio sender or Messaging Service
- whether the destination number format is correct
- whether your trial account restrictions apply
- whether the delivery attempt only reached an initial accepted state
- whether a later delivery-status callback system is still pending

### If redirects make debugging difficult

You can temporarily increase redirect delays in flow configs such as:

```txt
src/customerAccess/config/accountSignupConfig.js
src/customerAccess/config/quickLeadConfig.js
```

and turn on **Preserve log** in the browser Network panel.

### If Turbopack causes instability in development

This project currently uses Webpack in scripts for stability during development.

---

## Intended Use

This project is intended to serve as a reusable foundation for:

- business websites
- onboarding systems
- client portals
- membership systems
- lead generation pages
- multi-project auth and form systems

---

## Customization Strategy

To adapt this system for a new business or website:

1. edit centralized messages and rules
2. configure shared site defaults
3. choose the fields needed for that business
4. define default field values where needed
5. choose verification behavior per flow
6. choose verification content per flow/target where needed
7. choose verification success redirects per flow
8. choose submit redirects per flow
9. style the forms through `src/customerAccess/styles/auth.css`
10. connect real providers for verification delivery where appropriate
11. connect lead data to business workflows if needed

---

## Current Project Direction

This project originally started with a broader website direction and was later refocused into a reusable system.

The current purpose of the repository is:

**A reusable signup, verification, login, logout, session, lead capture, and verification-delivery system for future projects.**

Current practical direction:

- keep the core system reusable and config-driven
- use email as the most reliable active verification channel
- collect phone / WhatsApp number where useful as contact data
- leave SMS as available infrastructure for later operational rollout
- add WhatsApp delivery support later as a deliberate upgrade rather than forcing it early

---

## License

Add your preferred license here.
#   R e u s a b l e - A u t h - L e a d - C a p t u r e - S y s t e m  
 