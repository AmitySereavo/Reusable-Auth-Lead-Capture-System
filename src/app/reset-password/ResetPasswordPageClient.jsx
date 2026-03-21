"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell from "@/customerAccess/components/AuthShell";
import { siteConfig } from "@/customerAccess/config/siteConfig";

export default function ResetPasswordPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setMessageType("error");

    if (!password || !confirmPassword) {
      setMessage("Enter and confirm your new password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/password/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Unable to reset password.");
        setMessageType("error");
        return;
      }

      setMessage(data.message || "Password reset successful.");
      setMessageType("success");

      setTimeout(() => {
        router.replace(siteConfig.routes.login || "/login");
      }, 1000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      businessName={siteConfig.businessName}
      title="Reset Password"
      subtitle="Choose a new password"
      message={message}
      messageType={messageType}
      footerLinks={siteConfig.footerLinks}
    >
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          New Password
          <input
            type="password"
            placeholder="Enter a new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <label>
          Confirm Password
          <input
            type="password"
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : "Reset Password"}
        </button>
      </form>
    </AuthShell>
  );
}