export default function SectionIntro({ eyebrow, title, text, centered = false }) {
  return (
    <div className={`section-intro${centered ? " section-intro-center" : ""}`}>
      {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  );
}
