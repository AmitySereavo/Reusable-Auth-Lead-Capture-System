const PENDING_VERIFICATION_KEY = "pendingVerificationIdentifier";

export function setPendingVerificationIdentifier(identifier) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_VERIFICATION_KEY, identifier);
}

export function getPendingVerificationIdentifier() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(PENDING_VERIFICATION_KEY) || "";
}

export function clearPendingVerificationIdentifier() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_VERIFICATION_KEY);
}

export function hasPendingVerificationIdentifier() {
  return !!getPendingVerificationIdentifier();
}