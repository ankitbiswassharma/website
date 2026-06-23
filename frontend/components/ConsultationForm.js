"use client";

import { useState } from "react";

import { apiJson } from "@/lib/api";
import { projectTypeOptions } from "@/lib/site-data";

const TIME_SLOTS = [
  "10:00 – 11:00",
  "11:00 – 12:00",
  "12:00 – 13:00",
  "14:00 – 15:00",
  "15:00 – 16:00",
  "16:00 – 17:00",
];

const initialState = {
  full_name: "",
  email: "",
  phone: "",
  company: "",
  project_type: "",
  preferred_demo_date: "",
  preferred_demo_time: "",
  client_requirements_html: "",
  company_website: "", // honeypot
};

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

export default function ConsultationForm() {
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

    const payload = {
      full_name: form.full_name,
      email: form.email,
      phone: form.phone || null,
      company: form.company || null,
      project_type: form.project_type || null,
      source: "consultation",
      client_requirements_html: form.client_requirements_html,
      preferred_demo_date: form.preferred_demo_date || null,
      preferred_demo_time: form.preferred_demo_time || null,
      company_website: form.company_website || null,
    };

    try {
      await apiJson("/public/leads/demo", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSuccess(
        "Thanks! Your consultation request is in. We'll confirm your slot by email within one business day."
      );
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
        <div className="eyebrow">Consultation Request</div>
        <h3>Book your free consultation</h3>
        <p>
          Tell us a little about your business and pick a preferred time. The
          call is free and there&apos;s no obligation.
        </p>
      </div>

      {success ? <div className="success-box">{success}</div> : null}
      {error ? <div className="error-box">{error}</div> : null}

      {/* Honeypot — hidden from real users */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="cf-company-website">Company website</label>
        <input
          id="cf-company-website"
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
          <label>Phone Number</label>
          <input
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
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
          <label>What do you want to build?</label>
          <select
            value={form.project_type}
            onChange={(event) => updateField("project_type", event.target.value)}
          >
            <option value="">Select a project type</option>
            {projectTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Preferred Date</label>
          <input
            type="date"
            min={todayIso()}
            value={form.preferred_demo_date}
            onChange={(event) => updateField("preferred_demo_date", event.target.value)}
          />
        </div>
        <div className="field full">
          <label>Preferred Time Slot</label>
          <div className="slot-grid" role="group" aria-label="Preferred time slot">
            {TIME_SLOTS.map((slot) => (
              <button
                type="button"
                key={slot}
                className={`slot-chip${form.preferred_demo_time === slot ? " is-selected" : ""}`}
                aria-pressed={form.preferred_demo_time === slot}
                onClick={() =>
                  updateField(
                    "preferred_demo_time",
                    form.preferred_demo_time === slot ? "" : slot
                  )
                }
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
        <div className="field full">
          <label>Tell us about your workflow (optional)</label>
          <textarea
            placeholder="Describe your current workflow, where the manual work piles up, the tools you use, and what you'd like to build or automate."
            value={form.client_requirements_html}
            onChange={(event) =>
              updateField("client_requirements_html", event.target.value)
            }
          />
        </div>
      </div>

      <button className="button button-primary" type="submit" disabled={loading}>
        {loading ? "Booking..." : "Request My Consultation"}
      </button>
    </form>
  );
}
