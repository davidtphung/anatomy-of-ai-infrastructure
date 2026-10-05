import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/methodology")({
  head: () => ({ meta: [{ title: "Methodology — Anatomy of AI Infrastructure" }] }),
  component: MethodologyPage,
});

function MethodologyPage() {
  return (
    <main className="page stack">
      <p className="eyebrow">Assumptions</p>
      <h1 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", margin: "0.2rem 0" }}>
        What this model is allowed to claim.
      </h1>
      <p className="lede">
        Anatomy of AI Infrastructure is a teaching exhibit. It is physically coherent on purpose and numerically humble on purpose. It is not a design package, a vendor catalog, or an investment memo.
      </p>
      <article className="panel stack">
        <h2>What is simplified</h2>
        <p>One campus stands in for many topologies. Protection schemes, grounding detail, and exact one-lines are described in text rather than drawn as construction documents. Racks are instanced. The exploded cabinet is a representative AI server, labeled as such. The silicon view stops at a schematic lattice. It is not a process recipe and not a die photo.</p>
        <p>800 V DC appears in the reading list as an emerging distribution idea for very dense racks. The default campus still shows the familiar path: utility AC, step-down, UPS or batteries, busway, rack PDU. Adoption is not universal.</p>
        <p>Cloud, hyperscale, and neocloud are not mutually exclusive legal categories. A neocloud here means an operator whose product is accelerated compute — GPU-hours, reservations, dense pods — rather than the full general-purpose cloud catalog.</p>
      </article>
      <article className="panel stack">
        <h2>Numbers</h2>
        <p>Rack power is given as ranges: pre-cloud often about 2–12 kW, cloud halls about 8–20 kW, hyperscale AI zones about 30–150+ kW, neocloud pods in a similar dense band. Real designs sit outside those bands.</p>
        <p>
          The metrics lab uses: facility MW = IT MW × PUE; drawn IT = IT × utilization; annual energy = drawn megawatts × 8,760; racks = IT kW / average rack kW; WUE lookup by cooling method; water and CO₂e from those products; energy cost = MWh × price. Overhead inside PUE is split 70/25/5 for the chart only. Stranded capacity is flagged under 45% utilization. None of this is an audited energy model.
        </p>
        <p>PUE does not measure water, embodied carbon, grid congestion, or useful tokens per joule. WUE without a definition of consumption versus withdrawal is incomplete.</p>
      </article>
      <article className="panel stack">
        <h2>Reading that shaped the exhibit</h2>
        <p>Tung-Hui Hu, A Prehistory of the Cloud (MIT Press, 2015). The cloud as a mute, fragile, physical network: five-nines as an aspiration sitting on brittle fiber, the bunker inheritance of data centers, and the gap between the metaphor and the building.</p>
        <p>Crucible Capital, Building a Datacenter (for Dummies) Part I (September 2025). Site control, permitting, power procurement, fiber, and why interconnection and long-lead electrical gear dominate a schedule. Not investment advice.</p>
        <p>Crucible Capital, Building a Datacenter Part 2 (February 2026). Legacy power paths, the industry conversation about 800 V DC, cooling standardization, and storage. Treated as an industry essay, not a specification you can build from.</p>
        <p>Crucible Capital, The Datacenter Series Part 3: Networking Systems (June 2026). East-west versus north-south traffic, spine and leaf, NICs, optics, and why the fabric can limit GPU utilization. Link rates and rack kilowatts in that essay are context, not copied here as vendor specs.</p>
        <p>Supplier names in the inspector are categories — foundries, HBM makers, transformer shops — not a ranking and not a claim of a current contract.</p>
      </article>
      <article className="panel stack">
        <h2>What the 3D scene refuses to do</h2>
        <p>It does not show a specific company’s floor plan. It does not animate a branded accelerator. It does not invent a gigawatt contract for the notional campus. Quality modes drop instance counts and shadows rather than pretending every phone can draw the full yard.</p>
        <p>
          If WebGL fails, the <Link to="/atlas">text atlas</Link> still lists every system.
        </p>
      </article>
    </main>
  );
}
