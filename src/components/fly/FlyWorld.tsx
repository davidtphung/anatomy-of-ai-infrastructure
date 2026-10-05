import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import * as THREE from "three";
import { input, consumeLook, type ControlsProbe } from "@/fly/input";
import { live } from "@/fly/live";
import { useFly } from "@/fly/store";
import {
  HALL_Z,
  HERO_RACK,
  RACK_D,
  RACK_H,
  RACK_PITCH,
  RACK_W,
  ROW_X,
  SLOTS,
  TOUR,
  hallColliders,
  rackZ,
  resolveAisles,
  stepThermal,
} from "@/fly/spec";

const boxes = hallColliders();
const DoorContext = createContext<THREE.CanvasTexture | null>(null);
const _fwd = new THREE.Vector3();
const _right = new THREE.Vector3();
const _look = new THREE.Vector3();
const _aim = new THREE.Vector3();
const _desired = new THREE.Vector3();
const _lookAt = new THREE.Vector3();

function clamp(v: number, a: number, b: number) {
  return Math.min(b, Math.max(a, v));
}

function aimOf(pos: THREE.Vector3, look: THREE.Vector3) {
  _aim.subVectors(look, pos);
  if (_aim.lengthSq() < 1e-6) _aim.set(0, 0, -1);
  _aim.normalize();
  return {
    yaw: Math.atan2(-_aim.x, -_aim.z),
    pitch: Math.asin(clamp(_aim.y, -0.92, 0.92)),
  };
}

function dampAngle(current: number, target: number, lambda: number, dt: number) {
  let d = target - current;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return current + d * (1 - Math.exp(-lambda * dt));
}

