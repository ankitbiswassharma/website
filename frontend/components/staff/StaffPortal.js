"use client";

import { useEffect, useState } from "react";

import StaffChangePassword from "@/components/staff/StaffChangePassword";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal_sent", label: "Proposal sent" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

const FILTER_OPTIONS = [{ value: "", label: "All statuses" }, ...STATUS_OPTIONS];

const STATUS_CLS = {
  new: "pill-new",
  contacted: "pill-contacted",
  qualified: "pill-qualified",
  proposal_sent: "pill-proposal",
  won: "pill-won",
  lost: "pill-lost",
};

function StatusPill({ status }) {
  const label = STATUS_OPTIONS.find((option) => option.value === status)?.label || status;
  return <span className={`status-pill ${STATUS_CLS[status] || ""}`}>{label}</span>;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function StaffPortal({ session }) {
  const [leads, setLeads] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [draftStatus, setDraftStatus] = useState("");
  const [draftNotes, setDraftNotes] = useState("");
  const [savingLead, setSavingLead] = useState(false);
  const [leadMessage, setLeadMessage] = useState("");
  const [showPasswordPanel, setShowPasswordPanel] = useState(false);

  useEffect(() => {
    if (!session.token) return;
    loadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.token, statusFilter]);

  async function loadLeads() {
    setLoading(true);
    setError("");
    try {
      const query = statusFilter ? `?status_filter=${encodeURIComponent(statusFilter)}` : "";
      const response = await session.authFetch(`/staff/leads${query}`);
      setLeads(response);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  async function openLead(leadId) {
    setSelectedId(leadId);
    setDetail(null);
    setLeadMessage("");
    setDetailLoading(true);
    try {
      const response = await session.authFetch(`/staff/leads/${leadId}`);
      setDetail(response);
      setDraftStatus(response.status);
      setDraftNotes(response.admin_notes || "");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setDetailLoading(false);
    }
  }

  async function saveLead() {
    if (!detail) return;
    setSavingLead(true);
    setLeadMessage("");
    setError("");
    try {
      const body = {};
      if (draftStatus !== detail.status) body.status = draftStatus;
      if (draftNotes !== (detail.admin_notes || "")) body.admin_notes = draftNotes;
      if (Object.keys(body).length === 0) {
        setLeadMessage("No changes to save.");
        setSavingLead(false);
        return;
      }
      const updated = await session.authFetch(`/staff/leads/${detail.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setDetail(updated);
      setDraftStatus(updated.status);
      setDraftNotes(updated.admin_notes || "");
      setLeadMessage("Lead updated.");
      loadLeads();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSavingLead(false);
    }
  }

  const profile = session.profile;

  if (profile?.must_change_password) {
    return (
      <section className="dashboard-wrapper">
        <div className="shell stack-lg">
          <div className="admin-page-head">
            <div className="stack-sm">
              <div className="eyebrow">Staff Portal</div>
              <h1 className="admin-page-title">Welcome, {profile.name}</h1>
              <p className="admin-page-sub">One quick step before you start.</p>
            </div>
            <div className="dashboard-toolbar">
              <button className="button button-ghost admin-icon-btn" type="button" onClick={session.logout}>
                Logout
              </button>
            </div>
          </div>
          <StaffChangePassword session={session} forced />
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-wrapper">
      <div className="shell stack-lg">
        <div className="admin-page-head">
          <div className="stack-sm">
            <div className="eyebrow">Staff Portal</div>
            <h1 className="admin-page-title">Lead workspace</h1>
            <p className="admin-page-sub">
              {profile ? `Signed in as ${profile.name}` : "Review and update the lead pipeline."}
            </p>
          </div>
          <div className="dashboard-toolbar">
            <button
              className="button button-ghost admin-icon-btn"
              type="button"
              onClick={() => setShowPasswordPanel((value) => !value)}
            >
              {showPasswordPanel ? "Back to leads" : "Change password"}
            </button>
            <button className="button button-ghost admin-icon-btn" type="button" onClick={session.logout}>
              Logout
            </button>
          </div>
        </div>

        {error ? <div className="error-box">{error}</div> : null}

        {showPasswordPanel ? (
          <StaffChangePassword session={session} onDone={() => setShowPasswordPanel(false)} />
        ) : (
          <>
            <div className="card dashboard-card stack-md">
              <div className="dashboard-toolbar toolbar-spread">
                <div className="stack-sm">
                  <h3>Lead pipeline</h3>
                  <p className="muted" style={{ fontSize: 13 }}>
                    {loading ? "Refreshing…" : `${leads.length} lead${leads.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <div className="field admin-filter-field" style={{ marginBottom: 0 }}>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    style={{ minWidth: 160 }}
                  >
                    {FILTER_OPTIONS.map((option) => (
                      <option key={option.value || "all"} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-table-wrap">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Status</th>
                      <th>Request</th>
                      <th>Created</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id}>
                        <td>
                          <div className="stack-sm">
                            <strong>{lead.full_name}</strong>
                            <div className="muted" style={{ fontSize: 12 }}>
                              {lead.company || lead.email}
                            </div>
                          </div>
                        </td>
                        <td>
                          <StatusPill status={lead.status} />
                        </td>
                        <td>
                          <span className="admin-request-tag">{lead.request_type}</span>
                        </td>
                        <td className="muted" style={{ fontSize: 13 }}>
                          {formatDate(lead.created_at)}
                        </td>
                        <td>
                          <button
                            className="button button-ghost btn-sm"
                            type="button"
                            onClick={() => openLead(lead.id)}
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!loading && !leads.length ? (
                  <div className="empty-state">No leads match the selected status.</div>
                ) : null}
              </div>
            </div>

            {selectedId ? (
              <div className="card dashboard-card stack-md">
                {detailLoading ? <div className="empty-state">Loading lead…</div> : null}
                {detail ? (
                  <>
                    <div className="dashboard-toolbar toolbar-spread">
                      <div className="stack-sm">
                        <div className="eyebrow">{detail.lead_reference || "Lead"}</div>
                        <h3>{detail.full_name}</h3>
                        <p className="muted">
                          {detail.email}
                          {detail.phone ? ` · ${detail.phone}` : ""}
                          {detail.company ? ` · ${detail.company}` : ""}
                        </p>
                      </div>
                      <button
                        className="button button-ghost btn-sm"
                        type="button"
                        onClick={() => {
                          setSelectedId("");
                          setDetail(null);
                        }}
                      >
                        Close
                      </button>
                    </div>

                    {detail.client_requirements_text ? (
                      <div className="stack-sm">
                        <span className="muted">Requirement</span>
                        <p>{detail.client_requirements_text}</p>
                      </div>
                    ) : null}

                    {leadMessage ? <div className="success-box">{leadMessage}</div> : null}

                    <div className="form-grid company-form-grid">
                      <div className="field">
                        <label>Status</label>
                        <select value={draftStatus} onChange={(event) => setDraftStatus(event.target.value)}>
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="field full">
                        <label>Notes</label>
                        <textarea
                          value={draftNotes}
                          onChange={(event) => setDraftNotes(event.target.value)}
                          placeholder="Add an internal note about this lead"
                        />
                      </div>
                    </div>

                    <div className="dashboard-toolbar">
                      <button
                        className="button button-primary"
                        type="button"
                        disabled={savingLead}
                        onClick={saveLead}
                      >
                        {savingLead ? "Saving…" : "Save changes"}
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
