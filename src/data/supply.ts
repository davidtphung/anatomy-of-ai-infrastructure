export interface SupplyNode {
  id: string;
  name: string;
  componentIds: string[];
  materials: string;
  steps: string;
  geography: string;
  bottleneck: string;
  lat: number;
  lon: number;
}

/** Representative regions for an educational map. Not exclusive production sites. */
export const SUPPLY_NODES: SupplyNode[] = [
  {
    id: "logic-fabs",
    name: "Advanced logic wafers",
    componentIds: ["accelerator", "nic", "tor-switch"],
    materials: "High-purity silicon, specialty gases, photoresists, ultra-clean water at the fab.",
    steps: "Ingot, wafer, lithography, etch, deposition, metrology. Leading-edge logic is concentrated in a few fabs.",
    geography: "Taiwan is the usual reference point for leading-edge foundry logic, with other capacity in South Korea, the United States, and elsewhere.",
    bottleneck: "Fab capacity, yield, and export controls. A data hall cannot substitute a process node.",
    lat: 24.8,
    lon: 121.0,
  },
  {
    id: "hbm",
    name: "HBM memory",
    componentIds: ["hbm", "accelerator"],
    materials: "DRAM dies, advanced packaging substrates, through-silicon vias.",
    steps: "DRAM wafer, stacking, packaging, test. HBM is a narrower supply base than commodity DRAM.",
    geography: "South Korea is the reference concentration for HBM, with other memory manufacturing in the broader region.",
    bottleneck: "Stacking capacity and allocation to accelerator vendors. Memory can gate GPU output even when logic wafers exist.",
    lat: 37.0,
    lon: 127.3,
  },
  {
    id: "packaging",
    name: "Advanced packaging",
    componentIds: ["accelerator", "gpu-server"],
    materials: "Substrates, interposers, underfill, thermal interface materials.",
    steps: "Die prep, bonding, substrate attach, test. Multi-die accelerator packages are their own factories.",
    geography: "Taiwan, South Korea, Southeast Asia, and growing capacity elsewhere. Locations move.",
    bottleneck: "Substrate supply and packaging tools. The slow step is often after the wafer is “done.”",
    lat: 25.0,
    lon: 121.5,
  },
  {
    id: "boards",
    name: "Boards and server integration",
    componentIds: ["gpu-server", "gpu-rack", "rack-pdu"],
    materials: "Printed circuit boards, connectors, sheet metal, power supplies, firmware.",
    steps: "PCB fab, SMT assembly, tray integration, rack integration, burn-in.",
    geography: "Contract manufacturing across East and Southeast Asia, Mexico, Eastern Europe, and the United States.",
    bottleneck: "Connectors, magnetics, and the specific firmware rev the cluster expects.",
    lat: 14.6,
    lon: 121.0,
  },
  {
    id: "optics",
    name: "Optics and fiber",
    componentIds: ["optical-transceiver", "fiber-campus", "nic"],
    materials: "Lasers, photodetectors, fiber preforms, connectors, DSP chips inside modules.",
    steps: "Preform, draw fiber, module assembly, test. Campus fiber and GPU fabric optics are different products that share a materials story.",
    geography: "Module assembly is geographically broad. Some laser and DSP steps are concentrated.",
    bottleneck: "The latest module rate often lags the marketing slide. Power of the module becomes a thermal problem of its own.",
    lat: 35.7,
    lon: 139.7,
  },
  {
    id: "electrical-steel",
    name: "Transformers and switchgear",
    componentIds: ["main-transformer", "mv-switchgear", "distribution-transformer"],
    materials: "Grain-oriented electrical steel, copper or aluminum, oil, bushings, breakers.",
    steps: "Core stacking, winding, tanking, factory test, heavy haul, field assembly.",
    geography: "Large-unit factories in Europe, North America, East Asia, and a short list of others. Not a commodity spot market.",
    bottleneck: "Factory slots and qualified steel. This is why a civil schedule can look finished while the site is still dark.",
    lat: 48.2,
    lon: 16.4,
  },
  {
    id: "generation",
    name: "Backup generation and storage",
    componentIds: ["generator", "battery", "ups", "fuel-system"],
    materials: "Engines or turbines, alternators, lithium cells or other storage, switchgear, fuel systems.",
    steps: "Engine build, cell manufacture, pack integration, controls, site fuel contract.",
    geography: "Engines from a small set of global OEMs. Battery cells concentrated in East Asia, with pack assembly more widely distributed.",
    bottleneck: "Emissions permits for diesel testing, gas supply for turbines, and cell allocation.",
    lat: 41.9,
    lon: 12.5,
  },
  {
    id: "thermal-plant",
    name: "Chillers, towers, pumps",
    componentIds: ["chiller", "cooling-tower", "cdu", "heat-exchanger"],
    materials: "Compressors, heat-exchanger plates, fans, valves, treatment chemicals, copper and steel piping.",
    steps: "Skid fabrication, coil or plate manufacture, factory functional test, rigging.",
    geography: "Global HVAC and industrial OEMs. CDUs for IT liquid cooling are a younger, tighter vendor set.",
    bottleneck: "Large chillers and custom CDUs. Installation skill is part of the supply chain.",
    lat: 51.5,
    lon: 7.5,
  },
  {
    id: "materials-bulk",
    name: "Steel, copper, concrete",
    componentIds: ["concrete-shell", "busway", "grounding"],
    materials: "Cement, aggregate, structural steel, copper bus, aluminum, rebar.",
    steps: "Mill, fab shop, ready-mix, site placement. Ordinary materials, extraordinary quantities.",
    geography: "Mostly regional, which is a virtue until a local mill or cement outage hits the pour schedule.",
    bottleneck: "Skilled trades and sequence, more than ore. Copper still tracks a global price.",
    lat: 39.7,
    lon: -86.2,
  },
  {
    id: "campus",
    name: "Illustrative campus",
    componentIds: ["data-hall"],
    materials: "Everything above, plus local utility power, water strategy, and fiber laterals.",
    steps: "Ship, receive, set, commission, operate, repair, recycle.",
    geography: "This globe uses a notional North American campus so routes have a destination. It is not a specific project.",
    bottleneck: "The campus is where late transformers, late GPUs, and late fiber discover each other.",
    lat: 33.4,
    lon: -111.9,
  },
];

