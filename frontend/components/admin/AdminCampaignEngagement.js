"use client";

import { useEffect, useMemo, useState } from "react";

import AdminModal from "@/components/admin/AdminModal";

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Local YYYY-MM-DD key for a date value (string or Date). Returns null if absent/invalid.
function localDateKey(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function RecipientsTable({ rows }) {
  return (
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
          {rows.map((row) => (
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
  );
}

export default function AdminCampaignEngagement({ session }) {
  const [engagement, setEngagement] = useState(null);
  const [suppressions, setSuppressions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // History panel state
  const [showHistory, setShowHistory] = useState(false);
  const [historyDate, setHistoryDate] = useState("");
  const [historySearch, setHistorySearch] = useState("");

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

  const todayKey = localDateKey(new Date());

  const allRecipients = useMemo(
    () => engagement?.recipients || [],
    [engagement]
  );

  // Today = sent today, or not sent yet (queued / no sent_at). History = sent on a previous day.
  const { todayRecipients, historyRecipients } = useMemo(() => {
    const today = [];
    const history = [];
    for (const row of allRecipients) {
      const key = localDateKey(row.sent_at);
      if (key === null || key === todayKey) {
        today.push(row);
      } else {
        history.push(row);
      }
    }
    return { todayRecipients: today, historyRecipients: history };
  }, [allRecipients, todayKey]);

  const hasHistoryFilter = Boolean(historyDate) || historySearch.trim().length > 0;

  const filteredHistory = useMemo(() => {
    if (!hasHistoryFilter) return [];
    const q = historySearch.trim().toLowerCase();
    return historyRecipients.filter((row) => {
      if (historyDate && localDateKey(row.sent_at) !== historyDate) return false;
      if (q && !(row.recipient_email || "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [hasHistoryFilter, historyRecipients, historyDate, historySearch]);

  return (
    <>
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
        <div className="dashboard-toolbar" style={{ gap: 8 }}>
          <button
            className={`button btn-sm ${showHistory ? "button-primary" : "button-ghost"}`}
            type="button"
            onClick={() => setShowHistory((v) => !v)}
          >
            History{historyRecipients.length ? ` (${historyRecipients.length})` : ""}
          </button>
          <button
            className="button button-ghost btn-sm"
            type="button"
            onClick={loadEngagement}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      {/* Today's recipients */}
      {todayRecipients.length ? (
        <div className="stack-sm">
          <p className="muted" style={{ fontSize: 12, marginBottom: 0 }}>
            Sent today &amp; pending · {todayRecipients.length}
          </p>
          <RecipientsTable rows={todayRecipients} />
        </div>
      ) : !loading ? (
        <div className="empty-state">
          {allRecipients.length
            ? "No campaign emails sent today. Use History to view earlier sends."
            : "No campaign emails have been sent yet."}
        </div>
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

    <AdminModal
      open={showHistory}
      onClose={() => setShowHistory(false)}
      eyebrow="Click Tracking"
      title="Campaign History"
      description="Earlier sends, kept out of the main view. Pick a date or search by email to load them."
      size="xl"
    >
      <div className="stack-md">
        <div className="dashboard-toolbar" style={{ gap: 12, flexWrap: "wrap" }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Date sent</label>
            <input
              type="date"
              value={historyDate}
              max={todayKey}
              onChange={(event) => setHistoryDate(event.target.value)}
            />
          </div>
          <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
            <label>Search email</label>
            <input
              type="search"
              placeholder="Search by recipient email…"
              value={historySearch}
              onChange={(event) => setHistorySearch(event.target.value)}
            />
          </div>
          {hasHistoryFilter ? (
            <button
              className="button button-ghost btn-sm"
              type="button"
              style={{ alignSelf: "flex-end" }}
              onClick={() => {
                setHistoryDate("");
                setHistorySearch("");
              }}
            >
              Clear
            </button>
          ) : null}
        </div>

        {!historyRecipients.length ? (
          <div className="empty-state">No earlier campaign sends yet.</div>
        ) : !hasHistoryFilter ? (
          <div className="empty-state">
            Select a date or type an email above to load history.
          </div>
        ) : filteredHistory.length ? (
          <RecipientsTable rows={filteredHistory} />
        ) : (
          <div className="empty-state">No recipients match this filter.</div>
        )}
      </div>
    </AdminModal>
    </>
  );
}
