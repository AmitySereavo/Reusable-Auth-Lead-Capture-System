# Auth Regression Checklist

Use this checklist after every auth/security/delivery change and before committing.

## Build Check

- [ ] Run `npm run build`
- [ ] Confirm the build completes without errors
- [ ] Confirm there are no new import warnings
- [ ] Confirm Prisma client is generated if schema changed

```bash
npm run build
```

````

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

### Phone / WhatsApp Signup

- [ ] Go to `/signup`
- [ ] Sign up with a phone number
- [ ] Confirm phone channel choice appears
- [ ] Choose WhatsApp
- [ ] Confirm verification code is sent through WhatsApp provider
- [ ] Submit the correct verification code
- [ ] Confirm phone becomes verified
- [ ] Confirm login works after verification

### SMS Status

- [ ] Confirm SMS/Twilio is paused or disabled in config
- [ ] Confirm the UI does not push users toward SMS unless intentionally enabled
- [ ] Confirm WhatsApp is the preferred phone verification channel

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
- [ ] Enter new password
- [ ] Confirm password updates
- [ ] Confirm old sessions are revoked
- [ ] Confirm new password works

---

## Forgot Password by WhatsApp

- [ ] Go to `/forgot-password`
- [ ] Enter a verified phone number
- [ ] Confirm WhatsApp/SMS choice appears
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

## SMS / Twilio Pause Check

- [ ] Confirm Twilio SMS is not required for any happy path
- [ ] Confirm SMS provider can remain configured but unused
- [ ] Confirm WhatsApp works without Twilio
- [ ] Confirm README says SMS/Twilio is optional or paused if that is the current project direction

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

## Delivery Providers

### Email Console

- [ ] Enable console email provider
- [ ] Trigger verification email
- [ ] Confirm message logs to server console
- [ ] Confirm normalized delivery result is returned

### Resend Email

- [ ] Enable Resend provider
- [ ] Confirm `RESEND_API_KEY` is set
- [ ] Confirm `RESEND_FROM_EMAIL` is set
- [ ] In development, confirm dev-safe routing works
- [ ] Trigger verification email
- [ ] Confirm delivery attempt is logged

### Future SMTP / Nodemailer

- [ ] Add SMTP config
- [ ] Confirm transporter verifies connection
- [ ] Trigger verification email
- [ ] Confirm message sends
- [ ] Confirm delivery attempt is logged
- [ ] Confirm failed SMTP auth/network errors are normalized

### WhatsApp Meta Provider

- [ ] Confirm WhatsApp API credentials are set
- [ ] Confirm phone number ID is set
- [ ] Confirm access token is set
- [ ] Trigger verification code by WhatsApp
- [ ] Confirm message sends
- [ ] Confirm delivery attempt is logged
- [ ] Confirm provider errors are normalized
- [ ] Confirm failed WhatsApp messages do not mark verification as completed

### Twilio SMS

- [ ] Confirm SMS is paused unless intentionally enabled
- [ ] Confirm Twilio route/webhook is not required for the main flow
- [ ] If re-enabled later, add webhook signature verification before production use

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

---

## Config-Driven Behavior

Confirm these remain configurable:

- [ ] password length rules
- [ ] verification code length
- [ ] verification expiry
- [ ] verification resend cooldown
- [ ] verification max attempts
- [ ] password reset resend cooldown
- [ ] rate limits
- [ ] auth messages
- [ ] route redirects
- [ ] delivery provider choice
- [ ] phone channel behavior

Files:

```txt
src/customerAccess/config/authRules.js
src/customerAccess/config/authMessages.js
src/customerAccess/config/siteConfig.js
src/customerAccess/config/verificationProviders.js
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

```
````
