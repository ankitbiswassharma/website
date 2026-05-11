export default function SectionIntro({ eyebrow, title, text }) {
  return (
    <div className="section-intro">
      {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  );
}
