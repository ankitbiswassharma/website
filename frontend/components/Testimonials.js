function StarRow() {
  return (
    <div className="testimonial-stars" aria-label="5 stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <span className="t-star" key={n} aria-hidden="true">★</span>
      ))}
    </div>
  );
}

export default function Testimonials({ items }) {
  return (
    <div className="testimonial-grid">
      {items.map((item) => (
        <article className="card testimonial-card" key={item.author}>
          <div className="testimonial-quote-icon" aria-hidden="true">"</div>
          <StarRow />
          <p className="quote">"{item.quote}"</p>
          <div className="testimonial-meta">
            <strong>{item.author}</strong>
            <span>{item.role}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
