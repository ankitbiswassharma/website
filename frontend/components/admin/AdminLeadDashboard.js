"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminCampaignEngagement from "@/components/admin/AdminCampaignEngagement";
import AdminCampaignSender from "@/components/admin/AdminCampaignSender";
import AdminCompanyManager from "@/components/admin/AdminCompanyManager";
import AdminUserCreate from "@/components/admin/AdminUserCreate";
import AdminUserList from "@/components/admin/AdminUserList";
import AdminLeadWorkspace from "@/components/admin/AdminLeadWorkspace";
import AdminLoginCard from "@/components/admin/AdminLoginCard";
import AdminModal from "@/components/admin/AdminModal";
import useAdminSession from "@/components/admin/useAdminSession";

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal_sent", label: "Proposal sent" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

const STATUS_META = {
  new:           { label: "New",           cls: "pill-new" },
  contacted:     { label: "Contacted",     cls: "pill-contacted" },
  qualified:     { label: "Qualified",     cls: "pill-qualified" },
  proposal_sent: { label: "Proposal sent", cls: "pill-proposal" },
  won:           { label: "Won",           cls: "pill-won" },
  lost:          { label: "Lost",          cls: "pill-lost" },
};

function StatusPill({ status }) {
  const meta = STATUS_META[status] || { label: status.replace(/_/g, " "), cls: "" };
  return <span className={`status-pill ${meta.cls}`}>{meta.label}</span>;
}

function LeadAvatar({ name }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
  return <span className="lead-avatar">{initials}</span>;
}

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatMoney(value, currency = "INR") {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatStatus(status) {
  return status.replace(/_/g, " ");
}

// ── Stat card icons ────────────────────────────────────────────────────────────
const STAT_ICONS = {
  leads: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  qualified: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  conversion: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 14l4-4 4 3 6-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  revenue: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="10" width="3" height="7" rx="1" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="8.5" y="6" width="3" height="11" rx="1" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="14" y="3" width="3" height="14" rx="1" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  ),
};

