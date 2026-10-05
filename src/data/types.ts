export type EraId = "precloud" | "cloud" | "hyperscale" | "neocloud";

export type LayerId =
  | "power"
  | "backup"
  | "cooling"
  | "water"
  | "network"
  | "compute"
  | "building"
  | "supply"
  | "capital"
  | "carbon"
  | "construction"
  | "telemetry";

export type FlowKind = "power" | "water" | "data" | "heat";

export type Vec3 = [number, number, number];

export interface Spec {
  label: string;
  value: string;
}

export interface InfraComponent {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  eras: EraId[];
  layer: LayerId;
  shortDescription: string;
  description: string;
  whyItMatters: string;
  technicalSpecs: Spec[];
  capacity: string;
  units: string;
  inputs: string[];
  outputs: string[];
  dependencies: string[];
  redundancy: string;
  failureModes: string[];
  suppliers: string[];
  supplyChainOrigins: string[];
  energyImpact: string;
  waterImpact: string;
  carbonImpact: string;
  historicalContext: string;
  eraNotes?: Partial<Record<EraId, string>>;
  related: string[];
  keywords: string[];
}

export type CoolingMethod = "air" | "chilled" | "dtc" | "rear-door" | "dry" | "immersion";

export interface Scenario {
  itLoadMw: number;
  pue: number;
  avgRackKw: number;
  cooling: CoolingMethod;
  carbonGPerKwh: number;
  waterStress: "low" | "medium" | "high";
  utilization: number;
  energyPricePerMwh: number;
  redundancy: "N" | "N+1" | "2N";
}

export type QualityMode = "high" | "balanced" | "low";

export type ExploreMode = "explore" | "power" | "water" | "data" | "heat" | "build" | "ops";

export type RackZoom = "cabinet" | "server" | "package";
