import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { COMPONENTS } from "@/data/components";
import { LAYER_ORDER } from "@/lib/store";
import { focusComponent } from "@/lib/focus";

export const Route = createFileRoute("/atlas")({
  head: () => ({ meta: [{ title: "Text atlas — Anatomy of AI Infrastructure" }] }),
  component: AtlasPage,
});

function AtlasPage() {
  const navigate = useNavigate();
  return (
    <main className="page atlas">
      <p className="eyebrow">No WebGL required</p>
      <h1 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", margin: "0.2rem 0 0.6rem" }}>
        Text atlas
      </h1>
      <p className="lede">
        Every system in the model, grouped by layer. Open one, or jump into the campus with it selected. This page is the accessible fallback.
      </p>
      {LAYER_ORDER.map((layer) => {
        const items = COMPONENTS.filter((item) => item.layer === layer.id);
        if (items.length === 0) return null;
        return (
          <section key={layer.id}>
            <h2>
              <i className="swatch" data-layer={layer.id} aria-hidden="true" /> {layer.label}
            </h2>
            {items.map((item) => (
              <details key={item.id} id={item.id}>
                <summary>{item.name}</summary>
                <p>{item.shortDescription}</p>
                <p>{item.whyItMatters}</p>
                <p>
                  <strong>Capacity. </strong>
                  {item.capacity}
                </p>
                <p>
                  <strong>Failure. </strong>
                  {item.failureModes.join("; ")}
                </p>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    focusComponent(item.id);
                    void navigate({ to: "/explore" });
                  }}
                >
                  Show in the campus
                </button>
              </details>
            ))}
          </section>
        );
      })}
    </main>
  );
}
