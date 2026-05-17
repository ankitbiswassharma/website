import { noIndexMetadata } from "@/lib/seo.mjs";

export const metadata = noIndexMetadata(
  "Musk-IT Admin Dashboard",
  "Private Musk-IT administrative dashboard."
);

export default function DashboardLayout({ children }) {
  return children;
}
