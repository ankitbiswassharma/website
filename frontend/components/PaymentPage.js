"use client";

import { useEffect, useState } from "react";

import { apiJson, loadExternalScript } from "@/lib/api";

export default function PaymentPage({ quoteCode }) {
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    async function loadQuotation() {
      try {
        const response = await apiJson(`/public/quotations/${quoteCode}`);
        setQuotation(response);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }
    loadQuotation();
  }, [quoteCode]);

  async function handlePayment() {
    setPaying(true);
    setError("");
    setMessage("");

    try {
      const order = await apiJson(`/public/quotations/${quoteCode}/payment-order`, {
        method: "POST",
      });

      if (order.mode !== "razorpay") {
        setMessage(order.message || "Payment flow updated.");
        setPaying(false);
        return;
      }

      await loadExternalScript("https://checkout.razorpay.com/v1/checkout.js");

      const razorpay = new window.Razorpay({
        key: order.key_id,
        order_id: order.order_id,
        name: "Musk-IT",
        description: quotation.title,
        amount: order.amount,
        currency: order.currency,
        prefill: order.prefill,
        theme: { color: "#4f46e5" },
        handler: async function onPaymentSuccess(response) {
          try {
            const verifyResponse = await apiJson("/public/payments/verify", {
              method: "POST",
              body: JSON.stringify(response),
            });
            setMessage(
              `Payment confirmed. Invoice ${verifyResponse.invoice_number} has been generated.`
            );
          } catch (verifyError) {
            setError(verifyError.message);
          }
        },
      });

      razorpay.on("payment.failed", function onPaymentFailed(response) {
        setError(
          response?.error?.description || "Payment failed. Please try again or contact sales."
        );
      });
      razorpay.open();
    } catch (paymentError) {
      setError(paymentError.message);
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <section className="page-section">
        <div className="shell empty-state">Loading quotation...</div>
      </section>
    );
  }

  if (error && !quotation) {
    return (
      <section className="page-section">
        <div className="shell error-box">{error}</div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="shell stack-lg">
        <div className="page-hero">
          <div className="shell">
            <div className="eyebrow">Sprint Quotation</div>
            <h1 style={{ fontSize: "52px" }}>{quotation.title}</h1>
            <p>
              Quotation {quotation.quotation_number} prepared for {quotation.lead_name}.
              Review the scope summary and complete payment below to confirm your sprint.
            </p>
          </div>
        </div>
        {message ? <div className="success-box">{message}</div> : null}
        {error ? <div className="error-box">{error}</div> : null}
        <div className="payment-grid">
          <div className="card pay-card stack-md">
            <div>
              <h3>Sprint scope</h3>
              <p>
                {quotation.requirements_summary ||
                  "Scoped sprint delivery tailored to the agreed feature set, timeline, and technical requirements."}
              </p>
            </div>
            {quotation.items.map((item) => (
              <div
                className="dashboard-toolbar"
                key={`${item.title}-${item.id || item.line_total}`}
                style={{ justifyContent: "space-between" }}
              >
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
                <strong>
                  {quotation.currency} {item.line_total}
                </strong>
              </div>
            ))}
          </div>
          <div className="card pay-card stack-md">
            <div className="eyebrow">Commercial summary</div>
            <div className="dashboard-toolbar" style={{ justifyContent: "space-between" }}>
              <span>Subtotal</span>
              <strong>{quotation.currency} {quotation.subtotal}</strong>
            </div>
            <div className="dashboard-toolbar" style={{ justifyContent: "space-between" }}>
              <span>{quotation.tax_label} ({quotation.tax_rate}%)</span>
              <strong>{quotation.currency} {quotation.tax_amount}</strong>
            </div>
            <div className="dashboard-toolbar" style={{ justifyContent: "space-between" }}>
              <span>Total payable</span>
              <strong>{quotation.currency} {quotation.total_amount}</strong>
            </div>
            <div className="muted">Valid until {quotation.valid_until}</div>
            <button className="button button-primary" type="button" onClick={handlePayment} disabled={paying}>
              {paying ? "Opening payment..." : "Pay with Razorpay"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
