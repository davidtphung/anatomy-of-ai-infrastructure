import { useEffect, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import { live } from "@/fly/live";
import { input } from "@/fly/input";
import { useFly } from "@/fly/store";
import {
  BUS_V,
  CAMPUS,
  COMPUTE_TRAYS,
  CPUS,
  FLOW_LPM,
  FP4_DENSE,
  FP4_SPARSE,
  GPUS,
  HBM_TB,
  HERO_RACK,
  HERO_TRAY,
  HOME_KW,
  NVLINK_TB_S,
  PUE,
  RACK_KW,
  SHELF_KW,
  SHELVES,
  SWITCH_TRAYS,
  TOUR,
} from "@/fly/spec";

function useLive() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 120);
    return () => window.clearInterval(id);
  }, []);
  void tick;
  return live;
}

export function Hud() {
  const t = useLive();
  const focus = useFly((s) => s.focus);
  const workload = useFly((s) => s.workload);
  const pumps = useFly((s) => s.pumps);
  const touring = useFly((s) => s.touring);
  const tourStep = useFly((s) => s.tourStep);
  const campus = useFly((s) => s.campus);
  const rack = useFly((s) => s.rack);
  const tray = useFly((s) => s.tray);
  const notes = useFly((s) => s.notes);
  const hot = t.chipC >= 90;
  const shot = touring ? TOUR[tourStep] : null;

  return (
    <>
      <p className="sr-only">
        Cold Aisle is a fly-through of a sixteen-rack liquid-cooled AI training pod. Play the tour, or use W A S D to move, drag to look, Space to rise and C to drop.
      </p>
      <header className="fly-top">
        <div className="fly-brand">
          <p className="kicker">Cold aisle</p>
          <strong>Sixteen racks. One pod.</strong>
          <span>Drag to look. WASD to fly the aisle.</span>
        </div>
        <div className="fly-readout" data-hot={hot ? "true" : "false"}>
          <p className="fly-temp">
            {t.chipC.toFixed(1)}
            <small>°C</small>
          </p>
          <p className="fly-sub">
            package · {t.rackKw.toFixed(0)} kW · {t.flowLpm.toFixed(0)} L/min
          </p>
          <p className="fly-sub">
            supply {t.supplyC.toFixed(0)}° · return {t.flowLpm < 5 ? "stalled" : `${t.returnC.toFixed(1)}°`} · liquid {t.liquidKw.toFixed(0)} kW
          </p>
        </div>
      </header>

      {shot ? (
        <div className="fly-caption">
          <p className="kicker">
            Tour {tourStep + 1} / {TOUR.length}
          </p>
          <h2>{shot.title}</h2>
          <p>{shot.body}</p>
        </div>
      ) : null}

      {hot && !campus ? <p className="fly-alarm">Pumps are down. Heat is staying in the package.</p> : null}

      <div className="fly-dock">
        <div className="fly-row">
          <button type="button" className="btn" onClick={() => useFly.getState().setTouring(true)}>
            {touring ? "Tour running" : "Play the tour"}
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => useFly.setState({ touring: false, framed: false, campus: false })}
          >
            Take the stick
          </button>
          <button type="button" className="btn-ghost" onClick={() => useFly.getState().setNotes(!notes)}>
            {notes ? "Close notes" : "Notes"}
          </button>
        </div>
        <div className="fly-row" role="group" aria-label="Follow a flow">
          <Chip on={focus === "all"} label="Everything" click={() => useFly.getState().setFocus("all")} />
          <Chip on={focus === "power"} label="Power" click={() => useFly.getState().setFocus("power")} />
          <Chip on={focus === "water"} label="Water" click={() => useFly.getState().setFocus("water")} />
          <Chip on={focus === "data"} label="Data" click={() => useFly.getState().setFocus("data")} />
        </div>
        <div className="fly-row" role="group" aria-label="Workload">
          <Chip on={workload === "training" && pumps} label="Training 132 kW" click={() => useFly.getState().setWorkload("training")} />
          <Chip on={workload === "inference"} label="Inference est." click={() => useFly.getState().setWorkload("inference")} />
          <Chip on={workload === "idle"} label="Idle est." click={() => useFly.getState().setWorkload("idle")} />
          <button
            type="button"
            className="chip"
            data-on={!pumps ? "true" : "false"}
            onClick={() => useFly.getState().setPumps(!pumps)}
          >
            {pumps ? "Stop the pumps" : "Pumps stopped"}
          </button>
        </div>
        <div className="fly-row">
          <button type="button" className="btn-ghost" data-on={rack != null && tray == null ? "true" : "false"} onClick={() => useFly.getState().openRack(HERO_RACK)}>
            Open a rack
          </button>
          <button type="button" className="btn-ghost" data-on={tray != null ? "true" : "false"} onClick={() => useFly.getState().pullTray(HERO_TRAY)}>
            Pull a tray
          </button>
          <button type="button" className="btn-ghost" data-on={campus ? "true" : "false"} onClick={() => useFly.getState().setCampus(!campus)}>
            {campus ? "Back to the aisle" : "Scale to a gigawatt"}
          </button>
        </div>
        <p className="fly-keys">W A S D move · drag look · Space rise · C drop · Shift faster · click a cabinet</p>
      </div>

      <Stick />
      <div className="fly-rise">
        <button type="button" className="btn-ghost" onPointerDown={() => (input.rise = 1)} onPointerUp={() => (input.rise = 0)} onPointerCancel={() => (input.rise = 0)}>
          Up
        </button>
        <button type="button" className="btn-ghost" onPointerDown={() => (input.rise = -1)} onPointerUp={() => (input.rise = 0)} onPointerCancel={() => (input.rise = 0)}>
          Down
        </button>
      </div>

      {notes ? <Notes onClose={() => useFly.getState().setNotes(false)} /> : null}
      {campus ? (
        <p className="fly-campus">
          {CAMPUS.pods.toLocaleString("en-US")} pods · {CAMPUS.racks.toLocaleString("en-US")} racks · {CAMPUS.itMw.toFixed(0)} MW IT ·{" "}
          {CAMPUS.facilityMw.toFixed(0)} MW at PUE {PUE} · about {Math.round(CAMPUS.homes / 1000)}k homes
        </p>
      ) : null}
    </>
  );
}

