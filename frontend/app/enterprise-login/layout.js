import { noIndexMetadata } from "@/lib/seo.mjs";

export const metadata = noIndexMetadata(
  "Client Portal",
  "Secure client portal access for Musk-IT sprint and software delivery clients."
);

export default function EnterpriseLoginLayout({ children }) {
  return children;
}
