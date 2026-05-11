"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import AdminCompanyManager from "@/components/admin/AdminCompanyManager";
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

function formatStatus(status) {
  return status.replace(/_/g, " ");
}

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString();
}

function formatMoney(value, currency = "INR") {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export default function AdminLeadDashboard() {
  const session = useAdminSession();
  const [summary, setSummary] = useState(null);
  const [leads, setLeads] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");

  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [quotationModalOpen, setQuotationModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [workspaceLeadId, setWorkspaceLeadId] = useState("");
  const [workspaceInitialTab, setWorkspaceInitialTab] = useState("overview");

  const [quotationVault, setQuotationVault] = useState([]);
  const [quotationVaultLoading, setQuotationVaultLoading] = useState(false);
  const [quotationVaultError, setQuotationVaultError] = useState("");

  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState("");

  useEffect(() => {
    if (!session.ready || !session.token) {
      return;
    }

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
    if (!session.ready || !session.token || !quotationModalOpen) {
      return;
    }

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
    if (!session.ready || !session.token || !paymentModalOpen) {
      return;
    }

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
    setRefreshTick((current) => current + 1);
  }

  const selectedLead = leads.find((lead) => lead.id === workspaceLeadId) || null;

  if (!session.ready) {
    return (
      <section className="dashboard-wrapper">
        <div className="shell">
          <div className="empty-state">Loading admin session...</div>
        </div>
      </section>
    );
  }

  if (!session.token) {
    return (
      <AdminLoginCard
        session={session}
        description="Use OTP access to review leads, open focused workspaces, and manage quotations from one cleaner dashboard."
      />
    );
  }

  return (
    <>
      <section className="dashboard-wrapper">
        <div className="shell stack-lg">
          <div className="admin-page-head">
            <div className="stack-sm">
              <div className="eyebrow">Admin panel</div>
              <h1 className="admin-page-title">Lead management dashboard</h1>
              <p>
                Open focused modal workspaces for companies, quotations, payments, and lead actions
                instead of stacking every admin function on one page.
              </p>
            </div>
            <div className="dashboard-toolbar">
              <button className="button button-ghost" type="button" disabled={loading} onClick={refreshDashboard}>
                Refresh
              </button>
              <button className="button button-ghost" type="button" onClick={session.logout}>
                Logout
              </button>
            </div>
          </div>

          {dashboardError ? <div className="error-box">{dashboardError}</div> : null}

          {summary ? (
            <div className="dashboard-stats">
              <article className="stats-item">
                <span className="muted">Total leads</span>
                <strong>{summary.total_leads}</strong>
              </article>
              <article className="stats-item">
                <span className="muted">Qualified</span>
                <strong>{summary.qualified_leads}</strong>
              </article>
              <article className="stats-item">
                <span className="muted">Conversion rate</span>
                <strong>{summary.conversion_rate}%</strong>
              </article>
              <article className="stats-item">
                <span className="muted">Revenue</span>
                <strong>INR {summary.revenue}</strong>
              </article>
            </div>
          ) : null}

          <div className="admin-function-grid">
            <article className="card dashboard-card admin-function-card stack-md">
              <div className="stack-sm">
                <div className="eyebrow">Directory</div>
                <h3>Enterprise companies</h3>
                <p>Manage company codes, portal URLs, and contact ownership in a dedicated modal.</p>
              </div>
              <button className="button button-primary" type="button" onClick={() => setCompanyModalOpen(true)}>
                Open company registry
              </button>
            </article>

            <article className="card dashboard-card admin-function-card stack-md">
              <div className="stack-sm">
                <div className="eyebrow">Audit</div>
                <h3>Quotation vault</h3>
                <p>Review saved quotation records and download the stored DOCX and PDF audit copies.</p>
              </div>
              <button className="button button-primary" type="button" onClick={() => setQuotationModalOpen(true)}>
                Open quotation vault
              </button>
            </article>

            <article className="card dashboard-card admin-function-card stack-md">
              <div className="stack-sm">
                <div className="eyebrow">Payments</div>
                <h3>Payment timeline</h3>
                <p>Check quotations that have moved into payment creation, collection, and confirmation.</p>
              </div>
              <button className="button button-primary" type="button" onClick={() => setPaymentModalOpen(true)}>
                Open payments
              </button>
            </article>
          </div>

          <div className="card dashboard-card stack-md">
            <div className="dashboard-toolbar toolbar-spread">
              <div className="stack-sm">
                <h3>Lead pipeline</h3>
                <p>{loading ? "Refreshing data..." : `${leads.length} lead(s) in the current view.`}</p>
              </div>
              <div className="field admin-filter-field">
                <label>Status filter</label>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  {statusOptions.map((option) => (
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    const canQuote = ["qualified", "proposal_sent", "won"].includes(lead.status);
                    return (
                      <tr key={lead.id}>
                        <td>
                          <div className="stack-sm">
                            <button
                              className="lead-row-link button-reset"
                              type="button"
                              onClick={() => openLeadWorkspace(lead.id, "overview")}
                            >
                              {lead.full_name}
                            </button>
                            <div className="muted">{lead.company || lead.email}</div>
                          </div>
                        </td>
                        <td>
                          <span className="status-pill">{formatStatus(lead.status)}</span>
                        </td>
                        <td>{lead.request_type}</td>
                        <td>{formatDate(lead.created_at)}</td>
                        <td>
                          <div className="dashboard-toolbar">
                            <button
                              className="button button-ghost"
                              type="button"
                              onClick={() => openLeadWorkspace(lead.id, "overview")}
                            >
                              Workspace
                            </button>
                            <button
                              className={`button ${canQuote ? "button-primary" : "button-ghost"}`}
                              type="button"
                              onClick={() => openLeadWorkspace(lead.id, canQuote ? "quotation" : "pipeline")}
                            >
                              {canQuote ? "Send quotation" : "Pipeline stage"}
                            </button>
                            <Link className="button button-ghost" href={`/dashboard/leads/${lead.id}`}>
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

      <AdminModal
        open={companyModalOpen}
        eyebrow="Enterprise Directory"
        title="Company registry"
        description="Maintain company login domains, contact owners, and enterprise records without crowding the dashboard."
        onClose={() => setCompanyModalOpen(false)}
      >
        <AdminCompanyManager session={session} />
      </AdminModal>

      <AdminModal
        open={quotationModalOpen}
        eyebrow="Quotation Vault"
        title="Saved quotations and audit downloads"
        description="Every quotation generated in the admin workflow is stored here with its Word draft and stamped PDF copy."
        onClose={() => setQuotationModalOpen(false)}
      >
        {quotationVaultError ? <div className="error-box">{quotationVaultError}</div> : null}
        {quotationVaultLoading ? <div className="empty-state">Loading quotation vault...</div> : null}
        {!quotationVaultLoading && !quotationVault.length ? (
          <div className="empty-state">No quotations have been generated yet.</div>
        ) : null}
        <div className="quotation-vault-grid">
          {quotationVault.map((quotation) => (
            <article className="card detail-card stack-md quotation-vault-card" key={quotation.id}>
              <div className="dashboard-toolbar toolbar-spread">
                <div className="stack-sm">
                  <div className="eyebrow">{quotation.quotation_number}</div>
                  <h3>{quotation.lead_name}</h3>
                  <p>{quotation.company || quotation.lead_email}</p>
                </div>
                <span className="status-pill">{formatStatus(quotation.status)}</span>
              </div>
              <div className="meta-grid">
                <div className="meta-item">
                  <span className="muted">Created</span>
                  <strong>{formatDate(quotation.created_at)}</strong>
                </div>
                <div className="meta-item">
                  <span className="muted">Total</span>
                  <strong>{formatMoney(quotation.total_amount, quotation.currency)}</strong>
                </div>
              </div>
              <div className="dashboard-toolbar">
                <button
                  className="button button-ghost"
                  type="button"
                  onClick={() =>
                    session.downloadFile(
                      `/admin/quotations/${quotation.id}/docx`,
                      `${quotation.quotation_number}.docx`
                    )
                  }
                >
                  Download Word
                </button>
                <button
                  className="button button-ghost"
                  type="button"
                  onClick={() =>
                    session.downloadFile(
                      `/admin/quotations/${quotation.id}/pdf`,
                      `${quotation.quotation_number}.pdf`
                    )
                  }
                >
                  Download PDF
                </button>
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => {
                    setQuotationModalOpen(false);
                    openLeadWorkspace(quotation.lead_id, "quotation");
                  }}
                >
                  Open lead workspace
                </button>
              </div>
            </article>
          ))}
        </div>
      </AdminModal>

      <AdminModal
        open={paymentModalOpen}
        eyebrow="Payments"
        title="Quotation payment timeline"
        description="Track which quotations have moved into payment creation and which have already been settled."
        onClose={() => setPaymentModalOpen(false)}
      >
        {paymentsError ? <div className="error-box">{paymentsError}</div> : null}
        {paymentsLoading ? <div className="empty-state">Loading payments...</div> : null}
        {!paymentsLoading && !payments.length ? (
          <div className="empty-state">No payment records are available yet.</div>
        ) : null}
        <div className="quotation-vault-grid">
          {payments.map((payment) => (
            <article className="card detail-card stack-md quotation-vault-card" key={payment.id}>
              <div className="dashboard-toolbar toolbar-spread">
                <div className="stack-sm">
                  <div className="eyebrow">{payment.quotation_number || "Payment"}</div>
                  <h3>{payment.lead_name || "Lead record"}</h3>
                  <p>{payment.company || payment.receipt}</p>
                </div>
                <span className="status-pill">{formatStatus(payment.status)}</span>
              </div>
              <div className="meta-grid">
                <div className="meta-item">
                  <span className="muted">Created</span>
                  <strong>{formatDate(payment.created_at)}</strong>
                </div>
                <div className="meta-item">
                  <span className="muted">Total</span>
                  <strong>{formatMoney(payment.total_amount, payment.currency)}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      </AdminModal>

      <AdminModal
        open={Boolean(workspaceLeadId)}
        eyebrow="Lead Workspace"
        title={selectedLead ? `${selectedLead.full_name} workspace` : "Lead workspace"}
        description="Switch between lead functions in one modal workspace and trigger the quotation pipeline when the lead is qualified."
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
