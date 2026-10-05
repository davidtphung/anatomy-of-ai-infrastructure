/** Held keys and look deltas. Gameplay reads this from the frame loop only. */

const GAME_KEYS = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "KeyQ",
  "KeyC",
  "KeyE",
  "Space",
  "ShiftLeft",
  "ShiftRight",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ControlLeft",
  "ControlRight",
]);

export const input = {
  keys: new Set<string>(),
  lookX: 0,
  lookY: 0,
  /** Touch / stick strafe, -1..1. Right is positive. */
  stickX: 0,
  /** Touch / stick forward, -1..1. Forward is positive. */
  stickY: 0,
  rise: 0,
  manual: false,
};

export function consumeLook() {
  const x = input.lookX;
  const y = input.lookY;
  input.lookX = 0;
  input.lookY = 0;
  return { x, y };
}

export function bindFlyInput(onManual: () => void) {
  const down = (event: KeyboardEvent) => {
    if (!GAME_KEYS.has(event.code)) return;
    const tag = (event.target as HTMLElement | null)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    event.preventDefault();
    if (!input.keys.has(event.code)) input.manual = true;
    input.keys.add(event.code);
    onManual();
  };
  const up = (event: KeyboardEvent) => {
    input.keys.delete(event.code);
  };
  const clear = () => {
    input.keys.clear();
    input.stickX = 0;
    input.stickY = 0;
    input.rise = 0;
  };
  window.addEventListener("keydown", down);
  window.addEventListener("keyup", up);
  window.addEventListener("blur", clear);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clear();
  });
  return () => {
    window.removeEventListener("keydown", down);
    window.removeEventListener("keyup", up);
    window.removeEventListener("blur", clear);
  };
}

export type ControlsProbe = {
  getYaw: () => number;
  getSpeed: () => number;
  getX: () => number;
  getZ: () => number;
  setKeys: (codes: string[]) => void;
};

declare global {
  interface Window {
    __controlsTest?: ControlsProbe;
  }
}
