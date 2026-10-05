import type { EraId, FlowKind, LayerId, Vec3 } from "@/data/types";
import { PALETTE } from "@/components/three/palette";

export interface SceneNode {
  id: string;
  position: Vec3;
  size: Vec3;
  rotation?: Vec3;
  shape: "box" | "cylinder" | "tank";
  layer: LayerId;
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
  opacity?: number;
  minPhase: number;
}

export interface FlowPath {
  id: string;
  kind: FlowKind;
  layer: LayerId;
  color: string;
  points: Vec3[];
  minPhase: number;
}

export interface HallSpec {
  id: string;
  position: Vec3;
  size: Vec3;
  open: "south" | "east";
  minPhase: number;
}

export interface CampusLayout {
  era: EraId;
  halls: HallSpec[];
  nodes: SceneNode[];
  racks: Vec3[];
  rackSize: Vec3;
  flows: FlowPath[];
  pipes: { a: Vec3; b: Vec3; color: string; radius: number; layer: LayerId; minPhase: number }[];
  fences: Vec3[];
  towers: Vec3[];
  camera: { position: Vec3; target: Vec3 };
  liquid: boolean;
  raisedFloor: boolean;
  containment: boolean;
}

function racksIn(origin: Vec3, rows: number, cols: number, dx: number, dz: number, y: number): Vec3[] {
  const out: Vec3[] = [];
  const width = (cols - 1) * dx;
  const depth = (rows - 1) * dz;
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      out.push([origin[0] - width / 2 + c * dx, y, origin[2] - depth / 2 + r * dz]);
    }
  }
  return out;
}

function fenceLoop(x0: number, x1: number, z0: number, z1: number, step = 4): Vec3[] {
  const posts: Vec3[] = [];
  for (let x = x0; x <= x1; x += step) {
    posts.push([x, 0, z0], [x, 0, z1]);
  }
  for (let z = z0 + step; z < z1; z += step) {
    posts.push([x0, 0, z], [x1, 0, z]);
  }
  return posts;
}

function node(
  id: string,
  position: Vec3,
  size: Vec3,
  layer: LayerId,
  color: string,
  extra: Partial<SceneNode> = {},
): SceneNode {
  return {
    id,
    position,
    size,
    shape: "box",
    layer,
    color,
    metalness: 0.55,
    roughness: 0.38,
    minPhase: extra.minPhase ?? 4,
    ...extra,
  };
}

export function buildLayout(era: EraId, rackScale = 1): CampusLayout {
  if (era === "precloud") return precloud(rackScale);
  if (era === "cloud") return cloud(rackScale);
  if (era === "neocloud") return neocloud(rackScale);
  return hyperscale(rackScale);
}

