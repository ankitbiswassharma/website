"use client";

import { useEffect, useState } from "react";

const initialForm = {
  name: "",
  company_code: "",
  address: "",
  contact_person: "",
  contact_email: "",
};

function normalizeCompanyCode(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
}

export default function AdminCompanyManager({ session }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!session.ready || !session.token) {
      return;
    }

    async function loadCompanies() {
      setLoading(true);
      setError("");
      try {
        const response = await session.authFetch("/admin/companies");
        setCompanies(response);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadCompanies();
  }, [session.ready, session.token]);

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: key === "company_code" ? normalizeCompanyCode(value) : value,
    }));
  }

  function resetForm() {
    setEditingId("");
    setForm(initialForm);
  }

  function startEdit(company) {
    setEditingId(company.id);
    setMessage("");
    setError("");
    setForm({
      name: company.name || "",
      company_code: company.company_code || "",
      address: company.address || "",
      contact_person: company.contact_person || "",
      contact_email: company.contact_email || "",
    });
  }

  async function reloadCompanies(nextEditingId = editingId) {
    const response = await session.authFetch("/admin/companies");
    setCompanies(response);
    if (nextEditingId) {
      const updated = response.find((item) => item.id === nextEditingId);
      if (updated) {
        startEdit(updated);
      }
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        name: form.name.trim(),
        company_code: normalizeCompanyCode(form.company_code),
        address: form.address.trim(),
        contact_person: form.contact_person.trim(),
        contact_email: form.contact_email.trim(),
      };
      const path = editingId ? `/admin/companies/${editingId}` : "/admin/companies";
      const method = editingId ? "PATCH" : "POST";
      await session.authFetch(path, {
        method,
        body: JSON.stringify(payload),
      });
      await reloadCompanies("");
      setMessage(editingId ? "Company details updated." : "Company added to the enterprise directory.");
      resetForm();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card dashboard-card stack-lg">
      <div className="dashboard-toolbar toolbar-spread">
        <div className="stack-sm">
          <div className="eyebrow">Enterprise Directory</div>
          <h3>Company login registry</h3>
          <p>Add companies, assign company codes, and keep the enterprise login list in sync.</p>
        </div>
      </div>

      {message ? <div className="success-box">{message}</div> : null}
      {error ? <div className="error-box">{error}</div> : null}

      <div className="company-manager-grid">
        <form className="stack-md" onSubmit={handleSubmit}>
          <div className="form-grid company-form-grid">
            <div className="field">
              <label>Company Name</label>
              <input
                required
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Apple Projects Ltd"
              />
            </div>
            <div className="field">
              <label>Company Code</label>
              <input
                required
                value={form.company_code}
                onChange={(event) => updateField("company_code", event.target.value)}
                placeholder="APPL"
              />
            </div>
            <div className="field full">
              <label>Address</label>
              <textarea
                value={form.address}
                onChange={(event) => updateField("address", event.target.value)}
                placeholder="Registered office or project HQ address."
              />
            </div>
            <div className="field">
              <label>Contact Person</label>
              <input
                value={form.contact_person}
                onChange={(event) => updateField("contact_person", event.target.value)}
                placeholder="Primary decision maker"
              />
            </div>
            <div className="field">
              <label>Contact Email</label>
              <input
                type="email"
                value={form.contact_email}
                onChange={(event) => updateField("contact_email", event.target.value)}
                placeholder="Optional but recommended"
              />
            </div>
          </div>

          <div className="stack-sm">
            <span className="muted">
              Login link preview:{" "}
              <span className="inline-code">
                {form.company_code ? `https://${form.company_code.toLowerCase()}.muskit.in` : "company_code.muskit.in"}
              </span>
            </span>
            <div className="dashboard-toolbar">
              <button className="button button-primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update company" : "Add company"}
              </button>
              {editingId ? (
                <button className="button button-ghost" type="button" onClick={resetForm}>
                  Cancel edit
                </button>
              ) : null}
            </div>
          </div>
        </form>

        <div className="stack-md">
          <div className="dashboard-toolbar toolbar-spread">
            <div className="stack-sm">
              <h3>Registered companies</h3>
              <p>{loading ? "Refreshing enterprise directory..." : `${companies.length} company record(s)`}</p>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Code</th>
                  <th>Portal</th>
                  <th>Latest Lead</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id}>
                    <td>
                      <div className="stack-sm">
                        <strong>{company.name}</strong>
                        <div className="muted">
                          {company.contact_person || "No contact person"}{" "}
                          {company.contact_email ? `· ${company.contact_email}` : ""}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="inline-code">{company.company_code}</span>
                    </td>
                    <td>
                      <a className="company-link" href={company.login_url} target="_blank" rel="noreferrer">
                        {company.login_url}
                      </a>
                    </td>
                    <td>{company.latest_lead_reference || "-"}</td>
                    <td>
                      <button className="button button-ghost" type="button" onClick={() => startEdit(company)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && !companies.length ? (
              <div className="empty-state">No companies are registered yet.</div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
