import { createFileRoute } from "@tanstack/react-router";
import { CampusViewport } from "@/components/three/CampusScene";
import { EraSwitch } from "@/components/ui/controls";
import { getComponent } from "@/data/components";
import { COMPARE_ROWS, ERAS, ERA_MAP } from "@/data/eras";
import { useInfra } from "@/lib/store";

export const Route = createFileRoute("/compare")({
  head: () => ({ meta: [{ title: "Compare eras — Anatomy of AI Infrastructure" }] }),
  component: ComparePage,
});

function ComparePage() {
  const era = useInfra((state) => state.era);
  const compareIds = useInfra((state) => state.compareIds);
  const picked = compareIds.map((id) => getComponent(id)).filter((item) => item !== undefined);
  const active = ERA_MAP[era];

  return (
    <main className="page">
      <p className="eyebrow">Four eras</p>
      <h1 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", margin: "0.2rem 0 0.6rem" }}>
        Same idea of a data center. Different machines.
      </h1>
      <p className="lede">
        Rack-power ranges are representative, not universal. A neocloud can lease a hyperscale shell. A cloud hall can host an AI pod. The categories are teaching tools.
      </p>
      <div style={{ margin: "1rem 0" }}>
        <EraSwitch />
      </div>
      <div className="hero" style={{ minHeight: 0, width: "100%" }}>
        <div className="hero-stage" style={{ minHeight: "22rem" }}>
          <CampusViewport interactive />
        </div>
        <article className="panel">
          <p className="kicker">{active.period}</p>
          <h2 style={{ marginTop: 0 }}>{active.name}</h2>
          <p>{active.summary}</p>
          <p className="callout" style={{ marginTop: "0.8rem" }}>
            Bottleneck: {active.bottleneck}
          </p>
        </article>
      </div>
      <div style={{ overflowX: "auto", marginTop: "1.2rem" }}>
        <table className="data-table">
          <caption className="sr-only">Comparison of four data-center eras</caption>
          <thead>
            <tr>
              <th scope="col">Question</th>
              {ERAS.map((item) => (
                <th key={item.id} scope="col">
                  <button type="button" className="chip" data-on={era === item.id ? "true" : "false"} onClick={() => useInfra.getState().setEra(item.id)}>
                    {item.name}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row) => (
              <tr key={row.key}>
                <th scope="row">{row.label}</th>
                {ERAS.map((item) => (
                  <td key={item.id}>{String(item[row.key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="section-title">
        <h2>Pinned components</h2>
        <p>Shift-click up to three objects in the campus, or use Compare in the inspector.</p>
      </div>
      {picked.length === 0 ? (
        <p className="lede">Nothing is in the compare tray yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Field</th>
                {picked.map((item) => (
                  <th key={item.id} scope="col">
                    {item.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Why it matters", "whyItMatters"],
                  ["Capacity", "capacity"],
                  ["Redundancy", "redundancy"],
                  ["Energy", "energyImpact"],
                  ["Water", "waterImpact"],
                ] as const
              ).map(([label, key]) => (
                <tr key={key}>
                  <th scope="row">{label}</th>
                  {picked.map((item) => (
                    <td key={item.id}>{item[key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
