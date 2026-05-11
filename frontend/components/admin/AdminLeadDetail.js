"use client";

import Link from "next/link";

import AdminLoginCard from "@/components/admin/AdminLoginCard";
import AdminLeadWorkspace from "@/components/admin/AdminLeadWorkspace";
import useAdminSession from "@/components/admin/useAdminSession";

export default function AdminLeadDetail({ leadId }) {
  const session = useAdminSession();

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
        title="Admin access required"
        description="Sign in to open the full lead workspace and run the quotation workflow."
      />
    );
  }

  return (
    <section className="dashboard-wrapper">
      <div className="shell stack-lg">
        <div className="admin-page-head">
          <div className="stack-sm">
            <div className="eyebrow">Lead workspace</div>
            <h1 className="admin-page-title">Lead detail and quotation control</h1>
            <p>Review the lead, manage the pipeline, and drive the quotation lifecycle from one place.</p>
          </div>
          <div className="dashboard-toolbar">
            <Link className="button button-ghost" href="/dashboard">
              Back to dashboard
            </Link>
            <button className="button button-ghost" type="button" onClick={session.logout}>
              Logout
            </button>
          </div>
        </div>

        <AdminLeadWorkspace session={session} leadId={leadId} />
      </div>
    </section>
  );
}
