"use client";

import { useState } from "react";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  aadhaar_number: "",
  qualification: "",
  gender: "male",
  date_of_birth: "",
};

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

function formatAadhaar(value) {
  return value.replace(/\D/g, "").slice(0, 12);
}

export default function AdminUserCreate({ session, onCreated }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: key === "aadhaar_number" ? formatAadhaar(value) : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    if (form.aadhaar_number.length !== 12) {
      setError("Aadhaar number must be exactly 12 digits.");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        aadhaar_number: form.aadhaar_number,
        qualification: form.qualification.trim(),
        gender: form.gender,
        date_of_birth: form.date_of_birth,
      };
      const created = await session.authFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setMessage(
        created.credentials_emailed
          ? `User created. Login credentials were emailed to ${created.email}.`
          : `User created, but the credential email could not be sent. Check SMTP settings.`
      );
      setForm(initialForm);
      onCreated?.();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card dashboard-card stack-lg">
      <div className="stack-sm">
        <div className="eyebrow">Team Access</div>
        <h3>Create a user</h3>
        <p>
          Add a team member who works with leads. A temporary password is emailed automatically; the
          user sets their own on first login.
        </p>
      </div>

      {message ? <div className="success-box">{message}</div> : null}
      {error ? <div className="error-box">{error}</div> : null}

      <form className="stack-md" onSubmit={handleSubmit}>
        <div className="form-grid company-form-grid">
          <div className="field">
            <label>Name</label>
            <input
              required
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Full name"
            />
          </div>
          <div className="field">
            <label>Email Id</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="user@example.com"
            />
          </div>
          <div className="field">
            <label>Phone Number</label>
            <input
              required
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="+91 ..."
            />
          </div>
          <div className="field">
            <label>Aadhaar Number</label>
            <input
              required
              inputMode="numeric"
              value={form.aadhaar_number}
              onChange={(event) => updateField("aadhaar_number", event.target.value)}
              placeholder="12-digit Aadhaar"
            />
          </div>
          <div className="field full">
            <label>Address</label>
            <textarea
              required
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              placeholder="Residential address"
            />
          </div>
          <div className="field">
            <label>Qualification</label>
            <input
              required
              value={form.qualification}
              onChange={(event) => updateField("qualification", event.target.value)}
              placeholder="e.g. B.Tech, MBA"
            />
          </div>
          <div className="field">
            <label>Gender</label>
            <select value={form.gender} onChange={(event) => updateField("gender", event.target.value)}>
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Date of Birth</label>
            <input
              required
              type="date"
              value={form.date_of_birth}
              onChange={(event) => updateField("date_of_birth", event.target.value)}
            />
          </div>
        </div>

        <div className="dashboard-toolbar">
          <button className="button button-primary" type="submit" disabled={saving}>
            {saving ? "Creating user..." : "Create user"}
          </button>
        </div>
      </form>
    </section>
  );
}
