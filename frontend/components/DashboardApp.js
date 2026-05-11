"use client";

import { useDeferredValue, useEffect, useState } from "react";

import { apiJson, buildApiUrl } from "@/lib/api";

function emptyQuoteDraft() {
  const validUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  return {
    title: "Custom Business Software Proposal",
    intro_message: "",
    requirements_summary: "",
    tax_rate: "18",
    valid_until: validUntil,
    send_email: true,
    personalized_message: "",
    items: [{ title: "Business workflow system", description: "", quantity: "1", unit_price: "0" }],
  };
}

function quoteDraftFromLead(lead) {
  const draft = emptyQuoteDraft();
  draft.requirements_summary = lead?.client_requirements_text || "";
  draft.items = [
    {
      title: `${lead?.project_type || "ERP"} enablement package`,
      description: "Custom platform rollout, workflow setup, and onboarding scope",
      quantity: "1",
      unit_price: "0",
    },
  ];
  return draft;
}

function paymentLinkDraftFromLead(lead) {
  const name = lead?.full_name || "there";
  return `Hi ${name}, your quotation is approved for checkout. Use the secure payment link below to complete the payment and we will move into kickoff and onboarding immediately.`;
}

export default function DashboardApp() {
  const [token, setToken] = useState("");
  const [loginEmail, setLoginEmail] = useState("ankitbiswassharma@muskit.in");
  const [otp, setOtp] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [otpDigits, setOtpDigits] = useState(6);
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [leads, setLeads] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dashboardError, setDashboardError] = useState("");
  const [tab, setTab] = useState("leads");
  const [quoteDraft, setQuoteDraft] = useState(emptyQuoteDraft());
  const [paymentLinkMessage, setPaymentLinkMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const storedToken = window.localStorage.getItem("muskit_admin_token") || "";
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }
    loadDashboard();
  }, [token]);

  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = statusFilter ? lead.status === statusFilter : true;
    const query = deferredSearch.trim().toLowerCase();
    const matchesSearch = query
      ? [lead.full_name, lead.email, lead.company]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query))
      : true;
    return matchesStatus && matchesSearch;
  });

  async function authFetch(path, options = {}) {
    return apiJson(path, {
      ...options,
      headers: {
        "x-admin-token": token,
        ...(options.headers || {}),
      },
    });
  }

  async function loadDashboard() {
    setDashboardError("");
    try {
      const [summaryResponse, leadsResponse, paymentsResponse] = await Promise.all([
        authFetch("/admin/dashboard/summary"),
        authFetch("/admin/leads"),
        authFetch("/admin/payments"),
      ]);
      setSummary(summaryResponse);
      setLeads(leadsResponse);
      setPayments(paymentsResponse);
      if (selectedLeadId) {
        await openLead(selectedLeadId);
      }
    } catch (error) {
      setDashboardError(error.message);
      if (error.message === "Unauthorized") {
        handleLogout();
      }
    }
  }

  async function openLead(leadId) {
    try {
      const lead = await authFetch(`/admin/leads/${leadId}`);
      setSelectedLeadId(leadId);
      setSelectedLead(lead);
      setQuoteDraft(quoteDraftFromLead(lead));
      setPaymentLinkMessage(paymentLinkDraftFromLead(lead));
    } catch (error) {
      setDashboardError(error.message);
    }
  }

  async function requestOtp() {
    setAuthLoading(true);
    setAuthError("");
    setAuthMessage("");
    try {
      const response = await apiJson("/admin/auth/request-otp", {
        method: "POST",
        body: JSON.stringify({ email: loginEmail }),
      });
      setChallengeId(response.challenge_id);
      setOtpDigits(response.otp_digits);
      setAuthMessage(response.message || `OTP sent to ${response.masked_email}.`);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function verifyOtp() {
    setAuthLoading(true);
    setAuthError("");
    try {
      const response = await apiJson("/admin/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          email: loginEmail,
          challenge_id: challengeId,
          otp,
        }),
      });
      window.localStorage.setItem("muskit_admin_token", response.token);
      setToken(response.token);
      setOtp("");
      setAuthMessage("Login successful.");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function updateLead(payload) {
    if (!selectedLead) {
      return;
    }
    setSaving(true);
    setActionMessage("");
    try {
      const updated = await authFetch(`/admin/leads/${selectedLead.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setSelectedLead(updated);
      setLeads((current) =>
        current.map((lead) => (lead.id === updated.id ? updated : lead))
      );
      setActionMessage("Lead updated.");
      await loadDashboard();
    } catch (error) {
      setDashboardError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function addLeadActivity() {
    const description = window.prompt("Add internal comment");
    if (!description || !selectedLead) {
      return;
    }
    setSaving(true);
    try {
      await authFetch(`/admin/leads/${selectedLead.id}/activities`, {
        method: "POST",
        body: JSON.stringify({ description, created_by: "admin" }),
      });
      await openLead(selectedLead.id);
      setActionMessage("Internal comment added.");
    } catch (error) {
      setDashboardError(error.message);
    } finally {
      setSaving(false);
    }
  }

  function updateQuoteField(key, value) {
    setQuoteDraft((current) => ({ ...current, [key]: value }));
  }

  function updateQuoteItem(index, key, value) {
    setQuoteDraft((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  }

  function addQuoteItem() {
    setQuoteDraft((current) => ({
      ...current,
      items: [
        ...current.items,
        { title: "Additional module", description: "", quantity: "1", unit_price: "0" },
      ],
    }));
  }

  function removeQuoteItem(index) {
    setQuoteDraft((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function createQuotation() {
    if (!selectedLead) {
      return;
    }
    setSaving(true);
    setActionMessage("");
    try {
      const quotation = await authFetch(`/admin/leads/${selectedLead.id}/quotation`, {
        method: "POST",
        body: JSON.stringify({
          ...quoteDraft,
          items: quoteDraft.items.map((item) => ({
            ...item,
            quantity: Number(item.quantity || 0),
            unit_price: Number(item.unit_price || 0),
          })),
          tax_rate: Number(quoteDraft.tax_rate || 18),
        }),
      });
      setActionMessage(`Quotation ${quotation.quotation_number} generated.`);
      await openLead(selectedLead.id);
      await loadDashboard();
    } catch (error) {
      setDashboardError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function sendPaymentLink() {
    if (!selectedLead?.latest_quotation_id) {
      return;
    }
    setSaving(true);
    setActionMessage("");
    try {
      const response = await authFetch(
        `/admin/quotations/${selectedLead.latest_quotation_id}/payment-link`,
        {
          method: "POST",
          body: JSON.stringify({
            message: paymentLinkMessage,
            send_email: true,
          }),
        }
      );
      setActionMessage(response.message || "Payment link generated.");
      await openLead(selectedLead.id);
      await loadDashboard();
    } catch (error) {
      setDashboardError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function downloadQuotationPdf(quotationId, quotationNumber = "quotation") {
    try {
      const response = await fetch(buildApiUrl(`/admin/quotations/${quotationId}/pdf`), {
        headers: { "x-admin-token": token },
      });
      if (!response.ok) {
        throw new Error("Could not download quotation PDF");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${quotationNumber}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setDashboardError(error.message);
    }
  }

  async function handleLogout() {
    if (token) {
      try {
        await authFetch("/admin/auth/logout", { method: "POST" });
      } catch {}
    }
    window.localStorage.removeItem("muskit_admin_token");
    setToken("");
    setSelectedLead(null);
    setSelectedLeadId("");
  }

  if (!token) {
    return (
      <section className="login-screen shell">
        <div className="login-card stack-md">
          <div className="eyebrow">Admin access</div>
          <h1 style={{ fontSize: "42px" }}>OTP-protected dashboard</h1>
          <p>
            Request a one-time code for the admin inbox, then enter it here to
            manage leads, quotations, and payments.
          </p>
          {authMessage ? <div className="success-box">{authMessage}</div> : null}
          {authError ? <div className="error-box">{authError}</div> : null}
          <div className="stack-sm">
            <div className="field">
              <label>Admin email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
              />
            </div>
            {challengeId ? (
              <div className="field">
                <label>OTP</label>
                <input
                  inputMode="numeric"
                  maxLength={otpDigits}
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, otpDigits))
                  }
                />
              </div>
            ) : null}
          </div>
          <div className="dashboard-toolbar">
            <button
              className="button button-primary"
              type="button"
              onClick={challengeId ? verifyOtp : requestOtp}
              disabled={authLoading}
            >
              {authLoading
                ? "Please wait..."
                : challengeId
                  ? "Verify OTP"
                  : "Send OTP"}
            </button>
            {challengeId ? (
              <button className="button button-ghost" type="button" onClick={requestOtp}>
                Send fresh OTP
              </button>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-wrapper">
      <div className="shell stack-lg">
        <div className="dashboard-toolbar">
          <div className="eyebrow">Admin dashboard</div>
          <button className="button button-ghost" type="button" onClick={loadDashboard}>
            Refresh
          </button>
          <button className="button button-ghost" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {dashboardError ? <div className="error-box">{dashboardError}</div> : null}
        {actionMessage ? <div className="success-box">{actionMessage}</div> : null}

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

        <div className="dashboard-toolbar">
          <button className="button button-primary" type="button" onClick={() => setTab("leads")}>
            Leads
          </button>
          <button className="button button-ghost" type="button" onClick={() => setTab("payments")}>
            Payments
          </button>
        </div>

        {tab === "leads" ? (
          <div className="dashboard-layout">
            <div className="card dashboard-card stack-md">
              <div className="dashboard-toolbar">
                <input
                  placeholder="Search leads"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="">All statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal_sent">Proposal sent</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Lead</th>
                      <th>Status</th>
                      <th>Request</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => openLead(lead.id)}
                      >
                        <td>
                          <strong>{lead.full_name}</strong>
                          <div className="muted">{lead.company || lead.email}</div>
                        </td>
                        <td>
                          <span className="status-pill">{lead.status.replace("_", " ")}</span>
                        </td>
                        <td>{lead.request_type}</td>
                        <td>{new Date(lead.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!filteredLeads.length ? (
                  <div className="empty-state">No leads match the current filter.</div>
                ) : null}
              </div>
            </div>

            <div className="stack-md">
              {selectedLead ? (
                <>
                  <div className="card detail-card stack-md">
                    <div className="dashboard-toolbar">
                      <div>
                        <h3>{selectedLead.full_name}</h3>
                        <p>{selectedLead.company || selectedLead.email}</p>
                      </div>
                      <span className="status-pill">
                        {selectedLead.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="stack-sm">
                      <div><strong>Email:</strong> {selectedLead.email}</div>
                      <div><strong>Phone:</strong> {selectedLead.phone || "-"}</div>
                      <div><strong>Project type:</strong> {selectedLead.project_type || "-"}</div>
                      <div><strong>Request type:</strong> {selectedLead.request_type}</div>
                      <div><strong>Preferred demo:</strong> {selectedLead.preferred_demo_date || "-"} {selectedLead.preferred_demo_time || ""}</div>
                    </div>
                    <div className="stack-sm">
                      <label>Status</label>
                      <select
                        value={selectedLead.status}
                        onChange={(event) =>
                          updateLead({ status: event.target.value, admin_notes: selectedLead.admin_notes })
                        }
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="proposal_sent">Proposal sent</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                      </select>
                    </div>
                    <div className="stack-sm">
                      <label>Internal notes</label>
                      <textarea
                        value={selectedLead.admin_notes || ""}
                        onChange={(event) =>
                          setSelectedLead((current) => ({
                            ...current,
                            admin_notes: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="detail-actions">
                      <button
                        className="button button-primary"
                        type="button"
                        disabled={saving}
                        onClick={() =>
                          updateLead({
                            status: selectedLead.status,
                            admin_notes: selectedLead.admin_notes || "",
                          })
                        }
                      >
                        Save lead
                      </button>
                      <button className="button button-ghost" type="button" onClick={addLeadActivity}>
                        Add comment
                      </button>
                    </div>
                    <div className="stack-sm">
                      <label>Client requirements</label>
                      <div
                        className="card"
                        style={{ padding: "18px" }}
                        dangerouslySetInnerHTML={{
                          __html:
                            selectedLead.client_requirements_html ||
                            "<p class='muted'>No requirements supplied.</p>",
                        }}
                      />
                    </div>
                  </div>

                  <div className="card detail-card stack-md">
                    <div>
                      <div className="eyebrow">Quotation workflow</div>
                      <h3>Create custom pricing</h3>
                    </div>
                    <div className="field">
                      <label>Proposal title</label>
                      <input
                        value={quoteDraft.title}
                        onChange={(event) => updateQuoteField("title", event.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Intro message</label>
                      <textarea
                        value={quoteDraft.intro_message}
                        onChange={(event) =>
                          updateQuoteField("intro_message", event.target.value)
                        }
                      />
                    </div>
                    <div className="field">
                      <label>Requirements summary</label>
                      <textarea
                        value={quoteDraft.requirements_summary}
                        onChange={(event) =>
                          updateQuoteField("requirements_summary", event.target.value)
                        }
                      />
                    </div>
                    <div className="form-grid">
                      <div className="field">
                        <label>Tax rate</label>
                        <input
                          value={quoteDraft.tax_rate}
                          onChange={(event) => updateQuoteField("tax_rate", event.target.value)}
                        />
                      </div>
                      <div className="field">
                        <label>Valid until</label>
                        <input
                          type="date"
                          value={quoteDraft.valid_until}
                          onChange={(event) =>
                            updateQuoteField("valid_until", event.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="field">
                      <label>Client-facing message</label>
                      <textarea
                        value={quoteDraft.personalized_message}
                        onChange={(event) =>
                          updateQuoteField("personalized_message", event.target.value)
                        }
                      />
                    </div>
                    <label style={{ fontWeight: 700 }}>Pricing items</label>
                    {quoteDraft.items.map((item, index) => (
                      <div className="card" style={{ padding: "18px" }} key={`${item.title}-${index}`}>
                        <div className="quote-item-row">
                          <div className="field" style={{ flex: 2 }}>
                            <label>Title</label>
                            <input
                              value={item.title}
                              onChange={(event) =>
                                updateQuoteItem(index, "title", event.target.value)
                              }
                            />
                          </div>
                          <div className="field" style={{ flex: 1 }}>
                            <label>Quantity</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.quantity}
                              onChange={(event) =>
                                updateQuoteItem(index, "quantity", event.target.value)
                              }
                            />
                          </div>
                          <div className="field" style={{ flex: 1 }}>
                            <label>Unit price</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(event) =>
                                updateQuoteItem(index, "unit_price", event.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div className="field">
                          <label>Description</label>
                          <textarea
                            value={item.description}
                            onChange={(event) =>
                              updateQuoteItem(index, "description", event.target.value)
                            }
                          />
                        </div>
                        {quoteDraft.items.length > 1 ? (
                          <button
                            className="button button-ghost"
                            type="button"
                            onClick={() => removeQuoteItem(index)}
                          >
                            Remove item
                          </button>
                        ) : null}
                      </div>
                    ))}
                    <div className="dashboard-toolbar">
                      <button className="button button-ghost" type="button" onClick={addQuoteItem}>
                        Add item
                      </button>
                      <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <input
                          checked={quoteDraft.send_email}
                          type="checkbox"
                          onChange={(event) =>
                            updateQuoteField("send_email", event.target.checked)
                          }
                        />
                        Send quotation email immediately
                      </label>
                    </div>
                    <div className="field">
                      <label>Payment link email message</label>
                      <textarea
                        value={paymentLinkMessage}
                        onChange={(event) => setPaymentLinkMessage(event.target.value)}
                        placeholder="Message to send with the secure payment link."
                      />
                    </div>
                    <div className="detail-actions">
                      <button
                        className="button button-primary"
                        type="button"
                        disabled={saving}
                        onClick={createQuotation}
                      >
                        {saving ? "Saving..." : "Generate quotation"}
                      </button>
                      {selectedLead.latest_quotation_id ? (
                        <button
                          className="button button-ghost"
                          type="button"
                          disabled={saving}
                          onClick={sendPaymentLink}
                        >
                          {saving ? "Sending..." : "Email payment link"}
                        </button>
                      ) : null}
                      {selectedLead.latest_quotation_id ? (
                        <button
                          className="button button-ghost"
                          type="button"
                          onClick={() =>
                            downloadQuotationPdf(
                              selectedLead.latest_quotation_id,
                              selectedLead.latest_quotation_number || "quotation"
                            )
                          }
                        >
                          Download latest PDF
                        </button>
                      ) : null}
                      {selectedLead.latest_quote_code ? (
                        <a
                          className="button button-ghost"
                          href={`/pay/${selectedLead.latest_quote_code}`}
                          target="_blank"
                        >
                          Open payment page
                        </a>
                      ) : null}
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  Select a lead to review requirements, update status, and create
                  a custom quotation.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card dashboard-card">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Invoice</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <strong>{payment.lead_name || payment.lead_id}</strong>
                      <div className="muted">{payment.company || payment.quotation_number || "-"}</div>
                    </td>
                    <td><span className="status-pill">{payment.status}</span></td>
                    <td>{payment.currency} {payment.total_amount}</td>
                    <td>{payment.invoice_number || "-"}</td>
                    <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!payments.length ? (
              <div className="empty-state">No payments have been created yet.</div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
