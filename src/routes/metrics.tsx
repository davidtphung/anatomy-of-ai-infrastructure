import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { coolingLabel, evaluateScenario, SCENARIO_NOTE } from "@/lib/calculations";
import { formatCompact, formatMw, formatNumber, formatUsd } from "@/lib/format";
import { useInfra } from "@/lib/store";
import type { CoolingMethod } from "@/data/types";

export const Route = createFileRoute("/metrics")({
  head: () => ({ meta: [{ title: "Metrics lab — Anatomy of AI Infrastructure" }] }),
  component: MetricsPage,
});

const METHODS: CoolingMethod[] = ["air", "chilled", "dtc", "rear-door", "dry", "immersion"];

function MetricsPage() {
  const scenario = useInfra((state) => state.scenario);
  const set = useInfra((state) => state.setScenario);
  const result = useMemo(() => evaluateScenario(scenario), [scenario]);

  return (
    <main className="page">
      <p className="eyebrow">Educational scenario model</p>
      <h1 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", margin: "0.2rem 0 0.6rem" }}>
        Megawatts, water, and a bill that is not a forecast.
      </h1>
      <p className="lede">{SCENARIO_NOTE}</p>
      <p className="callout">
        Context, not an input: surveyed PUE for large sites was near 2.5 around 2007 and a little above 1.5 later, with the best fleets near 1.1. Air is generally comfortable near 20–30 kW a rack. A rough airflow minimum is about 120 cubic feet per minute per kilowatt. The{" "}
        <Link className="text-link" to="/build">
          power page
        </Link>{" "}
        is where those dated public estimates live, in this exhibit’s own words.
      </p>
      <div className="hero" style={{ width: "100%", minHeight: 0, marginTop: "1rem" }}>
        <form className="panel stack" onSubmit={(event) => event.preventDefault()}>
          <Slider label="IT load" value={scenario.itLoadMw} min={1} max={200} step={1} suffix="MW" onChange={(value) => set({ itLoadMw: value })} />
          <Slider label="PUE" value={scenario.pue} min={1.05} max={2.4} step={0.01} digits={2} onChange={(value) => set({ pue: value })} />
          <Slider label="Average rack" value={scenario.avgRackKw} min={4} max={150} step={1} suffix="kW" onChange={(value) => set({ avgRackKw: value })} />
          <Slider label="Utilization" value={scenario.utilization} min={0.1} max={1} step={0.01} digits={2} onChange={(value) => set({ utilization: value })} />
          <Slider label="Grid carbon" value={scenario.carbonGPerKwh} min={20} max={900} step={10} suffix="g/kWh" onChange={(value) => set({ carbonGPerKwh: value })} />
          <Slider label="Energy price" value={scenario.energyPricePerMwh} min={15} max={250} step={1} suffix="$/MWh" onChange={(value) => set({ energyPricePerMwh: value })} />
          <label className="slider">
            <span>Cooling method</span>
            <select className="select" value={scenario.cooling} onChange={(event) => set({ cooling: event.target.value as CoolingMethod })}>
              {METHODS.map((method) => (
                <option key={method} value={method}>
                  {coolingLabel(method)}
                </option>
              ))}
            </select>
          </label>
          <label className="slider">
            <span>Water stress context</span>
            <select
              className="select"
              value={scenario.waterStress}
              onChange={(event) => set({ waterStress: event.target.value as "low" | "medium" | "high" })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <div className="chain" role="group" aria-label="Redundancy assumption">
            {(["N", "N+1", "2N"] as const).map((item) => (
              <button key={item} type="button" className="chip" data-on={scenario.redundancy === item ? "true" : "false"} onClick={() => set({ redundancy: item })}>
                {item}
              </button>
            ))}
          </div>
          <p className="micro">
            Redundancy is shown as a design choice. This calculator does not add a second set of losses for 2N. PUE is facility energy over IT energy. It is not water, carbon, or useful work.
          </p>
        </form>
        <div className="stack">
          {result.stranded ? (
            <p className="warn">Utilization is under 45%. Nameplate megawatts can sit stranded: the building is energized and the accelerators are not earning their keep.</p>
          ) : null}
          <div className="metric-grid">
            <Metric label="Facility load" value={formatMw(result.facilityMw)} note="IT nameplate × PUE" />
            <Metric label="IT draw" value={formatMw(result.itMwDrawn)} note="Nameplate × utilization" />
            <Metric label="Annual energy" value={`${formatNumber(result.annualFacilityGwh, 2)} GWh`} note="Drawn IT × PUE × 8,760 h" />
            <Metric label="Racks" value={formatNumber(result.rackCount)} note={`${formatNumber(scenario.avgRackKw)} kW average`} />
            <Metric label="Illustrative GPUs" value={formatCompact(result.illustrativeGpuCount, 0)} note="8 per server when racks are dense. Zero under 15 kW." />
            <Metric label="WUE" value={`${formatNumber(result.wueLPerKwh, 2)} L/kWh`} note={coolingLabel(scenario.cooling)} />
            <Metric label="Water" value={`${formatCompact(result.annualWaterM3, 1)} m³`} note={`${formatCompact(result.annualWaterGal, 0)} gal, illustrative`} />
            <Metric label="Operational CO₂e" value={`${formatCompact(result.operationalTco2e, 1)} t`} note="Electricity only. Not embodied." />
            <Metric label="Energy cost" value={formatUsd(result.annualEnergyCost)} note="Price × facility MWh" />
            <Metric label="Energy per GPU-hour" value={result.energyPerGpuHour ? `$${formatNumber(result.energyPerGpuHour, 3)}` : "—"} note="Cost, not a market price" />
          </div>
          <p className="micro">
            Water-stress setting ({scenario.waterStress}) is context, not a multiplier. A dry cooler in a high-stress basin still matters politically even when WUE is low. {scenario.redundancy} does not change the arithmetic above.
          </p>
          <EnergySplit it={result.itMwDrawn} cooling={result.coolingShareMw} electrical={result.electricalLossMw} other={result.otherOverheadMw} />
        </div>
      </div>
    </main>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  digits = 0,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  digits?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="slider">
      <span>
        {label} · {formatNumber(value, digits)} {suffix}
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="card">
      <p className="kicker">{label}</p>
      <p className="metric-value">{value}</p>
      <p className="micro">{note}</p>
    </article>
  );
}

function EnergySplit({ it, cooling, electrical, other }: { it: number; cooling: number; electrical: number; other: number }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const data = [
    { name: "IT draw", mw: Number(it.toFixed(2)) },
    { name: "Cooling share", mw: Number(cooling.toFixed(2)) },
    { name: "Electrical loss", mw: Number(electrical.toFixed(2)) },
    { name: "Other overhead", mw: Number(other.toFixed(2)) },
  ];
  return (
    <article className="panel">
      <p className="kicker">Where the drawn megawatts sit</p>
      <p className="micro">Overhead is split 70 / 25 / 5 cooling, electrical, other — a teaching split, not a metered one-line.</p>
      <div style={{ width: "100%", height: "16rem" }}>
        {ready ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#a39c90" tick={{ fill: "#a39c90", fontSize: 12 }} />
              <YAxis stroke="#a39c90" tick={{ fill: "#a39c90", fontSize: 12 }} unit=" MW" width={70} />
              <Tooltip
                contentStyle={{ background: "#181c24", border: "1px solid #313846", color: "#f4efe6" }}
                formatter={(value) => [`${value} MW`, "Load"]}
              />
              <Bar dataKey="mw" fill="#e8a317" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="micro">Chart loads with the page.</p>
        )}
      </div>
    </article>
  );
}
