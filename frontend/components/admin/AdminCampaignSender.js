"use client";

import { useEffect, useMemo, useState } from "react";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const DEFAULT_SUBJECT =
  "Custom software & IT solutions, built around how your business runs — Musk-IT";

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseEmails(raw) {
  const valid = [];
  const invalid = [];
  const duplicates = [];
  const seen = new Set();

  for (const chunk of (raw || "").split(/[,\n;]+/)) {
    const candidate = chunk.trim().replace(/^<|>$/g, "").trim();
    if (!candidate) continue;
    const lowered = candidate.toLowerCase();
    if (!EMAIL_RE.test(lowered)) {
      invalid.push(candidate);
    } else if (seen.has(lowered)) {
      duplicates.push(lowered);
    } else {
      seen.add(lowered);
      valid.push(lowered);
    }
  }
  return { valid, invalid, duplicates };
}

export default function AdminCampaignSender({ session }) {
  const [emails, setEmails] = useState("");
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const [previewHtml, setPreviewHtml] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const [engagement, setEngagement] = useState(null);
  const [engagementLoading, setEngagementLoading] = useState(false);
  const [engagementError, setEngagementError] = useState("");

  const { valid, invalid, duplicates } = useMemo(() => parseEmails(emails), [emails]);

  async function loadEngagement() {
    if (!session.token) return;
    setEngagementLoading(true);
    setEngagementError("");
    try {
      const data = await session.authFetch("/admin/campaigns/recipients");
      setEngagement(data);
    } catch (e) {
      setEngagementError(e.message);
    } finally {
      setEngagementLoading(false);
    }
  }

  useEffect(() => {
    if (session.token) loadEngagement();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.token]);

  useEffect(() => {
    if (!showPreview || previewHtml || !session.token) return;
    let active = true;
    (async () => {
      try {
        const response = await session.authFetchRaw("/admin/campaigns/cold-outreach/preview");
        const html = await response.text();
        if (active) setPreviewHtml(html);
      } catch (e) {
        if (active) setPreviewError(e.message);
      }
    })();
    return () => {
      active = false;
    };
  }, [showPreview, previewHtml, session]);

  async function handleSend(event) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!valid.length) {
      setError("Enter at least one valid email address.");
      return;
    }

    const confirmed = window.confirm(
      `Send the Musk-IT capabilities email to ${valid.length} recipient${
        valid.length !== 1 ? "s" : ""
      }?`
    );
    if (!confirmed) return;

    setSending(true);
    try {
      const response = await session.authFetch("/admin/campaigns/cold-outreach", {
        method: "POST",
        body: JSON.stringify({ emails, subject: subject.trim() || undefined }),
      });
      setResult(response);
      if (response.failed === 0) {
        setEmails("");
      }
      loadEngagement();
    } catch (sendError) {
      setError(sendError.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="card dashboard-card stack-lg">
      <div className="stack-sm">
        <div className="eyebrow">Cold Outreach</div>
        <h3>Send the capabilities email</h3>
        <p>
          Paste your prospect email addresses below, separated by commas. Each person receives the
          same polished email showcasing Musk-IT&rsquo;s custom software and IT solutions — sent
          individually, so recipients never see each other.
        </p>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <form className="stack-md" onSubmit={handleSend}>
        <div className="field">
          <label>Recipient emails (comma separated)</label>
          <textarea
            required
            rows={5}
            value={emails}
            onChange={(event) => setEmails(event.target.value)}
            placeholder="priya@acme.com, founder@startup.in, ops@logistics.co"
            style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 13 }}
          />
        </div>

        {/* ── Parsed summary ───────────────────────────────────── */}
        {emails.trim() ? (
          <div className="stack-sm">
            <div className="dashboard-toolbar" style={{ gap: 8, flexWrap: "wrap" }}>
              <span className="status-pill pill-won">{valid.length} valid</span>
              {duplicates.length ? (
                <span className="status-pill pill-contacted">{duplicates.length} duplicate</span>
              ) : null}
              {invalid.length ? (
                <span className="status-pill pill-lost">{invalid.length} invalid</span>
              ) : null}
            </div>
            {valid.length ? (
              <div className="campaign-chip-row">
                {valid.slice(0, 40).map((email) => (
                  <span className="campaign-chip" key={email}>
                    {email}
                  </span>
                ))}
                {valid.length > 40 ? (
                  <span className="campaign-chip campaign-chip-more">
                    +{valid.length - 40} more
                  </span>
                ) : null}
              </div>
            ) : null}
            {invalid.length ? (
              <p className="muted" style={{ fontSize: 12 }}>
                Skipped (invalid): {invalid.slice(0, 8).join(", ")}
                {invalid.length > 8 ? "…" : ""}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="field">
          <label>Subject line</label>
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder={DEFAULT_SUBJECT}
          />
        </div>

        <div className="dashboard-toolbar" style={{ gap: 10, flexWrap: "wrap" }}>
          <button className="button button-primary" type="submit" disabled={sending || !valid.length}>
            {sending
              ? "Sending…"
              : `Send to ${valid.length} recipient${valid.length !== 1 ? "s" : ""}`}
          </button>
          <button
            className="button button-ghost"
            type="button"
            onClick={() => setShowPreview((open) => !open)}
          >
            {showPreview ? "Hide email preview" : "Preview email"}
          </button>
        </div>
      </form>

      {/* ── Email preview ────────────────────────────────────────── */}
      {showPreview ? (
        <div className="stack-sm">
          {previewError ? <div className="error-box">{previewError}</div> : null}
          {!previewHtml && !previewError ? (
            <div className="empty-state">Loading preview…</div>
          ) : null}
          {previewHtml ? (
            <iframe
              title="Email preview"
              srcDoc={previewHtml}
              style={{
                width: "100%",
                height: 620,
                border: "1px solid var(--border)",
                borderRadius: 16,
                background: "#edf2f8",
              }}
            />
          ) : null}
        </div>
      ) : null}

      {/* ── Send results ─────────────────────────────────────────── */}
      {result ? (
        <div className="stack-sm">
          <div
            className={result.failed === 0 ? "success-box" : "error-box"}
          >
            {result.sent} sent · {result.failed} failed
            {result.skipped_invalid.length
              ? ` · ${result.skipped_invalid.length} invalid skipped`
              : ""}
            {result.skipped_duplicates.length
              ? ` · ${result.skipped_duplicates.length} duplicates skipped`
              : ""}
          </div>
          {result.results?.length ? (
            <div className="admin-table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Status</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((row) => (
                    <tr key={row.email}>
                      <td>{row.email}</td>
                      <td>
                        <span
                          className={`status-pill ${
                            row.status === "sent" ? "pill-won" : "pill-lost"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="muted" style={{ fontSize: 12 }}>
                        {row.error_message || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ── Engagement / click tracking ──────────────────────────── */}
      <div className="stack-sm" style={{ borderTop: "1px solid var(--border)", paddingTop: 18 }}>
        <div className="dashboard-toolbar toolbar-spread">
          <div className="stack-sm">
            <h3 style={{ marginBottom: 0 }}>Recipients &amp; engagement</h3>
            <p className="muted" style={{ fontSize: 13 }}>
              {engagement
                ? `${engagement.total} sent · ${engagement.clicked} clicked the link`
                : "Track who opened the consultation link from the email."}
            </p>
          </div>
          <button
            className="button button-ghost btn-sm"
            type="button"
            onClick={loadEngagement}
            disabled={engagementLoading}
          >
            {engagementLoading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {engagementError ? <div className="error-box">{engagementError}</div> : null}

        {engagement?.recipients?.length ? (
          <div className="admin-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Recipient</th>
                  <th>Delivery</th>
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
                          row.status === "sent" ? "pill-won" : "pill-lost"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td>
                      {row.clicked ? (
                        <span className="status-pill pill-qualified">
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
        ) : !engagementLoading ? (
          <div className="empty-state">No campaign emails have been sent yet.</div>
        ) : null}
      </div>
    </section>
  );
}
