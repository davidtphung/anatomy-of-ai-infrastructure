import type { EraId } from "@/data/types";

export interface Milestone {
  id: string;
  year: string;
  title: string;
  era: EraId;
  text: string;
  bottleneck: string;
}

export const MILESTONES: Milestone[] = [
  {
    id: "mainframe",
    year: "1950s–70s",
    title: "Computer rooms",
    era: "precloud",
    text: "Mainframes lived in raised-floor rooms with dedicated cooling and operators. The machine was centralized because the hardware was scarce, not because the cloud had been invented.",
    bottleneck: "The machine itself, and the people allowed to touch it.",
  },
  {
    id: "client-server",
    year: "1990s",
    title: "Client-server rooms",
    era: "precloud",
    text: "Departments filled rooms with servers, SANs, and tape. Copper patch fields grew faster than the drawings. Facilities management was still mostly a building skill.",
    bottleneck: "Air under the floor and undocumented cabling.",
  },
  {
    id: "colo",
    year: "Late 1990s",
    title: "Colocation and hosting",
    era: "precloud",
    text: "Carriers and hosts rented cages, power, and cross-connects. The meet-me room became a business. The internet’s “cloud” was already a building with a loading dock.",
    bottleneck: "Cross-connects, power circuits, and who owned the cage.",
  },
  {
    id: "virt",
    year: "2000s",
    title: "Virtualization",
    era: "cloud",
    text: "Many logical servers shared one host. Utilization of CPUs rose. The facility still had to cool a box that no longer mapped neatly to a single application owner.",
    bottleneck: "Noisy neighbors and backup windows.",
  },
  {
    id: "public-cloud",
    year: "2006–",
    title: "Public cloud",
    era: "cloud",
    text: "Infrastructure became an API. Buildings standardized into pods. The customer stopped visiting the hall, which made the hall easier to forget and no less physical.",
    bottleneck: "Network architecture and the speed of adding utility power.",
  },
  {
    id: "hyperscale-std",
    year: "2010s",
    title: "Hyperscale standardization",
    era: "cloud",
    text: "Operators cloned halls, busways, and containment. PUE became a number executives repeated. Designs assumed air, commodity servers, and steady growth.",
    bottleneck: "Land, substations, and the long life of a building versus a server.",
  },
  {
    id: "containers",
    year: "Mid-2010s",
    title: "Containers and cloud-native software",
    era: "cloud",
    text: "Orchestration made workloads mobile across machines. Failure of a server became normal. Failure of a transformer did not.",
    bottleneck: "State, data gravity, and the facilities the scheduler cannot reschedule.",
  },
  {
    id: "gpu",
    year: "2012–2018",
    title: "GPU acceleration",
    era: "hyperscale",
    text: "Training deep models concentrated work onto accelerators. Racks that had been tens of kilowatts started to look insufficient, and the network inside the cluster started to matter as much as the chip.",
    bottleneck: "Accelerator memory, interconnect, and heat.",
  },
  {
    id: "llm",
    year: "2020–",
    title: "Large training clusters",
    era: "hyperscale",
    text: "Frontier training runs asked for synchronized fleets of accelerators. East-west bandwidth, liquid cooling, and utility-scale interconnects moved from specialist topics to project gates.",
    bottleneck: "Megawatts, transformers, and fabric latency.",
  },
  {
    id: "liquid",
    year: "2023–",
    title: "Liquid cooling at scale",
    era: "hyperscale",
    text: "Direct-to-chip loops, coolant distribution, and new rack specifications spread because air handlers could not politely remove the heat of the newest AI racks.",
    bottleneck: "Plumbing skill, leak tolerance, and facility water strategy.",
  },
  {
    id: "factory",
    year: "Now",
    title: "AI factories and neoclouds",
    era: "neocloud",
    text: "Some operators sell the cluster itself: GPU-hours, reservations, and dense pods stood up as fast as power and chips allow. The building is a factory whose product is tokens, not a general cloud catalog.",
    bottleneck: "Chip allocation, interconnection queues, and keeping expensive silicon busy.",
  },
];

export const BUILD_PHASES: { id: number; name: string; detail: string; critical: string }[] = [
  {
    id: 0,
    name: "Site selection and permitting",
    detail: "Land, zoning, community process, water rights, and a first look at whether the utility can even study the load.",
    critical: "A site without a credible power path is a real-estate brochure.",
  },
  {
    id: 1,
    name: "Grid interconnection",
    detail: "Studies, agreements, and a place in the utility’s queue. Timing varies by region, voltage, and how loaded the local grid already is.",
    critical: "Interconnection can outlast the building. Treat any universal month-count as fiction.",
  },
  {
    id: 2,
    name: "Civil works and grading",
    detail: "Pads, roads, stormwater, duct banks, and the grounding grid. Fiber, water, and medium-voltage conduits want separate, maintainable routes.",
    critical: "Underground conflicts found late are expensive because concrete does not renegotiate.",
  },
  {
    id: 3,
    name: "Substation construction",
    detail: "Foundations, steel, breakers, bus, protection, and the transformers — if they have arrived.",
    critical: "Large transformers and switchgear are frequent long-lead items. Spares strategy is part of the design.",
  },
  {
    id: 4,
    name: "Shell and core",
    detail: "Structure, envelope, fire ratings, loading dock, and rooms that must exist before equipment is set: electrical, mechanical, network, battery.",
    critical: "Structural grid and floor loading have to anticipate a heavier generation of racks than the first tenant installs.",
  },
  {
    id: 5,
    name: "Electrical and mechanical plant",
    detail: "Switchgear, UPS or batteries, generators, chillers, pumps, towers or dry coolers, and the controls that make them one system.",
    critical: "The plant is commissioned as a system. Individual nameplates do not guarantee the combination works.",
  },
  {
    id: 6,
    name: "Data hall fit-out",
    detail: "Busway, containment or manifolds, cable tray, leak detection, and the white space the racks will occupy.",
    critical: "Liquid and power want designed pathways. Retrofit spaghetti is how maintenance windows get dangerous.",
  },
  {
    id: 7,
    name: "Network and fiber",
    detail: "Carrier entry, meet-me, spines, leaves or an AI fabric, and out-of-band management that does not share fate with the data plane.",
    critical: "Diverse fiber routes are physical routes. Two strands in one conduit are not diversity.",
  },
  {
    id: 8,
    name: "GPU rack delivery",
    detail: "Racks arrive integrated, or are integrated on site. Accelerator supply can reorder the whole sequence: a finished hall may wait on silicon, or silicon may wait on a hall.",
    critical: "Delivery slots, firmware, and liquid connectors are as schedule-critical as the crane.",
  },
  {
    id: 9,
    name: "Commissioning",
    detail: "Integrated systems tests, transfer tests, leak tests, and failure drills. The goal is to find the boring fault before tenants do.",
    critical: "Skip this and the first outage becomes the test plan.",
  },
  {
    id: 10,
    name: "Operational ramp",
    detail: "Load grows as clusters are accepted. Telemetry should see facility and IT together: a hot rack is an electrical, thermal, and scheduling event.",
    critical: "Nameplate megawatts are not useful GPU-hours until power, cooling, fabric, and workload agree.",
  },
];
