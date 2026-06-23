"use client";

import { useEffect, useState } from "react";

function formatMoney(value, currency = "INR") {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function monthLabel(key) {
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("en-IN", { month: "short" });
}

const STAGE_COLORS = ["#4f46e5", "#6366f1", "#7c3aed", "#0891b2", "#10b981"];

export default function AdminAnalytics({ session }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!session.token) return;
    setLoading(true);
    setError("");
    try {
      setData(await session.authFetch("/admin/dashboard/funnel"));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session.token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.token]);

  const maxSource = Math.max(1, ...(data?.sources?.map((s) => s.count) || [1]));
  const maxTrend = Math.max(1, ...(data?.trend?.map((t) => t.leads) || [1]));

  return (
    <section className="card dashboard-card stack-lg">
      <div className="dashboard-toolbar toolbar-spread">
        <div className="stack-sm">
          <div className="eyebrow">Pipeline Analytics</div>
          <h3>Conversion funnel</h3>
          <p className="muted" style={{ fontSize: 13 }}>
            How leads move from first contact to paid — plus where they come from.
          </p>
        </div>
        <button className="button button-ghost btn-sm" type="button" onClick={load} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error ? <div className="error-box">{error}</div> : null}
      {!data && !error ? <div className="empty-state">Loading analytics…</div> : null}

      {data ? (
        <>
          {/* Headline stats */}
          <div className="admin-stat-grid">
            <article className="admin-stat-card">
              <div className="admin-stat-body">
                <span className="admin-stat-label">Total leads</span>
                <strong className="admin-stat-value">{data.total_leads}</strong>
              </div>
            </article>
            <article className="admin-stat-card">
              <div className="admin-stat-body">
                <span className="admin-stat-label">Won</span>
                <strong className="admin-stat-value">{data.won_leads}</strong>
              </div>
            </article>
            <article className="admin-stat-card">
              <div className="admin-stat-body">
                <span className="admin-stat-label">Win rate</span>
                <strong className="admin-stat-value">{data.win_rate}%</strong>
              </div>
            </article>
            <article className="admin-stat-card">
              <div className="admin-stat-body">
                <span className="admin-stat-label">Revenue</span>
                <strong className="admin-stat-value admin-stat-value-sm">{formatMoney(data.revenue)}</strong>
              </div>
            </article>
          </div>

          {/* Funnel */}
          <div className="stack-sm">
            {data.stages.map((stage, i) => (
              <div className="funnel-row" key={stage.key}>
                <div className="funnel-row-head">
                  <span className="funnel-row-label">{stage.label}</span>
                  <span className="funnel-row-meta">
                    <strong>{stage.count}</strong>
                    {i > 0 ? (
                      <span className="muted" style={{ fontSize: 12 }}> · {stage.conversion_from_prev}% from prev</span>
                    ) : null}
                  </span>
                </div>
                <div className="funnel-bar-track">
                  <div
                    className="funnel-bar-fill"
                    style={{
                      width: `${Math.max(stage.pct_of_total, stage.count > 0 ? 4 : 0)}%`,
                      background: STAGE_COLORS[i % STAGE_COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Sources + Trend side by side */}
          <div className="analytics-split">
            <div className="stack-sm">
              <div className="eyebrow">Lead sources</div>
              {data.sources.length ? (
                data.sources.map((s) => (
                  <div className="source-row" key={s.source}>
                    <span className="source-label">{s.source.replace(/_/g, " ")}</span>
                    <div className="source-track">
                      <div className="source-fill" style={{ width: `${(s.count / maxSource) * 100}%` }} />
                    </div>
                    <span className="source-count">{s.count}</span>
                  </div>
                ))
              ) : (
                <p className="muted" style={{ fontSize: 13 }}>No leads yet.</p>
              )}
            </div>

            <div className="stack-sm">
              <div className="eyebrow">New leads — last 6 months</div>
              <div className="trend-chart">
                {data.trend.map((t) => (
                  <div className="trend-col" key={t.month}>
                    <div className="trend-bar-wrap">
                      <span className="trend-bar-value">{t.leads || ""}</span>
                      <div
                        className="trend-bar"
                        style={{ height: `${(t.leads / maxTrend) * 100}%` }}
                      />
                    </div>
                    <span className="trend-month">{monthLabel(t.month)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
