/**
 * Comparison table positioning Musk-IT against the two common alternatives
 * (hiring in-house, a traditional agency). Purely qualitative, honest framing.
 */
const ROWS = [
  { label: "Time to first working build", us: "~48 hours", inhouse: "2–4 months", agency: "4–8 weeks", tone: ["yes", "no", "mid"] },
  { label: "You own the code & IP", us: "Always", inhouse: "Yes", agency: "Often licensed", tone: ["yes", "yes", "no"] },
  { label: "Cost to get started", us: "Fixed scope, no overhead", inhouse: "Salaries + benefits", agency: "High retainers", tone: ["yes", "no", "no"] },
  { label: "Runs the IT behind it too", us: "Cloud, security & support", inhouse: "Separate hire", agency: "Rarely", tone: ["yes", "mid", "no"] },
  { label: "Built around your workflows", us: "Every engagement", inhouse: "Yes", agency: "Templated", tone: ["yes", "yes", "mid"] },
  { label: "Scale up or pause anytime", us: "No lock-in", inhouse: "Hiring / layoffs", agency: "Contract-bound", tone: ["yes", "no", "mid"] },
];

function Cell({ value, tone }) {
  const cls = tone === "yes" ? "compare-yes" : tone === "no" ? "compare-no" : "compare-mid";
  const mark = tone === "yes" ? "✓ " : tone === "no" ? "✕ " : "~ ";
  return (
    <div className="compare-cell col-alt">
      <span className={cls}>{mark}</span>
      {value}
    </div>
  );
}

export default function WhyUsCompare() {
  return (
    <div className="compare" role="table" aria-label="How Musk-IT compares">
      <div className="compare-row compare-head" role="row">
        <div className="compare-cell rowlabel" role="columnheader">How we compare</div>
        <div className="compare-cell head-us" role="columnheader">Musk-IT</div>
        <div className="compare-cell head-alt" role="columnheader">In-house hire</div>
        <div className="compare-cell head-alt" role="columnheader">Traditional agency</div>
      </div>
      {ROWS.map((row) => (
        <div className="compare-row" role="row" key={row.label}>
          <div className="compare-cell rowlabel" role="cell">{row.label}</div>
          <div className="compare-cell col-us" role="cell">
            <span className="compare-yes">✓ </span>
            {row.us}
          </div>
          <Cell value={row.inhouse} tone={row.tone[1]} />
          <Cell value={row.agency} tone={row.tone[2]} />
        </div>
      ))}
    </div>
  );
}
