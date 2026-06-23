import { noIndexMetadata } from "@/lib/seo.mjs";

export const metadata = noIndexMetadata(
  "Musk-IT Staff Portal",
  "Private Musk-IT staff portal."
);

export default function StaffLayout({ children }) {
  return children;
}
