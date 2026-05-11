import PaymentPage from "@/components/PaymentPage";

export default function QuotePaymentRoute({ params }) {
  const { quoteCode } = params;
  return <PaymentPage quoteCode={quoteCode} />;
}
