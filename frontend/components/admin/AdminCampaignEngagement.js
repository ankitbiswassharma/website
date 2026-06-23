"use client";

import { useEffect, useState } from "react";

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminCampaignEngagement({ session }) {
  const [engagement, setEngagement] = useState(null);
  const [suppressions, setSuppressions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadEngagement() {
    if (!session.token) return;
    setLoading(true);
    setError("");
    try {
      const [data, supp] = await Promise.all([
        session.authFetch("/admin/campaigns/recipients"),
        session.authFetch("/admin/campaigns/suppressions"),
      ]);
      setEngagement(data);
      setSuppressions(supp || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session.token) loadEngagement();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.token]);

  return (
    <section className="card dashboard-card stack-lg">
      <div className="dashboard-toolbar toolbar-spread">
        <div className="stack-sm">
          <div className="eyebrow">Click Tracking</div>
          <h3>Recipients &amp; engagement</h3>
          <p className="muted" style={{ fontSize: 13 }}>
            {engagement
              ? `${engagement.total} recipients · ${engagement.sent} delivered · ${engagement.opened} opened · ${engagement.clicked} clicked`
              : "Track which recipients opened the email and clicked the consultation link."}
          </p>
        </div>
        <button
          className="button button-ghost btn-sm"
          type="button"
          onClick={loadEngagement}
          disabled={loading}
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      {engagement?.recipients?.length ? (
        <div className="admin-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Recipient</th>
                <th>Delivery</th>
                <th>Opened</th>
                <th>Clicked link</th>
                <th>Sent</th>
                <th>Last click</th>
              </tr>
            </thead>
            <tbody>
              {engagement.recipients.map((row) => (
                <tr key={row.id}>
                  <td>{row.recipient_email}</td>
                  <td>
                    <span
                      className={`status-pill ${
                        row.status === "sent"
                          ? "pill-won"
                          : row.status === "queued"
                          ? "pill-contacted"
                          : "pill-lost"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td>
                    {row.opened ? (
                      <span className="status-pill pill-qualified">
                        Opened{row.open_count > 1 ? ` ×${row.open_count}` : ""}
                      </span>
                    ) : (
                      <span className="muted" style={{ fontSize: 13 }}>Not yet</span>
                    )}
                  </td>
                  <td>
                    {row.clicked ? (
                      <span className="status-pill pill-won">
                        Clicked{row.click_count > 1 ? ` ×${row.click_count}` : ""}
                      </span>
                    ) : (
                      <span className="muted" style={{ fontSize: 13 }}>Not yet</span>
                    )}
                  </td>
                  <td className="muted" style={{ fontSize: 12 }}>{formatDateTime(row.sent_at)}</td>
                  <td className="muted" style={{ fontSize: 12 }}>{formatDateTime(row.last_clicked_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !loading ? (
        <div className="empty-state">No campaign emails have been sent yet.</div>
      ) : null}

      {suppressions.length ? (
        <div className="stack-sm" style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <h3 style={{ marginBottom: 0, fontSize: 15 }}>
            Unsubscribed ({suppressions.length})
          </h3>
          <p className="muted" style={{ fontSize: 12 }}>
            These addresses opted out and are automatically skipped on future sends.
          </p>
          <div className="campaign-chip-row">
            {suppressions.slice(0, 60).map((s) => (
              <span className="campaign-chip" key={s.email}>{s.email}</span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
