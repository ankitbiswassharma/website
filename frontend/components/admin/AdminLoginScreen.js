"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import AdminLoginCard from "@/components/admin/AdminLoginCard";
import useAdminSession from "@/components/admin/useAdminSession";

export default function AdminLoginScreen() {
  const router = useRouter();
  const session = useAdminSession();

  useEffect(() => {
    if (session.ready && session.token) {
      router.replace("/dashboard");
    }
  }, [router, session.ready, session.token]);

  if (!session.ready) {
    return <section className="login-screen shell"><div className="empty-state">Loading admin session...</div></section>;
  }

  if (session.token) {
    return null;
  }

  return (
    <AdminLoginCard
      session={session}
      title="Admin sign-in"
      description="Use OTP access to open the lead management dashboard and review submitted enquiries."
    />
  );
}
