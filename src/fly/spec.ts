/** Teaching model of a 16-rack liquid-cooled AI pod.
 *  Tray counts, 132 kW, 50 V bus, and 110 L/min follow public rack-scale figures.
 *  Thermal resistance, idle/inference power, and throttle are estimates.
 */

export type Focus = "all" | "power" | "water" | "data";
export type Workload = "training" | "inference" | "idle";

export const ROW_X = 1.5;
export const RACK_W = 0.74;
export const RACK_D = 1.16;
export const RACK_H = 2.24;
export const RACK_Z0 = -3.01;
export const RACK_PITCH = 0.86;
export const HALL_Z = 6.15;

export const GPUS = 72;
export const CPUS = 36;
export const COMPUTE_TRAYS = 18;
export const SWITCH_TRAYS = 9;
export const HBM_TB = 13.4;
export const NVLINK_TB_S = 130;
export const FP4_DENSE = 720;
export const FP4_SPARSE = 1440;
export const RACK_KW = 132;
export const SHELVES = 8;
export const SHELF_KW = 33;
export const BUS_V = 50;
export const FLOW_LPM = 110;
export const SUPPLY_C = 32;
export const PUE = 1.2;
export const HOME_KW = 1.2;
export const PODS = 394;
export const RACKS_PER_POD = 16;

export function rackZ(i: number) {
  return RACK_Z0 + i * RACK_PITCH;
}

export function nameplateKw(workload: Workload) {
  if (workload === "training") return RACK_KW;
  if (workload === "inference") return 70;
  return 36;
}

export const CAMPUS = {
  pods: PODS,
  racks: PODS * RACKS_PER_POD,
  get itMw() {
    return (this.racks * RACK_KW) / 1000;
  },
  get facilityMw() {
    return this.itMw * PUE;
  },
  get homes() {
    return (this.facilityMw * 1000) / HOME_KW;
  },
};

const R_LIQ = 0.00023;
const R_AIR = 0.004;
const C_THERM = 32000;
const CP = 4184;
const RHO = 0.997;

export type Thermal = {
  chipC: number;
  flowLpm: number;
  rackKw: number;
  returnC: number;
  supplyC: number;
  liquidKw: number;
  airKw: number;
};

export function createThermal(workload: Workload = "training"): Thermal {
  const s: Thermal = {
    chipC: 64,
    flowLpm: FLOW_LPM,
    rackKw: nameplateKw(workload),
    returnC: 45,
    supplyC: SUPPLY_C,
    liquidKw: 0,
    airKw: 0,
  };
  for (let i = 0; i < 600; i += 1) stepThermal(s, 1 / 60, true, workload);
  return s;
}

function throttle(chipC: number) {
  return Math.min(1, Math.max(0.1, 1 - (chipC - 88) / 14));
}

/** Mutates `s` by `dt` seconds. */
export function stepThermal(s: Thermal, dt: number, pumps: boolean, workload: Workload) {
  const h = Math.min(Math.max(dt, 0), 0.05);
  const targetFlow = pumps ? FLOW_LPM : 0;
  s.flowLpm += (targetFlow - s.flowLpm) * (1 - Math.exp(-h / 1.25));
  const factor = throttle(s.chipC);
  const pW = nameplateKw(workload) * 1000 * factor;
  s.rackKw = pW / 1000;
  const mdot = (s.flowLpm / 60) * RHO;
  const tMean = SUPPLY_C + 0.5 * Math.max(0, s.returnC - SUPPLY_C);
  const cool = mdot > 0.05 ? Math.max(0, (s.chipC - tMean) / R_LIQ) : 0;
  const air = Math.max(0, (s.chipC - 24) / R_AIR);
  s.chipC += ((pW - cool - air) / C_THERM) * h;
  s.chipC = Math.min(140, Math.max(SUPPLY_C, s.chipC));
  let targetReturn = SUPPLY_C;
  if (mdot > 0.05) targetReturn = SUPPLY_C + cool / (mdot * CP);
  s.returnC += (targetReturn - s.returnC) * (1 - Math.exp(-h / 0.7));
  s.liquidKw = cool / 1000;
  s.airKw = air / 1000;
  s.supplyC = SUPPLY_C;
}

export type SlotKind = "power" | "compute" | "switch";
export type Slot = { kind: SlotKind; y: number; h: number; index: number };

export function buildSlots(): Slot[] {
  const out: Slot[] = [];
  let y = 0.1;
  let index = 0;
  for (let i = 0; i < SHELVES; i += 1) {
    const h = 0.034;
    out.push({ kind: "power", y: y + h / 2, h, index });
    y += 0.04;
    index += 1;
  }
  y += 0.03;
  for (let g = 0; g < 9; g += 1) {
    for (let c = 0; c < 2; c += 1) {
      const h = 0.058;
      out.push({ kind: "compute", y: y + h / 2, h, index });
      y += 0.066;
      index += 1;
    }
    const h = 0.04;
    out.push({ kind: "switch", y: y + h / 2, h, index });
    y += 0.048;
    index += 1;
  }
  return out;
}

export const SLOTS = buildSlots();

export function heroTrayIndex() {
  let best = 0;
  let bestD = 99;
  for (const slot of SLOTS) {
    if (slot.kind !== "compute") continue;
    const d = Math.abs(slot.y - 1.28);
    if (d < bestD) {
      bestD = d;
      best = slot.index;
    }
  }
  return best;
}

export const HERO_TRAY = heroTrayIndex();
export const HERO_RACK = 4;