function precloud(rackScale: number): CampusLayout {
  const hall: HallSpec = {
    id: "data-hall",
    position: [0, 0, 0],
    size: [16, 5.2, 12],
    open: "south",
    minPhase: 4,
  };
  const racks = racksIn([0, 0, -0.4], 3, Math.max(3, Math.round(6 * rackScale)), 1.7, 2.3, 0.85);
  return {
    era: "precloud",
    halls: [hall],
    racks,
    rackSize: [0.85, 2.0, 1.0],
    raisedFloor: true,
    liquid: false,
    containment: false,
    towers: [[-22, 0, -2]],
    fences: fenceLoop(-18, 16, -12, 14, 3.5),
    camera: { position: [20, 12, 18], target: [0, 2, 0] },
    nodes: [
      node("transmission-line", [-16, 3.2, -8], [0.15, 0.15, 10], "power", PALETTE.hv, {
        minPhase: 1,
        shape: "cylinder",
        emissive: PALETTE.hv,
        emissiveIntensity: 0.4,
      }),
      node("main-transformer", [-10, 1.1, -6], [2.4, 2.2, 2.2], "power", PALETTE.yard, {
        minPhase: 3,
        emissive: PALETTE.hv,
        emissiveIntensity: 0.08,
      }),
      node("mv-switchgear", [-10, 1.3, -1], [3.2, 2.6, 1.6], "power", PALETTE.metal, { minPhase: 5 }),
      node("generator", [-10, 1.2, 6], [3.4, 2.2, 1.6], "backup", PALETTE.backup, {
        minPhase: 5,
        roughness: 0.6,
        metalness: 0.3,
      }),
      node("fuel-system", [-10, 0.7, 9.2], [2.2, 1.4, 1.2], "backup", PALETTE.yard, {
        minPhase: 5,
        shape: "cylinder",
      }),
      node("ups", [-6, 1.2, 6], [2.4, 2.4, 1.8], "backup", PALETTE.battery, {
        minPhase: 5,
        emissive: PALETTE.battery,
        emissiveIntensity: 0.15,
      }),
      node("battery", [-3.2, 1, 6], [1.8, 2, 1.4], "backup", "#3f6212", { minPhase: 5 }),
      node("floor-pdu", [6.4, 1, 0], [0.8, 2, 1.6], "power", PALETTE.lv, { minPhase: 6 }),
      node("crac", [-6.6, 1.3, 0], [1.4, 2.6, 3.2], "cooling", "#334155", { minPhase: 5 }),
      node("crac", [6.6, 1.3, -3], [1.4, 2.6, 2.4], "cooling", "#334155", { minPhase: 5 }),
      node("raised-floor", [0, 0.35, 0], [14, 0.25, 10], "building", "#243044", { minPhase: 6, metalness: 0.2 }),
      node("cooling-tower", [12, 2.2, 8], [2.2, 4.4, 2.2], "water", "#94a3b8", {
        minPhase: 5,
        shape: "cylinder",
      }),
      node("chiller", [8, 1, 8], [3, 1.8, 1.6], "cooling", PALETTE.chilled, { minPhase: 5 }),
      node("water-treatment", [12, 0.8, 4.5], [1.6, 1.6, 1.6], "water", PALETTE.supplyWater, {
        minPhase: 5,
        shape: "tank",
      }),
      node("noc", [-4, 1.4, -9], [4, 2.8, 2], "telemetry", "#1e293b", { minPhase: 4, opacity: 0.92 }),
      node("security-perimeter", [0, 0.4, 13], [8, 0.8, 0.3], "building", "#475569", { minPhase: 2 }),
      node("fire-suppression", [0, 4.4, 0], [2, 0.2, 2], "building", "#fecaca", { minPhase: 6 }),
    ],
    flows: [
      {
        id: "power",
        kind: "power",
        layer: "power",
        color: PALETTE.hv,
        minPhase: 6,
        points: [
          [-20, 6, -8],
          [-10, 3, -6],
          [-10, 2, -1],
          [0, 1.2, 0],
        ],
      },
      {
        id: "backup",
        kind: "power",
        layer: "backup",
        color: PALETTE.backup,
        minPhase: 5,
        points: [
          [-10, 2, 6],
          [-6, 2, 6],
          [0, 1.4, 1],
        ],
      },
      {
        id: "water",
        kind: "water",
        layer: "water",
        color: PALETTE.supplyWater,
        minPhase: 5,
        points: [
          [12, 1, 4.5],
          [12, 1.2, 8],
          [8, 1.2, 8],
          [-6, 1, 0],
        ],
      },
      {
        id: "heat",
        kind: "heat",
        layer: "cooling",
        color: PALETTE.heat,
        minPhase: 8,
        points: [
          [0, 2, 0],
          [0, 4, 2],
          [12, 5, 8],
        ],
      },
    ],
    pipes: [],
  };
}

