"use client";

import { useEffect, useState } from "react";

const statusOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal_sent", label: "Proposal sent" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

const workspaceTabs = [
  { value: "overview", label: "Overview" },
  { value: "requirements", label: "Requirements" },
  { value: "activity", label: "Activity" },
  { value: "pipeline", label: "Pipeline" },
  { value: "notes", label: "Notes" },
  { value: "quotation", label: "Quotation" },
];

function formatStatus(status) {
  return status.replace(/_/g, " ");
}

function formatDateTime(value) {
  return new Date(value).toLocaleString();
}

function formatDate(value) {
  return new Date(value).toLocaleDateString();
}

function formatMoney(value, currency = "INR") {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function buildDefaultValidUntil() {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 14);
  return nextDate.toISOString().slice(0, 10);
}

function createEmptyItem() {
  return {
    title: "",
    description: "",
    unit: "Nos",
    quantity: "1",
    unit_price: "0",
  };
}

function createEmptySection(title = "") {
  return {
    title,
    content: "",
  };
}

function createDefaultSections(lead) {
  return [
    createEmptySection("Monthly Subscription"),
    {
      title: "Add-On Module Details",
      content: "",
    },
    {
      title: "Scope of Work",
      content: lead.client_requirements_text || "",
    },
    createEmptySection("Payment Terms"),
    createEmptySection("Other Terms"),
  ];
}

function buildDraftFromLead(lead) {
  return {
    title: `${lead.company || lead.full_name} solution proposal`,
    intro_message: `Prepared for ${lead.full_name} to cover the requested ${lead.request_type.replace(/_/g, " ")} scope and rollout priorities.`,
    requirements_summary: lead.client_requirements_text || "",
    personalized_message:
      "Please review the attached quotation draft. We can finalize scope, rollout milestones, and commercial terms once you confirm the reviewed version.",
    tax_rate: "18",
    valid_until: buildDefaultValidUntil(),
    items: [
      {
        title: "Discovery and implementation scope",
        description: lead.project_type
          ? `${lead.project_type} workflow setup, delivery planning, and platform configuration.`
          : "Workflow setup, delivery planning, and platform configuration.",
        unit: "Nos",
        quantity: "1",
        unit_price: "0",
      },
    ],
    sections: createDefaultSections(lead),
  };
}

function buildDraftFromQuotation(quotation) {
  return {
    title: quotation.title || "Custom SaaS Proposal",
    intro_message: quotation.intro_message || "",
    requirements_summary: quotation.requirements_summary || "",
    personalized_message: quotation.personalized_message || "",
    tax_rate: String(quotation.tax_rate ?? "18"),
    valid_until: quotation.valid_until || buildDefaultValidUntil(),
    items:
      quotation.items?.map((item) => ({
        title: item.title || "",
        description: item.description || "",
        unit: item.unit || "Nos",
        quantity: String(item.quantity ?? "1"),
        unit_price: String(item.unit_price ?? "0"),
      })) || [createEmptyItem()],
    sections:
      quotation.sections?.length
        ? quotation.sections.map((section) => ({
            title: section.title || "",
            content: section.content || "",
          }))
        : createDefaultSections({
            client_requirements_text: quotation.requirements_summary || "",
          }),
  };
}

function parseNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function calculateTotals(items, taxRate) {
  const subtotal = items.reduce((accumulator, item) => {
    return accumulator + parseNumber(item.quantity) * parseNumber(item.unit_price);
  }, 0);
  const taxAmount = subtotal * (parseNumber(taxRate) / 100);
  return {
    subtotal,
    taxAmount,
    total: subtotal + taxAmount,
  };
}

