import type { EraId } from "@/data/types";

export interface EraProfile {
  id: EraId;
  name: string;
  period: string;
  tagline: string;
  summary: string;
  building: string;
  density: string;
  cooling: string;
  power: string;
  network: string;
  software: string;
  business: string;
  bottleneck: string;
  geography: string;
  environment: string;
  rackKw: string;
  pue: string;
}

export const ERAS: EraProfile[] = [
  {
    id: "precloud",
    name: "Pre-cloud room",
    period: "1990s – mid-2000s",
    tagline: "A computer room the company owned.",
    summary:
      "Enterprise facilities built around raised floors, CRAC units, mixed 1U and 2U servers, SAN arrays, and tape. Density was modest. The facility was a cost center attached to the business, not a product.",
    building: "Smaller purpose-built room or retrofitted floor, raised-floor plenum, modest generator yard.",
    density: "Often about 2–8 kW per rack, sometimes a little higher. Representative, not a code limit.",
    cooling: "CRAC or CRAH units pushing cold air through a raised-floor plenum. Hot/cold aisle discipline was uneven.",
    power: "Building service, UPS room, diesel generators, whips to racks. Rarely a private transmission substation.",
    network: "Copper-heavy structured cabling, patch panels, some fiber uplinks. North-south traffic dominated.",
    software: "Operating systems on physical hosts, backup windows, manual change control, early virtualization late in the period.",
    business: "On-premises ownership. Capacity planned for peaks the company itself expected.",
    bottleneck: "Floor space, raised-floor airflow, and staff who understood both the apps and the plant.",
    geography: "Close to headquarters, a campus, or a downtown colocation suite.",
    environment: "Lower IT load, but often poor PUE by later standards and little visibility into water or carbon.",
    rackKw: "2–12 kW",
    pue: "Often 1.8–2.5",
  },
  {
    id: "cloud",
    name: "Cloud hall",
    period: "Mid-2000s – late 2010s",
    tagline: "Standardized compute as a service.",
    summary:
      "Warehouse halls, commodity servers, virtualization, then containers. Hot-aisle containment, modular UPS, and spine/leaf networks. The building became a factory for virtual machines and object storage.",
    building: "Large single-story warehouse, pods, meet-me room, security operations, loading dock.",
    density: "Commonly about 8–15 kW per rack in general compute, with hotter pockets.",
    cooling: "Hot-aisle containment, air-side economizers where climate allows, or chilled-water plants.",
    power: "Medium-voltage service, distributed UPS, busway or overhead power, N+1 blocks.",
    network: "Leaf and spine Ethernet, vast east-west traffic inside the hall, carrier fiber in a meet-me room.",
    software: "Hypervisors, orchestration, multi-tenant control planes, infrastructure as code.",
    business: "Public cloud, large private cloud, or wholesale colocation. Utilization becomes a product metric.",
    bottleneck: "Network oversubscription, power density of general-purpose servers, and slow utility upgrades.",
    geography: "Cheap power, land, tax, and fiber routes. Not necessarily next to the user.",
    environment: "PUE became a public metric. Water use and embodied carbon were still easy to leave off the slide.",
    rackKw: "8–20 kW",
    pue: "Often 1.2–1.6 in efficient designs",
  },
  {
    id: "hyperscale",
    name: "Hyperscale AI campus",
    period: "2020s",
    tagline: "A power project that happens to compute.",
    summary:
      "Campus-scale buildings tied to high-voltage interconnects, liquid-cooled GPU halls, and AI fabrics. The scarce inputs are megawatts, transformers, water strategy, and accelerators — not raised-floor tiles.",
    building: "Multiple halls, dedicated substation, water plant, security perimeter, NOC, construction yard.",
    density: "AI zones can span tens of kW to well above 100 kW per rack. Air-only design stops being the default.",
    cooling: "Direct-to-chip loops, CDUs, heat exchangers, chillers and towers or dry coolers. Rear-door units as a bridge.",
    power: "Transmission interconnect, step-down transformers, medium-voltage distribution, UPS or battery, backup generation, busway to the rack.",
    network: "High-bandwidth, low-latency east-west fabric. InfiniBand and Ethernet both appear. Optics move closer to the accelerator.",
    software: "Cluster schedulers, training and inference stacks, telemetry from facility to GPU.",
    business: "Hyperscaler platforms, and the power purchase agreements and land banks behind them.",
    bottleneck: "Utility interconnection, large transformers and switchgear, liquid cooling, and accelerator supply.",
    geography: "Where a utility can deliver firm power, a community will permit the load, and fiber can leave the site.",
    environment: "Very large annual energy. Water depends on the heat-rejection design and climate, not on the logo on the building.",
    rackKw: "30–150+ kW in AI zones",
    pue: "Design targets often near 1.1–1.4; PUE ignores water and workload efficiency",
  },
  {
    id: "neocloud",
    name: "Neocloud campus",
    period: "Current",
    tagline: "An AI factory rented by the GPU-hour.",
    summary:
      "A neocloud is an accelerated-computing provider organized around GPUs rather than the full general-purpose cloud catalog. Designs emphasize dense liquid-cooled pods, fast deployment, high utilization, and a control plane for reservations, queues, and tenants.",
    building: "Modular AI pods, sometimes inside a leased powered shell, a build-to-suit, or a dedicated site.",
    density: "Similar physical ceilings to hyperscale AI halls, with a bias toward filling the rack with accelerators.",
    cooling: "Direct-to-chip or other liquid loops are common because the product is density. Designs still vary.",
    power: "Leased capacity, behind-the-meter generation, or a utility interconnect. The contract path changes faster than the physics.",
    network: "Cluster fabric first. Customer traffic is real, but east-west GPU communication sets the design.",
    software: "GPU scheduler, tenancy and reservation grid, queue, health checks, and a usage API. Kubernetes may be present; it is not the product.",
    business: "GPU-as-a-service. Revenue tracks delivered GPU-hours and uptime, not virtual-machine SKUs.",
    bottleneck: "GPU allocation, power delivery dates, and the network’s ability to keep accelerators busy.",
    geography: "Wherever power and GPUs can be stood up soon — including sites a hyperscaler has not already absorbed.",
    environment: "High utilization can improve energy per useful token, but only if the workload is real. Idle GPUs still sit on energized infrastructure.",
    rackKw: "40–150+ kW",
    pue: "Illustrative targets often 1.15–1.4",
  },
];

export const ERA_MAP: Record<EraId, EraProfile> = Object.fromEntries(
  ERAS.map((era) => [era.id, era]),
) as Record<EraId, EraProfile>;

export const COMPARE_ROWS: { key: keyof EraProfile; label: string }[] = [
  { key: "period", label: "Period" },
  { key: "building", label: "Building" },
  { key: "density", label: "Rack density" },
  { key: "cooling", label: "Cooling" },
  { key: "power", label: "Power" },
  { key: "network", label: "Network" },
  { key: "software", label: "Software" },
  { key: "business", label: "Business model" },
  { key: "bottleneck", label: "Primary bottleneck" },
  { key: "geography", label: "Geographic logic" },
  { key: "environment", label: "Environmental tradeoff" },
  { key: "rackKw", label: "Representative rack power" },
  { key: "pue", label: "PUE context" },
];
