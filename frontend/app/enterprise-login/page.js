"use client";

import { useEffect, useMemo, useState } from "react";

import { apiJson } from "@/lib/api";

export default function EnterpriseLoginPage() {
  const [companies, setCompanies] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCompanies() {
      setLoading(true);
      setError("");
      try {
        const response = await apiJson("/public/companies");
        setCompanies(response);
        if (response[0]) {
          setSelectedId(response[0].id);
        }
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadCompanies();
  }, []);

  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === selectedId) || null,
    [companies, selectedId]
  );

  function openLogin() {
    if (!selectedCompany?.login_url) {
      return;
    }
    window.location.href = selectedCompany.login_url;
  }

  return (
    <section className="page-section enterprise-directory">
      <div className="shell enterprise-shell">
        <article className="card enterprise-card stack-lg">
          <div className="stack-sm">
            <div className="brand">
              <span className="brand-wordmark enterprise-brand">
                <span>Musk</span>
                <span>-IT</span>
              </span>
            </div>
            <div className="eyebrow">Client Portal</div>
            <h1 className="enterprise-title">Sign in to your workspace</h1>
            <p>
              Select your company name below and continue to your dedicated Musk-IT client portal
              for sprint updates, delivery tracking, and project communication.
            </p>
          </div>

          {error ? <div className="error-box">{error}</div> : null}

          <div className="stack-md">
            <div className="field">
              <label>Company Name</label>
              <select
                value={selectedId}
                onChange={(event) => setSelectedId(event.target.value)}
                disabled={loading || !companies.length}
              >
                {loading ? <option value="">Loading companies...</option> : null}
                {!loading && !companies.length ? <option value="">No companies available</option> : null}
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name} ({company.company_code})
                  </option>
                ))}
              </select>
            </div>

            {selectedCompany ? (
              <div className="enterprise-preview">
                <div className="stack-sm">
                  <span className="muted">Selected company</span>
                  <strong>{selectedCompany.name}</strong>
                </div>
                <div className="stack-sm">
                  <span className="muted">Company code</span>
                  <strong>{selectedCompany.company_code}</strong>
                </div>
                <div className="stack-sm">
                  <span className="muted">Access type</span>
                  <strong>Dedicated client workspace</strong>
                </div>
              </div>
            ) : null}

            <div className="dashboard-toolbar">
              <button
                className="button button-primary"
                type="button"
                disabled={!selectedCompany}
                onClick={openLogin}
              >
                Open Client Portal
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
