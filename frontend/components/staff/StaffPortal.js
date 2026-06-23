"use client";

import { useEffect, useState } from "react";

import AdminLeadWorkspace from "@/components/admin/AdminLeadWorkspace";
import AdminModal from "@/components/admin/AdminModal";
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
  const label =
    STATUS_OPTIONS.find((option) => option.value === status)?.label || String(status).replace(/_/g, " ");
  return <span className={`status-pill ${STATUS_CLS[status] || ""}`}>{label}</span>;
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatMoney(value, currency = "INR") {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

const PAYMENT_CLS = {
  paid: "pill-won",
  captured: "pill-won",
  pending: "pill-proposal",
  created: "pill-contacted",
  failed: "pill-lost",
};

export default function StaffPortal({ session }) {
  const [view, setView] = useState("leads");
  const [leads, setLeads] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [workspaceLeadId, setWorkspaceLeadId] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  const [quotations, setQuotations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [commerceLoading, setCommerceLoading] = useState(false);
  const [commerceError, setCommerceError] = useState("");

  useEffect(() => {
    if (!session.token || view !== "leads") return;
    loadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.token, statusFilter, view, refreshTick]);

  useEffect(() => {
    if (!session.token || view !== "commerce") return;
    loadCommerce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.token, view, refreshTick]);

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

  async function loadCommerce() {
    setCommerceLoading(true);
    setCommerceError("");
    try {
      const [quotationsResponse, paymentsResponse] = await Promise.all([
        session.authFetch("/staff/quotations?mine=true"),
        session.authFetch("/staff/payments"),
      ]);
      setQuotations(quotationsResponse);
      setPayments(paymentsResponse);
    } catch (loadError) {
      setCommerceError(loadError.message);
    } finally {
      setCommerceLoading(false);
    }
  }

  function paymentForQuotation(quotationId) {
    return payments.find((payment) => payment.quotation_id === quotationId) || null;
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
    <>
      <section className="dashboard-wrapper">
        <div className="shell stack-lg">
          <div className="admin-page-head">
            <div className="stack-sm">
              <div className="eyebrow">Staff Portal</div>
              <h1 className="admin-page-title">
                {view === "password" ? "Account security" : "Lead workspace"}
              </h1>
              <p className="admin-page-sub">
                {profile ? `Signed in as ${profile.name}` : "Review and update the lead pipeline."}
              </p>
            </div>
            <div className="dashboard-toolbar">
              <button className="button button-ghost admin-icon-btn" type="button" onClick={session.logout}>
                Logout
              </button>
            </div>
          </div>

          <div className="admin-tab-strip">
            <button
              className={`admin-tab-button${view === "leads" ? " is-active" : ""}`}
              type="button"
              onClick={() => setView("leads")}
            >
              Leads
            </button>
            <button
              className={`admin-tab-button${view === "commerce" ? " is-active" : ""}`}
              type="button"
              onClick={() => setView("commerce")}
            >
              My quotations &amp; payments
            </button>
            <button
              className={`admin-tab-button${view === "password" ? " is-active" : ""}`}
              type="button"
              onClick={() => setView("password")}
            >
              Change password
            </button>
          </div>

          {error && view === "leads" ? <div className="error-box">{error}</div> : null}

          {view === "leads" ? (
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
                            className="button button-primary btn-sm"
                            type="button"
                            onClick={() => setWorkspaceLeadId(lead.id)}
                          >
                            Open workspace
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
          ) : null}

          {view === "commerce" ? (
            <div className="stack-lg">
              {commerceError ? <div className="error-box">{commerceError}</div> : null}

              <div className="card dashboard-card stack-md">
                <div className="dashboard-toolbar toolbar-spread">
                  <div className="stack-sm">
                    <h3>My quotations</h3>
                    <p className="muted" style={{ fontSize: 13 }}>
                      {commerceLoading ? "Loading…" : `${quotations.length} quotation(s) you created`}
                    </p>
                  </div>
                </div>
                <div className="admin-table-wrap">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Quotation</th>
                        <th>Client</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotations.map((quotation) => {
                        const payment = paymentForQuotation(quotation.id);
                        const paid = payment && ["paid", "captured"].includes(payment.status);
                        return (
                          <tr key={quotation.id}>
                            <td>
                              <strong>{quotation.quotation_number}</strong>
                            </td>
                            <td>
                              <div className="stack-sm">
                                <span>{quotation.lead_name}</span>
                                <span className="muted" style={{ fontSize: 12 }}>
                                  {quotation.company || quotation.lead_email}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className="status-pill">{String(quotation.status).replace(/_/g, " ")}</span>
                            </td>
                            <td>{formatMoney(quotation.total_amount, quotation.currency)}</td>
                            <td>
                              {payment ? (
                                <span className={`status-pill ${PAYMENT_CLS[payment.status] || ""}`}>
                                  {paid ? "Received" : String(payment.status).replace(/_/g, " ")}
                                </span>
                              ) : (
                                <span className="muted">No payment yet</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {!commerceLoading && !quotations.length ? (
                    <div className="empty-state">
                      You haven&apos;t created any quotations yet. Open a lead workspace to build one.
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="card dashboard-card stack-md">
                <div className="dashboard-toolbar toolbar-spread">
                  <div className="stack-sm">
                    <h3>Payments received</h3>
                    <p className="muted" style={{ fontSize: 13 }}>
                      Payment activity for the quotations you sent.
                    </p>
                  </div>
                </div>
                <div className="admin-table-wrap">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Quotation</th>
                        <th>Client</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th>Paid on</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id}>
                          <td>{payment.quotation_number || "-"}</td>
                          <td>{payment.lead_name || payment.company || "-"}</td>
                          <td>
                            <span className={`status-pill ${PAYMENT_CLS[payment.status] || ""}`}>
                              {String(payment.status).replace(/_/g, " ")}
                            </span>
                          </td>
                          <td>{formatMoney(payment.total_amount, payment.currency)}</td>
                          <td className="muted" style={{ fontSize: 13 }}>
                            {payment.paid_at ? formatDate(payment.paid_at) : "Awaiting"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!commerceLoading && !payments.length ? (
                    <div className="empty-state">No payments have been recorded for your quotations yet.</div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {view === "password" ? (
            <StaffChangePassword session={session} onDone={() => setView("leads")} />
          ) : null}
        </div>
      </section>

      <AdminModal
        open={Boolean(workspaceLeadId)}
        eyebrow="Lead Workspace"
        title="Lead workspace"
        description="Update the lead, build quotations, send them, and track payment."
        size="xxl"
        onClose={() => {
          setWorkspaceLeadId("");
          setRefreshTick((tick) => tick + 1);
        }}
      >
        {workspaceLeadId ? (
          <AdminLeadWorkspace
            session={session}
            leadId={workspaceLeadId}
            apiBase="/staff"
            onLeadChange={() => setRefreshTick((tick) => tick + 1)}
          />
        ) : null}
      </AdminModal>
    </>
  );
}