function cloud(rackScale: number): CampusLayout {
  const halls: HallSpec[] = [
    { id: "data-hall", position: [4, 0, 0], size: [36, 7, 20], open: "south", minPhase: 4 },
  ];
  const racks = racksIn([4, 0, -1], 4, Math.max(6, Math.round(12 * rackScale)), 1.45, 2.7, 1.05);
  return {
    era: "cloud",
    halls,
    racks,
    rackSize: [0.72, 2.2, 1.05],
    raisedFloor: false,
    liquid: false,
    containment: true,
    towers: [[-36, 0, 4], [-28, 0, 10]],
    fences: fenceLoop(-30, 28, -18, 20, 4),
    camera: { position: [36, 20, 32], target: [4, 3, 0] },
    nodes: [
      node("switchyard", [-22, 0.4, -2], [8, 0.5, 10], "power", "#3f3a32", { minPhase: 3, roughness: 0.9, metalness: 0.1 }),
      node("main-transformer", [-22, 1.6, -4], [3.2, 3, 2.4], "power", "#44403c", {
        minPhase: 3,
        emissive: PALETTE.hv,
        emissiveIntensity: 0.12,
      }),
      node("main-transformer", [-22, 1.6, 2], [3.2, 3, 2.4], "power", "#44403c", { minPhase: 3 }),
      node("mv-switchgear", [-14, 1.6, 0], [4, 3.2, 6], "power", PALETTE.metal, { minPhase: 5 }),
      node("distribution-transformer", [-8, 1.3, 6], [2.2, 2.4, 1.8], "power", PALETTE.mv, { minPhase: 5 }),
      node("ups", [-8, 1.4, 10], [4, 2.8, 2], "backup", "#365314", {
        minPhase: 5,
        emissive: PALETTE.battery,
        emissiveIntensity: 0.12,
      }),
      node("battery", [-4, 1.2, 10], [2.4, 2.4, 1.6], "backup", "#3f6212", { minPhase: 5 }),
      node("generator", [-16, 1.3, 12], [5, 2.4, 1.8], "backup", "#9f1239", { minPhase: 5 }),
      node("generator", [-16, 1.3, 15], [5, 2.4, 1.8], "backup", "#9f1239", { minPhase: 5 }),
      node("fuel-system", [-22, 0.9, 14], [2.4, 1.6, 1.4], "backup", "#44403c", { minPhase: 5, shape: "cylinder" }),
      node("ats", [-12, 1, 8], [1.4, 2, 1], "backup", PALETTE.lv, { minPhase: 5 }),
      node("chiller", [18, 1.2, 12], [5, 2.2, 2], "cooling", "#0f766e", { minPhase: 5 }),
      node("cooling-tower", [24, 2.6, 14], [3, 5, 3], "water", "#cbd5e1", { minPhase: 5, shape: "cylinder" }),
      node("cooling-tower", [28, 2.6, 14], [3, 5, 3], "water", "#cbd5e1", { minPhase: 5, shape: "cylinder" }),
      node("water-treatment", [24, 1, 9], [2.4, 2, 2], "water", PALETTE.supplyWater, { minPhase: 5, shape: "tank" }),
      node("crac", [4, 1.4, 8.4], [8, 2.6, 1.2], "cooling", "#334155", { minPhase: 6 }),
      node("meet-me", [-6, 1.5, -8], [4, 3, 3], "network", "#0e7490", {
        minPhase: 7,
        emissive: PALETTE.network,
        emissiveIntensity: 0.2,
      }),
      node("spine-switch", [-2, 1.4, -8], [2, 2.4, 1], "network", "#155e75", {
        minPhase: 7,
        emissive: PALETTE.network,
        emissiveIntensity: 0.35,
      }),
      node("noc", [16, 1.6, -12], [6, 3.2, 3], "telemetry", "#1e293b", { minPhase: 4 }),
      node("security-perimeter", [4, 0.5, 18], [10, 1, 0.4], "building", "#475569", { minPhase: 2 }),
      node("fire-suppression", [4, 6.2, 0], [6, 0.15, 4], "building", "#fecaca", { minPhase: 6, opacity: 0.7 }),
      node("busway", [4, 4.3, -1], [14, 0.18, 0.35], "power", PALETTE.lv, {
        minPhase: 6,
        emissive: PALETTE.lv,
        emissiveIntensity: 0.25,
      }),
    ],
    flows: [
      {
        id: "power",
        kind: "power",
        layer: "power",
        color: PALETTE.hv,
        minPhase: 6,
        points: [
          [-34, 10, 6],
          [-22, 4, -2],
          [-14, 3, 0],
          [4, 4.3, -1],
        ],
      },
      {
        id: "backup",
        kind: "power",
        layer: "backup",
        color: PALETTE.backup,
        minPhase: 5,
        points: [
          [-16, 2.4, 13],
          [-12, 2, 8],
          [-8, 2, 10],
          [4, 3.5, 0],
        ],
      },
      {
        id: "water",
        kind: "water",
        layer: "cooling",
        color: PALETTE.chilled,
        minPhase: 5,
        points: [
          [26, 2, 14],
          [18, 2, 12],
          [4, 2, 8],
          [4, 2, 0],
        ],
      },
      {
        id: "data",
        kind: "data",
        layer: "network",
        color: PALETTE.network,
        minPhase: 7,
        points: [
          [30, 1, -16],
          [-6, 2, -8],
          [-2, 2.2, -8],
          [4, 3.2, -1],
        ],
      },
      {
        id: "heat",
        kind: "heat",
        layer: "cooling",
        color: PALETTE.heat,
        minPhase: 8,
        points: [
          [4, 2.2, 0],
          [4, 5, 6],
          [26, 7, 14],
        ],
      },
    ],
    pipes: [],
  };
}

