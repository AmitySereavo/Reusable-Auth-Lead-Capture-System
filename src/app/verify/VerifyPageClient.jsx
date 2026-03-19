"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import VerifyForm from "@/customerAccess/components/VerifyForm";
import AuthShell from "@/customerAccess/components/AuthShell";
import { siteConfig } from "@/customerAccess/config/siteConfig";

export default function VerifyPageClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const redirectTimeoutRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(
    token
      ? "Click Verify below to confirm your details."
      : ""
  );
  const [messageType, setMessageType] = useState("info");
  const [done, setDone] = useState(false);

  async function handleVerifyLink() {
    if (!token || loading || done) return;

    setLoading(true);
    setMessage("Verifying your link...");
    setMessageType("info");

    try {
      const res = await fetch("/api/verify/consume-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Verification failed.");
        setMessageType("error");
        setDone(true);
        return;
      }

      setMessage(data.message || "Verification successful.");
      setMessageType("success");
      setDone(true);

      const redirectTo = data.successRedirect || siteConfig.routes.login;

      redirectTimeoutRef.current = setTimeout(() => {
        window.location.href = redirectTo;
      }, 1200);
    } catch (error) {
      setMessage(error?.message || "Verification failed.");
      setMessageType("error");
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  if (token) {
    return (
      <AuthShell
        title="Verify"
        subtitle={
          done
            ? "Your verification request has been processed."
            : "Review this step, then click Verify to continue."
        }
        message={message}
        messageType={messageType}
      >
        <div className="auth-form">
          {!done ? (
            <button
              type="button"
              onClick={handleVerifyLink}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          ) : null}
        </div>
      </AuthShell>
    );
  }

  return <VerifyForm />;
}