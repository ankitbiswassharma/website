import AdminLeadDetail from "@/components/admin/AdminLeadDetail";

export const metadata = {
  title: "Lead Detail",
};

export default function DashboardLeadDetailPage({ params }) {
  return <AdminLeadDetail leadId={params.leadId} />;
}