export type Shot = {
  title: string;
  body: string;
  pos: [number, number, number];
  look: [number, number, number];
  focus: Focus;
  workload: Workload;
  pumps: boolean;
  rack: number | null;
  tray: number | null;
  campus: boolean;
};

export const TOUR: Shot[] = [
  {
    title: "Sixteen racks",
    body: "A training pod is two rows and a cold aisle. Sixteen full-size cabinets. Fly down the middle.",
    pos: [0, 1.62, 4.6],
    look: [0, 1.35, -1],
    focus: "all",
    workload: "training",
    pumps: true,
    rack: null,
    tray: null,
    campus: false,
  },
  {
    title: "One cabinet, 72 accelerators",
    body: "18 compute trays, 9 switch trays, 36 CPUs. Nominal draw 132 kW. The face is just a door.",
    pos: [-0.15, 1.45, 1.55],
    look: [-1.15, 1.2, 0.43],
    focus: "all",
    workload: "training",
    pumps: true,
    rack: null,
    tray: null,
    campus: false,
  },
  {
    title: "Power from the bus",
    body: "An overhead DC bus, about 50 volts, feeds eight shelves of roughly 33 kW. A and B should be real paths.",
    pos: [0.15, 2.55, 0.2],
    look: [-1.5, 3.25, -2.2],
    focus: "power",
    workload: "training",
    pumps: true,
    rack: null,
    tray: null,
    campus: false,
  },
  {
    title: "Open it",
    body: "Direct-to-chip liquid takes about 90% of the heat. Air was never going to carry 132 kW.",
    pos: [-0.05, 1.32, 1.25],
    look: [-1.2, 1.2, 0.43],
    focus: "water",
    workload: "training",
    pumps: true,
    rack: HERO_RACK,
    tray: null,
    campus: false,
  },
  {
    title: "Pull a tray",
    body: "Four accelerators, two CPUs, high-bandwidth memory, and a cold plate on the packages. 13.4 TB and 130 TB/s stay inside this rack.",
    pos: [0.15, 1.32, 1.35],
    look: [-0.85, 1.22, 0.5],
    focus: "water",
    workload: "training",
    pumps: true,
    rack: HERO_RACK,
    tray: HERO_TRAY,
    campus: false,
  },
  {
    title: "The water leaves warmer",
    body: "One in-row coolant unit serves eight racks. At 110 liters a minute the return rise is just power, mass flow, and the specific heat of water.",
    pos: [-0.35, 1.55, -1.4],
    look: [-1.45, 1.15, -4.15],
    focus: "water",
    workload: "training",
    pumps: true,
    rack: null,
    tray: null,
    campus: false,
  },
  {
    title: "East-west, not the internet",
    body: "Training traffic is accelerators talking to accelerators across a copper spine. Carrier fiber at the building edge is a different network.",
    pos: [0.1, 2.15, 2.4],
    look: [0, 3.05, -1.5],
    focus: "data",
    workload: "training",
    pumps: true,
    rack: null,
    tray: null,
    campus: false,
  },
  {
    title: "Stop the pumps",
    body: "Same electricity, nowhere for the heat to go. The packages climb toward 100 °C. In a real hall this is a trip, not a demo.",
    pos: [-0.05, 1.38, 1.2],
    look: [-1.15, 1.22, 0.43],
    focus: "water",
    workload: "training",
    pumps: false,
    rack: HERO_RACK,
    tray: HERO_TRAY,
    campus: false,
  },
  {
    title: "About a gigawatt",
    body: "394 of these pods is 6,304 racks. 832 MW of compute. At a PUE of 1.2 the fence sees about 999 MW — near 830,000 homes.",
    pos: [28, 62, 78],
    look: [0, 0, 0],
    focus: "all",
    workload: "training",
    pumps: true,
    rack: null,
    tray: null,
    campus: true,
  },
];

export type Aabb = { minX: number; maxX: number; minZ: number; maxZ: number };

export function hallColliders(): Aabb[] {
  const boxes: Aabb[] = [];
  const inflate = 0.22;
  for (const side of [-1, 1]) {
    for (let i = 0; i < 8; i += 1) {
      const z = rackZ(i);
      const cx = side * ROW_X;
      boxes.push({
        minX: cx - RACK_D / 2 - inflate,
        maxX: cx + RACK_D / 2 + inflate,
        minZ: z - RACK_W / 2 - inflate,
        maxZ: z + RACK_W / 2 + inflate,
      });
    }
    const cz = rackZ(0) - 1.05;
    const cx = side * ROW_X;
    boxes.push({
      minX: cx - RACK_D / 2 - inflate,
      maxX: cx + RACK_D / 2 + inflate,
      minZ: cz - 0.55 - inflate,
      maxZ: cz + 0.48 + inflate,
    });
  }
  return boxes;
}

/** Push a point out of XZ boxes. Returns true if it moved. */
export function resolveAisles(x: number, z: number, boxes: Aabb[]) {
  let px = x;
  let pz = z;
  for (let n = 0; n < 2; n += 1) {
    for (const b of boxes) {
      if (px < b.minX || px > b.maxX || pz < b.minZ || pz > b.maxZ) continue;
      const left = px - b.minX;
      const right = b.maxX - px;
      const back = pz - b.minZ;
      const front = b.maxZ - pz;
      const m = Math.min(left, right, back, front);
      if (m === left) px = b.minX;
      else if (m === right) px = b.maxX;
      else if (m === back) pz = b.minZ;
      else pz = b.maxZ;
    }
  }
  return { x: px, z: pz };
}
