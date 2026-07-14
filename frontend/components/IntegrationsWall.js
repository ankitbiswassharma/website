import { integrationCategories } from "@/lib/site-data";

/**
 * Colour-coded wall of the tools we integrate with — flattens the integration
 * categories into a single scannable grid. Signals "we plug into your stack".
 */
const CONNECTORS = Array.from(
  new Set(integrationCategories.flatMap((c) => c.connectors))
);

export default function IntegrationsWall({ items = CONNECTORS }) {
  return (
    <div className="integrations-wall">
      {items.map((name) => (
        <div className="integration-tile" key={name}>
          <span className="integration-dot" aria-hidden="true" />
          {name}
        </div>
      ))}
    </div>
  );
}
