import PaymentPage from "@/components/PaymentPage";
import { noIndexMetadata } from "@/lib/seo.mjs";

export const metadata = noIndexMetadata(
  "Quotation Payment",
  "Private quotation payment checkout page."
);

export default async function QuotePaymentRoute({ params }) {
  const { quoteCode } = await params;
  return <PaymentPage quoteCode={quoteCode} />;
}
