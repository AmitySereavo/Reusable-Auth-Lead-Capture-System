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
- Channel-based verification decisions for leads
- Already-verified submitted lead channels can skip verification and go straight to content
- New or unverified submitted lead channels must verify before content access

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
- Verification session context persisted for verify/resend flows

### Verification Delivery

- Email delivery abstraction
- SMS delivery abstraction
- WhatsApp delivery abstraction
- Resend integration for email
- Twilio SMS transport support
- Meta WhatsApp API transport support
- Console providers for local/dev testing
- Dev-safe Resend test routing
- Normalized delivery result structure
- Delivery-attempt audit logging in Prisma
- Twilio status callback support for later delivery updates
- Dev-only console fallback for immediate Twilio API failures

### UX Improvements

- Live identifier detection while typing
- If the current identifier is recognized as a phone number, the UI can reveal a verification channel choice
- Phone verification channel choice supports:
  - WhatsApp
  - SMS
- Email identifiers do not show the phone verification channel choice
- Verification messages are centralized in config for easier reuse across brands and projects

---

## Stack

- Next.js (App Router)
- React
- PostgreSQL
- Prisma ORM
- bcrypt
- Resend (email provider integration)
- Twilio (SMS transport support)
- Meta WhatsApp Business API / Cloud API (direct WhatsApp provider support)

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
      webhooks/
        twilio/
          status/
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
        whatsappMeta.js
    prisma.js
```

---

## Core System Flow

### Signup Flow

1. User submits signup form
2. User record is created
3. Verification is initiated according to the configured verification settings
4. If the submitted identifier is a phone number, the UI can ask the user whether to receive verification by **WhatsApp** or **SMS**
5. If the flow uses code verification and redirects to the verify page, the user is sent to `/verify`
6. If the flow uses link verification, the user opens the link they receive and confirms verification on the verify page
7. Verification succeeds
8. The user is redirected according to the configured flow

### Lead Capture Flow

1. User submits a lead form
2. Lead data is validated
3. The submitted identifier is normalized and matched against existing leads
4. If the submitted channel is already verified for that lead:
   - verification is skipped
   - the user can be redirected straight to content

5. If the submitted channel is not yet verified:
   - verification is triggered according to the flow config

6. Verification delivery is started according to the configured flow
7. If link verification is used, the user opens the link and confirms on the verify page
8. If code verification is used, the user enters the code on `/verify`
9. Verification succeeds
10. The user is redirected according to the configured flow

### Login Flow

1. User enters email/phone and password
2. Credentials are checked
3. Verification status is checked
4. Server creates a session
5. Session token is stored in an HTTP-only cookie
6. User is authenticated
7. User is redirected to `/dashboard`

---

## Current Working Verification Behavior

### Lead Flow

Current lead flows are config-driven and can choose:

- verification by `code`
- verification by `link`
- target-aware delivery content
- flow-specific redirect behavior
- already-verified submitted-channel skip logic
- verified-content redirect behavior

A lead flow can be configured to:

- collect email
- collect phone / WhatsApp number as contact data
- use email-first verification
- reveal phone verification channel choice only when the identifier is a phone number
- redirect after submit
- redirect after successful verification
- redirect already-verified channels straight to content

### Account Flow

Current account verification flow:

- verification delivery can use `code` or `link`
- code entry page: `/verify`
- login redirects to `/dashboard`
- phone identifier entry can reveal channel choice:
  - `whatsapp`
  - `sms`

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

### Webhooks

- `POST /api/webhooks/twilio/status`

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

### Lead

Stores reusable lead capture data such as:

- email
- phone
- lead profile fields
- `emailVerifiedAt`
- `phoneVerifiedAt`

Important design note:

Lead verification is handled per submitted channel, not as a single person-level verified state.

Examples:

- if a lead submits an email and `emailVerifiedAt` exists, verification can be skipped for that email flow
- if a lead submits a phone number and `phoneVerifiedAt` exists, verification can be skipped for that phone flow
- a person may appear more than once across different lead records or flow contexts if that fits the business need

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
- Meta WhatsApp sends
- normalized provider failures
- dev-safe email rewrites
- verification-linked delivery history
- later Twilio delivery status updates

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
TWILIO_STATUS_CALLBACK_URL=""

WHATSAPP_ACCESS_TOKEN=""
WHATSAPP_PHONE_NUMBER_ID=""
WHATSAPP_BUSINESS_ACCOUNT_ID=""
WHATSAPP_FROM=""
```