function Pilot() {
  const { camera } = useThree();
  const yaw = useRef(0);
  const pitch = useRef(-0.12);
  const player = useRef(new THREE.Vector3(0, 1.78, 8.15));
  const speed = useRef(0);
  const tourClock = useRef(0);
  const tourApplied = useRef(-1);
  const nonceSeen = useRef(-1);
  const prev = useRef(new THREE.Vector3());

  useEffect(() => {
    const probe: ControlsProbe = {
      getYaw: () => yaw.current,
      getSpeed: () => speed.current,
      getX: () => player.current.x,
      getZ: () => player.current.z,
      setKeys: (codes) => {
        input.keys = new Set(codes);
        useFly.setState({ touring: false, framed: false });
      },
    };
    window.__controlsTest = probe;
    camera.position.copy(player.current);
    return () => {
      if (window.__controlsTest === probe) delete window.__controlsTest;
    };
  }, [camera]);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    const fly = useFly.getState();
    let left = dt;
    while (left > 1e-5) {
      const h = Math.min(1 / 60, left);
      stepThermal(live, h, fly.pumps, fly.workload);
      left -= h;
    }

    const look = consumeLook();
    let gx = 0;
    let gy = 0;
    let grx = 0;
    let gry = 0;
    const pads = navigator.getGamepads?.();
    if (pads) {
      for (const pad of pads) {
        if (!pad || !pad.buttons.some((button) => button.pressed)) continue;
        const mx = Math.hypot(pad.axes[0] ?? 0, pad.axes[1] ?? 0);
        if (mx > 0.2) {
          const s = (mx - 0.2) / 0.8 / mx;
          gx += (pad.axes[0] ?? 0) * s;
          gy += -(pad.axes[1] ?? 0) * s;
        }
        const rx = pad.axes[2] ?? 0;
        const ry = pad.axes[3] ?? 0;
        const rm = Math.hypot(rx, ry);
        if (rm > 0.2) {
          const s = (rm - 0.2) / 0.8 / rm;
          grx += rx * s;
          gry += ry * s;
        }
      }
    }

    const moved =
      input.keys.size > 0 ||
      Math.abs(look.x) + Math.abs(look.y) > 3 ||
      Math.abs(input.stickX) + Math.abs(input.stickY) > 0.25 ||
      input.rise !== 0 ||
      Math.abs(gx) + Math.abs(gy) > 0.05;

    if (moved && (fly.touring || fly.framed)) {
      useFly.setState({ touring: false, framed: false });
    }
    const now = useFly.getState();

    if (now.touring) {
      if (nonceSeen.current !== now.tourNonce) {
        nonceSeen.current = now.tourNonce;
        tourApplied.current = -1;
        tourClock.current = 0;
      }
      if (tourApplied.current !== now.tourStep) {
        tourApplied.current = now.tourStep;
        tourClock.current = 0;
        const shot = TOUR[now.tourStep];
        if (shot) useFly.getState().applyShot(shot);
      }
      tourClock.current += dt;
      const travel = now.reduced ? 0.05 : 4.5;
      const hold = now.reduced ? 1.2 : 2.5;
      const shot = TOUR[now.tourStep] ?? TOUR[0];
      const from = TOUR[Math.max(0, now.tourStep - 1)] ?? shot;
      const u = now.tourStep === 0 ? 1 : Math.min(1, tourClock.current / travel);
      const s = u * u * (3 - 2 * u);
      _desired.set(
        from.pos[0] + (shot.pos[0] - from.pos[0]) * s,
        from.pos[1] + (shot.pos[1] - from.pos[1]) * s,
        from.pos[2] + (shot.pos[2] - from.pos[2]) * s,
      );
      _lookAt.set(
        from.look[0] + (shot.look[0] - from.look[0]) * s,
        from.look[1] + (shot.look[1] - from.look[1]) * s,
        from.look[2] + (shot.look[2] - from.look[2]) * s,
      );
      player.current.copy(_desired);
      const aim = aimOf(player.current, _lookAt);
      yaw.current = aim.yaw;
      pitch.current = aim.pitch;
      if (tourClock.current > travel + hold) {
        if (now.tourStep < TOUR.length - 1) useFly.getState().setTourStep(now.tourStep + 1);
        else useFly.setState({ touring: false });
      }
    } else if (now.framed) {
      const frame = framedPose(now.rack, now.tray, now.campus);
      if (frame) {
        _desired.set(frame.pos[0], frame.pos[1], frame.pos[2]);
        _lookAt.set(frame.look[0], frame.look[1], frame.look[2]);
        const k = 1 - Math.exp(-4.2 * dt);
        player.current.lerp(_desired, k);
        const aim = aimOf(_desired, _lookAt);
        yaw.current = dampAngle(yaw.current, aim.yaw, 2.6, dt);
        pitch.current = dampAngle(pitch.current, aim.pitch, 2.6, dt);
      }
    } else {
      yaw.current -= (look.x + grx * 42) * 0.0026;
      pitch.current = clamp(pitch.current - (look.y + gry * 42) * 0.0022, -1.15, 1.15);
      let fwd = input.stickY + gy;
      let str = input.stickX + gx;
      if (input.keys.has("KeyW") || input.keys.has("ArrowUp")) fwd += 1;
      if (input.keys.has("KeyS") || input.keys.has("ArrowDown")) fwd -= 1;
      if (input.keys.has("KeyD") || input.keys.has("ArrowRight")) str += 1;
      if (input.keys.has("KeyA") || input.keys.has("ArrowLeft")) str -= 1;
      fwd = clamp(fwd, -1, 1);
      str = clamp(str, -1, 1);
      let rise = input.rise;
      if (input.keys.has("Space") || input.keys.has("KeyE")) rise += 1;
      if (input.keys.has("KeyC") || input.keys.has("KeyQ") || input.keys.has("ControlLeft") || input.keys.has("ControlRight")) rise -= 1;
      rise = clamp(rise, -1, 1);
      const sprint = input.keys.has("ShiftLeft") || input.keys.has("ShiftRight");
      const wide = now.campus || player.current.y > 8 || Math.abs(player.current.x) > 14;
      const pace = wide ? (sprint ? 86 : 38) : sprint ? 6.4 : 2.45;
      _fwd.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
      _right.set(Math.cos(yaw.current), 0, -Math.sin(yaw.current));
      prev.current.copy(player.current);
      player.current.addScaledVector(_fwd, fwd * pace * dt);
      player.current.addScaledVector(_right, str * pace * dt);
      player.current.y += rise * pace * 0.72 * dt;
      const outside = player.current.z > HALL_Z + 0.35 && Math.abs(player.current.x) < 1.15;
      const roaming = now.campus || player.current.z > HALL_Z + 0.4 || Math.abs(player.current.x) > 6.2;
      if (!roaming && !outside) {
        const hit = resolveAisles(player.current.x, player.current.z, boxes);
        player.current.x = hit.x;
        player.current.z = hit.z;
        player.current.x = clamp(player.current.x, -5.35, 5.35);
        if (player.current.z > HALL_Z - 0.15 && Math.abs(player.current.x) > 1.15) {
          player.current.z = Math.min(player.current.z, HALL_Z - 0.15);
        }
        player.current.z = clamp(player.current.z, -5.7, 8.4);
        player.current.y = clamp(player.current.y, 0.42, 3.55);
      } else {
        player.current.y = clamp(player.current.y, 0.55, wide ? 140 : 18);
        player.current.x = clamp(player.current.x, -180, 180);
        player.current.z = clamp(player.current.z, -180, 180);
      }
      speed.current = Math.hypot(player.current.x - prev.current.x, player.current.z - prev.current.z) / Math.max(dt, 1e-4);
    }

    const cp = Math.cos(pitch.current);
    _look.set(-Math.sin(yaw.current) * cp, Math.sin(pitch.current), -Math.cos(yaw.current) * cp);
    camera.position.copy(player.current);
    camera.lookAt(player.current.x + _look.x, player.current.y + _look.y, player.current.z + _look.z);
  });

  return null;
}

