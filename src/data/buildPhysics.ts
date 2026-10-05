/** Dated public context for why AI halls are power projects.
 *  Synthesized for this exhibit. Not a quotation of any essay, chart, or table.
 *  Primary synthesis: Brian Potter, “How to Build an AI Data Center”
 *  (Construction Physics / Institute for Progress, 10 June 2024),
 *  drawing on IEA, LBNL, Uptime Institute, CBRE, SemiAnalysis, and Epoch AI.
 *  Figures are mid-2020s estimates. They are not a live inventory.
 */

export const BUILD_SOURCE = {
  author: "Brian Potter",
  work: "How to Build an AI Data Center",
  series: "Institute for Progress, Compute in America",
  date: "10 June 2024",
  href: "https://www.construction-physics.com/p/how-to-build-an-ai-data-center",
};

export const DENSITY_BANDS: { band: string; rack: string; note: string }[] = [
  {
    band: "Early 2000s hall",
    rack: "about 1 kW",
    note: "A rack was still mostly a stack of modest servers.",
  },
  {
    band: "Enterprise, early 2020s",
    rack: "up to about 10 kW",
    note: "Air, raised floor, and CRAH units still set the room.",
  },
  {
    band: "Hyperscale general compute",
    rack: "about 20 kW and up",
    note: "Halls themselves moved from under 10 MW toward 100 MW.",
  },
  {
    band: "Comfortable air cooling",
    rack: "about 20–30 kW",
    note: "Rear-door exchangers can push the practical ceiling toward 50 kW. Beyond that, the room becomes a duct.",
  },
  {
    band: "H100-class rack, as specified",
    rack: "above 40 kW",
    note: "A published 32-accelerator rack. Vendor figure, not a measurement of this model.",
  },
  {
    band: "Later rack-scale system",
    rack: "about 120 kW",
    note: "Published nameplate for a liquid-cooled rack-scale design. This exhibit’s teaching cabinet is 132 kW, in the same band.",
  },
];

export const TREND_ROWS: { indicator: string; y2015: string; y2022: string; change: string }[] = [
  { indicator: "Internet users", y2015: "3 billion", y2022: "5.3 billion", change: "about +80%" },
  { indicator: "Internet traffic", y2015: "0.6 ZB", y2022: "4.4 ZB", change: "about 6×" },
  { indicator: "Data-center workloads", y2015: "180 million", y2022: "800 million", change: "about 4.4×" },
  { indicator: "Data-center electricity", y2015: "200 TWh", y2022: "240–340 TWh", change: "about +20% to +70%" },
];

/** 2022 operating MW and additional MW then projected. SemiAnalysis, via Potter, 2024. Incomplete rows omitted. */
export const FLEET_ROWS: { operator: string; operatingMw: string; addedMw: string }[] = [
  { operator: "Google", operatingMw: "3,024", addedMw: "2,905" },
  { operator: "Microsoft", operatingMw: "2,176", addedMw: "3,344" },
  { operator: "Amazon", operatingMw: "2,480", addedMw: "2,533" },
  { operator: "Meta", operatingMw: "1,790", addedMw: "2,595" },
  { operator: "Apple", operatingMw: "600", addedMw: "1,403" },
];

/** CBRE-based regional snapshot Potter published in 2024. Blank construction cells were not listed. */
export const REGION_ROWS: { market: string; inventoryMw: string; buildingMw: string }[] = [
  { market: "Northern Virginia", inventoryMw: "2,499", buildingMw: "1,237" },
  { market: "Dallas–Fort Worth", inventoryMw: "565", buildingMw: "287" },
  { market: "Chicago", inventoryMw: "560", buildingMw: "—" },
  { market: "Silicon Valley", inventoryMw: "428", buildingMw: "—" },
  { market: "Phoenix", inventoryMw: "360", buildingMw: "—" },
  { market: "Atlanta", inventoryMw: "310", buildingMw: "733" },
  { market: "Hillsboro", inventoryMw: "262", buildingMw: "281" },
  { market: "New York tri-state", inventoryMw: "190", buildingMw: "—" },
];