export default function AdminLeadWorkspace({
  session,
  leadId,
  initialTab = "overview",
  onLeadChange,
}) {
  const [lead, setLead] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [selectedQuotationId, setSelectedQuotationId] = useState("");
  const [activeTab, setActiveTab] = useState(initialTab);
  const [statusValue, setStatusValue] = useState("new");
  const [notesValue, setNotesValue] = useState("");
  const [quoteDraft, setQuoteDraft] = useState({
    title: "Custom SaaS Proposal",
    intro_message: "",
    requirements_summary: "",
    personalized_message: "",
    tax_rate: "18",
    valid_until: buildDefaultValidUntil(),
    items: [createEmptyItem()],
    sections: [],
  });
  const [loading, setLoading] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [savingQuotation, setSavingQuotation] = useState(false);
  const [uploadingQuotation, setUploadingQuotation] = useState(false);
  const [sendingQuotation, setSendingQuotation] = useState(false);
  const [selectedDocx, setSelectedDocx] = useState(null);
  const [workspaceError, setWorkspaceError] = useState("");
  const [workspaceMessage, setWorkspaceMessage] = useState("");

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, leadId]);

  useEffect(() => {
    if (!session.token || !leadId) {
      return;
    }

    async function loadWorkspace() {
      setLoading(true);
      setWorkspaceError("");
      setWorkspaceMessage("");
      setSelectedDocx(null);

      try {
        const [leadResponse, quotationsResponse] = await Promise.all([
          session.authFetch(`/admin/leads/${leadId}`),
          session.authFetch(`/admin/quotations?lead_id=${encodeURIComponent(leadId)}`),
        ]);
        setLead(leadResponse);
        setStatusValue(leadResponse.status);
        setNotesValue(leadResponse.admin_notes || "");
        setQuotations(quotationsResponse);

        if (quotationsResponse.length) {
          setSelectedQuotationId(quotationsResponse[0].id);
          setQuoteDraft(buildDraftFromQuotation(quotationsResponse[0]));
        } else {
          setSelectedQuotationId("");
          setQuoteDraft(buildDraftFromLead(leadResponse));
        }
      } catch (error) {
        setWorkspaceError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadWorkspace();
  }, [session.token, leadId]);

  const canSendQuotation = Boolean(lead && ["qualified", "proposal_sent", "won"].includes(lead.status));
  const currentQuotation =
    quotations.find((quotation) => quotation.id === selectedQuotationId) || quotations[0] || null;
  const quoteTotals = calculateTotals(quoteDraft.items, quoteDraft.tax_rate);

  function syncLeadList() {
    onLeadChange?.();
  }

  function selectQuotation(quotation) {
    setSelectedQuotationId(quotation.id);
    setQuoteDraft(buildDraftFromQuotation(quotation));
    setSelectedDocx(null);
  }

  function replaceQuotation(nextQuotation) {
    setQuotations((current) => {
      const remaining = current.filter((quotation) => quotation.id !== nextQuotation.id);
      return [nextQuotation, ...remaining];
    });
    selectQuotation(nextQuotation);
  }

  function updateQuoteField(key, value) {
    setQuoteDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateQuoteItem(index, key, value) {
    setQuoteDraft((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [key]: value,
            }
          : item
      ),
    }));
  }

  function updateQuoteSection(index, key, value) {
    setQuoteDraft((current) => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) =>
        sectionIndex === index
          ? {
              ...section,
              [key]: value,
            }
          : section
      ),
    }));
  }

  function addQuoteItem() {
    setQuoteDraft((current) => ({
      ...current,
      items: [...current.items, createEmptyItem()],
    }));
  }

  function addQuoteSection() {
    setQuoteDraft((current) => ({
      ...current,
      sections: [...current.sections, createEmptySection()],
    }));
  }

  function removeQuoteItem(index) {
    setQuoteDraft((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function removeQuoteSection(index) {
    setQuoteDraft((current) => ({
      ...current,
      sections: current.sections.filter((_, sectionIndex) => sectionIndex !== index),
    }));
  }

  async function updateStatus() {
    setSavingStatus(true);
    setWorkspaceError("");
    setWorkspaceMessage("");

    try {
      const updatedLead = await session.authFetch(`/admin/leads/${leadId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: statusValue }),
      });
      setLead(updatedLead);
      setStatusValue(updatedLead.status);
      setNotesValue(updatedLead.admin_notes || "");
      setWorkspaceMessage("Pipeline status updated.");
      syncLeadList();
      if (updatedLead.status === "qualified") {
        setActiveTab("quotation");
      }
    } catch (error) {
      setWorkspaceError(error.message);
    } finally {
      setSavingStatus(false);
    }
  }

  async function updateNotes() {
    setSavingNotes(true);
    setWorkspaceError("");
    setWorkspaceMessage("");

    try {
      const updatedLead = await session.authFetch(`/admin/leads/${leadId}/notes`, {
        method: "PATCH",
        body: JSON.stringify({ admin_notes: notesValue }),
      });
      setLead(updatedLead);
      setStatusValue(updatedLead.status);
      setNotesValue(updatedLead.admin_notes || "");
      setWorkspaceMessage("Internal notes saved.");
    } catch (error) {
      setWorkspaceError(error.message);
    } finally {
      setSavingNotes(false);
    }
  }

  async function generateQuotationDraft() {
    setSavingQuotation(true);
    setWorkspaceError("");
    setWorkspaceMessage("");

    try {
      const payload = {
        title: quoteDraft.title.trim(),
        intro_message: quoteDraft.intro_message.trim(),
        requirements_summary: quoteDraft.requirements_summary.trim(),
        personalized_message: quoteDraft.personalized_message.trim(),
        tax_rate: parseNumber(quoteDraft.tax_rate),
        valid_until: quoteDraft.valid_until || null,
        send_email: false,
        items: quoteDraft.items
          .filter((item) => item.title.trim())
          .map((item) => ({
            title: item.title.trim(),
            description: item.description.trim(),
            unit: item.unit.trim() || "Nos",
            quantity: parseNumber(item.quantity),
            unit_price: parseNumber(item.unit_price),
          })),
        sections: quoteDraft.sections
          .filter((section) => section.title.trim() && section.content.trim())
          .map((section) => ({
            title: section.title.trim(),
            content: section.content.trim(),
          })),
      };
      const createdQuotation = await session.authFetch(`/admin/leads/${leadId}/quotation`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      replaceQuotation(createdQuotation);
      setLead((current) =>
        current
          ? {
              ...current,
              latest_quotation_id: createdQuotation.id,
              latest_quotation_number: createdQuotation.quotation_number,
              latest_quote_code: createdQuotation.quote_code,
            }
          : current
      );
      setWorkspaceMessage(
        `Quotation draft ${createdQuotation.quotation_number} generated. Download the Word file, edit it, then upload the updated DOCX to refresh the PDF review copy.`
      );
      syncLeadList();
    } catch (error) {
      setWorkspaceError(error.message);
    } finally {
      setSavingQuotation(false);
    }
  }

  async function uploadEditedQuotation() {
    if (!currentQuotation || !selectedDocx) {
      return;
    }

    setUploadingQuotation(true);
    setWorkspaceError("");
    setWorkspaceMessage("");

    try {
      const formData = new FormData();
      formData.append("file", selectedDocx);
      const updatedQuotation = await session.authFetch(`/admin/quotations/${currentQuotation.id}/edited-docx`, {
        method: "POST",
        body: formData,
      });
      replaceQuotation(updatedQuotation);
      setLead((current) =>
        current
          ? {
              ...current,
              latest_quotation_id: updatedQuotation.id,
              latest_quotation_number: updatedQuotation.quotation_number,
              latest_quote_code: updatedQuotation.quote_code,
            }
          : current
      );
      setSelectedDocx(null);
      setWorkspaceMessage(
        `Edited quotation uploaded. ${updatedQuotation.quotation_number} is ready as the stamped PDF review copy.`
      );
    } catch (error) {
      setWorkspaceError(error.message);
    } finally {
      setUploadingQuotation(false);
    }
  }

  async function sendQuotation() {
    if (!currentQuotation) {
      return;
    }

    setSendingQuotation(true);
    setWorkspaceError("");
    setWorkspaceMessage("");

    try {
      const sentQuotation = await session.authFetch(`/admin/quotations/${currentQuotation.id}/send`, {
        method: "POST",
        body: JSON.stringify({
          personalized_message: quoteDraft.personalized_message.trim() || null,
        }),
      });
      replaceQuotation(sentQuotation);
      setLead((current) =>
        current
          ? {
              ...current,
              status: "proposal_sent",
              latest_quotation_id: sentQuotation.id,
              latest_quotation_number: sentQuotation.quotation_number,
              latest_quote_code: sentQuotation.quote_code,
            }
          : current
      );
      setStatusValue("proposal_sent");
      setWorkspaceMessage("Quotation accepted and sent to the client.");
      syncLeadList();
    } catch (error) {
      setWorkspaceError(error.message);
    } finally {
      setSendingQuotation(false);
    }
  }

  if (loading) {
    return <div className="empty-state">Loading lead workspace...</div>;
  }

  if (!lead) {
    return <div className="empty-state">Lead data is unavailable.</div>;
  }

  return (
    <div className="stack-lg">
      {workspaceMessage ? <div className="success-box">{workspaceMessage}</div> : null}
      {workspaceError ? <div className="error-box">{workspaceError}</div> : null}

      <section className="card detail-card stack-md lead-workspace-hero">
        <div className="dashboard-toolbar toolbar-spread">
          <div className="stack-sm">
            <div className="eyebrow">Lead workspace</div>
            <h3>{lead.full_name}</h3>
            <p>
              {lead.company || lead.email}
              {lead.project_type ? ` · ${lead.project_type}` : ""}
            </p>
          </div>
          <span className="status-pill">{formatStatus(lead.status)}</span>
        </div>

        <div className="lead-highlight-grid">
          <div className="meta-item">
            <span className="muted">Lead reference</span>
            <strong>{lead.lead_reference || "-"}</strong>
          </div>
          <div className="meta-item">
            <span className="muted">Request type</span>
            <strong>{lead.request_type}</strong>
          </div>
          <div className="meta-item">
            <span className="muted">Latest quotation</span>
            <strong>{lead.latest_quotation_number || "Not generated yet"}</strong>
          </div>
          <div className="meta-item">
            <span className="muted">Latest payment</span>
            <strong>{lead.latest_payment_status || "Not started"}</strong>
          </div>
        </div>

        <div className="admin-tab-strip">
          {workspaceTabs.map((tab) => (
            <button
              key={tab.value}
              className={`admin-tab-button ${activeTab === tab.value ? "is-active" : ""}`}
              type="button"
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {activeTab === "overview" ? (
        <section className="lead-workspace-grid">
          <div className="card detail-card stack-md">
            <div className="stack-sm">
              <div className="eyebrow">Client profile</div>
              <h3>Contact and account details</h3>
            </div>
            <div className="meta-grid">
              <div className="meta-item">
                <span className="muted">Email</span>
                <strong>{lead.email}</strong>
              </div>
              <div className="meta-item">
                <span className="muted">Phone</span>
                <strong>{lead.phone || "-"}</strong>
              </div>
              <div className="meta-item">
                <span className="muted">Designation</span>
                <strong>{lead.designation || "-"}</strong>
              </div>
              <div className="meta-item">
                <span className="muted">Source</span>
                <strong>{lead.source || "website"}</strong>
              </div>
              <div className="meta-item">
                <span className="muted">Company code</span>
                <strong>{lead.company_code || "-"}</strong>
              </div>
              <div className="meta-item">
                <span className="muted">Created</span>
                <strong>{formatDateTime(lead.created_at)}</strong>
              </div>
            </div>
          </div>

          <div className="card detail-card stack-md">
            <div className="stack-sm">
              <div className="eyebrow">Quick actions</div>
              <h3>Jump to the next action</h3>
            </div>
            <div className="admin-quick-actions">
              <button className="button button-ghost" type="button" onClick={() => setActiveTab("requirements")}>
                View requirements
              </button>
              <button className="button button-ghost" type="button" onClick={() => setActiveTab("activity")}>
                View activity
              </button>
              <button className="button button-ghost" type="button" onClick={() => setActiveTab("pipeline")}>
                Update pipeline
              </button>
              <button className="button button-ghost" type="button" onClick={() => setActiveTab("notes")}>
                Admin notes
              </button>
              {canSendQuotation ? (
                <button className="button button-primary" type="button" onClick={() => setActiveTab("quotation")}>
                  Send quotation
                </button>
              ) : (
                <div className="empty-state compact-empty-state">
                  Move this lead to <strong>Qualified</strong> to unlock the quotation workflow.
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === "requirements" ? (
        <section className="card detail-card stack-md">
          <div className="stack-sm">
            <div className="eyebrow">Requirements</div>
            <h3>Client scope and needs</h3>
          </div>
          <div
            className="detail-richtext"
            dangerouslySetInnerHTML={{
              __html:
                lead.client_requirements_html ||
                "<p class='muted'>No requirements were submitted for this lead.</p>",
            }}
          />
        </section>
      ) : null}

      {activeTab === "activity" ? (
        <section className="card detail-card stack-md">
          <div className="stack-sm">
            <div className="eyebrow">Activity</div>
            <h3>Timeline and automation trail</h3>
          </div>
          <div className="activity-feed">
            {lead.activities?.length ? (
              lead.activities.map((activity) => (
                <article className="activity-item" key={activity.id}>
                  <div className="dashboard-toolbar toolbar-spread">
                    <strong>{activity.description}</strong>
                    <span className="muted">{formatDateTime(activity.created_at)}</span>
                  </div>
                  <p className="muted">{activity.activity_type}</p>
                </article>
              ))
            ) : (
              <div className="empty-state">No activity has been recorded yet.</div>
            )}
          </div>
        </section>
      ) : null}

      {activeTab === "pipeline" ? (
        <section className="lead-workspace-grid">
          <div className="card detail-card stack-md">
            <div className="stack-sm">
              <div className="eyebrow">Pipeline</div>
              <h3>Update stage and trigger next steps</h3>
            </div>
            <div className="field">
              <label>Current status</label>
              <select value={statusValue} onChange={(event) => setStatusValue(event.target.value)}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="button button-primary"
              type="button"
              disabled={savingStatus}
              onClick={updateStatus}
            >
              {savingStatus ? "Saving..." : "Update pipeline stage"}
            </button>
          </div>

          <div className="card detail-card stack-md">
            <div className="stack-sm">
              <div className="eyebrow">Quotation action</div>
              <h3>Commercial proposal workflow</h3>
            </div>
            {canSendQuotation ? (
              <>
                <p>
                  This lead is ready for quotation handling. Open the quotation workspace to create
                  the Word draft, upload the edited copy, review the stamped PDF, and send it to
                  the client.
                </p>
                <button className="button button-primary" type="button" onClick={() => setActiveTab("quotation")}>
                  Send quotation
                </button>
              </>
            ) : (
              <div className="empty-state compact-empty-state">
                The <strong>Send quotation</strong> action appears after this lead is saved as
                <strong> Qualified</strong>.
              </div>
            )}
          </div>
        </section>
      ) : null}

      {activeTab === "notes" ? (
        <section className="card detail-card stack-md">
          <div className="stack-sm">
            <div className="eyebrow">Internal notes</div>
            <h3>Admin notes and follow-ups</h3>
          </div>
          <div className="field">
            <label>Notes</label>
            <textarea
              value={notesValue}
              onChange={(event) => setNotesValue(event.target.value)}
              placeholder="Add internal context, qualification notes, or follow-up actions."
            />
          </div>
          <button className="button button-primary" type="button" disabled={savingNotes} onClick={updateNotes}>
            {savingNotes ? "Saving..." : "Save notes"}
          </button>
        </section>
      ) : null}

      {activeTab === "quotation" ? (
        <section className="quotation-workspace-grid">
          <div className="card detail-card stack-md">
            <div className="dashboard-toolbar toolbar-spread">
              <div className="stack-sm">
                <div className="eyebrow">Quotation builder</div>
                <h3>Generate the editable Word draft</h3>
                <p>
                  Build a sample-style quotation with pricing, GST totals, and admin-managed narrative sections
                  before you download and edit the DOCX version.
                </p>
              </div>
              <button
                className="button button-primary"
                type="button"
                disabled={!canSendQuotation || savingQuotation}
                onClick={generateQuotationDraft}
              >
                {savingQuotation ? "Generating..." : "Generate quotation draft"}
              </button>
            </div>

            {!canSendQuotation ? (
              <div className="empty-state">
                Save this lead as <strong>Qualified</strong> first to enable quotation generation.
              </div>
            ) : null}

            <div className="form-grid">
              <div className="field">
                <label>Quotation title</label>
                <input
                  value={quoteDraft.title}
                  onChange={(event) => updateQuoteField("title", event.target.value)}
                  placeholder="Custom SaaS Proposal"
                />
              </div>
              <div className="field">
                <label>Valid until</label>
                <input
                  type="date"
                  value={quoteDraft.valid_until}
                  onChange={(event) => updateQuoteField("valid_until", event.target.value)}
                />
              </div>
              <div className="field">
                <label>Tax rate (%)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={quoteDraft.tax_rate}
                  onChange={(event) => updateQuoteField("tax_rate", event.target.value)}
                />
              </div>
              <div className="field full">
                <label>Introduction</label>
                <textarea
                  value={quoteDraft.intro_message}
                  onChange={(event) => updateQuoteField("intro_message", event.target.value)}
                  placeholder="High-level commercial introduction for the quotation PDF."
                />
              </div>
              <div className="field full">
                <label>Requirements summary</label>
                <textarea
                  value={quoteDraft.requirements_summary}
                  onChange={(event) => updateQuoteField("requirements_summary", event.target.value)}
                  placeholder="Scope summary that appears inside the quotation."
                />
              </div>
              <div className="field full">
                <label>Client email message</label>
                <textarea
                  value={quoteDraft.personalized_message}
                  onChange={(event) => updateQuoteField("personalized_message", event.target.value)}
                  placeholder="Message that will be used when the approved quotation is emailed."
                />
              </div>
            </div>

            <div className="stack-md">
              <div className="dashboard-toolbar toolbar-spread">
                <div className="stack-sm">
                  <h4>Line items</h4>
                  <p>These items drive the Word draft, the PDF, and the saved backend audit record.</p>
                </div>
                <button className="button button-ghost" type="button" onClick={addQuoteItem}>
                  Add line item
                </button>
              </div>

              <div className="stack-md">
                {quoteDraft.items.map((item, index) => (
                  <article className="quote-item-card" key={`${index}-${item.title}`}>
                    <div className="quote-item-row">
                      <div className="field quote-item-field">
                        <label>Title</label>
                        <input
                          value={item.title}
                          onChange={(event) => updateQuoteItem(index, "title", event.target.value)}
                          placeholder="Implementation scope"
                        />
                      </div>
                      <div className="field quote-item-field">
                        <label>Unit</label>
                        <input
                          value={item.unit}
                          onChange={(event) => updateQuoteItem(index, "unit", event.target.value)}
                          placeholder="Nos"
                        />
                      </div>
                      <div className="field quote-item-field">
                        <label>Quantity</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          onChange={(event) => updateQuoteItem(index, "quantity", event.target.value)}
                        />
                      </div>
                      <div className="field quote-item-field">
                        <label>Unit price</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(event) => updateQuoteItem(index, "unit_price", event.target.value)}
                        />
                      </div>
                      <button
                        className="button button-ghost quote-item-remove"
                        type="button"
                        onClick={() => removeQuoteItem(index)}
                        disabled={quoteDraft.items.length === 1}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="field">
                      <label>Description</label>
                      <textarea
                        value={item.description}
                        onChange={(event) => updateQuoteItem(index, "description", event.target.value)}
                        placeholder="Optional scope detail visible in the quotation."
                      />
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="stack-md">
              <div className="dashboard-toolbar toolbar-spread">
                <div className="stack-sm">
                  <h4>Quotation sections</h4>
                  <p>
                    Add structured narrative blocks such as Monthly Subscription, Add-On Module Details,
                    Scope of Work, Payment Terms, and Other Terms.
                  </p>
                </div>
                <button className="button button-ghost" type="button" onClick={addQuoteSection}>
                  Add section
                </button>
              </div>

              <div className="stack-md">
                {quoteDraft.sections.map((section, index) => (
                  <article className="quote-item-card" key={`${index}-${section.title}`}>
                    <div className="quote-item-row">
                      <div className="field quote-item-field">
                        <label>Section title</label>
                        <input
                          value={section.title}
                          onChange={(event) => updateQuoteSection(index, "title", event.target.value)}
                          placeholder="Scope of Work"
                        />
                      </div>
                      <button
                        className="button button-ghost quote-item-remove"
                        type="button"
                        onClick={() => removeQuoteSection(index)}
                        disabled={quoteDraft.sections.length === 1}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="field">
                      <label>Section content</label>
                      <textarea
                        value={section.content}
                        onChange={(event) => updateQuoteSection(index, "content", event.target.value)}
                        placeholder="Enter the section details, bullet points, or numbered terms."
                      />
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="quote-total-card">
              <div>
                <span className="muted">Subtotal</span>
                <strong>{formatMoney(quoteTotals.subtotal)}</strong>
              </div>
              <div>
                <span className="muted">Tax</span>
                <strong>{formatMoney(quoteTotals.taxAmount)}</strong>
              </div>
              <div>
                <span className="muted">Total</span>
                <strong>{formatMoney(quoteTotals.total)}</strong>
              </div>
            </div>
          </div>

          <div className="stack-md">
            <div className="card detail-card stack-md">
              <div className="stack-sm">
                <div className="eyebrow">Review cycle</div>
                <h3>Download, edit, review, and send</h3>
              </div>

              {currentQuotation ? (
                <>
                  <div className="quotation-summary-card">
                    <div>
                      <span className="muted">Current quotation</span>
                      <strong>{currentQuotation.quotation_number}</strong>
                    </div>
                    <div>
                      <span className="muted">Status</span>
                      <strong>{formatStatus(currentQuotation.status)}</strong>
                    </div>
                    <div>
                      <span className="muted">Created</span>
                      <strong>{formatDate(currentQuotation.created_at)}</strong>
                    </div>
                    <div>
                      <span className="muted">Total</span>
                      <strong>{formatMoney(currentQuotation.total_amount, currentQuotation.currency)}</strong>
                    </div>
                  </div>

                  <div className="admin-quick-actions">
                    <button
                      className="button button-ghost"
                      type="button"
                      onClick={() =>
                        session.downloadFile(
                          `/admin/quotations/${currentQuotation.id}/docx`,
                          `${currentQuotation.quotation_number}.docx`
                        )
                      }
                    >
                      Download Word draft
                    </button>
                    <button
                      className="button button-ghost"
                      type="button"
                      onClick={() =>
                        session.downloadFile(
                          `/admin/quotations/${currentQuotation.id}/pdf`,
                          `${currentQuotation.quotation_number}.pdf`
                        )
                      }
                    >
                      Download review PDF
                    </button>
                  </div>

                  <div className="field">
                    <label>Upload edited DOCX</label>
                    <input
                      type="file"
                      accept=".docx"
                      onChange={(event) => setSelectedDocx(event.target.files?.[0] || null)}
                    />
                    <div className="form-note">
                      {selectedDocx
                        ? `Selected file: ${selectedDocx.name}`
                        : "Upload the admin-edited Word file to generate a fresh stamped PDF. If the current quotation was already sent, the next revision is created automatically."}
                    </div>
                  </div>

                  <div className="dashboard-toolbar">
                    <button
                      className="button button-primary"
                      type="button"
                      disabled={!selectedDocx || uploadingQuotation}
                      onClick={uploadEditedQuotation}
                    >
                      {uploadingQuotation ? "Uploading..." : "Submit edited quotation"}
                    </button>
                    <button
                      className="button button-primary"
                      type="button"
                      disabled={sendingQuotation || !currentQuotation.pdf_path}
                      onClick={sendQuotation}
                    >
                      {sendingQuotation
                        ? "Sending..."
                        : currentQuotation.status === "sent"
                          ? "Resend quotation"
                          : "Accept and send to client"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  Generate the first quotation draft to unlock DOCX download, PDF review, and client delivery.
                </div>
              )}
            </div>

            <div className="card detail-card stack-md">
              <div className="dashboard-toolbar toolbar-spread">
                <div className="stack-sm">
                  <div className="eyebrow">Audit trail</div>
                  <h3>Saved quotation history</h3>
                </div>
                <span className="muted">{quotations.length} saved quotation(s)</span>
              </div>

              {quotations.length ? (
                <div className="quotation-history-list">
                  {quotations.map((quotation) => (
                    <article
                      key={quotation.id}
                      className={`quotation-history-card ${
                        currentQuotation?.id === quotation.id ? "is-active" : ""
                      }`}
                    >
                      <div className="dashboard-toolbar toolbar-spread">
                        <div className="stack-sm">
                          <strong>{quotation.quotation_number}</strong>
                          <span className="muted">
                            {formatDate(quotation.created_at)} · {formatStatus(quotation.status)}
                          </span>
                        </div>
                        <strong>{formatMoney(quotation.total_amount, quotation.currency)}</strong>
                      </div>
                      <div className="admin-quick-actions">
                        <button className="button button-ghost" type="button" onClick={() => selectQuotation(quotation)}>
                          Load into editor
                        </button>
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
                          Word
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
                          PDF
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No quotations have been saved for this lead yet.</div>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