function framedPose(rack: number | null, tray: number | null, campus: boolean) {
  if (campus) return { pos: [18, 46, 62] as [number, number, number], look: [0, 1.2, 0] as [number, number, number] };
  if (rack == null) return null;
  const left = rack < 8;
  const index = left ? rack : rack - 8;
  const z = rackZ(index);
  if (tray != null && SLOTS[tray]) {
    const y = SLOTS[tray].y;
    return left
      ? { pos: [0.05, y + 0.22, z + 0.42] as [number, number, number], look: [-0.95, y, z] as [number, number, number] }
      : { pos: [-0.05, y + 0.22, z + 0.42] as [number, number, number], look: [0.95, y, z] as [number, number, number] };
  }
  return left
    ? { pos: [0.2, 1.32, z] as [number, number, number], look: [-1.25, 1.2, z] as [number, number, number] }
    : { pos: [-0.2, 1.32, z] as [number, number, number], look: [1.25, 1.2, z] as [number, number, number] };
}

function makeDoorTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 512;
  const g = canvas.getContext("2d");
  if (!g) return null;
  g.fillStyle = "#465266";
  g.fillRect(0, 0, 128, 512);
  for (let y = 14; y < 500; y += 18) {
    g.fillStyle = "#1c2430";
    g.fillRect(12, y, 88, 11);
    g.strokeStyle = "#8ea0b8";
    g.strokeRect(12, y, 88, 11);
  }
  g.fillStyle = "#7ec8c3";
  g.fillRect(6, 16, 5, 476);
  g.fillStyle = "#e8a317";
  g.fillRect(108, 16, 8, 476);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makeFloorTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const g = canvas.getContext("2d");
  if (!g) return null;
  g.fillStyle = "#2a3140";
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 3500; i += 1) {
    const a = 0.015 + Math.random() * 0.03;
    g.fillStyle = `rgba(244,239,230,${a})`;
    g.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }
  g.strokeStyle = "rgba(232,163,23,0.45)";
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(256, 0);
  g.lineTo(256, 512);
  g.stroke();
  g.strokeStyle = "rgba(126,200,195,0.18)";
  g.lineWidth = 10;
  g.beginPath();
  g.moveTo(248, 0);
  g.lineTo(248, 512);
  g.moveTo(264, 0);
  g.lineTo(264, 512);
  g.stroke();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 8);
  return tex;
}

