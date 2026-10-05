import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SupplyGlobe } from "@/components/three/SupplyGlobe";
import { RACK_JOURNEY, SUPPLY_NODES } from "@/data/supply";
import { focusComponent } from "@/lib/focus";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/supply")({
  head: () => ({ meta: [{ title: "Supply chain — Anatomy of AI Infrastructure" }] }),
  component: SupplyPage,
});

function SupplyPage() {
  const [active, setActive] = useState<string | null>("logic-fabs");
  const navigate = useNavigate();
  const node = SUPPLY_NODES.find((item) => item.id === active) ?? SUPPLY_NODES[0];

  return (
    <main className="page">
      <p className="eyebrow">Upstream of the hall</p>
      <h1 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", margin: "0.2rem 0 0.6rem" }}>
        The rack is the last mile of several factories.
      </h1>
      <p className="lede">
        Regions on this globe are representative, not exclusive production sites. Supplier locations and allocations change. The campus marker is notional.
      </p>
      <div className="hero" style={{ minHeight: 0, width: "100%", marginTop: "1rem" }}>
        <div className="hero-stage" style={{ minHeight: "24rem" }}>
          <SupplyGlobe activeId={node?.id ?? null} />
        </div>
        {node ? (
          <article className="panel stack">
            <p className="kicker">Selected region</p>
            <h2 style={{ margin: 0 }}>{node.name}</h2>
            <p>{node.geography}</p>
            <p>
              <strong>Materials. </strong>
              {node.materials}
            </p>
            <p>
              <strong>Steps. </strong>
              {node.steps}
            </p>
            <p className="callout">{node.bottleneck}</p>
            <div className="chain">
              {node.componentIds.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="chip"
                  onClick={() => {
                    focusComponent(id);
                    void navigate({ to: "/explore" });
                  }}
                >
                  Show {id.replaceAll("-", " ")}
                </button>
              ))}
            </div>
          </article>
        ) : null}
      </div>
      <div className="chain" style={{ marginTop: "0.9rem" }}>
        {SUPPLY_NODES.map((item) => (
          <button key={item.id} type="button" className="chip" data-on={item.id === node?.id ? "true" : "false"} onClick={() => setActive(item.id)}>
            {item.name}
          </button>
        ))}
      </div>
      <div className="section-title">
        <h2>Build an AI rack</h2>
        <p>Eleven steps from ore and gas to a scheduler that believes the node is healthy.</p>
      </div>
      <ol className="steps">
        {RACK_JOURNEY.map((item) => (
          <li key={item.step}>
            <div>
              <strong>{item.step}</strong>
              <p>{item.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
