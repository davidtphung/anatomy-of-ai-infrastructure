import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  EraId,
  ExploreMode,
  LayerId,
  QualityMode,
  RackZoom,
  Scenario,
  Vec3,
} from "@/data/types";

export const LAYER_ORDER: { id: LayerId; label: string; hint: string; key: string }[] = [
  { id: "power", label: "Grid power", hint: "Utility path through the rack", key: "p" },
  { id: "backup", label: "Backup", hint: "Generation, transfer, UPS, batteries", key: "b" },
  { id: "cooling", label: "Cooling", hint: "Heat path off the silicon", key: "c" },
  { id: "water", label: "Water", hint: "Makeup, towers, treatment", key: "w" },
  { id: "network", label: "Network", hint: "Fiber and the AI fabric", key: "n" },
  { id: "compute", label: "Compute", hint: "Racks, trays, accelerators", key: "g" },
  { id: "building", label: "Building", hint: "Hall, fire, security", key: "u" },
  { id: "supply", label: "Supply chain", hint: "Where the objects come from", key: "s" },
  { id: "capital", label: "Capital", hint: "What the money is buying", key: "e" },
  { id: "carbon", label: "Carbon", hint: "Operational intensity overlay", key: "o" },
  { id: "construction", label: "Construction", hint: "Build sequence", key: "t" },
  { id: "telemetry", label: "Telemetry", hint: "Illustrative live readings", key: "y" },
];

const defaultLayers = (): Record<LayerId, boolean> => ({
  power: true,
  backup: true,
  cooling: true,
  water: true,
  network: true,
  compute: true,
  building: true,
  supply: false,
  capital: false,
  carbon: false,
  construction: false,
  telemetry: false,
});

export const defaultScenario = (): Scenario => ({
  itLoadMw: 40,
  pue: 1.25,
  avgRackKw: 80,
  cooling: "dtc",
  carbonGPerKwh: 380,
  waterStress: "medium",
  utilization: 0.62,
  energyPricePerMwh: 65,
  redundancy: "N+1",
});

interface CameraRequest {
  position: Vec3;
  target: Vec3;
  nonce: number;
}

interface InfraState {
  era: EraId;
  layers: Record<LayerId, boolean>;
  mode: ExploreMode;
  selectedId: string | null;
  selectedPosition: Vec3 | null;
  compareIds: string[];
  pins: string[];
  quality: QualityMode;
  reducedMotion: boolean;
  highContrast: boolean;
  buildPhase: number;
  cameraRequest: CameraRequest | null;
  rackOpen: boolean;
  rackZoom: RackZoom;
  explode: number;
  tourStep: number | null;
  setEra: (era: EraId) => void;
  toggleLayer: (id: LayerId) => void;
  setLayer: (id: LayerId, on: boolean) => void;
  setMode: (mode: ExploreMode) => void;
  select: (id: string | null, position?: Vec3 | null) => void;
  toggleCompare: (id: string) => void;
  togglePin: (id: string) => void;
  setQuality: (quality: QualityMode) => void;
  setReducedMotion: (value: boolean) => void;
  setHighContrast: (value: boolean) => void;
  setBuildPhase: (phase: number) => void;
  requestCamera: (position: Vec3, target: Vec3) => void;
  setRackOpen: (open: boolean) => void;
  setRackZoom: (zoom: RackZoom) => void;
  setExplode: (value: number) => void;
  setTourStep: (step: number | null) => void;
  setScenario: (patch: Partial<Scenario>) => void;
  scenario: Scenario;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
}

export const useInfra = create<InfraState>()(
  persist(
    (set, get) => ({
      era: "hyperscale",
      layers: defaultLayers(),
      mode: "explore",
      selectedId: null,
      selectedPosition: null,
      compareIds: [],
      pins: [],
      quality: "balanced",
      reducedMotion: false,
      highContrast: false,
      buildPhase: 10,
      cameraRequest: null,
      rackOpen: false,
      rackZoom: "cabinet",
      explode: 0.45,
      tourStep: null,
      scenario: defaultScenario(),
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      setEra: (era) => set({ era, rackOpen: false }),
      toggleLayer: (id) =>
        set({ layers: { ...get().layers, [id]: !get().layers[id] }, mode: "explore" }),
      setLayer: (id, on) => set({ layers: { ...get().layers, [id]: on } }),
      setMode: (mode) => set({ mode, ...(mode === "build" ? { buildPhase: get().buildPhase } : {}) }),
      select: (id, position) =>
        set({
          selectedId: id,
          selectedPosition: position ?? null,
          rackOpen: id === null ? false : get().rackOpen,
        }),
      toggleCompare: (id) => {
        const current = get().compareIds;
        if (current.includes(id)) set({ compareIds: current.filter((item) => item !== id) });
        else set({ compareIds: [...current, id].slice(-3) });
      },
      togglePin: (id) => {
        const current = get().pins;
        if (current.includes(id)) set({ pins: current.filter((item) => item !== id) });
        else set({ pins: [...current, id] });
      },
      setQuality: (quality) => set({ quality }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setBuildPhase: (buildPhase) => set({ buildPhase, mode: "build" }),
      requestCamera: (position, target) =>
        set({ cameraRequest: { position, target, nonce: Date.now() } }),
      setRackOpen: (rackOpen) => set({ rackOpen, rackZoom: rackOpen ? get().rackZoom : "cabinet" }),
      setRackZoom: (rackZoom) => set({ rackZoom }),
      setExplode: (explode) => set({ explode }),
      setTourStep: (tourStep) => set({ tourStep }),
      setScenario: (patch) => set({ scenario: { ...get().scenario, ...patch } }),
    }),
    {
      name: "anatomy-ai-infra",
      skipHydration: true,
      partialize: (state) => ({
        scenario: state.scenario,
        pins: state.pins,
        reducedMotion: state.reducedMotion,
        highContrast: state.highContrast,
        quality: state.quality,
      }),
    },
  ),
);

export function layerOn(state: Pick<InfraState, "layers" | "mode" | "buildPhase">, id: LayerId): boolean {
  const { mode, layers, buildPhase } = state;
  if (mode === "power") return id === "power" || id === "backup" || id === "building" || id === "compute";
  if (mode === "water") return id === "water" || id === "cooling" || id === "building" || id === "compute";
  if (mode === "data") return id === "network" || id === "compute" || id === "building";
  if (mode === "heat") return id === "cooling" || id === "water" || id === "compute" || id === "building";
  if (mode === "build") {
    if (id === "telemetry" || id === "capital" || id === "carbon" || id === "supply") return false;
    if (buildPhase < 3 && (id === "power" || id === "backup")) return buildPhase >= 1 && id === "power";
    if (buildPhase < 5 && (id === "cooling" || id === "water")) return false;
    if (buildPhase < 7 && id === "network") return false;
    if (buildPhase < 8 && id === "compute") return false;
    return true;
  }
  if (mode === "ops") return true;
  return layers[id];
}