function Flows() {
  const focus = useFly((s) => s.focus);
  const pumps = useFly((s) => s.pumps);
  const power = useMemo(() => rowLine(ROW_X, 3.32, rackZ(0) - 0.2, rackZ(7) + 0.2), []);
  const powerB = useMemo(() => rowLine(-ROW_X, 3.32, rackZ(0) - 0.2, rackZ(7) + 0.2), []);
  const water = useMemo(() => rowLine(-ROW_X - RACK_D / 2 - 0.12, 0.72, rackZ(0) - 0.9, rackZ(7) + 0.3), []);
  const waterB = useMemo(() => rowLine(ROW_X + RACK_D / 2 + 0.12, 0.72, rackZ(0) - 0.9, rackZ(7) + 0.3), []);
  const data = useMemo(() => rowLine(0, 3.08, rackZ(0), rackZ(7)), []);
  const pa = layerGain(focus, "power");
  const wa = layerGain(focus, "water") * (pumps ? 1 : 0.15);
  const da = layerGain(focus, "data");
  return (
    <>
      <Stream points={power} color="#e8a317" count={48} speed={0.22} gain={pa} />
      <Stream points={powerB} color="#e8a317" count={48} speed={0.22} gain={pa} />
      <Stream points={water} color="#7ec8c3" count={56} speed={pumps ? 0.28 : 0.02} gain={wa} />
      <Stream points={waterB} color="#7ec8c3" count={56} speed={pumps ? 0.28 : 0.02} gain={wa} />
      <Stream points={data} color="#e7c4a2" count={40} speed={0.45} gain={da} />
    </>
  );
}

function layerGain(focus: string, layer: string) {
  if (focus === "all") return 0.75;
  return focus === layer ? 1 : 0.08;
}

function rowLine(x: number, y: number, z0: number, z1: number) {
  return [new THREE.Vector3(x, y, z0), new THREE.Vector3(x, y, z1)];
}

function Stream({
  points,
  color,
  count,
  speed,
  gain,
}: {
  points: THREE.Vector3[];
  color: string;
  count: number;
  speed: number;
  gain: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const geo = useMemo(() => new THREE.SphereGeometry(1, 6, 6), []);
  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, depthWrite: false }),
    [color],
  );
  const seeds = useMemo(() => Array.from({ length: count }, () => Math.random()), [count]);
  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat],
  );
  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime * speed;
    for (let i = 0; i < count; i += 1) {
      const u = (seeds[i] + t) % 1;
      dummy.position.lerpVectors(points[0], points[1], u);
      dummy.position.y += Math.sin(u * 12 + i) * 0.012;
      dummy.scale.setScalar((0.035 + (i % 5) * 0.004) * (0.35 + gain));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mat.opacity = 0.12 + gain * 0.82;
  });
  return <instancedMesh ref={ref} args={[geo, mat, count]} />;
}