// ── Function card icons ────────────────────────────────────────────────────────
const FUNC_ICONS = {
  company: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="7" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M7 7V5a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M8 13h6M11 11v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  quotation: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M14 3H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-5-5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M14 3v5h5M8 13h6M8 10h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  payment: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M2 9h18" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M6 14h4M14 14h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  users: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M2.5 18c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M15 7.5a2.5 2.5 0 0 1 0 5M17 18c0-2.2-.9-3.7-2-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  campaign: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2.5" y="5" width="17" height="12" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M3 6l8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  engagement: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M9 3l9 4-4 1.6L19 13l-2 2-4.4-4.4L11 15z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M4 4.5l1.4 1.4M3 9h2M4 13.5l1.4-1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  analytics: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 3v16h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M7 14l3-3 2.5 2.5L18 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

export default function AdminLeadDashboard() {
  const session = useAdminSession();
  const [summary, setSummary] = useState(null);
  const [leads, setLeads] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");

  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [userCreateModalOpen, setUserCreateModalOpen] = useState(false);
  const [userListModalOpen, setUserListModalOpen] = useState(false);
  const [userRefreshKey, setUserRefreshKey] = useState(0);
  const [quotationModalOpen, setQuotationModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [engagementModalOpen, setEngagementModalOpen] = useState(false);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [workspaceLeadId, setWorkspaceLeadId] = useState("");
  const [workspaceInitialTab, setWorkspaceInitialTab] = useState("overview");

  const [quotationVault, setQuotationVault] = useState([]);
  const [quotationVaultLoading, setQuotationVaultLoading] = useState(false);
  const [quotationVaultError, setQuotationVaultError] = useState("");

  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState("");

  useEffect(() => {
    if (!session.ready || !session.token) return;
    async function loadDashboard() {
      setLoading(true);
      setDashboardError("");
      try {
        const query = statusFilter ? `?status_filter=${encodeURIComponent(statusFilter)}` : "";
        const [summaryResponse, leadsResponse] = await Promise.all([
          session.authFetch("/admin/dashboard/summary"),
          session.authFetch(`/admin/leads${query}`),
        ]);
        setSummary(summaryResponse);
        setLeads(leadsResponse);
      } catch (error) {
        setDashboardError(error.message);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [session.ready, session.token, statusFilter, refreshTick]);

  useEffect(() => {
    if (!session.ready || !session.token || !quotationModalOpen) return;
    async function loadQuotationVault() {
      setQuotationVaultLoading(true);
      setQuotationVaultError("");
      try {
        const response = await session.authFetch("/admin/quotations");
        setQuotationVault(response);
      } catch (error) {
        setQuotationVaultError(error.message);
      } finally {
        setQuotationVaultLoading(false);
      }
    }
    loadQuotationVault();
  }, [session.ready, session.token, quotationModalOpen, refreshTick]);

  useEffect(() => {
    if (!session.ready || !session.token || !paymentModalOpen) return;
    async function loadPayments() {
      setPaymentsLoading(true);
      setPaymentsError("");
      try {
        const response = await session.authFetch("/admin/payments");
        setPayments(response);
      } catch (error) {
        setPaymentsError(error.message);
      } finally {
        setPaymentsLoading(false);
      }
    }
    loadPayments();
  }, [session.ready, session.token, paymentModalOpen, refreshTick]);

  function openLeadWorkspace(leadId, initialTab = "overview") {
    setWorkspaceLeadId(leadId);
    setWorkspaceInitialTab(initialTab);
  }

  function refreshDashboard() {
    setRefreshTick((c) => c + 1);
  }

  const selectedLead = leads.find((l) => l.id === workspaceLeadId) || null;

  if (!session.ready) {
    return (
      <section className="dashboard-wrapper">
        <div className="shell"><div className="empty-state">Loading admin session…</div></div>
      </section>
    );
  }

  if (!session.token) {
    return (
      <AdminLoginCard
        session={session}
        description="OTP-secured access for reviewing leads, managing quotations, and tracking payments."
      />
    );
  }

  return (
    <>
      <section className="dashboard-wrapper">
        <div className="shell stack-lg">

          {/* ── Page header ─────────────────────────────────────── */}
          <div className="admin-page-head">
            <div className="stack-sm">
              <div className="eyebrow">Admin Panel</div>
              <h1 className="admin-page-title">Lead management</h1>
              <p className="admin-page-sub">
                Manage your sales pipeline, quotations, and client records from one place.
              </p>
            </div>
            <div className="dashboard-toolbar">
              <button className="button button-ghost admin-icon-btn" type="button" disabled={loading} onClick={refreshDashboard}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                  <path d="M13 7.5A5.5 5.5 0 1 1 7.5 2a5.5 5.5 0 0 1 4.5 2.34M13 2v2.5H10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Refresh
              </button>
              <button className="button button-ghost admin-icon-btn" type="button" onClick={session.logout}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                  <path d="M6 2H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3M10 10l3-2.5L10 5M5 7.5h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Logout
              </button>
            </div>
          </div>

          {dashboardError ? <div className="error-box">{dashboardError}</div> : null}

          {/* ── Summary stat cards ──────────────────────────────── */}
          {summary ? (
            <div className="admin-stat-grid">
              <article className="admin-stat-card">
                <div className="admin-stat-icon admin-stat-icon-indigo">{STAT_ICONS.leads}</div>
                <div className="admin-stat-body">
                  <span className="admin-stat-label">Total leads</span>
                  <strong className="admin-stat-value">{summary.total_leads}</strong>
                </div>
              </article>
              <article className="admin-stat-card">
                <div className="admin-stat-icon admin-stat-icon-amber">{STAT_ICONS.qualified}</div>
                <div className="admin-stat-body">
                  <span className="admin-stat-label">Qualified</span>
                  <strong className="admin-stat-value">{summary.qualified_leads}</strong>
                </div>
              </article>
              <article className="admin-stat-card">
                <div className="admin-stat-icon admin-stat-icon-violet">{STAT_ICONS.conversion}</div>
                <div className="admin-stat-body">
                  <span className="admin-stat-label">Conversion rate</span>
                  <strong className="admin-stat-value">{summary.conversion_rate}%</strong>
                </div>
              </article>
              <article className="admin-stat-card">
                <div className="admin-stat-icon admin-stat-icon-emerald">{STAT_ICONS.revenue}</div>
                <div className="admin-stat-body">
                  <span className="admin-stat-label">Revenue collected</span>
                  <strong className="admin-stat-value admin-stat-value-sm">
                    {formatMoney(summary.revenue)}
                  </strong>
                </div>
              </article>
            </div>
          ) : null}

          {/* ── Function shortcut cards ─────────────────────────── */}
          <div className="admin-function-grid">
            <button
              className="admin-func-card"
              type="button"
              onClick={() => setCompanyModalOpen(true)}
            >
              <div className="admin-func-icon admin-func-icon-indigo">{FUNC_ICONS.company}</div>
              <div className="admin-func-body">
                <div className="eyebrow" style={{ fontSize: 10 }}>Directory</div>
                <strong>Enterprise companies</strong>
                <p>Manage codes, portal URLs, and ownership</p>
              </div>
              <svg className="admin-func-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <button
              className="admin-func-card"
              type="button"
              onClick={() => setUserCreateModalOpen(true)}
            >
              <div className="admin-func-icon admin-func-icon-indigo">{FUNC_ICONS.users}</div>
              <div className="admin-func-body">
                <div className="eyebrow" style={{ fontSize: 10 }}>Team</div>
                <strong>Create user</strong>
                <p>Add a staff account that works with leads</p>
              </div>
              <svg className="admin-func-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <button
              className="admin-func-card"
              type="button"
              onClick={() => setUserListModalOpen(true)}
            >
              <div className="admin-func-icon admin-func-icon-violet">{FUNC_ICONS.users}</div>
              <div className="admin-func-body">
                <div className="eyebrow" style={{ fontSize: 10 }}>Team</div>
                <strong>View users</strong>
                <p>See current staff and enable or disable access</p>
              </div>
              <svg className="admin-func-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <button
              className="admin-func-card"
              type="button"
              onClick={() => setQuotationModalOpen(true)}
            >
              <div className="admin-func-icon admin-func-icon-violet">{FUNC_ICONS.quotation}</div>
              <div className="admin-func-body">
                <div className="eyebrow" style={{ fontSize: 10 }}>Audit</div>
                <strong>Quotation vault</strong>
                <p>Download DOCX and PDF audit copies</p>
              </div>
              <svg className="admin-func-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <button
              className="admin-func-card"
              type="button"
              onClick={() => setPaymentModalOpen(true)}
            >
              <div className="admin-func-icon admin-func-icon-emerald">{FUNC_ICONS.payment}</div>
              <div className="admin-func-body">
                <div className="eyebrow" style={{ fontSize: 10 }}>Payments</div>
                <strong>Payment timeline</strong>
                <p>Track payment creation and settlement</p>
              </div>
              <svg className="admin-func-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <button
              className="admin-func-card"
              type="button"
              onClick={() => setCampaignModalOpen(true)}
            >
              <div className="admin-func-icon admin-func-icon-indigo">{FUNC_ICONS.campaign}</div>
              <div className="admin-func-body">
                <div className="eyebrow" style={{ fontSize: 10 }}>Outreach</div>
                <strong>Email campaign</strong>
                <p>Send the capabilities email to prospects</p>
              </div>
              <svg className="admin-func-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <button
              className="admin-func-card"
              type="button"
              onClick={() => setEngagementModalOpen(true)}
            >
              <div className="admin-func-icon admin-func-icon-emerald">{FUNC_ICONS.engagement}</div>
              <div className="admin-func-body">
                <div className="eyebrow" style={{ fontSize: 10 }}>Outreach</div>
                <strong>Campaign engagement</strong>
                <p>See who received and clicked the email</p>
              </div>
              <svg className="admin-func-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <button
              className="admin-func-card"
              type="button"
              onClick={() => setAnalyticsModalOpen(true)}
            >
              <div className="admin-func-icon admin-func-icon-violet">{FUNC_ICONS.analytics}</div>
              <div className="admin-func-body">
                <div className="eyebrow" style={{ fontSize: 10 }}>Insights</div>
                <strong>Pipeline analytics</strong>
                <p>Conversion funnel, sources, and trend</p>
              </div>
              <svg className="admin-func-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* ── Lead pipeline table ─────────────────────────────── */}
          <div className="card dashboard-card stack-md">
            <div className="dashboard-toolbar toolbar-spread">
              <div className="stack-sm">
                <h3>Lead pipeline</h3>
                <p className="muted" style={{ fontSize: 13 }}>
                  {loading ? "Refreshing…" : `${leads.length} lead${leads.length !== 1 ? "s" : ""} in current view`}
                </p>
              </div>
              <div className="field admin-filter-field" style={{ marginBottom: 0 }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ minWidth: 160 }}
                >
                  {statusOptions.map((o) => (
                    <option key={o.value || "all"} value={o.value}>{o.label}</option>
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    const canQuote = ["qualified", "proposal_sent", "won"].includes(lead.status);
                    return (
                      <tr key={lead.id}>
                        <td>
                          <div className="lead-client-cell">
                            <LeadAvatar name={lead.full_name} />
                            <div>
                              <button
                                className="lead-row-link button-reset"
                                type="button"
                                onClick={() => openLeadWorkspace(lead.id, "overview")}
                              >
                                {lead.full_name}
                              </button>
                              <div className="muted" style={{ fontSize: 12 }}>
                                {lead.company || lead.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td><StatusPill status={lead.status} /></td>
                        <td>
                          <span className="admin-request-tag">{lead.request_type}</span>
                        </td>
                        <td className="muted" style={{ fontSize: 13 }}>{formatDate(lead.created_at)}</td>
                        <td>
                          <div className="dashboard-toolbar" style={{ gap: 6 }}>
                            <button
                              className="button button-ghost btn-sm"
                              type="button"
                              onClick={() => openLeadWorkspace(lead.id, "overview")}
                            >
                              Workspace
                            </button>
                            <button
                              className={`button btn-sm ${canQuote ? "button-primary" : "button-ghost"}`}
                              type="button"
                              onClick={() => openLeadWorkspace(lead.id, canQuote ? "quotation" : "pipeline")}
                            >
                              {canQuote ? "Quote" : "Pipeline"}
                            </button>
                            <Link className="button button-ghost btn-sm" href={`/dashboard/leads/${lead.id}`}>
                              Full page
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!loading && !leads.length ? (
                <div className="empty-state">No leads match the selected status.</div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* ── Modals ──────────────────────────────────────────────── */}
      <AdminModal
        open={companyModalOpen}
        eyebrow="Enterprise Directory"
        title="Company registry"
        description="Maintain company login domains, contact owners, and enterprise records."
        onClose={() => setCompanyModalOpen(false)}
      >
        <AdminCompanyManager session={session} />
      </AdminModal>

      <AdminModal
        open={userCreateModalOpen}
        eyebrow="Team Access"
        title="Create user"
        description="Add a new staff account. Login credentials are emailed automatically."
        onClose={() => setUserCreateModalOpen(false)}
      >
        <AdminUserCreate
          session={session}
          onCreated={() => setUserRefreshKey((key) => key + 1)}
        />
      </AdminModal>

      <AdminModal
        open={userListModalOpen}
        eyebrow="Team Access"
        title="Current users"
        description="Review staff accounts and enable or disable who can work with leads."
        onClose={() => setUserListModalOpen(false)}
      >
        <AdminUserList session={session} refreshKey={userRefreshKey} />
      </AdminModal>

      <AdminModal
        open={quotationModalOpen}
        eyebrow="Quotation Vault"
        title="Saved quotations"
        description="Every generated quotation is stored here with its Word draft and stamped PDF."
        onClose={() => setQuotationModalOpen(false)}
      >
        {quotationVaultError ? <div className="error-box">{quotationVaultError}</div> : null}
        {quotationVaultLoading ? <div className="empty-state">Loading vault…</div> : null}
        {!quotationVaultLoading && !quotationVault.length ? (
          <div className="empty-state">No quotations have been generated yet.</div>
        ) : null}
        <div className="quotation-vault-grid">
          {quotationVault.map((q) => (
            <article className="card detail-card stack-md quotation-vault-card" key={q.id}>
              <div className="dashboard-toolbar toolbar-spread">
                <div className="stack-sm">
                  <div className="eyebrow">{q.quotation_number}</div>
                  <h3>{q.lead_name}</h3>
                  <p>{q.company || q.lead_email}</p>
                </div>
                <StatusPill status={q.status} />
              </div>
              <div className="meta-grid">
                <div className="meta-item">
                  <span className="muted">Created</span>
                  <strong>{formatDate(q.created_at)}</strong>
                </div>
                <div className="meta-item">
                  <span className="muted">Total</span>
                  <strong>{formatMoney(q.total_amount, q.currency)}</strong>
                </div>
              </div>
              <div className="dashboard-toolbar">
                <button className="button button-ghost btn-sm" type="button"
                  onClick={() => session.downloadFile(`/admin/quotations/${q.id}/docx`, `${q.quotation_number}.docx`)}>
                  Word
                </button>
                <button className="button button-ghost btn-sm" type="button"
                  onClick={() => session.downloadFile(`/admin/quotations/${q.id}/pdf`, `${q.quotation_number}.pdf`)}>
                  PDF
                </button>
                <button className="button button-primary btn-sm" type="button"
                  onClick={() => { setQuotationModalOpen(false); openLeadWorkspace(q.lead_id, "quotation"); }}>
                  Open workspace
                </button>
              </div>
            </article>
          ))}
        </div>
      </AdminModal>

      <AdminModal
        open={paymentModalOpen}
        eyebrow="Payments"
        title="Payment timeline"
        description="Track which quotations have moved into payment and which have settled."
        onClose={() => setPaymentModalOpen(false)}
      >
        {paymentsError ? <div className="error-box">{paymentsError}</div> : null}
        {paymentsLoading ? <div className="empty-state">Loading payments…</div> : null}
        {!paymentsLoading && !payments.length ? (
          <div className="empty-state">No payment records yet.</div>
        ) : null}
        <div className="quotation-vault-grid">
          {payments.map((p) => (
            <article className="card detail-card stack-md quotation-vault-card" key={p.id}>
              <div className="dashboard-toolbar toolbar-spread">
                <div className="stack-sm">
                  <div className="eyebrow">{p.quotation_number || "Payment"}</div>
                  <h3>{p.lead_name || "Lead record"}</h3>
                  <p>{p.company || p.receipt}</p>
                </div>
                <StatusPill status={p.status} />
              </div>
              <div className="meta-grid">
                <div className="meta-item">
                  <span className="muted">Created</span>
                  <strong>{formatDate(p.created_at)}</strong>
                </div>
                <div className="meta-item">
                  <span className="muted">Total</span>
                  <strong>{formatMoney(p.total_amount, p.currency)}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      </AdminModal>

      <AdminModal
        open={campaignModalOpen}
        eyebrow="Cold Outreach"
        title="Email campaign"
        description="Enter prospect emails (comma separated) and send the Musk-IT capabilities email to each."
        size="xl"
        onClose={() => setCampaignModalOpen(false)}
      >
        <AdminCampaignSender session={session} />
      </AdminModal>

      <AdminModal
        open={engagementModalOpen}
        eyebrow="Click Tracking"
        title="Campaign engagement"
        description="See which recipients received the email and who clicked the consultation link."
        size="xl"
        onClose={() => setEngagementModalOpen(false)}
      >
        <AdminCampaignEngagement session={session} />
      </AdminModal>

      <AdminModal
        open={analyticsModalOpen}
        eyebrow="Insights"
        title="Pipeline analytics"
        description="Your lead-to-paid conversion funnel, lead sources, and recent trend."
        size="xl"
        onClose={() => setAnalyticsModalOpen(false)}
      >
        <AdminAnalytics session={session} />
      </AdminModal>

      <AdminModal
        open={Boolean(workspaceLeadId)}
        eyebrow="Lead Workspace"
        title={selectedLead ? `${selectedLead.full_name}` : "Lead workspace"}
        description={selectedLead ? `${selectedLead.company || selectedLead.email} · ${selectedLead.request_type}` : ""}
        size="xxl"
        onClose={() => setWorkspaceLeadId("")}
      >
        {workspaceLeadId ? (
          <AdminLeadWorkspace
            session={session}
            leadId={workspaceLeadId}
            initialTab={workspaceInitialTab}
            onLeadChange={refreshDashboard}
          />
        ) : null}
      </AdminModal>
    </>
  );
}
