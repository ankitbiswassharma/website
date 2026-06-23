"use client";

import { useEffect, useState } from "react";

function formatDate(dateValue) {
  if (!dateValue) return "-";
  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminUserList({ session, refreshKey = 0 }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!session.ready || !session.token) return;
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.ready, session.token, refreshKey]);

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
          <h3>Current users</h3>
          <p>{loading ? "Loading users..." : `${users.length} user record(s)`}</p>
        </div>
        <button className="button button-ghost btn-sm" type="button" onClick={loadUsers} disabled={loading}>
          Refresh
        </button>
      </div>

      {message ? <div className="success-box">{message}</div> : null}
      {error ? <div className="error-box">{error}</div> : null}

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
                  <button className="button button-ghost btn-sm" type="button" onClick={() => toggleActive(user)}>
                    {user.is_active ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !users.length ? <div className="empty-state">No users created yet.</div> : null}
      </div>
    </section>
  );
}