function hyperscale(rackScale: number): CampusLayout {
  const halls: HallSpec[] = [
    { id: "data-hall", position: [8, 0, -8], size: [42, 8.5, 22], open: "south", minPhase: 4 },
    { id: "data-hall", position: [8, 0, 16], size: [34, 8, 16], open: "south", minPhase: 4 },
  ];
  const cols = Math.max(8, Math.round(16 * rackScale));
  const racks = racksIn([8, 0, -8], 4, cols, 1.35, 2.8, 1.1);
  const pipes = liquidPipes([8, 0, -8], 4, cols, 1.35, 2.8);
  return {
    era: "hyperscale",
    halls,
    racks,
    rackSize: [0.7, 2.25, 1.05],
    raisedFloor: false,
    liquid: true,
    containment: true,
    towers: [
      [-62, 0, -8],
      [-50, 0, -4],
      [-38, 0, -10],
    ],
    fences: fenceLoop(-46, 52, -30, 34, 4),
    camera: { position: [58, 32, 46], target: [8, 3, 0] },
    nodes: hyperNodes(),
    flows: hyperFlows(),
    pipes,
  };
}

function neocloud(rackScale: number): CampusLayout {
  const base = hyperscale(rackScale);
  const pods: HallSpec[] = [
    { id: "data-hall", position: [0, 0, -4], size: [22, 7.5, 14], open: "south", minPhase: 4 },
    { id: "data-hall", position: [0, 0, 12], size: [22, 7.5, 12], open: "south", minPhase: 6 },
    { id: "data-hall", position: [24, 0, 4], size: [16, 7, 18], open: "east", minPhase: 8 },
  ];
  const cols = Math.max(6, Math.round(10 * rackScale));
  const racks = [
    ...racksIn([0, 0, -4], 4, cols, 1.3, 2.4, 1.1),
    ...racksIn([0, 0, 12], 3, cols, 1.3, 2.4, 1.1),
  ];
  return {
    ...base,
    era: "neocloud",
    halls: pods,
    racks,
    liquid: true,
    camera: { position: [48, 28, 42], target: [6, 3, 4] },
    pipes: liquidPipes([0, 0, -4], 4, cols, 1.3, 2.4),
    nodes: [
      ...base.nodes.filter((item) => item.id !== "data-hall"),
      node("concrete-shell", [24, 0.2, 4], [18, 0.3, 20], "construction", "#334155", {
        minPhase: 2,
        roughness: 0.95,
        metalness: 0.05,
        opacity: 0.85,
      }),
    ],
  };
}