Notes:

- `RESEND_API_KEY` enables the Resend email provider
- `RESEND_FROM_EMAIL` is the sender used by the email provider
- `RESEND_DEV_TEST_EMAIL` is the dev-safe test inbox used when email delivery is rewritten in development
- if `RESEND_API_KEY` is missing, email delivery can fall back to console mode depending on config
- SMS can use console mode or Twilio depending on config/env
- WhatsApp can use console mode or Meta API mode depending on config/env
- if `TWILIO_STATUS_CALLBACK_URL` is blank, the app can build a callback URL from `NEXT_PUBLIC_APP_URL`
- for local-only development, `NEXT_PUBLIC_APP_URL="http://localhost:3000"` is fine
- real Twilio status callbacks require a publicly reachable URL
- the current practical direction keeps email highly reliable while allowing SMS and WhatsApp flows where useful
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
- token-link confirmation page messages
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
- radio options
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
- define verified-content redirects where useful
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
- WhatsApp content
- target-specific overrides such as `user` and `lead`

### Verification Provider Settings

Edit:

```txt
src/customerAccess/config/verificationProviders.js
```

Use this file to control things like:

- provider mode for email
- provider mode for SMS
- provider mode for WhatsApp
- sender defaults
- dev-safe email rewrite settings
- Twilio sender settings
- Meta WhatsApp settings

---

## Validation and Identifier Design

Validation is shared and centralized through:

```txt
src/customerAccess/utils/validation.js
src/customerAccess/utils/identifier.js
src/customerAccess/config/authRules.js
```

### Important Design Notes

#### Signup and login do not have to enforce the same password rules

For example:

- signup can require the current password policy
- login should only require a password to be entered and let the server verify it against the database

This allows older or imported accounts to continue logging in even if they were created under different password rules.

#### Phone normalization is centralized

Phone identifiers are normalized through shared utilities before lookup and verification so that common variations of the same number can resolve consistently.

Examples:

- `8765892721`
- `18765892721`
- `+18765892721`

can all normalize to the same canonical format.

---

## Verification Session Context

Verification session context is stored client-side for verify/resend flows.

This context can include:

- identifier
- delivery
- method
- target
- success redirect
- expiry settings
- selected phone channel

Main file:

```txt
src/customerAccess/utils/verificationSession.js
```

This allows verify-page resend behavior to preserve the original verification intent rather than falling back to a stripped-down request.

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
- phone-channel selection for phone identifiers
- channel-aware lead verification skip logic

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
- already-verified submitted-channel redirect for lead content flows

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
src/lib/verification/providers/whatsappMeta.js
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
  - Twilio status callback support for later delivery updates
  - dev-only console fallback for immediate Twilio API errors

- **whatsapp**
  - console provider
  - direct Meta WhatsApp API provider support

### Current Product Direction

Current practical direction:

- keep email highly reliable
- allow phone users to choose WhatsApp or SMS where appropriate
- keep SMS transport support available
- support direct Meta WhatsApp integration without coupling WhatsApp to Twilio
- keep console fallback and audit logging especially useful in development

### Dev-Safe Email Testing

In development, email delivery can be rewritten to a safe Resend test inbox instead of the original recipient.

Typical behavior:

- original recipient is preserved in the normalized delivery result
- actual test delivery goes to `delivered@resend.dev`
- the message content includes a dev note showing the original intended recipient

### Console Delivery in Development

Console providers are useful in development for:

- SMS simulation
- WhatsApp simulation
- immediate visibility into code/link content in terminal output
- fallback when a provider fails immediately in dev

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
- later Twilio delivery-status updates

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

### Signup + Phone + Channel Choice

1. Go to `/signup`
2. Enter a phone number in the identifier field
3. Confirm the UI reveals the phone verification channel choice
4. Choose **WhatsApp** or **SMS**
5. Submit the form
6. Confirm verification starts using the selected phone channel

### Signup + Verify by Code

1. Go to `/signup`
2. Create an account
3. Redirect to `/verify` if the configured signup flow uses code verification with verify-page redirect
4. Enter the verification code
5. Confirm redirect based on the configured flow

### Lead Capture + Verify by Link

1. Go to `/example/lead-capture`
2. Submit lead data
3. If the submitted channel is already verified, confirm redirect straight to content
4. If not verified, trigger verification according to the current lead flow config
5. Click the verification link from terminal, email, SMS, or WhatsApp provider output if applicable
6. Click **Verify** on the verify page
7. Confirm the lead is marked verified
8. Confirm redirect to the configured success/content page

### Lead Capture + Already Verified Channel

1. Submit a lead form using an already-verified email or phone number
2. Confirm the lead is recognized as existing for that submitted channel
3. Confirm verification is skipped
4. Confirm redirect straight to the configured content page

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
6. if using Twilio status callbacks, confirm later status updates are recorded

### WhatsApp Delivery Testing

1. Leave WhatsApp in console mode for local/dev-safe testing, or
2. configure direct Meta WhatsApp settings
3. trigger a phone-based verification flow with `phoneChannel = whatsapp`
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
- Twilio SMS transport support
- direct Meta WhatsApp provider support
- normalized verification delivery result structure
- delivery-attempt audit logging in Prisma
- Twilio delivery-status callback support
- lead submitted-channel verification skip logic
- phone-channel choice for phone identifiers

### Recommended Next Improvements

- hash verification codes instead of storing plaintext
- add rate limiting to signup, login, verify, and lead endpoints
- add brute-force protection
- add webhook signature verification for Twilio status callbacks
- stop exposing verification codes and links in production logs
- continue consolidating remaining hardcoded API response messages into shared config where appropriate
- add provider-backed delivery status handling beyond Twilio where useful
- add richer flow metadata in delivery audit records where useful
- add spam protection to lead capture endpoints
- add protected-route examples
- add file upload hardening if uploads are introduced later
- expand content-delivery / lead-magnet flow configuration where needed

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
- whether the initial Twilio response only reflects accepted/queued state
- whether your status callback URL is reachable publicly
- whether a later status update reports `undelivered` or `failed`

### If Twilio status callbacks are not hitting locally

`localhost` is not publicly reachable by Twilio.
Use a public URL/tunnel in development if you want Twilio to call back into your local app.

### If Meta WhatsApp is not sending

Check:

- whether `WHATSAPP_ACCESS_TOKEN` is valid
- whether `WHATSAPP_PHONE_NUMBER_ID` is correct
- whether the destination number is in the expected format
- whether the current environment should still be using console mode instead

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
9. choose verified-content redirects where needed
10. style the forms through `src/customerAccess/styles/auth.css`
11. connect real providers for verification delivery where appropriate
12. connect lead data to business workflows if needed

---

## Current Project Direction

This project originally started with a broader website direction and was later refocused into a reusable system.

The current purpose of the repository is:

**A reusable signup, verification, login, logout, session, lead capture, content-gated lead flow, and verification-delivery system for future projects.**

Current practical direction:

- keep the core system reusable and config-driven
- use centralized configuration and messaging wherever possible
- treat verification as channel verification where appropriate
- keep email highly reliable
- allow phone users to choose WhatsApp or SMS where useful
- support direct Meta WhatsApp integration separately from Twilio
- keep SMS transport support available without making it the only phone strategy

---

## License

Add your preferred license here.
