import { create } from "zustand";
import { HERO_RACK, HERO_TRAY, type Focus, type Workload } from "@/fly/spec";

type FlyState = {
  focus: Focus;
  workload: Workload;
  pumps: boolean;
  rack: number | null;
  tray: number | null;
  campus: boolean;
  touring: boolean;
  tourStep: number;
  tourNonce: number;
  framed: boolean;
  reduced: boolean;
  notes: boolean;
  setFocus: (focus: Focus) => void;
  setWorkload: (workload: Workload) => void;
  setPumps: (pumps: boolean) => void;
  openRack: (rack: number | null) => void;
  pullTray: (tray: number | null) => void;
  setCampus: (campus: boolean) => void;
  setTouring: (touring: boolean) => void;
  setTourStep: (tourStep: number) => void;
  setFramed: (framed: boolean) => void;
  setReduced: (reduced: boolean) => void;
  setNotes: (notes: boolean) => void;
  applyShot: (shot: {
    focus: Focus;
    workload: Workload;
    pumps: boolean;
    rack: number | null;
    tray: number | null;
    campus: boolean;
  }) => void;
};

export const useFly = create<FlyState>((set) => ({
  focus: "all",
  workload: "training",
  pumps: true,
  rack: null,
  tray: null,
  campus: false,
  touring: false,
  tourStep: 0,
  tourNonce: 0,
  framed: false,
  reduced: false,
  notes: false,
  setFocus: (focus) => set({ focus }),
  setWorkload: (workload) => set({ workload, pumps: true }),
  setPumps: (pumps) => set({ pumps }),
  openRack: (rack) =>
    set({
      rack,
      tray: null,
      campus: false,
      framed: true,
      touring: false,
    }),
  pullTray: (tray) =>
    set({
      rack: HERO_RACK,
      tray: tray ?? HERO_TRAY,
      campus: false,
      framed: true,
      touring: false,
    }),
  setCampus: (campus) =>
    set({
      campus,
      framed: true,
      touring: false,
      rack: campus ? null : HERO_RACK,
      tray: null,
    }),
  setTouring: (touring) =>
    set((state) => ({
      touring,
      framed: touring ? true : state.framed,
      tourStep: 0,
      tourNonce: touring ? state.tourNonce + 1 : state.tourNonce,
    })),
  setTourStep: (tourStep) => set({ tourStep }),
  setFramed: (framed) => set({ framed }),
  setReduced: (reduced) => set({ reduced }),
  setNotes: (notes) => set({ notes }),
  applyShot: (shot) =>
    set({
      focus: shot.focus,
      workload: shot.workload,
      pumps: shot.pumps,
      rack: shot.rack,
      tray: shot.tray,
      campus: shot.campus,
      framed: true,
    }),
}));
