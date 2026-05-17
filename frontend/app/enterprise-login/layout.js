import { noIndexMetadata } from "@/lib/seo.mjs";

export const metadata = noIndexMetadata(
  "Enterprise Login",
  "Private enterprise portal selector for Musk-IT client companies."
);

export default function EnterpriseLoginLayout({ children }) {
  return children;
}
