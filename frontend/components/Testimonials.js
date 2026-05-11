export default function Testimonials({ items }) {
  return (
    <div className="testimonial-grid">
      {items.map((item) => (
        <article className="card testimonial-card" key={item.author}>
          <p className="quote">“{item.quote}”</p>
          <div className="testimonial-meta">
            <strong>{item.author}</strong>
            <span>{item.role}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
