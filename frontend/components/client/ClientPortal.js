"use client";

import { useEffect, useState } from "react";

import useClientSession from "@/components/client/useClientSession";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatMoney(value, currency = "INR") {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(
    Number.isFinite(amount) ? amount : 0
  );
}

const STATUS_CLS = {
  new: "pill-new",
  contacted: "pill-contacted",
  qualified: "pill-qualified",
  proposal_sent: "pill-proposal",
  won: "pill-won",
  lost: "pill-lost",
  paid: "pill-won",
  sent: "pill-proposal",
  draft: "pill-new",
  pending: "pill-contacted",
};

function LoginCard({ session }) {
  return (
    <section className="page-section">
      <div className="shell" style={{ maxWidth: 460 }}>
        <article className="card form-card stack-lg">
          <div className="stack-sm">
            <div className="brand">
              <span className="brand-wordmark">
                <span>Musk</span>
                <span>-IT</span>
              </span>
            </div>
            <div className="eyebrow">Client Portal</div>
            <h1 style={{ fontSize: 28 }}>Sign in to your projects</h1>
            <p>
              Enter the email you contacted us with. We&apos;ll send a one-time code to view your
              project status, quotations, and payments.
            </p>
          </div>

          {session.authError ? <div className="error-box">{session.authError}</div> : null}
          {session.authMessage ? <div className="success-box">{session.authMessage}</div> : null}

          {session.stage === "email" ? (
            <form
              className="stack-md"
              onSubmit={(e) => {
                e.preventDefault();
                session.requestOtp();
              }}
            >
              <div className="field">
                <label>Work Email</label>
                <input
                  required
                  type="email"
                  value={session.email}
                  onChange={(e) => session.setEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </div>
              <button className="button button-primary" type="submit" disabled={session.authLoading}>
                {session.authLoading ? "Sending code…" : "Send me a code"}
              </button>
            </form>
          ) : (
            <form
              className="stack-md"
              onSubmit={(e) => {
                e.preventDefault();
                session.verifyOtp();
              }}
            >
              <div className="field">
                <label>Enter the {session.otpDigits}-digit code</label>
                <input
                  required
                  inputMode="numeric"
                  value={session.otp}
                  onChange={(e) => session.setOtp(e.target.value)}
                  placeholder="••••••"
                  style={{ letterSpacing: "0.3em", fontSize: 18 }}
                />
              </div>
              <button className="button button-primary" type="submit" disabled={session.authLoading}>
                {session.authLoading ? "Verifying…" : "Verify & sign in"}
              </button>
              <button
                className="button button-ghost btn-sm"
                type="button"
                onClick={() => session.setStage("email")}
              >
                Use a different email
              </button>
            </form>
          )}
        </article>
      </div>
    </section>
  );
}

function Timeline({ steps }) {
  return (
    <div className="client-timeline">
      {steps.map((step, i) => (
        <div className={`client-timeline-step${step.done ? " is-done" : ""}`} key={step.key}>
          <span className="client-timeline-dot" />
          {i < steps.length - 1 ? <span className="client-timeline-line" /> : null}
          <div className="client-timeline-body">
            <strong>{step.label}</strong>
            <span className="muted" style={{ fontSize: 12 }}>{step.at ? formatDate(step.at) : "Pending"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PortalView({ session }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setData(await session.authFetch("/client/portal/overview"));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="page-section">
      <div className="shell stack-lg">
        <div className="admin-page-head">
          <div className="stack-sm">
            <div className="eyebrow">Client Portal</div>
            <h1 className="admin-page-title">
              {data?.client_name ? `Welcome, ${data.client_name.split(" ")[0]}` : "Your projects"}
            </h1>
            <p className="admin-page-sub">Project status, quotations, and payments — all in one place.</p>
          </div>
          <div className="dashboard-toolbar">
            <button className="button button-ghost admin-icon-btn" type="button" onClick={load} disabled={loading}>
              {loading ? "Refreshing…" : "Refresh"}
            </button>
            <button className="button button-ghost admin-icon-btn" type="button" onClick={session.logout}>
              Sign out
            </button>
          </div>
        </div>

        {error ? <div className="error-box">{error}</div> : null}
        {!data && !error ? <div className="empty-state">Loading your projects…</div> : null}
        {data && !data.projects.length ? (
          <div className="empty-state">No projects yet. Once we start an engagement, it&apos;ll show up here.</div>
        ) : null}

        {data?.projects.map((project, idx) => (
          <article className="card detail-card stack-lg" key={project.reference || idx}>
            <div className="dashboard-toolbar toolbar-spread">
              <div className="stack-sm">
                <div className="eyebrow">{project.reference || "Project"}</div>
                <h3>{project.title}</h3>
                {project.company ? <p className="muted" style={{ fontSize: 13 }}>{project.company}</p> : null}
              </div>
              <span className={`status-pill ${STATUS_CLS[project.status] || ""}`}>{project.status_label}</span>
            </div>

            <Timeline steps={project.timeline} />

            {project.quotations.length ? (
              <div className="stack-sm">
                <div className="eyebrow">Quotations</div>
                <div className="admin-table-wrap">
                  <table className="dashboard-table">
                    <thead>
                      <tr><th>Number</th><th>Status</th><th>Amount</th><th>Date</th><th></th></tr>
                    </thead>
                    <tbody>
                      {project.quotations.map((q) => (
                        <tr key={q.quotation_number}>
                          <td>{q.quotation_number}</td>
                          <td><span className={`status-pill ${STATUS_CLS[q.status] || ""}`}>{q.status}</span></td>
                          <td>{formatMoney(q.total_amount, q.currency)}</td>
                          <td className="muted" style={{ fontSize: 13 }}>{formatDate(q.created_at)}</td>
                          <td>
                            {q.pay_url ? (
                              <a className="button button-primary btn-sm" href={q.pay_url}>Pay now</a>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {project.payments.length ? (
              <div className="stack-sm">
                <div className="eyebrow">Payments</div>
                <div className="admin-table-wrap">
                  <table className="dashboard-table">
                    <thead>
                      <tr><th>Invoice</th><th>Status</th><th>Amount</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {project.payments.map((p, i) => (
                        <tr key={p.invoice_number || i}>
                          <td>{p.invoice_number || "—"}</td>
                          <td><span className={`status-pill ${STATUS_CLS[p.status] || ""}`}>{p.status}</span></td>
                          <td>{formatMoney(p.total_amount, p.currency)}</td>
                          <td className="muted" style={{ fontSize: 13 }}>{formatDate(p.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export default function ClientPortal() {
  const session = useClientSession();

  if (!session.ready) {
    return (
      <section className="page-section">
        <div className="shell"><div className="empty-state">Loading…</div></div>
      </section>
    );
  }

  return session.token ? <PortalView session={session} /> : <LoginCard session={session} />;
}
