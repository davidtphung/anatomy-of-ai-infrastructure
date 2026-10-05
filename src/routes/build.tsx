import { createFileRoute, Link } from "@tanstack/react-router";
import { BUILD_SOURCE, DENSITY_BANDS, FLEET_ROWS, REGION_ROWS, TREND_ROWS } from "@/data/buildPhysics";

export const Route = createFileRoute("/build")({
  head: () => ({ meta: [{ title: "Power and the build — Anatomy of AI Infrastructure" }] }),
  component: BuildPage,
});

function BuildPage() {
  return (
    <main className="page stack">
      <p className="eyebrow">Why the campus exists where it does</p>
      <h1 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", margin: "0.2rem 0" }}>
        The gate is firm power.
      </h1>
      <p className="lede">
        A data center is counted in megawatts before it is counted in square feet. This page is our own account of that fact, using public estimates gathered in mid-2024 by {BUILD_SOURCE.author} for {BUILD_SOURCE.series}. It is not his essay, not his charts, and not a current inventory.
      </p>

      <article className="panel stack" id="measured-in-mw">
        <h2>Measured in megawatts</h2>
        <p>
          One server is a few hundred watts — a fraction of a hair dryer. A large hall is on the order of 100 MW, the continuous demand of a small city, or of a large electric-arc furnace. Industry inventories follow the power, not the floor plate. One 2024 reading of CBRE put a bit over 3,000 MW of U.S. data-center capacity under construction. The exact total is contested. The unit is not.
        </p>
        <p>
          That load is why the yard has transformers, switchgear, and often a substation of its own. Nine of the top ten U.S. utilities, in the surveys that essay cites, had already named data centers as their main source of new demand. Asked what decides a site, operators put power availability and power price first.
        </p>
        <p className="micro">
          Potter’s home comparison was about 75,000 households per 100 MW. This exhibit’s gigawatt sketch uses 1.2 kW per home, which lands in the same neighborhood. Neither number is a utility tariff.
        </p>
      </article>

      <section>
        <div className="section-title">
          <h2>How heavy a rack became</h2>
          <p>Order-of-magnitude bands, as described in 2024. Real rooms sit outside them.</p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <caption className="sr-only">Representative rack power by era</caption>
            <thead>
              <tr>
                <th scope="col">Band</th>
                <th scope="col">Rack</th>
                <th scope="col">What changed</th>
              </tr>
            </thead>
            <tbody>
              {DENSITY_BANDS.map((row) => (
                <tr key={row.band}>
                  <th scope="row">{row.band}</th>
                  <td>{row.rack}</td>
                  <td>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="micro">
          A decade before that essay, nearly every data center was under 10 MW. Large halls were being talked about at 100 MW, and multi-building campuses toward a gigawatt. One widely reported nuclear-adjacent campus started from an existing 48 MW hall, with land discussed up toward about 960 MW. Treat that as a headline, not a one-line.
        </p>
      </section>

      <article className="panel stack" id="air">
        <h2>Air runs out of room</h2>
        <p>
          Every watt that enters a chip leaves as heat. Classic halls still move that heat with air: a raised floor, a cold aisle, a hot aisle, and CRAH or CRAC units. Many plants are three loops deep — room air or a process-water loop, a chiller refrigerant loop, and a condenser loop out to cooling towers. Some sites chill a huge tank overnight, on the order of a million gallons in published tours, and spend that “cold battery” during the day.
        </p>
        <p>
          A rough minimum often quoted is about 120 cubic feet of air per minute for each kilowatt. At 100 MW that is about 12 million cubic feet a minute. Chillers at that scale are thousands of times a house air conditioner. Design notes from the same period warn that chasing AI heat with air alone can force the computers onto about a tenth of the floor, the rest given over to corridors of wind. The practical replies are fewer machines per rack, more space between racks, or liquid on the package.
        </p>
        <p>
          Direct-to-chip — coolant in a cold plate on the processor — is the near-term path, already used on some accelerator platforms and on the densest rack-scale systems. Immersion, the whole server in a dielectric bath, is the longer bet. The{" "}
          <Link className="text-link" to="/">
            cold aisle
          </Link>{" "}
          in this exhibit is the first of those: pumps, a 32 °C supply, and a rack past what air is asked to do. Stop the pumps and the model shows the heat staying in the package.
        </p>
      </article>

      <article className="panel stack" id="pue">
        <h2>PUE already spent its easy years</h2>
        <p>
          Power usage effectiveness is facility energy divided by IT energy. Around 2007, large-site surveys sat near 2.5: a watt in a server came with about a watt and a half of cooling, backup, and conversion. By the early 2020s the surveyed average was a little above 1.5. The best self-reported fleets were near 1.09 and 1.1. Company numbers are company numbers.
        </p>
        <p>
          The levers were ordinary: UPS conversion losses came down, aisles were contained, rooms were allowed to run warmer, server power supplies moved from roughly 60–70% efficient toward the mid-90s, and idle machines finally drew less than busy ones. From 1970 to 2020 the energy cost of a computation itself roughly halved every year and a half. In the United States, data-center electricity about doubled from 2000 to 2007 and then stayed roughly flat for a decade, even while traffic exploded. That is the LBNL picture of those years, not a promise that the next decade repeats it.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <caption className="sr-only">Global internet and data-center change, 2015 to 2022</caption>
            <thead>
              <tr>
                <th scope="col">Indicator</th>
                <th scope="col">2015</th>
                <th scope="col">2022</th>
                <th scope="col">Change</th>
              </tr>
            </thead>
            <tbody>
              {TREND_ROWS.map((row) => (
                <tr key={row.indicator}>
                  <th scope="row">{row.indicator}</th>
                  <td>{row.y2015}</td>
                  <td>{row.y2022}</td>
                  <td>{row.change}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="micro">IEA figures as compiled in 2024. Workloads and traffic outran electricity. That gap is the efficiency story. It is not infinite.</p>
        <p>
          Worldwide, data centers were about 1–1.3% of electricity in 2022, with crypto mining near another 0.4%. One analyst projection discussed alongside those numbers has data-center electricity more than tripling by 2030, toward 3–4.5% of global demand. Other voices have said 20%. The cautious reading is the wide middle: history says naive extrapolation overshoots, and history also says the easy PUE cuts are gone. The best halls already spend only about a tenth of their electricity on everything that is not IT. A marketed “25×” efficiency jump for one rack-scale system is not the same thing as a fleet using 25× less power.
        </p>
        <p>
          Training compute for a frontier model of the GPT-4 generation was estimated by Epoch AI at about 21 billion petaFLOP. The only claim this exhibit needs from that figure is the obvious one: it is a data-center job. Cut the chip’s joules per operation and the lab will usually ask for a larger model. Internet traffic took about ten years to grow twenty-fold. Leading models, in that same write-up, were getting four to seven times as heavy every year.
        </p>
      </article>

      <section id="where">
        <div className="section-title">
          <h2>Where the megawatts already were</h2>
          <p>2024 compilations. Operating fleets move. Use these as a map of concentration, not a scoreboard.</p>
        </div>
        <div className="hero" style={{ minHeight: 0, width: "100%" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <caption className="sr-only">Hyperscaler megawatts, 2022 and then-projected additions</caption>
              <thead>
                <tr>
                  <th scope="col">Operator</th>
                  <th scope="col">2022 MW</th>
                  <th scope="col">Then-projected added MW</th>
                </tr>
              </thead>
              <tbody>
                {FLEET_ROWS.map((row) => (
                  <tr key={row.operator}>
                    <th scope="row">{row.operator}</th>
                    <td>{row.operatingMw}</td>
                    <td>{row.addedMw}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="micro">SemiAnalysis estimates via the 2024 essay. Partial rows for other operators were left out rather than guessed.</p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <caption className="sr-only">U.S. regional data-center megawatts</caption>
              <thead>
                <tr>
                  <th scope="col">Market</th>
                  <th scope="col">2023 inventory MW</th>
                  <th scope="col">Then under construction</th>
                </tr>
              </thead>
              <tbody>
                {REGION_ROWS.map((row) => (
                  <tr key={row.market}>
                    <th scope="row">{row.market}</th>
                    <td>{row.inventoryMw}</td>
                    <td>{row.buildingMw}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="micro">CBRE-based snapshot. A dash means that cell was not listed, not that construction was zero.</p>
          </div>
        </div>
        <p>
          Concentration is the political fact. Ireland was reported near 18% of national electricity in data centers, with public discussion of a path toward about 30% by 2028. In Virginia, the world’s largest market, about a quarter of the power sold by the incumbent utility was already going to data centers. Northern Virginia did not win that role because the land was empty. It won it because the fiber meet-points were already there. Latency and interconnection came first. Power is what started to say no.
        </p>
        <p className="micro">
          Capital color from the same moment, already stale as a dollar figure: one hyperscaler discussing on the order of $150 billion over fifteen years, another about $37 billion of infrastructure in a single year, an AI-cloud startup talking about dozens of sites that year. The durable point is the size of the build, not the press release.
        </p>
      </section>

      <article className="panel stack" id="schedule">
        <h2>A building is faster than a grid</h2>
        <p>
          Halls are often a one-to-two-year construction job. Firm energy is frequently described as three years, or not available at all. Utilities treat transmission as a decades-long asset and have been building relatively little of it. Interconnection queues hold new generation. A data center is a poor customer for load-shifting: the cluster wants power at 3 a.m. and at 3 p.m., which means firm power, not a surplus hour of wind.
        </p>
        <p>
          The asset-life mismatch is why some utilities have asked data centers to reserve power they must largely pay for whether or not the racks are full — a Midwestern proposal near 90% of requested demand, and minimum-take constructs in Northern Virginia. A transformer outlives the server generation it was bought for. The utility does not want to strand it if the tenant’s plan changes.
        </p>
        <p>
          Places that already hosted the industry began to slow it. Singapore paused new data centers from about 2019 to 2022, then reopened them under stricter efficiency rules. Ireland put a moratorium on new Dublin-area centers into 2028. At least one Northern Virginia county turned an application down over power, described at the time as a first for that county. The response pattern is geographic and electrical: smaller metros where a substation can still be studied, and power that is not only a utility interconnect — solar and wind on a microgrid, gas fuel cells, and early talk of small modular reactors.
        </p>
        <p className="callout">
          The build sequence on the <Link className="text-link" to="/timeline">timeline</Link> puts interconnection before the shell for this reason. A finished hall with no megawatts is a warehouse.
        </p>
      </article>

      <article className="panel stack" id="tiers">
        <h2>Redundancy is a building, not a percentage</h2>
        <p>
          Uptime is graded in tiers, I through IV. Most large U.S. halls sit between III and IV: concurrent maintainability or full fault tolerance, diesel backup, and no single electrical or cooling path whose loss takes the room down. Tier IV is often quoted at a theoretical 99.995% availability. Human error and firmware routinely spend that margin. “Tier V” is a marketing phrase, not an Institute tier.
        </p>
        <p>
          In plain language, without copying a standards table: low tiers have one electrical path and hours of generator fuel. Tier III adds a second, passive path, N+1 UPS, a spare generator for the IT load, and fuel measured in days. Tier IV runs two active paths — 2N — and sizes backup for the whole building plus a spare. Floor loading, flood distance, and how far the site sits from an airport all tighten as the tier rises. The metrics lab lets you pick N, N+1, or 2N as a design choice. It does not certify anything, and it does not add a second set of electrical losses for the duplicate path.
        </p>
      </article>

      <article className="panel stack" id="ai">
        <h2>What AI changes</h2>
        <p>
          Two questions get conflated. The first is the individual hall. AI racks are heavier than the shells they are being dropped into. Air-cooled buildings get redesigned; at least one hyperscaler publicly stopped projects to rework them. One 2024 projection had more than half of data-center capacity aimed at AI by 2028. That is a forecast, not a census. Even if each chip does more work per joule, the rack still wants more absolute power, and the campus still wants a substation, a heat-rejection plant, and firm low-carbon electricity if the operator’s climate books are to stay intact.
        </p>
        <p>
          The second question is the grid total. Skeptics are right that data-center demand has been offset by efficiency before, and that photonic or superconducting chips will not help the queue this decade. They are wrong if they treat leftover PUE as a reservoir. There is not much left. The outcome Potter argues for, and the one this exhibit uses, is the uncomfortable middle: aggregate electricity rises by less than the scare posters, and individual sites still stall on power, water strategy, transformers, and permission.
        </p>
        <p>
          Try the difference in the <Link className="text-link" to="/metrics">metrics lab</Link>. A PUE of 2.4 is the old overhead. A PUE of 1.1 is a modern fleet that has already harvested it. The IT slider is what still moves the substation.
        </p>
      </article>

      <article className="panel stack">
        <h2>How to read this page</h2>
        <p>
          Source essay: {BUILD_SOURCE.author}, “{BUILD_SOURCE.work},” {BUILD_SOURCE.series}, {BUILD_SOURCE.date}. Underlying figures in that essay are credited there to IEA, LBNL, the Uptime Institute, CBRE, SemiAnalysis, Epoch AI, and The Data Center Builder’s Bible. We restated the picture and left the prose, the plots, and the tier matrix behind. Nothing here is a design load, a tariff, or an investment case. For what this model itself is allowed to claim, see{" "}
          <Link className="text-link" to="/methodology">
            methodology
          </Link>
          .
        </p>
        <p>
          <a className="text-link" href={BUILD_SOURCE.href}>
            Original essay
          </a>
        </p>
      </article>
    </main>
  );
}
