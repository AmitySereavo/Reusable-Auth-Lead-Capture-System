"use client";

import { useEffect, useState } from "react";
import AuthShell from "@/customerAccess/components/AuthShell";
import { siteConfig } from "@/customerAccess/config/siteConfig";
import { getPendingVerificationIdentifier } from "@/customerAccess/utils/verificationSession";

export default function VerificationLinkSentPage() {
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState(
    "Open the verification link we sent, then confirm on the verification page."
  );
  const [messageType, setMessageType] = useState("info");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const storedIdentifier = getPendingVerificationIdentifier();

    if (storedIdentifier) {
      setIdentifier(storedIdentifier);
      return;
    }

    setMessage("No identifier found for resend.");
    setMessageType("error");
  }, []);

  async function resendLink() {
    if (!identifier) {
      setMessage("No identifier found for resend.");
      setMessageType("error");
      return;
    }

    setSending(true);
    setMessage("");
    setMessageType("info");

    try {
      const res = await fetch("/api/verify/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          delivery: "link",
          method: "same-as-identifier",
          target: "lead",
          successRedirect: siteConfig.routes.verifiedLead,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Could not resend verification link.");
        setMessageType("error");
        return;
      }

      setMessage(
        data.message
          ? `${data.message}. Open it and confirm on the verification page.`
          : "Verification link resent. Open it and confirm on the verification page."
      );
      setMessageType("success");
    } catch (error) {
      setMessage(error?.message || "Could not resend verification link.");
      setMessageType("error");
    } finally {
      setSending(false);
    }
  }

  return (
    <AuthShell
      title="Check your inbox"
      subtitle="Open the verification link we sent, then click Verify on the next page."
      message={message}
      messageType={messageType}
    >
      <div className="auth-form">
        <button
          type="button"
          onClick={resendLink}
          disabled={sending || !identifier}
        >
          {sending ? "Sending..." : "Resend Link"}
        </button>
      </div>
    </AuthShell>
  );
}