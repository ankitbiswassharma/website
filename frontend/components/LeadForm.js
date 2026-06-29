"use client";

import { useState } from "react";

import { apiJson } from "@/lib/api";

const initialState = {
  name: "",
  email: "",
  phone: "",
  company_name: "",
  requirements: "",
  company_website: "", // honeypot
};

export default function LeadForm({
  eyebrow = "Consultation Request",
  title,
  description,
  submitLabel,
  successMessage = "Thank you. Our team will review the requirement and contact you shortly.",
}) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await apiJson("/leads", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setSuccess(successMessage);
      setForm(initialState);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card form-card stack-md" onSubmit={handleSubmit}>
      <div className="stack-sm">
        <div className="eyebrow">{eyebrow}</div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {success ? <div className="success-box">{success}</div> : null}
      {error ? <div className="error-box">{error}</div> : null}
      {/* Honeypot — hidden from real users */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="lf-company-website">Company website</label>
        <input
          id="lf-company-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.company_website}
          onChange={(event) => updateField("company_website", event.target.value)}
        />
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="lf-name">Full Name</label>
          <input
            id="lf-name"
            name="name"
            autoComplete="name"
            required
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="lf-email">Work Email</label>
          <input
            id="lf-email"
            name="email"
            autoComplete="email"
            required
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="lf-phone">Phone Number</label>
          <input
            id="lf-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="lf-company">Company / Organisation</label>
          <input
            id="lf-company"
            name="company_name"
            autoComplete="organization"
            value={form.company_name}
            onChange={(event) => updateField("company_name", event.target.value)}
          />
        </div>
        <div className="field full">
          <label htmlFor="lf-requirements">Describe the workflow and requirement</label>
          <textarea
            id="lf-requirements"
            name="requirements"
            required
            placeholder="Describe your current workflow, operational bottlenecks, reporting needs, user roles, and the kind of platform or module you want to build."
            value={form.requirements}
            onChange={(event) => updateField("requirements", event.target.value)}
          />
        </div>
      </div>
      <button className="button button-primary" type="submit" disabled={loading}>
        {loading ? "Submitting Request..." : submitLabel}
      </button>
    </form>
  );
}