function Rack({ index, side }: { index: number; side: -1 | 1 }) {
  const id = side === -1 ? index : index + 8;
  const open = useFly((s) => s.rack === id && !s.campus);
  const tray = useFly((s) => (s.rack === id ? s.tray : null));
  const door = useRef<THREE.Group>(null);
  const trays = useRef<(THREE.Group | null)[]>([]);
  const angle = useRef(0);
  const z = rackZ(index);
  const doorMap = useContext(DoorContext);

  useFrame((_, dt) => {
    const openAmount = open ? 1 : 0;
    angle.current += (openAmount - angle.current) * (1 - Math.exp(-7 * dt));
    if (door.current) {
      door.current.position.z = RACK_W / 2 - 0.02 + angle.current * 0.92;
      door.current.rotation.y = 0;
    }
    for (let i = 0; i < SLOTS.length; i += 1) {
      const g = trays.current[i];
      if (!g) continue;
      const pull = open && tray === i ? 0.62 : 0;
      g.position.x += (pull - g.position.x) * (1 - Math.exp(-6 * dt));
    }
  });

  return (
    <group position={[side * ROW_X, RACK_H / 2, z]} rotation={[0, side === 1 ? Math.PI : 0, 0]}>
      <mesh
        castShadow
        receiveShadow
        onClick={(event) => {
          event.stopPropagation();
          const state = useFly.getState();
          if (state.rack === id && !state.campus) state.openRack(null);
          else state.openRack(id);
        }}
      >
        <boxGeometry args={[RACK_D, RACK_H, RACK_W]} />
        <meshStandardMaterial color="#8b97a8" metalness={0.62} roughness={0.36} />
      </mesh>
      <mesh position={[0, -RACK_H / 2 + 0.02, 0]}>
        <boxGeometry args={[RACK_D + 0.08, 0.04, RACK_W + 0.08]} />
        <meshStandardMaterial color="#0c0e12" roughness={1} />
      </mesh>
      <group ref={door} position={[RACK_D / 2 + 0.01, 0, RACK_W / 2 - 0.02]}>
        <mesh position={[0.02, 0, -RACK_W / 2 + 0.02]} castShadow>
          <boxGeometry args={[0.045, RACK_H * 0.96, RACK_W * 0.94]} />
          <meshStandardMaterial map={doorMap ?? undefined} color="#d5dde8" metalness={0.35} roughness={0.48} emissive="#243044" emissiveIntensity={0.35} />
        </mesh>
      </group>
      <mesh position={[RACK_D / 2 + 0.04, RACK_H * 0.28, -RACK_W * 0.36]}>
        <boxGeometry args={[0.02, 0.55, 0.045]} />
        <LedPulse />
      </mesh>
      {open
        ? SLOTS.map((slot) => (
            <group
              key={slot.index}
              ref={(node) => {
                trays.current[slot.index] = node;
              }}
              position={[0, slot.y - RACK_H / 2, 0]}
              onClick={(event) => {
                event.stopPropagation();
                if (slot.kind === "compute") useFly.getState().pullTray(slot.index);
              }}
            >
              <mesh>
                <boxGeometry args={[RACK_D * 0.86, slot.h * 0.86, RACK_W * 0.78]} />
                <meshStandardMaterial
                  color={slot.kind === "power" ? "#3a2c22" : slot.kind === "switch" ? "#243038" : "#2a313c"}
                  metalness={0.45}
                  roughness={0.42}
                  emissive={slot.kind === "compute" ? "#12343a" : "#000000"}
                  emissiveIntensity={slot.kind === "compute" ? 0.25 : 0}
                />
              </mesh>
              {tray === slot.index && slot.kind === "compute" ? <TrayGuts /> : null}
            </group>
          ))
        : null}
    </group>
  );
}

