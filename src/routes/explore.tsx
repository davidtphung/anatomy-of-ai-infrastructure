import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CampusViewport } from "@/components/three/CampusScene";
import { ExplodedRack } from "@/components/three/ExplodedRack";
import { EraSwitch, LayerDock, ModeBar, QualityMenu } from "@/components/ui/controls";
import { Inspector } from "@/components/ui/inspector";
import { BUILD_PHASES } from "@/data/timeline";
import { TOUR } from "@/data/tour";
import { useInfra } from "@/lib/store";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [{ title: "Explore the campus — Anatomy of AI Infrastructure" }],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const tourStep = useInfra((state) => state.tourStep);
  const rackOpen = useInfra((state) => state.rackOpen);
  const mode = useInfra((state) => state.mode);
  const phase = useInfra((state) => state.buildPhase);
  const zoom = useInfra((state) => state.rackZoom);
  const explode = useInfra((state) => state.explode);

  useEffect(() => {
    if (tourStep === null) return;
    const step = TOUR[tourStep];
    if (!step) return;
    const state = useInfra.getState();
    if (step.era) state.setEra(step.era);
    state.setMode(step.mode);
    state.select(step.select);
    state.requestCamera(step.camera, step.target);
  }, [tourStep]);

  const step = tourStep !== null ? TOUR[tourStep] : null;

  return (
    <div className="explore-shell">
      <div className="explore-stage">
        <ModeBar />
        <CampusViewport />
        {rackOpen ? (
          <div className="rack-panel panel">
            <div className="row-actions">
              <p className="kicker" style={{ margin: 0 }}>
                Representative rack · not a vendor layout
              </p>
              <button type="button" className="chip" onClick={() => useInfra.getState().setRackOpen(false)}>
                Close
              </button>
            </div>
            <ExplodedRack />
            <div className="row-actions">
              {(["cabinet", "server", "package"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  className="chip"
                  data-on={zoom === level ? "true" : "false"}
                  onClick={() => useInfra.getState().setRackZoom(level)}
                >
                  {level}
                </button>
              ))}
              <label className="slider" style={{ minWidth: "8rem" }}>
                <span className="sr-only">Explode</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={explode}
                  onChange={(event) => useInfra.getState().setExplode(Number(event.target.value))}
                />
              </label>
            </div>
            <p className="micro">Package view is a schematic lattice, not a process model or a silicon floorplan.</p>
          </div>
        ) : null}
        {step ? (
          <div className="tour" role="region" aria-label="Guided tour">
            <p className="kicker">
              Tour {tourStep! + 1} / {TOUR.length}
            </p>
            <h2 style={{ fontSize: "1.4rem", margin: "0.15rem 0" }}>{step.title}</h2>
            <p style={{ margin: "0 0 0.7rem" }}>{step.body}</p>
            <div className="row-actions">
              <button
                type="button"
                className="btn-ghost"
                disabled={tourStep === 0}
                onClick={() => useInfra.getState().setTourStep((tourStep ?? 1) - 1)}
              >
                Back
              </button>
              {tourStep! < TOUR.length - 1 ? (
                <button type="button" className="btn" onClick={() => useInfra.getState().setTourStep((tourStep ?? 0) + 1)}>
                  Next
                </button>
              ) : (
                <Link to="/compare" className="btn">
                  Compare eras
                </Link>
              )}
              <button type="button" className="btn-ghost" onClick={() => useInfra.getState().setTourStep(null)}>
                Free explore
              </button>
            </div>
          </div>
        ) : null}
      </div>
      <Inspector />
      <div>
        <LayerDock />
        <div className="dock" style={{ borderTop: "none", paddingTop: 0, flexWrap: "wrap" }}>
          <EraSwitch compact />
          <button type="button" className="chip" data-on={tourStep !== null ? "true" : "false"} onClick={() => useInfra.getState().setTourStep(0)}>
            Start tour
          </button>
          <Link to="/atlas" className="chip" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            Text atlas
          </Link>
          <QualityMenu />
          {mode === "build" ? (
            <label className="slider" style={{ minWidth: "14rem", flex: 1 }}>
              <span className="kicker">
                {BUILD_PHASES[phase]?.name ?? "Phase"}
              </span>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={phase}
                aria-valuetext={BUILD_PHASES[phase]?.name}
                onChange={(event) => useInfra.getState().setBuildPhase(Number(event.target.value))}
              />
            </label>
          ) : null}
        </div>
      </div>
    </div>
  );
}
