import type { EraId, ExploreMode, Vec3 } from "@/data/types";

export interface TourStep {
  title: string;
  body: string;
  select: string;
  mode: ExploreMode;
  era?: EraId;
  camera: Vec3;
  target: Vec3;
}

export const TOUR: TourStep[] = [
  {
    title: "Utility power enters",
    body: "Every token starts as an electron the utility agreed to deliver. The line, the study, and the contract are the first piece of the machine.",
    select: "transmission-line",
    mode: "power",
    camera: [10, 22, 36],
    target: [-48, 8, -6],
  },
  {
    title: "Voltage is stepped down",
    body: "The switchyard protects the site. The main transformer changes transmission voltage into a campus distribution voltage. These objects are often on the critical path.",
    select: "main-transformer",
    mode: "power",
    camera: [-6, 16, 28],
    target: [-28, 2, 0],
  },
  {
    title: "Power reaches the hall",
    body: "Medium-voltage gear, UPS ride-through, and overhead busway carry energy to the row. A and B should be real paths, not two labels on one failure.",
    select: "busway",
    mode: "power",
    camera: [28, 14, 8],
    target: [8, 3, -6],
  },
  {
    title: "The rack makes heat",
    body: "A GPU rack turns electricity into computation and a concentrated thermal load. Open it and the tray, the cold plate, and the NICs are separate systems sharing a cabinet.",
    select: "gpu-rack",
    mode: "heat",
    camera: [24, 10, 6],
    target: [8, 2, -6],
  },
  {
    title: "Liquid takes the heat away",
    body: "Cold plates, a CDU, heat exchangers, and either towers or dry coolers reject that heat. Water use depends on which of those you chose, and on the weather.",
    select: "cdu",
    mode: "water",
    camera: [36, 16, 4],
    target: [22, 2, -8],
  },
  {
    title: "The fabric ties the accelerators together",
    body: "Training traffic is east-west: accelerators talking to accelerators. Carrier fiber at the meet-me room is a different problem from the fabric inside the pod.",
    select: "spine-switch",
    mode: "data",
    camera: [26, 12, 12],
    target: [4, 3, -2],
  },
  {
    title: "Supply chains set the schedule",
    body: "Transformers, optics, HBM, and the accelerator package do not share a factory. A finished hall can still sit dark.",
    select: "accelerator",
    mode: "explore",
    camera: [48, 24, 36],
    target: [6, 2, 0],
  },
  {
    title: "The eras are different machines",
    body: "A raised-floor enterprise room, a cloud warehouse, a hyperscale campus, and a neocloud pod do not differ only in paint. Scrub the timeline and compare them.",
    select: "data-hall",
    mode: "explore",
    era: "precloud",
    camera: [18, 12, 18],
    target: [0, 2, 0],
  },
];
