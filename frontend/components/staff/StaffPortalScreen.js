"use client";

import StaffLoginCard from "@/components/staff/StaffLoginCard";
import StaffPortal from "@/components/staff/StaffPortal";
import useStaffSession from "@/components/staff/useStaffSession";

export default function StaffPortalScreen({ initialView = "auto" }) {
  const session = useStaffSession();

  if (!session.ready) {
    return (
      <section className="login-screen shell">
        <div className="empty-state">Loading…</div>
      </section>
    );
  }

  if (!session.token) {
    return <StaffLoginCard session={session} />;
  }

  return <StaffPortal session={session} />;
}
