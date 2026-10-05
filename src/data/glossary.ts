export interface GlossaryEntry {
  id: string;
  term: string;
  group: string;
  definition: string;
  related?: string[];
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    id: "pue",
    term: "PUE",
    group: "Metrics",
    definition:
      "Power usage effectiveness: total facility energy divided by IT equipment energy. A useful efficiency ratio for the building, and a poor summary of water, carbon, grid impact, or how much useful computation came out.",
  },
  {
    id: "wue",
    term: "WUE",
    group: "Metrics",
    definition:
      "Water usage effectiveness, typically liters of water per kWh of IT energy. Always ask whether the number is withdrawal or consumption, and whether the cooling design is evaporative.",
  },
  {
    id: "nplus1",
    term: "N+1",
    group: "Reliability",
    definition:
      "Enough equipment to carry the load (N), plus one spare module. A single failure or maintenance window can be tolerated. It is not the same as 2N, which duplicates the entire path.",
  },
  {
    id: "2n",
    term: "2N",
    group: "Reliability",
    definition:
      "Two independent paths, each able to carry the full load. More expensive in capital, space, and sometimes losses. Used when the product being sold is continuity.",
  },
  {
    id: "cdu",
    term: "CDU",
    group: "Cooling",
    definition:
      "Coolant distribution unit. Sits between a facility water loop and the cleaner secondary loop that feeds cold plates or rear doors. Pumps, heat exchanger, filters, and controls live here.",
  },
  {
    id: "crac",
    term: "CRAC / CRAH",
    group: "Cooling",
    definition:
      "Computer-room air conditioner (usually a refrigerant coil) or computer-room air handler (usually a chilled-water coil). The classic raised-floor cooling machines.",
  },
  {
    id: "dtc",
    term: "Direct-to-chip",
    group: "Cooling",
    definition:
      "Liquid cooling where a cold plate sits on the processor package and coolant takes heat away before it ever enters the room air. Increasingly used as rack power climbs past what air can move.",
  },
  {
    id: "delta-t",
    term: "Delta-T",
    group: "Cooling",
    definition:
      "Temperature difference, often between cooling supply and return. A larger delta-T can move the same heat with less flow, which is kinder to pipes and pumps — if the IT equipment allows it.",
  },
  {
    id: "wet-bulb",
    term: "Wet-bulb temperature",
    group: "Cooling",
    definition:
      "The temperature a wet thermometer reaches by evaporation. It sets the practical floor for cooling-tower performance and is why the same tower design behaves differently in Phoenix and Stockholm.",
  },
  {
    id: "busway",
    term: "Busway",
    group: "Power",
    definition:
      "A prefabricated electrical bus, usually overhead in the aisle, that tap boxes connect to. It replaces long individual whips and makes rack moves less of a rewiring project.",
  },
  {
    id: "ats",
    term: "ATS",
    group: "Power",
    definition:
      "Automatic transfer switch. Moves a load between utility and generator, or between two sources, when it senses a failure. The logic and timing matter as much as the copper.",
  },
  {
    id: "ups",
    term: "UPS",
    group: "Power",
    definition:
      "Uninterruptible power supply. Batteries, flywheels, or other storage that ride through the seconds between a utility outage and generator readiness, and condition the power in some designs.",
  },
  {
    id: "800vdc",
    term: "800 V DC",
    group: "Power",
    definition:
      "A high-voltage direct-current distribution approach discussed for very dense AI racks, to cut conversion steps and copper. It is an emerging architecture, not a description of every hall operating today.",
  },
  {
    id: "mva",
    term: "MW and MVA",
    group: "Power",
    definition:
      "Megawatts are real power. Megavolt-amperes include reactive power and are how transformers are often rated. A campus can be described both ways; they are not interchangeable.",
  },
  {
    id: "east-west",
    term: "East-west traffic",
    group: "Network",
    definition:
      "Traffic between machines inside the data center, as opposed to north-south traffic that enters or leaves. AI training is dominated by east-west exchanges of gradients and activations.",
  },
  {
    id: "spine-leaf",
    term: "Spine / leaf",
    group: "Network",
    definition:
      "A two-tier fabric: leaf switches attach to servers, spine switches connect the leaves. Any leaf can reach any other in a predictable number of hops. AI fabrics may add further dedicated planes.",
  },
  {
    id: "oversubscription",
    term: "Oversubscription",
    group: "Network",
    definition:
      "When the sum of downstream port bandwidth exceeds upstream bandwidth. Acceptable for many web workloads. Expensive for synchronized GPU training, which wants the fabric closer to non-blocking.",
  },
  {
    id: "infiniband",
    term: "InfiniBand and Ethernet",
    group: "Network",
    definition:
      "Two families of high-speed interconnect used in AI clusters. Choice depends on latency, operations experience, switch power, and the software stack. Neither is universal.",
  },
  {
    id: "nic",
    term: "NIC / DPU",
    group: "Network",
    definition:
      "Network interface card, sometimes a data processing unit that offloads networking, storage, or security. In an AI server it is how the accelerator’s host joins the fabric.",
  },
  {
    id: "meet-me",
    term: "Meet-me room",
    group: "Network",
    definition:
      "The room where carrier fibers and the building’s fiber meet. Cross-connects happen here. Path diversity starts with physically separate entries, not with a second VLAN.",
  },
  {
    id: "hbm",
    term: "HBM",
    group: "Compute",
    definition:
      "High-bandwidth memory stacked near the accelerator die. Capacity and bandwidth are generation-specific. The important idea: many AI workloads are limited by memory movement, not by arithmetic alone.",
  },
  {
    id: "neocloud",
    term: "Neocloud",
    group: "Operators",
    definition:
      "An AI-focused cloud organized around accelerated computing rather than a broad catalog of general-purpose services. Often sells GPU time, cluster reservations, and fast access to dense liquid-cooled capacity.",
  },
  {
    id: "hyperscaler",
    term: "Hyperscaler",
    group: "Operators",
    definition:
      "A company operating cloud infrastructure at a scale where it designs its own buildings, networks, and often chips. The boundary with neoclouds and colo is commercial as much as technical.",
  },
  {
    id: "five-nines",
    term: "Five-nines",
    group: "Reliability",
    definition:
      "99.999% availability. A design target that still depends on brittle physical paths — a single fiber cut, breaker, or firmware bug can embarrass the percentage.",
  },
  {
    id: "vesda",
    term: "VESDA",
    group: "Life safety",
    definition:
      "Aspirating smoke detection that samples air continuously. Used because a data hall should notice a developing fire before a spot detector in a tall room does.",
  },
  {
    id: "mantrap",
    term: "Mantrap",
    group: "Security",
    definition:
      "An interlocked pair of doors so one person is admitted at a time. Part of the physical control around halls that are also critical infrastructure.",
  },
  {
    id: "dark-fiber",
    term: "Dark fiber",
    group: "Network",
    definition:
      "Fiber the tenant lights with their own optics, rather than buying a managed wavelength. Control over the optical layer, and responsibility for it, both move to the tenant.",
  },
  {
    id: "embodied",
    term: "Embodied carbon",
    group: "Metrics",
    definition:
      "Emissions from making and building things — concrete, steel, chips, transformers — before the first watt-hour of operation. Operational carbon does not include it.",
  },
  {
    id: "capacity-factor",
    term: "Capacity factor",
    group: "Metrics",
    definition:
      "Average load divided by nameplate capacity. A hall energized for 100 MW but averaging 60 MW has a 0.6 capacity factor. Stranded utility capacity is the gap you still pay to reserve.",
  },
  {
    id: "rppu",
    term: "PDU and rPDU",
    group: "Power",
    definition:
      "Power distribution unit: a floor or room unit, or the smaller rack PDU that finally feeds server power supplies. A and B feeds should stay on different upstream paths.",
  },
  {
    id: "economizer",
    term: "Economizer",
    group: "Cooling",
    definition:
      "A mode that uses outside air or cool water to reject heat without running compressors full time. Powerful in the right climate, and a reason the same IT load has different PUE in different cities.",
  },
  {
    id: "one-line",
    term: "One-line diagram",
    group: "Power",
    definition:
      "The simplified electrical drawing that shows sources, transformers, breakers, and paths as single lines. It is the map of how a megawatt becomes a GPU’s power supply.",
  },
  {
    id: "firm-power",
    term: "Firm power",
    group: "Power",
    definition:
      "Electricity that is there on demand, not only when the wind or the sun is. AI clusters are a flat load. They ask for firm power at 3 a.m. and at 3 p.m., which is why a surplus hour of renewables does not by itself unlock a hall.",
  },
  {
    id: "interconnection",
    term: "Interconnection queue",
    group: "Power",
    definition:
      "The line of generation and large loads waiting on a utility study before they can connect. A data hall can be built in a year or two. A place in this queue, and the transmission to serve it, often takes longer — or does not come.",
  },
  {
    id: "minimum-take",
    term: "Minimum take",
    group: "Power",
    definition:
      "A contract that makes a large customer pay for most of the power it reserved, whether or not the racks are full. Utilities propose it because a substation outlives a server generation, and they do not want to strand the asset if the tenant’s plan shrinks.",
  },
  {
    id: "tier",
    term: "Tier I–IV",
    group: "Reliability",
    definition:
      "The Uptime Institute’s availability grades. Higher tiers add electrical paths, UPS redundancy, generator coverage, and fuel. Most large U.S. halls sit between III and IV. A quoted 99.995% for Tier IV is a design target; operations spend it. “Tier V” is not an Institute tier.",
  },
  {
    id: "rack-unit",
    term: "Rack unit (U)",
    group: "Compute",
    definition:
      "A vertical slice of a cabinet, 1.75 inches. Common cabinets are 42U or 48U. AI trays do not always fill that grid the way 1U enterprise servers did. Power and coolant, not the U count, are what now size the rack.",
  },
  {
    id: "cfm",
    term: "CFM per kilowatt",
    group: "Cooling",
    definition:
      "Cubic feet of air per minute, per kilowatt of heat. A rough minimum often quoted is about 120. At 100 MW that is on the order of 12 million cubic feet a minute — why ducts and towers dwarf the racks, and why air runs out of room above a few tens of kilowatts.",
  },
  {
    id: "cold-battery",
    term: "Cold battery",
    group: "Cooling",
    definition:
      "A large tank of water chilled when power is cheaper, often overnight, and used to carry cooling load later. Published site tours have shown tanks on the order of a million gallons. It shifts when the chillers run. It does not shrink the heat.",
  },
  {
    id: "hot-aisle",
    term: "Hot aisle / cold aisle",
    group: "Cooling",
    definition:
      "Racks faced so that intakes share a cold aisle and exhausts share a hot aisle. Containment keeps the two from mixing. It was one of the ordinary moves that pulled surveyed PUE down from roughly 2.5 in the late 2000s toward a little above 1.5.",
  },
];
