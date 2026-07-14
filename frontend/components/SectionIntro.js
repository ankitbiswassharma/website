export default function SectionIntro({
  eyebrow,
  title,
  text,
  centered = false,
  eyebrowClassName = "",
}) {
  return (
    <div className={`section-intro${centered ? " section-intro-center" : ""}`}>
      {eyebrow ? (
        <div className={`eyebrow${eyebrowClassName ? ` ${eyebrowClassName}` : ""}`}>
          {eyebrow}
        </div>
      ) : null}
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  );
}
