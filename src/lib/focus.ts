import { anchorFor, buildLayout } from "@/components/three/layout";
import { useInfra } from "@/lib/store";

const SERVER_ZOOM = new Set(["gpu-server", "nic", "cold-plate", "rack-pdu", "tor-switch", "cdu"]);
const PACKAGE_ZOOM = new Set(["accelerator", "hbm"]);

export function focusComponent(id: string) {
  const state = useInfra.getState();
  const layout = buildLayout(state.era, 1);
  const anchor = anchorFor(layout, id);
  state.select(id, anchor?.position ?? null);
  if (anchor) state.requestCamera(anchor.camera, anchor.position);
  if (PACKAGE_ZOOM.has(id) || SERVER_ZOOM.has(id)) {
    state.setRackOpen(true);
    state.setRackZoom(PACKAGE_ZOOM.has(id) ? "package" : "server");
  }
}
