import ClientPortal from "@/components/client/ClientPortal";
import { noIndexMetadata } from "@/lib/seo.mjs";

export const metadata = noIndexMetadata(
  "Client Portal",
  "Sign in to your Musk-IT client portal to view project status, quotations, and payments."
);

export default function PortalPage() {
  return <ClientPortal />;
}