function TrayGuts() {
  const gpus = [-0.22, -0.07, 0.08, 0.23];
  return (
    <group position={[0.02, 0.045, 0]}>
      <mesh>
        <boxGeometry args={[0.72, 0.012, 0.42]} />
        <meshStandardMaterial color="#8d9a96" metalness={0.82} roughness={0.22} emissive="#1a3a3a" emissiveIntensity={0.35} />
      </mesh>
      {gpus.map((z) => (
        <group key={z} position={[0.02, 0.02, z]}>
          <mesh>
            <boxGeometry args={[0.16, 0.02, 0.09]} />
            <meshStandardMaterial color="#101216" metalness={0.5} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.012, 0]}>
            <boxGeometry args={[0.045, 0.006, 0.045]} />
            <meshStandardMaterial color="#d7fff4" emissive="#7ec8c3" emissiveIntensity={0.7} />
          </mesh>
          <mesh position={[-0.07, 0.01, 0.03]}>
            <boxGeometry args={[0.03, 0.008, 0.02]} />
            <meshStandardMaterial color="#1d2430" />
          </mesh>
          <mesh position={[-0.07, 0.01, -0.03]}>
            <boxGeometry args={[0.03, 0.008, 0.02]} />
            <meshStandardMaterial color="#1d2430" />
          </mesh>
        </group>
      ))}
      {[-0.34, 0.34].map((z) => (
        <mesh key={z} position={[-0.18, 0.016, z * 0.35]}>
          <boxGeometry args={[0.1, 0.016, 0.1]} />
          <meshStandardMaterial color="#1b222c" metalness={0.4} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function useDoor() {
  const tex = useMemo(() => makeDoorTexture(), []);
  useEffect(() => () => tex?.dispose(), [tex]);
  return tex;
}

function LedPulse() {
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((state) => {
    const m = mat.current;
    if (!m) return;
    const t = live.chipC;
    if (t < 80) m.emissive.set("#3ddc97");
    else if (t < 92) m.emissive.set("#e8a317");
    else m.emissive.set("#e24b3a");
    m.emissiveIntensity = 0.7 + Math.sin(state.clock.elapsedTime * (t > 92 ? 9 : 3)) * 0.25;
  });
  return (
    <meshStandardMaterial ref={mat} color="#07110c" emissive="#3ddc97" emissiveIntensity={1} />
  );
}

function HallShell() {
  const floor = useMemo(() => makeFloorTexture(), []);
  useEffect(() => () => floor?.dispose(), [floor]);
  const campus = useFly((s) => s.campus);
  return (
    <group visible={!campus}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.4]} receiveShadow>
        <planeGeometry args={[12.4, 14]} />
        <meshStandardMaterial map={floor ?? undefined} color={floor ? "#ffffff" : "#12161c"} roughness={0.92} metalness={0.04} />
      </mesh>
      <mesh position={[0, 2, -5.85]}>
        <boxGeometry args={[12.2, 4, 0.12]} />
        <meshStandardMaterial color="#2c3544" roughness={1} />
      </mesh>
      <mesh position={[-6.05, 2, 0.3]}>
        <boxGeometry args={[0.12, 4, 12.4]} />
        <meshStandardMaterial color="#2c3544" roughness={1} />
      </mesh>
      <mesh position={[6.05, 2, 0.3]}>
        <boxGeometry args={[0.12, 4, 12.4]} />
        <meshStandardMaterial color="#2c3544" roughness={1} />
      </mesh>
      <mesh position={[-3.6, 1.7, HALL_Z]}>
        <boxGeometry args={[5, 3.4, 0.16]} />
        <meshStandardMaterial color="#2c3544" roughness={1} />
      </mesh>
      <mesh position={[3.6, 1.7, HALL_Z]}>
        <boxGeometry args={[5, 3.4, 0.16]} />
        <meshStandardMaterial color="#2c3544" roughness={1} />
      </mesh>
      <mesh position={[0, 3.45, HALL_Z]}>
        <boxGeometry args={[2.4, 0.9, 0.16]} />
        <meshStandardMaterial color="#2c3544" roughness={1} />
      </mesh>
      <mesh position={[0, 3.92, 0.2]}>
        <boxGeometry args={[12, 0.08, 13.2]} />
        <meshStandardMaterial color="#0e1116" roughness={1} />
      </mesh>
      {[-1.6, 1.6].map((x) => (
        <mesh key={x} position={[x, 3.84, 0]}>
          <boxGeometry args={[0.12, 0.05, 10.5]} />
          <meshStandardMaterial color="#f7fbff" emissive="#f4efe6" emissiveIntensity={1.6} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 18]}>
        <planeGeometry args={[80, 40]} />
        <meshStandardMaterial color="#0d1014" roughness={1} />
      </mesh>
    </group>
  );
}

function Infrastructure() {
  const focus = useFly((s) => s.focus);
  const pumps = useFly((s) => s.pumps);
  const fan = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (fan.current && pumps) fan.current.rotation.y += dt * 2.4;
  });
  const powerI = focus === "power" || focus === "all" ? 0.55 : 0.05;
  const waterI = (focus === "water" || focus === "all" ? 0.45 : 0.05) * (pumps ? 1 : 0.2);
  const dataI = focus === "data" || focus === "all" ? 0.4 : 0.04;
  const len = RACK_PITCH * 7 + 0.8;
  return (
    <group>
      {[ROW_X, -ROW_X].map((x) => (
        <group key={x}>
          <mesh position={[x, 3.32, 0]}>
            <boxGeometry args={[0.16, 0.1, len]} />
            <meshStandardMaterial color="#2a241c" metalness={0.7} roughness={0.35} emissive="#e8a317" emissiveIntensity={powerI} />
          </mesh>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={i} position={[x, 2.78, rackZ(i)]}>
              <cylinderGeometry args={[0.025, 0.025, 1.05, 8]} />
              <meshStandardMaterial color="#3a3228" emissive="#e8a317" emissiveIntensity={powerI * 0.5} />
            </mesh>
          ))}
          <mesh position={[x + Math.sign(x) * (RACK_D / 2 + 0.12), 0.72, -0.15]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.055, 0.055, len + 0.4, 12]} />
            <meshStandardMaterial color="#245652" metalness={0.55} roughness={0.28} emissive="#7ec8c3" emissiveIntensity={waterI} />
          </mesh>
          <mesh position={[x + Math.sign(x) * (RACK_D / 2 + 0.12), 1.7, -0.15]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, len + 0.2, 10]} />
            <meshStandardMaterial color="#1c3e42" emissive="#7ec8c3" emissiveIntensity={waterI * 0.7} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 3.08, 0]}>
        <boxGeometry args={[0.42, 0.08, len - 0.2]} />
        <meshStandardMaterial color="#4a3428" metalness={0.75} roughness={0.3} emissive="#e7c4a2" emissiveIntensity={dataI} />
      </mesh>
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[0, 3.02, rackZ(0) + i * 1.5]}>
          <boxGeometry args={[0.5, 0.1, 0.34]} />
          <meshStandardMaterial color="#2c241e" metalness={0.6} roughness={0.4} emissive="#e7c4a2" emissiveIntensity={dataI} />
        </mesh>
      ))}
      {[-1, 1].map((side) => {
        const z = rackZ(0) - 1.05;
        const x = side * ROW_X;
        return (
          <group
            key={side}
            position={[x, 0, z]}
            onClick={(event) => {
              event.stopPropagation();
              useFly.setState({ focus: "water", framed: true, touring: false, campus: false });
            }}
          >
            <mesh position={[0, 1.05, 0]} castShadow>
              <boxGeometry args={[1.05, 2.1, 0.9]} />
              <meshStandardMaterial color="#1b2428" metalness={0.55} roughness={0.4} />
            </mesh>
            <mesh position={[0, 1.35, 0.46]}>
              <boxGeometry args={[0.7, 0.7, 0.04]} />
              <meshStandardMaterial color="#102224" emissive="#7ec8c3" emissiveIntensity={waterI * 1.4} />
            </mesh>
            <mesh ref={side === -1 ? fan : undefined} position={[0, 2.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.28, 0.28, 0.06, 16]} />
              <meshStandardMaterial color="#243036" metalness={0.6} roughness={0.35} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function CampusField() {
  const campus = useFly((s) => s.campus);
  const body = useRef<THREE.InstancedMesh>(null);
  const glow = useRef<THREE.InstancedMesh>(null);
  const bodyGeo = useMemo(() => new THREE.BoxGeometry(9.2, 1.1, 6.4), []);
  const glowGeo = useMemo(() => new THREE.BoxGeometry(1.1, 0.08, 5.2), []);
  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1a1f27", metalness: 0.4, roughness: 0.6 }), []);
  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#7ec8c3" }), []);
  useEffect(
    () => () => {
      bodyGeo.dispose();
      glowGeo.dispose();
      bodyMat.dispose();
      glowMat.dispose();
    },
    [bodyGeo, glowGeo, bodyMat, glowMat],
  );
  useEffect(() => {
    if (!campus) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    let n = 0;
    const pitch = 16;
    for (let r = 0; r < 20 && n < 393; r += 1) {
      for (let c = 0; c < 20 && n < 393; c += 1) {
        const x = (c - 9.5) * pitch;
        const z = (r - 9.5) * pitch;
        if (Math.abs(x) < 14 && Math.abs(z) < 14) continue;
        dummy.position.set(x, 0.55, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        body.current?.setMatrixAt(n, dummy.matrix);
        dummy.position.set(x, 0.42, z);
        dummy.updateMatrix();
        glow.current?.setMatrixAt(n, dummy.matrix);
        color.setHSL(0.55, 0.05, 0.12 + ((r + c) % 4) * 0.015);
        body.current?.setColorAt(n, color);
        n += 1;
      }
    }
    if (body.current) {
      body.current.count = n;
      body.current.instanceMatrix.needsUpdate = true;
      if (body.current.instanceColor) body.current.instanceColor.needsUpdate = true;
    }
    if (glow.current) {
      glow.current.count = n;
      glow.current.instanceMatrix.needsUpdate = true;
    }
  }, [campus]);
  if (!campus) return null;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[420, 420]} />
        <meshStandardMaterial color="#10141a" roughness={1} />
      </mesh>
      <Grid
        args={[360, 360]}
        position={[0, 0.02, 0]}
        cellSize={16}
        cellThickness={0.4}
        sectionSize={16}
        sectionThickness={1.1}
        cellColor="#2a3140"
        sectionColor="#3c4658"
        fadeDistance={240}
        infiniteGrid={false}
      />
      <instancedMesh ref={body} args={[bodyGeo, bodyMat, 393]} />
      <instancedMesh ref={glow} args={[glowGeo, glowMat, 393]} />
    </group>
  );
}

function Scene() {
  const campus = useFly((s) => s.campus);
  const door = useDoor();
  return (
    <DoorContext.Provider value={door}>
      <color attach="background" args={[campus ? "#10141a" : "#243044"]} />
      <fog attach="fog" args={[campus ? "#10141a" : "#1a2230", campus ? 40 : 18, campus ? 220 : 46]} />
      <hemisphereLight args={["#e7eef6", "#2a3344", 0.9]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[8, 14, 10]} intensity={2.4} color="#fff6ea" />
      <directionalLight position={[-6, 8, -2]} intensity={0.7} color="#9adbd4" />
      <pointLight position={[0, 3.1, 2]} intensity={18} distance={16} decay={2} color="#f4efe6" />
      <pointLight position={[0, 2.2, -2]} intensity={10} distance={14} decay={2} color="#7ec8c3" />
      <HallShell />
      <Infrastructure />
      <Flows />
      {([-1, 1] as const).map((side) =>
        Array.from({ length: 8 }, (_, index) => <Rack key={`${side}-${index}`} index={index} side={side} />),
      )}
      <CampusField />
      <Pilot />
    </DoorContext.Provider>
  );
}

export function FlyCanvas() {
  return (
    <Canvas
      className="fly-canvas"
      dpr={[1, 1.6]}
      camera={{ position: [0, 1.78, 8.15], fov: 52, near: 0.08, far: 460 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onPointerMissed={() => {
        if (useFly.getState().rack != null && !useFly.getState().touring) {
          useFly.getState().openRack(null);
        }
      }}
    >
      <Scene />
    </Canvas>
  );
}

export const heroRackId = HERO_RACK;
