import { ERAS } from "@/data/eras";
import { LAYER_ORDER, useInfra } from "@/lib/store";
import type { EraId, ExploreMode, QualityMode } from "@/data/types";

const MODES: { id: ExploreMode; label: string }[] = [
  { id: "explore", label: "Explore" },
  { id: "power", label: "Power" },
  { id: "water", label: "Water" },
  { id: "data", label: "Data" },
  { id: "heat", label: "Heat" },
  { id: "build", label: "Build" },
  { id: "ops", label: "Operations" },
];

export function ModeBar() {
  const mode = useInfra((state) => state.mode);
  return (
    <div className="float-bar" role="toolbar" aria-label="Follow a flow">
      {MODES.map((item) => (
        <button
          key={item.id}
          type="button"
          className="chip"
          data-on={mode === item.id ? "true" : "false"}
          onClick={() => useInfra.getState().setMode(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function EraSwitch({ compact = false }: { compact?: boolean }) {
  const era = useInfra((state) => state.era);
  return (
    <div className="chain" role="group" aria-label="Data center era">
      {ERAS.map((item) => (
        <button
          key={item.id}
          type="button"
          className="chip"
          data-on={era === item.id ? "true" : "false"}
          onClick={() => useInfra.getState().setEra(item.id)}
        >
          {compact ? item.name.replace(" campus", "").replace(" room", "").replace(" hall", "") : item.name}
        </button>
      ))}
    </div>
  );
}

export function LayerDock() {
  const layers = useInfra((state) => state.layers);
  const mode = useInfra((state) => state.mode);
  return (
    <div className="dock" role="toolbar" aria-label="Infrastructure layers">
      {LAYER_ORDER.map((layer) => (
        <button
          key={layer.id}
          type="button"
          className="layer-btn"
          data-on={layers[layer.id] ? "true" : "false"}
          aria-pressed={layers[layer.id]}
          title={`${layer.hint}. Shortcut ${layer.key.toUpperCase()}`}
          disabled={mode !== "explore"}
          onClick={() => useInfra.getState().toggleLayer(layer.id)}
        >
          <i className="swatch" data-layer={layer.id} aria-hidden="true" />
          {layer.label}
        </button>
      ))}
    </div>
  );
}

export function Legend() {
  return (
    <div className="legend" aria-label="Layer colors. Patterns repeat so hue is not the only cue.">
      {LAYER_ORDER.map((layer) => (
        <span key={layer.id}>
          <i className="swatch" data-layer={layer.id} aria-hidden="true" />
          {layer.label}
        </span>
      ))}
    </div>
  );
}

export function QualityMenu() {
  const quality = useInfra((state) => state.quality);
  const reduced = useInfra((state) => state.reducedMotion);
  const contrast = useInfra((state) => state.highContrast);
  const setQuality = (value: QualityMode) => useInfra.getState().setQuality(value);
  return (
    <div className="chain" role="group" aria-label="Display quality and accessibility">
      {(["high", "balanced", "low"] as QualityMode[]).map((item) => (
        <button key={item} type="button" className="chip" data-on={quality === item ? "true" : "false"} onClick={() => setQuality(item)}>
          {item === "low" ? "Low power" : item === "high" ? "High detail" : "Balanced"}
        </button>
      ))}
      <button
        type="button"
        className="chip"
        data-on={reduced ? "true" : "false"}
        aria-pressed={reduced}
        onClick={() => useInfra.getState().setReducedMotion(!reduced)}
      >
        Reduced motion
      </button>
      <button
        type="button"
        className="chip"
        data-on={contrast ? "true" : "false"}
        aria-pressed={contrast}
        onClick={() => useInfra.getState().setHighContrast(!contrast)}
      >
        High contrast
      </button>
    </div>
  );
}

export function setEraAndStay(id: EraId) {
  useInfra.getState().setEra(id);
}
