export default function ProcessSteps({ items }) {
  return (
    <div className="steps-grid">
      {items.map((item, index) => (
        <article className="card step-card" key={item.title}>
          <div className="step-number">0{index + 1}</div>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  );
}