function hyperNodes(): SceneNode[] {
  return [
    node("switchyard", [-30, 0.35, 0], [14, 0.4, 16], "power", "#3f3a32", {
      minPhase: 3,
      roughness: 0.92,
      metalness: 0.08,
    }),
    node("main-transformer", [-30, 2, -5], [4.2, 3.6, 3], "power", "#44403c", {
      minPhase: 3,
      emissive: PALETTE.hv,
      emissiveIntensity: 0.15,
    }),
    node("main-transformer", [-30, 2, 5], [4.2, 3.6, 3], "power", "#44403c", { minPhase: 3 }),
    node("mv-switchgear", [-16, 2, 2], [6, 4, 8], "power", "#94a3b8", { minPhase: 5 }),
    node("distribution-transformer", [-8, 1.5, 8], [2.6, 2.8, 2], "power", PALETTE.mv, { minPhase: 5 }),
    node("ups", [-8, 1.6, 14], [6, 3, 2.4], "backup", "#365314", {
      minPhase: 5,
      emissive: PALETTE.battery,
      emissiveIntensity: 0.16,
    }),
    node("battery", [-2, 1.4, 14], [3, 2.6, 2], "backup", "#3f6212", { minPhase: 5 }),
    node("ats", [-12, 1.2, 10], [1.6, 2.2, 1.2], "backup", PALETTE.lv, { minPhase: 5 }),
    node("generator", [-20, 1.4, 22], [6, 2.6, 2], "backup", "#9f1239", { minPhase: 5 }),
    node("generator", [-20, 1.4, 26], [6, 2.6, 2], "backup", "#9f1239", { minPhase: 5 }),
    node("generator", [-12, 1.4, 24], [6, 2.6, 2], "backup", "#be123c", { minPhase: 5 }),
    node("fuel-system", [-28, 1, 24], [3, 1.8, 1.6], "backup", "#44403c", { minPhase: 5, shape: "cylinder" }),
    node("chiller", [28, 1.4, -6], [7, 2.6, 2.4], "cooling", "#0f766e", { minPhase: 5 }),
    node("chiller", [28, 1.4, -2], [7, 2.6, 2.4], "cooling", "#115e59", { minPhase: 5 }),
    node("cooling-tower", [40, 3.2, -16], [3.4, 6.2, 3.4], "water", "#e2e8f0", { minPhase: 5, shape: "cylinder" }),
    node("cooling-tower", [45, 3.2, -16], [3.4, 6.2, 3.4], "water", "#e2e8f0", { minPhase: 5, shape: "cylinder" }),
    node("cooling-tower", [40, 3.2, -10], [3.4, 6.2, 3.4], "water", "#cbd5e1", { minPhase: 5, shape: "cylinder" }),
    node("dry-cooler", [34, 1.3, 8], [6, 2.2, 2.2], "cooling", "#64748b", { minPhase: 5 }),
    node("water-treatment", [42, 1.1, 6], [3, 2.2, 2.4], "water", PALETTE.supplyWater, { minPhase: 5, shape: "tank" }),
    node("heat-exchanger", [22, 1.2, -2], [2.2, 2.2, 1.2], "cooling", PALETTE.chilled, { minPhase: 5 }),
    node("cdu", [22, 1.3, -10], [3.2, 2.4, 1.6], "cooling", "#0891b2", {
      minPhase: 6,
      emissive: PALETTE.chilled,
      emissiveIntensity: 0.25,
    }),
    node("cdu", [-4, 1.3, -10], [3.2, 2.4, 1.6], "cooling", "#0e7490", {
      minPhase: 6,
      emissive: PALETTE.supplyWater,
      emissiveIntensity: 0.2,
    }),
    node("meet-me", [-6, 1.6, -16], [5, 3.2, 3.2], "network", "#0e7490", {
      minPhase: 7,
      emissive: PALETTE.network,
      emissiveIntensity: 0.22,
    }),
    node("spine-switch", [-1, 1.5, -16], [2.4, 2.6, 1.2], "network", "#155e75", {
      minPhase: 7,
      emissive: PALETTE.network,
      emissiveIntensity: 0.45,
    }),
    node("fiber-campus", [48, 0.4, 20], [8, 0.3, 0.4], "network", PALETTE.network, {
      minPhase: 2,
      emissive: PALETTE.network,
      emissiveIntensity: 0.4,
    }),
    node("noc", [-8, 1.8, -24], [8, 3.4, 3.5], "telemetry", "#172033", { minPhase: 4 }),
    node("security-perimeter", [8, 0.6, 32], [16, 1.1, 0.4], "building", "#475569", { minPhase: 2 }),
    node("busway", [8, 4.6, -8], [18, 0.2, 0.4], "power", PALETTE.lv, {
      minPhase: 6,
      emissive: PALETTE.lv,
      emissiveIntensity: 0.3,
    }),
    node("fire-suppression", [8, 7.4, -8], [8, 0.16, 4], "building", "#fecaca", { minPhase: 6, opacity: 0.65 }),
    node("grounding", [-30, 0.08, 0], [16, 0.08, 18], "power", "#b45309", {
      minPhase: 2,
      roughness: 1,
      metalness: 0.2,
      opacity: 0.45,
    }),
    node("immersion-tank", [30, 1.1, 16], [4, 2, 2], "cooling", "#1e3a4c", {
      minPhase: 8,
      emissive: PALETTE.chilled,
      emissiveIntensity: 0.12,
    }),
  ];
}