function Chip({ on, label, click }: { on: boolean; label: string; click: () => void }) {
  return (
    <button type="button" className="chip" data-on={on ? "true" : "false"} onClick={click}>
      {label}
    </button>
  );
}

function Stick() {
  return (
    <div
      className="fly-stick"
      aria-label="Move"
      onPointerDown={(event) => {
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        nudge(event.currentTarget, event);
      }}
      onPointerMove={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        nudge(event.currentTarget, event);
      }}
      onPointerUp={() => {
        input.stickX = 0;
        input.stickY = 0;
      }}
      onPointerCancel={() => {
        input.stickX = 0;
        input.stickY = 0;
      }}
    >
      <span />
    </div>
  );
}

function nudge(node: HTMLDivElement, event: ReactPointerEvent<HTMLDivElement>) {
  const rect = node.getBoundingClientRect();
  const dx = event.clientX - (rect.left + rect.width / 2);
  const dy = event.clientY - (rect.top + rect.height / 2);
  const max = rect.width * 0.36;
  const m = Math.hypot(dx, dy) || 1;
  const k = Math.min(1, m / max);
  input.stickX = (dx / m) * k;
  input.stickY = -(dy / m) * k;
  input.manual = true;
}

function Notes({ onClose }: { onClose: () => void }) {
  return (
    <aside className="fly-notes">
      <div className="fly-notes-card">
        <p className="kicker">Teaching model, not a drawing</p>
        <h2>What is real, and what is estimated</h2>
        <p>
          Each cabinet follows the public pattern for a rack-scale accelerator system: {GPUS} accelerators and {CPUS} CPUs, {COMPUTE_TRAYS} compute trays, {SWITCH_TRAYS} switch trays, {HBM_TB} TB of high-bandwidth memory, {NVLINK_TB_S} TB/s inside the rack, {FP4_DENSE} petaflops dense FP4 ({FP4_SPARSE} with sparsity). Nominal draw is {RACK_KW} kW through {SHELVES} shelves of about {SHELF_KW} kW on a roughly {BUS_V} volt DC bus.
        </p>
        <p>
          Direct liquid is taken as most of the heat. One coolant unit feeds eight racks at {FLOW_LPM} liters a minute. Supply is held at 32 °C. The return rise is heat divided by mass flow and the specific heat of water. Package temperature rides above the coolant on a resistance chosen so a healthy rack sits in the 60s. Inference at 70 kW and idle at 36 kW are estimates. Thermal mass is an estimate too.
        </p>
        <p>
          Stop the pumps and the liquid path closes. A throttle above 88 °C keeps the package from running away; it settles near 100 °C on what air can still carry. In a real hall that is a shutdown, not a spectacle.
        </p>
        <p>
          A gigawatt-class site here is {CAMPUS.pods} pods, {CAMPUS.racks.toLocaleString("en-US")} racks, {CAMPUS.itMw.toFixed(0)} MW of IT. At PUE {PUE} the facility is {CAMPUS.facilityMw.toFixed(0)} MW, about {Math.round(CAMPUS.homes).toLocaleString("en-US")} homes at {HOME_KW} kW. Builders do not all stack the trays this way. Click a cabinet, or a compute tray once it is open.
        </p>
        <p>
          Air cooling is generally asked to handle about 20–30 kW a rack, sometimes near 50 kW with a rear-door exchanger. Published AI racks sit above 40 kW and around 120 kW. This cabinet is in that heavier band. Why the industry counts halls in megawatts, why PUE’s easy cuts are already spent, and why a building is often faster than the grid, is on the{" "}
          <Link className="text-link" to="/build">
            power page
          </Link>
          . Those figures are dated public estimates, written here, not copied from the essay they come from.
        </p>
        <button type="button" className="btn" onClick={onClose}>
          Back to the aisle
        </button>
      </div>
    </aside>
  );
}
