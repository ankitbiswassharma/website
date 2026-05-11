export default function PricingCards({ plans }) {
  return (
    <div className="pricing-grid">
      {plans.map((plan) => (
        <article
          className={`card pricing-card${plan.featured ? " pricing-card-featured" : ""}`}
          key={plan.name}
        >
          <div className="eyebrow">{plan.eyebrow}</div>
          <h3>{plan.name}</h3>
          <div className="price">{plan.price}</div>
          <p>{plan.detail}</p>
          <ul className="bullet-list compact">
            {plan.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
