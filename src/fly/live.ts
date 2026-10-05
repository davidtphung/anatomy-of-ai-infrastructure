import { createThermal, type Thermal } from "@/fly/spec";

export const live: Thermal = createThermal("training");

export function readLive(): Thermal {
  return { ...live };
}
