import { getComponent } from "@/data/components";
import { ERA_MAP } from "@/data/eras";
import { focusComponent } from "@/lib/focus";
import { useInfra } from "@/lib/store";
import type { LayerId } from "@/data/types";

const POWER = [
  ["Grid", "transmission-line"],
  ["Yard", "switchyard"],
  ["XFMR", "main-transformer"],
  ["MV", "mv-switchgear"],
  ["ATS", "ats"],
  ["UPS", "ups"],
  ["Bus", "busway"],
  ["Rack", "gpu-rack"],
  ["GPU", "accelerator"],
] as const;

const WATER = [
  ["Treat", "water-treatment"],
  ["Tower", "cooling-tower"],
  ["Chiller", "chiller"],
  ["HX", "heat-exchanger"],
  ["CDU", "cdu"],
  ["Plate", "cold-plate"],
  ["Rack", "gpu-rack"],
] as const;

const DATA = [
  ["Fiber", "fiber-campus"],
  ["Meet-me", "meet-me"],
  ["Spine", "spine-switch"],
  ["ToR", "tor-switch"],
  ["NIC", "nic"],
  ["GPU", "accelerator"],
] as const;

function chainFor(layer: LayerId) {
  if (layer === "cooling" || layer === "water") return WATER;
  if (layer === "network") return DATA;
  return POWER;
}

export function Inspector() {
  const id = useInfra((state) => state.selectedId);
  const era = useInfra((state) => state.era);
  const pins = useInfra((state) => state.pins);
  const compare = useInfra((state) => state.compareIds);
  const component = getComponent(id);

  if (!component) {
    return (
      <aside className="inspector" aria-label="Component inspector">
        <p className="kicker">Inspector</p>
        <h2>Select a system</h2>
        <p className="lede">
          Click a building, transformer, tower, or rack. Shift-click adds it to compare (up to three). Double-click a rack to open the cabinet.
        </p>
        <div className="stack" style={{ marginTop: "1rem" }}>
          <PinList title="Pinned" ids={pins} />
          <PinList title="In compare" ids={compare} />
        </div>
      </aside>
    );
  }

  const chain = chainFor(component.layer);
  const eraNote = component.eraNotes?.[era];

  return (
    <aside className="inspector" aria-live="polite" aria-label="Component inspector">
      <p className="kicker">
        {component.category} · {component.subCategory}
      </p>
      <h2>{component.name}</h2>
      <p>{component.whyItMatters}</p>
      <div className="row-actions" style={{ margin: "0.8rem 0" }}>
        <button type="button" className="btn" onClick={() => focusComponent(component.id)}>
          Focus
        </button>
        <button type="button" className="btn-ghost" onClick={() => useInfra.getState().toggleCompare(component.id)}>
          {compare.includes(component.id) ? "Remove compare" : "Compare"}
        </button>
        <button type="button" className="btn-ghost" onClick={() => useInfra.getState().togglePin(component.id)}>
          {pins.includes(component.id) ? "Unpin" : "Pin"}
        </button>
      </div>
      <p className="kicker">One-line path</p>
      <div className="chain" role="list">
        {chain.map(([label, target]) => (
          <button
            key={target}
            type="button"
            className="chip"
            data-on={target === component.id ? "true" : "false"}
            onClick={() => focusComponent(target)}
          >
            {label}
          </button>
        ))}
      </div>
      <p style={{ marginTop: "0.9rem" }}>{component.description}</p>
      {eraNote ? <p className="callout">{ERA_MAP[era].name}: {eraNote}</p> : null}
      <table className="spec-table">
        <caption className="sr-only">Specifications for {component.name}</caption>
        <tbody>
          <tr>
            <th scope="row">Capacity</th>
            <td>
              {component.capacity} {component.units ? `(${component.units})` : ""}
            </td>
          </tr>
          {component.technicalSpecs.map((spec) => (
            <tr key={spec.label}>
              <th scope="row">{spec.label}</th>
              <td>{spec.value}</td>
            </tr>
          ))}
          <tr>
            <th scope="row">Inputs</th>
            <td>{component.inputs.join(" · ")}</td>
          </tr>
          <tr>
            <th scope="row">Outputs</th>
            <td>{component.outputs.join(" · ")}</td>
          </tr>
          <tr>
            <th scope="row">Depends on</th>
            <td>{component.dependencies.join(" · ")}</td>
          </tr>
          <tr>
            <th scope="row">Redundancy</th>
            <td>{component.redundancy}</td>
          </tr>
          <tr>
            <th scope="row">Failure modes</th>
            <td>{component.failureModes.join(" · ")}</td>
          </tr>
          <tr>
            <th scope="row">Suppliers</th>
            <td>
              {component.suppliers.join(" ")} Illustrative categories, not endorsements.
            </td>
          </tr>
          <tr>
            <th scope="row">Supply chain</th>
            <td>{component.supplyChainOrigins.join(" · ")}</td>
          </tr>
          <tr>
            <th scope="row">Energy</th>
            <td>{component.energyImpact}</td>
          </tr>
          <tr>
            <th scope="row">Water</th>
            <td>{component.waterImpact}</td>
          </tr>
          <tr>
            <th scope="row">Carbon</th>
            <td>{component.carbonImpact}</td>
          </tr>
          <tr>
            <th scope="row">History</th>
            <td>{component.historicalContext}</td>
          </tr>
        </tbody>
      </table>
      <p className="kicker" style={{ marginTop: "0.8rem" }}>
        Related
      </p>
      <div className="chain">
        {component.related.map((related) => {
          const item = getComponent(related);
          if (!item) return null;
          return (
            <button key={related} type="button" className="chip" onClick={() => focusComponent(related)}>
              {item.name}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function PinList({ title, ids }: { title: string; ids: string[] }) {
  if (ids.length === 0) return null;
  return (
    <div>
      <p className="kicker">{title}</p>
      <div className="chain">
        {ids.map((id) => {
          const item = getComponent(id);
          if (!item) return null;
          return (
            <button key={id} type="button" className="chip" onClick={() => focusComponent(id)}>
              {item.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
