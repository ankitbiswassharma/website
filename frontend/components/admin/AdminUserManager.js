"use client";

import { useEffect, useState } from "react";

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

function formatDate(dateValue) {
  if (!dateValue) return "-";
  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminUserManager({ session }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!session.ready || !session.token) return;
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.ready, session.token]);

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const response = await session.authFetch("/admin/users");
      setUsers(response);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

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
      await loadUsers();
      setMessage(
        created.credentials_emailed
          ? `User created. Login credentials were emailed to ${created.email}.`
          : `User created, but the credential email could not be sent. Check SMTP settings.`
      );
      setForm(initialForm);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(user) {
    setError("");
    setMessage("");
    try {
      await session.authFetch(`/admin/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      await loadUsers();
    } catch (toggleError) {
      setError(toggleError.message);
    }
  }

  return (
    <section className="card dashboard-card stack-lg">
      <div className="dashboard-toolbar toolbar-spread">
        <div className="stack-sm">
          <div className="eyebrow">Team Access</div>
          <h3>Create &amp; manage users</h3>
          <p>
            Add team members who work with leads. A temporary password is emailed automatically; users
            set their own on first login.
          </p>
        </div>
      </div>

      {message ? <div className="success-box">{message}</div> : null}
      {error ? <div className="error-box">{error}</div> : null}

      <div className="company-manager-grid">
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
              <select
                value={form.gender}
                onChange={(event) => updateField("gender", event.target.value)}
              >
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

        <div className="stack-md">
          <div className="dashboard-toolbar toolbar-spread">
            <div className="stack-sm">
              <h3>Team members</h3>
              <p>{loading ? "Loading users..." : `${users.length} user record(s)`}</p>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Aadhaar</th>
                  <th>Status</th>
                  <th>Last login</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="stack-sm">
                        <strong>{user.name}</strong>
                        <div className="muted">
                          {user.email}
                          {user.phone ? ` · ${user.phone}` : ""}
                        </div>
                        {user.must_change_password ? (
                          <span className="muted" style={{ fontSize: 12 }}>
                            Pending first-login password change
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <span className="inline-code">
                        {user.aadhaar_last4 ? `XXXX XXXX ${user.aadhaar_last4}` : "-"}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${user.is_active ? "pill-won" : "pill-lost"}`}>
                        {user.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="muted" style={{ fontSize: 13 }}>
                      {user.last_login_at ? formatDate(user.last_login_at) : "Never"}
                    </td>
                    <td>
                      <button
                        className="button button-ghost btn-sm"
                        type="button"
                        onClick={() => toggleActive(user)}
                      >
                        {user.is_active ? "Disable" : "Enable"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && !users.length ? (
              <div className="empty-state">No users created yet.</div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