export const RACK_JOURNEY: { step: string; text: string }[] = [
  { step: "Raw materials", text: "Silicon, metals, gases, and energy enter fabs and mills. Most of this never looks like a computer." },
  { step: "Wafer fabrication", text: "Logic and memory wafers are patterned in cleanrooms. Yield, not architecture diagrams, decides volume." },
  { step: "Packaging", text: "Dies are stacked and packaged with high-bandwidth memory and substrates. This is a distinct factory." },
  { step: "Board and tray", text: "Packages land on boards with power stages, NICs, and cold plates or heat sinks." },
  { step: "Rack integration", text: "Trays, PDUs, switches, manifolds, and sensors become a rack that can be lifted as a unit." },
  { step: "Optics", text: "Transceivers and fiber harnesses are matched to the fabric the cluster will actually run." },
  { step: "Shipping", text: "High-value freight, export paperwork, and shock sensors. A rack is not a parcel." },
  { step: "Installation", text: "Busway tap, A/B power, coolant quick-disconnects, fiber, and a position in the hall addressing scheme." },
  { step: "Commissioning", text: "Burn-in, leak check, fabric health, firmware baseline. Only then does the scheduler see a node." },
  { step: "Operation", text: "Training or inference, failures, and replacements. Utilization is an operations outcome." },
  { step: "Repair and recycling", text: "Boards are swapped. Coolant is handled as a chemical. Metals and some components re-enter supply; not everything is recyclable in practice." },
];
