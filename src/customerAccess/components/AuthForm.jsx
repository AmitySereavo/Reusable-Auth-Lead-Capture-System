"use client";

import { useMemo, useState } from "react";
import AuthShell from "./AuthShell";
import { fieldRegistry } from "../config/fieldRegistry";
import { validateFormFields } from "../utils/validation";
import "../styles/auth.css";
import { siteConfig } from "../config/siteConfig";

import { AUTH_MESSAGES } from "../config/authMessages";
import { setPendingVerificationIdentifier } from "../utils/verificationSession";

function getDefaultValue(settings, meta) {
  if (settings && Object.prototype.hasOwnProperty.call(settings, "defaultValue")) {
    return settings.defaultValue;
  }

  if (meta?.type === "checkbox") return false;
  if (meta?.type === "file") return null;

  return "";
}

export default function AuthForm({

  businessName = siteConfig.businessName,
  config,
  routes = {},
  footerLinks = siteConfig.footerLinks,

  title,
  subtitle,
  onSubmit,
}) {
  const visibleFields = useMemo(() => {
    return Object.entries(config.fields)
      .filter(([, settings]) => settings.visible)
      .map(([fieldKey, settings]) => ({
        key: fieldKey,
        settings,
        meta: fieldRegistry[fieldKey],
      }))
      .filter((field) => field.meta);
  }, [config]);

  const initialFormData = useMemo(() => {
    const values = {};
    visibleFields.forEach(({ key, settings, meta }) => {
      values[key] = getDefaultValue(settings, meta);
    });
    return values;
  }, [visibleFields]);

  const [formData, setFormData] = useState(initialFormData);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [loading, setLoading] = useState(false);

  function updateField(name, value) {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function validateForm() {
    return validateFormFields(visibleFields, formData);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setMessageType("error");

    const validationError = validateForm();
    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const payload = { ...formData };
      const submitConfig = config.submit || {};
      const verificationConfig = config.verification || {};

      if (onSubmit) {
        await onSubmit({
          formData: payload,
          config,
          routes,
          setMessage,
          setMessageType,
        });
        return;
      }

      const res = await fetch(submitConfig.endpoint, {
        method: submitConfig.method || "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.details || data.error || AUTH_MESSAGES.common.serverError);
        setMessageType("error");
        return;
      }

      setMessage(data.message || submitConfig.successMessage || "Success.");
      setMessageType("success");

      const identifier =
        payload.identifier || payload.email || payload.phone || "";

      if (identifier) {
        setPendingVerificationIdentifier(identifier);
      }

      if (
        verificationConfig.required &&
        verificationConfig.autoStart !== false &&
        identifier
      ) {
        await fetch("/api/verify/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier,
            expiresInMinutes: verificationConfig.expiresInMinutes,
            expiresInHours: verificationConfig.expiresInHours,
            method: verificationConfig.method,
            delivery: verificationConfig.delivery || "code",
            target: config.target || null,
            successRedirect: verificationConfig.successRedirect || null,
          }),
        });
      }

      if (
        verificationConfig.required &&
        verificationConfig.redirectToVerifyPage &&
        identifier
      ) {
        const verifyPath = routes.verify || "/verify";
        setPendingVerificationIdentifier(identifier);

        setTimeout(() => {
          window.location.href = verifyPath;
        }, submitConfig.redirectDelayMs || 1000);

        return;
      }

      if (submitConfig.successRedirect) {
        setTimeout(() => {
          window.location.href = submitConfig.successRedirect;
        }, submitConfig.redirectDelayMs || 1200);
      }
    } catch (error) {
      setMessage(error?.message || AUTH_MESSAGES.common.serverError);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  function renderField(field) {
    const { key, settings, meta } = field;

    if (!meta) return null;

    if (meta.type === "checkbox") {
      return (
        <label key={key} className="auth-checkbox-row">
          <input
            type="checkbox"
            checked={!!formData[key]}
            onChange={(e) => updateField(key, e.target.checked)}
          />
          <span>{meta.label}</span>
        </label>
      );
    }

    if (meta.type === "select") {
      return (
        <label key={key}>
          {meta.label}
          <select
            value={formData[key] || ""}
            onChange={(e) => updateField(key, e.target.value)}
            required={!!settings.required}
          >
            <option value="">Select an option</option>
            {meta.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      );
    }

    if (meta.type === "file") {
      return (
        <label key={key}>
          {meta.label}
          <input
            type="file"
            accept={meta.accept}
            onChange={(e) => updateField(key, e.target.files?.[0] || null)}
            required={!!settings.required}
          />
        </label>
      );
    }

    return (
      <label key={key}>
        {meta.label}
        <input
          type={meta.type}
          placeholder={meta.placeholder}
          value={formData[key] || ""}
          onChange={(e) => updateField(key, e.target.value)}
          required={!!settings.required}
        />
      </label>
    );
  }

  return (
    <AuthShell
      businessName={businessName}
      title={title || "Get Started"}
      subtitle={subtitle || `Continue with ${businessName}`}
      message={message}
      messageType={messageType}
      footerLinks={footerLinks}
      bottomLinks={
        routes.login
          ? {
              prefix: "Already have an account?",
              href: routes.login,
              label: "Log in",
            }
          : routes.signup
          ? {
              prefix: "Need an account?",
              href: routes.signup,
              label: "Sign up",
            }
          : null
      }
    >
      <form onSubmit={handleSubmit} className="auth-form">
        {visibleFields.map(renderField)}

        <button type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : config.submit?.buttonLabel || "Submit"}
        </button>
      </form>
    </AuthShell>
  );
}