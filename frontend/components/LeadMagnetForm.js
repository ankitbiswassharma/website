"use client";

import { useState } from "react";

import { apiJson } from "@/lib/api";

const initialState = {
  full_name: "",
  email: "",
  company: "",
  phone: "",
  company_website: "", // honeypot
};

/**
 * Reusable lead-capture form for lead magnets (audit request, gated download).
 * Posts to the public contact endpoint with a campaign-specific `source`.
 * If `downloadHref` is provided, the file is revealed (and auto-opened) on success.
 */
export default function LeadMagnetForm({
  source = "lead_magnet",
  projectType = "",
  note = "",
  submitLabel = "Submit",
  loadingLabel = "Submitting…",
  successTitle = "You're all set.",
  successMessage = "Thanks! We'll be in touch shortly.",
  downloadHref = "",
  downloadLabel = "Download now",
  eyebrow = "Get Started",
  title = "Request your free session",
  description = "Tell us where to reach you and we'll take it from there.",
}) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      full_name: form.full_name,
      email: form.email,
      company: form.company || null,
      phone: form.phone || null,
      project_type: projectType || null,
      source,
      client_requirements_html: note,
      company_website: form.company_website || null,
    };

    try {
      await apiJson("/public/leads/contact", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setDone(true);
      setForm(initialState);
      if (downloadHref && typeof window !== "undefined") {
        window.open(downloadHref, "_blank", "noopener");
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="card form-card stack-md">
        <div className="success-box">
          <strong>{successTitle}</strong>
          <div style={{ marginTop: 4 }}>{successMessage}</div>
        </div>
        {downloadHref ? (
          <a className="button button-primary" href={downloadHref} target="_blank" rel="noopener noreferrer">
            {downloadLabel}
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form className="card form-card stack-md" onSubmit={handleSubmit}>
      <div className="stack-sm">
        <div className="eyebrow">{eyebrow}</div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      {/* Honeypot — hidden from real users */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="lm-company-website">Company website</label>
        <input
          id="lm-company-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.company_website}
          onChange={(event) => updateField("company_website", event.target.value)}
        />
      </div>

      <div className="form-grid">
        <div className="field">
          <label>Full Name</label>
          <input
            required
            value={form.full_name}
            onChange={(event) => updateField("full_name", event.target.value)}
          />
        </div>
        <div className="field">
          <label>Work Email</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
        </div>
        <div className="field">
          <label>Company / Organisation</label>
          <input
            value={form.company}
            onChange={(event) => updateField("company", event.target.value)}
          />
        </div>
        <div className="field">
          <label>Phone (optional)</label>
          <input
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
          />
        </div>
      </div>

      <button className="button button-primary" type="submit" disabled={loading}>
        {loading ? loadingLabel : submitLabel}
      </button>
    </form>
  );
}
