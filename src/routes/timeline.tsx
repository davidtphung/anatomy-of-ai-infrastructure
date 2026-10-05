import { createFileRoute } from "@tanstack/react-router";
import { CampusViewport } from "@/components/three/CampusScene";
import { BUILD_PHASES, MILESTONES } from "@/data/timeline";
import { ERA_MAP } from "@/data/eras";
import { useInfra } from "@/lib/store";

export const Route = createFileRoute("/timeline")({
  head: () => ({ meta: [{ title: "Timeline — Anatomy of AI Infrastructure" }] }),
  component: TimelinePage,
});

function TimelinePage() {
  const phase = useInfra((state) => state.buildPhase);
  const current = BUILD_PHASES[phase];

  return (
    <main className="page">
      <p className="eyebrow">From the computer room to the AI factory</p>
      <h1 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", margin: "0.2rem 0 0.6rem" }}>
        The cloud was a building before it was a product.
      </h1>
      <p className="lede">
        Select a milestone to retune the campus. Dates are themes, not a claim that one year flipped the industry.
      </p>
      <div className="hero" style={{ width: "100%", minHeight: 0, marginTop: "1rem" }}>
        <div className="hero-stage" style={{ minHeight: "20rem" }}>
          <CampusViewport />
        </div>
        <div>
          <ol className="timeline">
            {MILESTONES.map((item) => (
              <li key={item.id}>
                <div className="year">{item.year}</div>
                <div>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => {
                      useInfra.getState().setEra(item.era);
                      useInfra.getState().setMode("explore");
                    }}
                  >
                    {item.title}
                  </button>
                  <p>{item.text}</p>
                  <p className="micro">Era: {ERA_MAP[item.era].name}. Bottleneck: {item.bottleneck}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="section-title">
        <h2>Build sequence</h2>
        <p>Illustrative order. Utility queues, transformers, and GPU allocations can reorder it. Timing is not universal.</p>
      </div>
      <label className="slider">
        <span className="kicker">
          Phase {phase} — {current?.name}
        </span>
        <input
          type="range"
          min={0}
          max={10}
          value={phase}
          onChange={(event) => useInfra.getState().setBuildPhase(Number(event.target.value))}
        />
      </label>
      {current ? (
        <article className="panel" style={{ marginTop: "0.8rem" }}>
          <p>{current.detail}</p>
          <p className="callout" style={{ marginTop: "0.7rem" }}>
            {current.critical}
          </p>
        </article>
      ) : null}
      <ol className="steps" style={{ marginTop: "0.8rem" }}>
        {BUILD_PHASES.map((item) => (
          <li key={item.id}>
            <div>
              <button type="button" className="chip" data-on={phase === item.id ? "true" : "false"} onClick={() => useInfra.getState().setBuildPhase(item.id)}>
                {item.name}
              </button>
              <p>{item.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