function hyperFlows(): FlowPath[] {
  return [
    {
      id: "power",
      kind: "power",
      layer: "power",
      color: PALETTE.hv,
      minPhase: 5,
      points: [
        [-62, 14, -8],
        [-50, 14, -4],
        [-38, 12, -10],
        [-30, 5, 0],
        [-16, 3.5, 2],
        [8, 4.6, -8],
      ],
    },
    {
      id: "backup",
      kind: "power",
      layer: "backup",
      color: PALETTE.backup,
      minPhase: 5,
      points: [
        [-20, 2.5, 24],
        [-12, 2.2, 10],
        [-8, 2.4, 14],
        [8, 3.8, -8],
      ],
    },
    {
      id: "water-supply",
      kind: "water",
      layer: "water",
      color: PALETTE.supplyWater,
      minPhase: 5,
      points: [
        [42, 1.5, 6],
        [42, 2, -13],
        [28, 2, -4],
        [22, 2, -10],
        [8, 3.2, -8],
      ],
    },
    {
      id: "water-return",
      kind: "heat",
      layer: "cooling",
      color: PALETTE.returnWater,
      minPhase: 6,
      points: [
        [8, 3.2, -8],
        [22, 2.4, -10],
        [28, 2.2, -4],
        [42, 5, -16],
      ],
    },
    {
      id: "data",
      kind: "data",
      layer: "network",
      color: PALETTE.network,
      minPhase: 7,
      points: [
        [52, 1, 24],
        [48, 1.2, 20],
        [-6, 2.4, -16],
        [-1, 2.6, -16],
        [8, 3.6, -8],
      ],
    },
    {
      id: "heat",
      kind: "heat",
      layer: "cooling",
      color: PALETTE.heat,
      minPhase: 8,
      points: [
        [8, 2.4, -8],
        [8, 7, -4],
        [32, 8, -12],
        [42, 9, -16],
      ],
    },
  ];
}

function liquidPipes(origin: Vec3, rows: number, cols: number, dx: number, dz: number) {
  const width = (cols - 1) * dx;
  const depth = (rows - 1) * dz;
  const pipes: CampusLayout["pipes"] = [];
  for (let r = 0; r < rows; r += 1) {
    const z = origin[2] - depth / 2 + r * dz;
    const x0 = origin[0] - width / 2 - 1.2;
    const x1 = origin[0] + width / 2 + 1.2;
    pipes.push({
      a: [x0, 3.35, z - 0.35],
      b: [x1, 3.35, z - 0.35],
      color: PALETTE.supplyWater,
      radius: 0.06,
      layer: "cooling",
      minPhase: 6,
    });
    pipes.push({
      a: [x0, 3.05, z + 0.35],
      b: [x1, 3.05, z + 0.35],
      color: PALETTE.returnWater,
      radius: 0.06,
      layer: "cooling",
      minPhase: 6,
    });
  }
  return pipes;
}

export function anchorFor(layout: CampusLayout, id: string): { position: Vec3; camera: Vec3 } | null {
  if (id === "gpu-rack" || id === "gpu-server" || id === "accelerator" || id === "rack-pdu" || id === "tor-switch") {
    const rack = layout.racks[Math.floor(layout.racks.length / 2)] ?? layout.camera.target;
    return { position: rack, camera: [rack[0] + 8, rack[1] + 5, rack[2] + 8] };
  }
  if (id === "transmission-line") {
    const tower = layout.towers[0];
    if (tower) return { position: [tower[0], 8, tower[2]], camera: [tower[0] + 18, 14, tower[2] + 16] };
  }
  const found = layout.nodes.find((item) => item.id === id);
  if (!found) {
    const hall = layout.halls[0];
    if (!hall) return null;
    return {
      position: [hall.position[0], 2, hall.position[2]],
      camera: [hall.position[0] + 18, 12, hall.position[2] + 16],
    };
  }
  return {
    position: found.position,
    camera: [found.position[0] + 12, found.position[1] + 8, found.position[2] + 12],
  };
}
