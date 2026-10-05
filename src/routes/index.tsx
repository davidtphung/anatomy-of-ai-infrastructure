import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CampusViewport } from "@/components/three/CampusScene";
import { EraSwitch, Legend } from "@/components/ui/controls";
import { ERAS } from "@/data/eras";
import { useInfra } from "@/lib/store";
import type { EraId } from "@/data/types";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const openEra = (id: EraId) => {
    useInfra.getState().setEra(id);
    void navigate({ to: "/explore" });
  };

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">The physical stack behind artificial intelligence</p>
          <h1>AI is built from power, water, silicon, fiber, and time.</h1>
          <p className="lede">
            Every model query, training run, and agent depends on a physical system: transmission lines, substations, transformers, backup generation, liquid cooling, GPU racks, optical networks, and the supply chains that deliver them.
          </p>
          <div className="hero-actions">
            <Link to="/explore" className="btn">
              Explore the AI campus
            </Link>
            <Link to="/compare" className="btn-ghost">
              Compare data center eras
            </Link>
          </div>
          <p className="micro">Interactive educational model. Representative configurations. Not a blueprint for a specific facility.</p>
          <EraSwitch />
        </div>
        <div className="hero-stage" aria-hidden="true">
          <CampusViewport variant="hero" />
        </div>
      </section>

      <div className="page">
        <div className="section-title">
          <h2>Four machines, not one metaphor</h2>
          <p>Cloud, hyperscale, and neocloud overlap in the real world. The model separates them so the differences in power, cooling, and business are visible.</p>
        </div>
        <div className="era-grid">
          {ERAS.map((era) => (
            <article key={era.id} className="card">
              <p className="kicker">{era.period}</p>
              <h3>{era.name}</h3>
              <p>{era.tagline}</p>
              <p style={{ marginTop: "0.6rem" }}>
                {era.rackKw} per rack · {era.pue}
              </p>
              <button type="button" className="btn-ghost" style={{ marginTop: "0.8rem" }} onClick={() => openEra(era.id)}>
                Open this era
              </button>
            </article>
          ))}
        </div>

        <div className="section-title">
          <h2>Where a watt goes</h2>
          <p>A simplified path. Real one-lines have protection, metering, and a second route that is actually independent.</p>
        </div>
        <ol className="steps">
          <li>
            <div>
              <strong>The utility delivers it.</strong>
              <p>Transmission or a feeder, a study, and a date. The campus cannot outrun interconnection.</p>
            </div>
          </li>
          <li>
            <div>
              <strong>A transformer steps it down.</strong>
              <p>High voltage becomes medium voltage the site can distribute. Lead times here often set the schedule.</p>
            </div>
          </li>
          <li>
            <div>
              <strong>Backup sits beside the path.</strong>
              <p>Generators, transfer switches, UPS or batteries. N+1 is a spare. 2N is a second path that can carry the load.</p>
            </div>
          </li>
          <li>
            <div>
              <strong>The rack turns it into heat.</strong>
              <p>Busway, rack PDU, server supplies, accelerators. Computation is the small remainder. Heat is the rest.</p>
            </div>
          </li>
          <li>
            <div>
              <strong>Cooling rejects the heat.</strong>
              <p>Cold plates, CDUs, heat exchangers, chillers, towers or dry coolers. Water use follows that choice and the weather.</p>
            </div>
          </li>
          <li>
            <div>
              <strong>The fabric keeps GPUs busy.</strong>
              <p>East-west traffic between accelerators is a different network from the fiber that leaves the meet-me room.</p>
            </div>
          </li>
        </ol>

        <div className="section-title">
          <h2>Layers you can turn off</h2>
          <p>Color is paired with a pattern. The atlas still lists every system if WebGL is unavailable.</p>
        </div>
        <Legend />
        <p className="micro" style={{ marginTop: "1.5rem" }}>
          Reading behind the model: Tung-Hui Hu, A Prehistory of the Cloud; Crucible Capital datacenter notes on sites, 800 V DC, and networks. Figures in the metrics lab are educational, not audited.
        </p>
      </div>
    </main>
  );
}
