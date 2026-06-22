import CtaBanner from "@/components/CtaBanner";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import SectionIntro from "@/components/SectionIntro";
import { reviewItems } from "@/lib/site-data";
import { breadcrumbJsonLd, buildMetadata, serviceJsonLd } from "@/lib/seo.mjs";

export const metadata = buildMetadata("/testimonials");

function Stars({ rating = 5 }) {
  return (
    <div className="review-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rating ? "is-filled" : ""} aria-hidden="true">
          ★
        </span>
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  return (
    <>
      <PageHero
        eyebrow="Testimonials"
        title="What clients say about"
        highlight="working with us"
        text="We're judged on delivery, clarity, and software that actually gets used. Here's what businesses say after working with Musk-IT."
        primaryHref="/consultation"
        primaryLabel="Book a Consultation"
        secondaryHref="/work"
        secondaryLabel="See Our Work"
      />

      <section className="page-section">
        <div className="shell stack-lg">
          <div className="review-summary">
            <div className="review-summary-score">
              <strong>5.0</strong>
              <Stars rating={5} />
              <span className="muted">Average client rating</span>
            </div>
            <SectionIntro
              eyebrow="Client Feedback"
              title="Trusted by businesses across sectors"
              text="From manufacturers to professional services firms, teams choose us for delivery speed, honest scoping, and code they can own."
            />
          </div>

          <div className="review-grid">
            {reviewItems.map((review) => (
              <article className="card review-card" key={review.quote}>
                <Stars rating={review.rating} />
                <p className="review-quote">“{review.quote}”</p>
                <div className="review-meta">
                  <strong>{review.author}</strong>
                  <span>{review.role}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner
        gradient
        eyebrow="Join them"
        title="Let's build something you'll recommend."
        text="Book a consultation and tell us what you need. We'll scope it honestly and deliver software your team will actually use."
        primaryHref="/consultation"
        primaryLabel="Book a Consultation"
        secondaryHref="/estimate"
        secondaryLabel="Estimate a Project"
      />

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Testimonials", path: "/testimonials" },
          ]),
          serviceJsonLd({
            name: "Custom Software Development",
            description:
              "Client testimonials for Musk-IT custom software development and workflow automation services.",
            path: "/testimonials",
          }),
        ]}
      />
    </>
  );
}
