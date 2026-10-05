import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FlyCanvas } from "@/components/fly/FlyWorld";
import { Hud } from "@/components/fly/Hud";
import { bindFlyInput, input } from "@/fly/input";
import { useFly } from "@/fly/store";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) useFly.getState().setReduced(true);
    return bindFlyInput(() => {
      useFly.setState({ touring: false, framed: false });
    });
  }, []);

  return (
    <div
      className="fly-root"
      onPointerDown={(event) => {
        if (!canLook(event.target)) return;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        input.lookX += event.movementX;
        input.lookY += event.movementY;
      }}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="fly-stage">{ready ? <FlyCanvas /> : <p className="fly-fallback">Lining up the cold aisle</p>}</div>
      <div className="fly-vignette" />
      <div className="fly-cross" aria-hidden="true" />
      <Hud />
    </div>
  );
}

function canLook(target: EventTarget | null) {
  return target instanceof Element && !target.closest("button, a, .fly-stick, .fly-notes, .fly-dock, .fly-rise");
}
