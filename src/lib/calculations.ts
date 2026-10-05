import type { CoolingMethod, Scenario } from "@/data/types";

/** Educational scenario model. Not an audited energy or financial model. */

export interface ScenarioResult {
  facilityMw: number;
  itMwDrawn: number;
  overheadMw: number;
  annualItMwh: number;
  annualFacilityMwh: number;
  annualFacilityGwh: number;
  rackCount: number;
  illustrativeGpuCount: number;
  wueLPerKwh: number;
  annualWaterM3: number;
  annualWaterGal: number;
  operationalTco2e: number;
  annualEnergyCost: number;
  energyPerGpuHour: number;
  coolingShareMw: number;
  electricalLossMw: number;
  otherOverheadMw: number;
  stranded: boolean;
}

const WUE: Record<CoolingMethod, number> = {
  air: 0.4,
  chilled: 1.5,
  dtc: 0.25,
  "rear-door": 0.7,
  dry: 0.08,
  immersion: 0.12,
};

const GPU_PER_SERVER = 8;

function serversPerRack(avgRackKw: number): number {
  const serverKw = avgRackKw >= 100 ? 18 : avgRackKw >= 50 ? 12 : avgRackKw >= 20 ? 8 : 0.6;
  return Math.max(1, Math.min(42, Math.round(avgRackKw / serverKw)));
}

export function coolingLabel(method: CoolingMethod): string {
  switch (method) {
    case "air":
      return "Air cooling / CRAC-CRAH";
    case "chilled":
      return "Chilled water + towers";
    case "dtc":
      return "Direct-to-chip liquid";
    case "rear-door":
      return "Rear-door heat exchangers";
    case "dry":
      return "Dry coolers / closed loop";
    case "immersion":
      return "Immersion, closed dielectric";
  }
}

export function evaluateScenario(s: Scenario): ScenarioResult {
  const facilityMw = s.itLoadMw * s.pue;
  const itMwDrawn = s.itLoadMw * s.utilization;
  const overheadMw = Math.max(0, facilityMw * s.utilization - itMwDrawn);
  const annualItMwh = itMwDrawn * 8760;
  const annualFacilityMwh = annualItMwh * s.pue;
  const rackCount = Math.max(1, Math.round((s.itLoadMw * 1000) / Math.max(1, s.avgRackKw)));
  const gpusPerRack = s.avgRackKw < 15 ? 0 : GPU_PER_SERVER * serversPerRack(s.avgRackKw);
  const illustrativeGpuCount = rackCount * gpusPerRack;
  const wueLPerKwh = WUE[s.cooling];
  const annualWaterM3 = (annualFacilityMwh * 1000 * wueLPerKwh) / 1000;
  const annualWaterGal = annualWaterM3 * 264.172;
  const operationalTco2e = (annualFacilityMwh * s.carbonGPerKwh) / 1_000_000;
  const annualEnergyCost = annualFacilityMwh * s.energyPricePerMwh;
  const gpuHours = illustrativeGpuCount * 8760 * s.utilization;
  const energyPerGpuHour = gpuHours > 0 ? annualEnergyCost / gpuHours : 0;
  return {
    facilityMw,
    itMwDrawn,
    overheadMw,
    annualItMwh,
    annualFacilityMwh,
    annualFacilityGwh: annualFacilityMwh / 1000,
    rackCount,
    illustrativeGpuCount,
    wueLPerKwh,
    annualWaterM3,
    annualWaterGal,
    operationalTco2e,
    annualEnergyCost,
    energyPerGpuHour,
    coolingShareMw: overheadMw * 0.7,
    electricalLossMw: overheadMw * 0.25,
    otherOverheadMw: overheadMw * 0.05,
    stranded: s.utilization < 0.45,
  };
}

export const SCENARIO_NOTE =
  "Educational scenario model only. Actual facility performance depends on electrical topology, climate, equipment, redundancy requirements, workload, maintenance state, and local utility conditions.";
