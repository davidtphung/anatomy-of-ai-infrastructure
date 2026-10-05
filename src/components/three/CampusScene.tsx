import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { buildLayout, type SceneNode } from "@/components/three/layout";
import { FlowParticles, Pipe } from "@/components/three/FlowParticles";
import { PALETTE } from "@/components/three/palette";
import { layerOn, useInfra } from "@/lib/store";
import type { Vec3 } from "@/data/types";

type ControlsLike = { target: THREE.Vector3; update: () => void } | null;

export function CampusViewport({
  variant = "full",
  interactive = true,
}: {
  variant?: "full" | "hero";
  interactive?: boolean;
}) {
  const quality = useInfra((state) => state.quality);
  const reduced = useInfra((state) => state.reducedMotion);
  const [ready, setReady] = useState(false);
  const [orbiting, setOrbiting] = useState(false);
  useEffect(() => setReady(true), []);
  const dpr: [number, number] = quality === "high" ? [1, 1.6] : quality === "low" ? [1, 1] : [1, 1.25];

  if (!ready) {
    return (
      <div className="stage-fallback">
        <p>Preparing the campus model</p>
      </div>
    );
  }

  return (
    <Canvas
      shadows={quality === "high"}
      dpr={dpr}
      camera={{ position: [58, 32, 46], fov: 38, near: 0.1, far: 400 }}
      gl={{ antialias: quality !== "low", alpha: false, powerPreference: "high-performance" }}
      fallback={<div className="stage-fallback">WebGL is unavailable on this device. The atlas still has every system in text.</div>}
    >
      <color attach="background" args={["#0c0e12"]} />
      <fog attach="fog" args={["#0c0e12", variant === "hero" ? 40 : 60, 170]} />
      <hemisphereLight args={["#b7c7db", "#12161e", 0.62]} />
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[40, 54, 18]}
        intensity={1.65}
        color={"#fff3dd"}
        castShadow={quality === "high"}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-30, 20, -24]} intensity={0.4} color={"#7dd3fc"} />
      <CampusWorld variant={variant} />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={6}
        maxDistance={variant === "hero" ? 90 : 150}
        autoRotate={variant === "hero" && !reduced && !orbiting}
        autoRotateSpeed={0.28}
        enablePan={interactive}
        enabled={interactive}
        onStart={() => setOrbiting(true)}
      />
    </Canvas>
  );
}

function CampusWorld({ variant }: { variant: "full" | "hero" }) {
  const era = useInfra((state) => state.era);
  const quality = useInfra((state) => state.quality);
  const mode = useInfra((state) => state.mode);
  const layers = useInfra((state) => state.layers);
  const buildPhase = useInfra((state) => state.buildPhase);
  const reduced = useInfra((state) => state.reducedMotion);
  const select = useInfra((state) => state.select);
  const toggleCompare = useInfra((state) => state.toggleCompare);
  const selectedPosition = useInfra((state) => state.selectedPosition);
  const rackScale = quality === "low" ? 0.5 : variant === "hero" ? 0.65 : 1;
  const layout = useMemo(() => buildLayout(era, rackScale), [era, rackScale]);
  const phaseCap = mode === "build" ? buildPhase : 10;
  const show = (layer: SceneNode["layer"], phase: number) =>
    phase <= phaseCap && layerOn({ layers, mode, buildPhase }, layer);

  const pick = (id: string, point: Vec3, shift: boolean) => {
    if (variant === "hero") return;
    if (shift) toggleCompare(id);
    select(id, point);
  };

  return (
    <group key={era}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} receiveShadow>
        <planeGeometry args={[240, 240]} />
        <meshStandardMaterial color={PALETTE.ground} roughness={1} metalness={0} />
      </mesh>
      {quality !== "low" ? (
        <Grid
          args={[180, 180]}
          position={[6, 0.01, 0]}
          cellSize={1}
          cellThickness={0.45}
          sectionSize={10}
          sectionThickness={1}
          cellColor="#1e293b"
          sectionColor="#334155"
          fadeDistance={100}
          fadeStrength={1.5}
          infiniteGrid={false}
        />
      ) : null}
      <Road />
      {show("building", 2)
        ? layout.fences.map((post, index) => (
            <mesh key={`fence-${index}`} position={[post[0], 1.05, post[2]]}>
              <boxGeometry args={[0.1, 2.1, 0.1]} />
              <meshStandardMaterial color="#64748b" metalness={0.45} roughness={0.45} />
            </mesh>
          ))
        : null}
      {show("power", 1)
        ? layout.towers.map((tower, index) => <LatticeTower key={`tower-${index}`} position={tower} />)
        : null}
      {layout.halls
        .filter((hall) => show("building", hall.minPhase))
        .map((hall, index) => (
          <Hall key={`hall-${index}`} position={hall.position} size={hall.size} onPick={pick} />
        ))}
      {layout.raisedFloor && layout.halls[0] ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[layout.halls[0].position[0], 0.42, layout.halls[0].position[2]]}>
          <planeGeometry args={[layout.halls[0].size[0] - 1.2, layout.halls[0].size[2] - 1.2]} />
          <meshStandardMaterial color="#475569" transparent opacity={0.28} roughness={0.8} />
        </mesh>
      ) : null}
      {show("compute", 8) ? (
        <Racks positions={layout.racks} size={layout.rackSize} liquid={layout.liquid} onPick={pick} />
      ) : null}
      {layout.nodes
        .filter((item) => show(item.layer, item.minPhase))
        .map((item, index) => (
          <Equipment key={`${item.id}-${index}`} node={item} onPick={pick} />
        ))}
      {layout.pipes
        .filter((pipe) => show(pipe.layer, pipe.minPhase))
        .map((pipe, index) => (
          <Pipe key={`pipe-${index}`} a={pipe.a} b={pipe.b} color={pipe.color} radius={pipe.radius} />
        ))}
      <FlowParticles paths={layout.flows} enabled={(path) => show(path.layer, path.minPhase)} motion={!reduced} />
      {selectedPosition && variant !== "hero" ? <Beacon position={selectedPosition} /> : null}
      <CameraDirector home={layout.camera} />
    </group>
  );
}

function Road() {
  return (
    <group>
      <mesh position={[10, 0.02, 28]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7, 80]} />
        <meshStandardMaterial color="#141922" roughness={1} />
      </mesh>
      <mesh position={[0, 0.025, 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[90, 4.5]} />
        <meshStandardMaterial color="#141922" roughness={1} />
      </mesh>
    </group>
  );
}

function Hall({
  position,
  size,
  onPick,
}: {
  position: Vec3;
  size: Vec3;
  onPick: (id: string, point: Vec3, shift: boolean) => void;
}) {
  const [w, h, d] = size;
  const wall = 0.32;
  return (
    <group position={position}>
      <mesh
        position={[0, 0.16, 0]}
        receiveShadow
        onClick={(event) => {
          event.stopPropagation();
          onPick("data-hall", [position[0], 2, position[2]], event.nativeEvent.shiftKey);
        }}
      >
        <boxGeometry args={[w, 0.32, d]} />
        <meshStandardMaterial color="#1b2330" metalness={0.25} roughness={0.78} />
      </mesh>
      <mesh position={[0, h - 0.1, 0]}>
        <boxGeometry args={[w, 0.16, d]} />
        <meshStandardMaterial color="#93c5fd" transparent opacity={0.08} metalness={0.8} roughness={0.15} />
      </mesh>
      <mesh position={[-w / 2 + wall / 2, h / 2, 0]}>
        <boxGeometry args={[wall, h, d]} />
        <meshStandardMaterial color="#334155" metalness={0.48} roughness={0.42} />
      </mesh>
      <mesh position={[w / 2 - wall / 2, h / 2, 0]}>
        <boxGeometry args={[wall, h, d]} />
        <meshStandardMaterial color="#334155" metalness={0.48} roughness={0.42} />
      </mesh>
      <mesh position={[0, h / 2, -d / 2 + wall / 2]}>
        <boxGeometry args={[w, h, wall]} />
        <meshStandardMaterial color="#3b475c" metalness={0.42} roughness={0.46} />
      </mesh>
      {Array.from({ length: 4 }).map((_, index) => {
        const x = -w / 2 + 2 + index * ((w - 4) / 3);
        return (
          <mesh key={index} position={[x, h / 2, 0]}>
            <boxGeometry args={[0.22, h - 0.4, 0.22]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.72} roughness={0.28} />
          </mesh>
        );
      })}
      <pointLight position={[0, h * 0.55, 0]} intensity={6} distance={Math.max(w, d)} color={"#c4b5fd"} />
    </group>
  );
}

function Equipment({
  node,
  onPick,
}: {
  node: SceneNode;
  onPick: (id: string, point: Vec3, shift: boolean) => void;
}) {
  const selected = useInfra((state) => state.selectedId === node.id);
  const radial = node.shape === "box" ? null : node.size;
  return (
    <mesh
      position={node.position}
      castShadow
      onClick={(event) => {
        event.stopPropagation();
        const world = event.object.getWorldPosition(new THREE.Vector3());
        onPick(node.id, [world.x, world.y, world.z], event.nativeEvent.shiftKey);
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        const target = node.position;
        useInfra.getState().requestCamera([target[0] + 11, target[1] + 7, target[2] + 11], target);
        useInfra.getState().select(node.id, target);
      }}
    >
      {radial ? (
        <cylinderGeometry args={[radial[0] / 2, node.shape === "tank" ? radial[0] / 2.4 : radial[0] / 2.15, radial[1], 18]} />
      ) : (
        <boxGeometry args={node.size} />
      )}
      <meshStandardMaterial
        color={selected ? "#f8f1e3" : node.color}
        emissive={node.emissive ?? "#000"}
        emissiveIntensity={selected ? 0.28 : (node.emissiveIntensity ?? 0)}
        metalness={node.metalness ?? 0.5}
        roughness={node.roughness ?? 0.4}
        transparent={node.opacity !== undefined && node.opacity < 1}
        opacity={node.opacity ?? 1}
      />
    </mesh>
  );
}

function Racks({
  positions,
  size,
  liquid,
  onPick,
}: {
  positions: Vec3[];
  size: Vec3;
  liquid: boolean;
  onPick: (id: string, point: Vec3, shift: boolean) => void;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const glow = useRef<THREE.InstancedMesh>(null);
  const rackGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const glowGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const rackMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: liquid ? "#160c1d" : "#1a2330", metalness: 0.74, roughness: 0.3 }),
    [liquid],
  );
  const glowMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: liquid ? PALETTE.compute : "#38bdf8", toneMapped: false }),
    [liquid],
  );
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    positions.forEach((position, index) => {
      dummy.position.set(position[0], size[1] / 2 + 0.25, position[2]);
      dummy.scale.set(size[0], size[1], size[2]);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      ref.current?.setMatrixAt(index, dummy.matrix);
      dummy.scale.set(size[0] * 0.18, size[1] * 0.62, 0.05);
      dummy.position.set(position[0], size[1] / 2 + 0.25, position[2] + size[2] / 2 + 0.01);
      dummy.updateMatrix();
      glow.current?.setMatrixAt(index, dummy.matrix);
    });
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
    if (glow.current) glow.current.instanceMatrix.needsUpdate = true;
  }, [positions, size]);

  if (positions.length === 0) return null;
  return (
    <group>
      <instancedMesh
        ref={ref}
        args={[rackGeo, rackMat, positions.length]}
        castShadow
        onClick={(event) => {
          event.stopPropagation();
          const index = event.instanceId ?? 0;
          const position = positions[index] ?? positions[0];
          onPick("gpu-rack", position, event.nativeEvent.shiftKey);
        }}
        onDoubleClick={(event) => {
          event.stopPropagation();
          const index = event.instanceId ?? 0;
          const position = positions[index] ?? positions[0];
          useInfra.getState().select("gpu-rack", position);
          useInfra.getState().setRackOpen(true);
        }}
      />
      <instancedMesh ref={glow} args={[glowGeo, glowMat, positions.length]} />
    </group>
  );
}

function LatticeTower({ position }: { position: Vec3 }) {
  const legs: Vec3[] = [
    [-1.1, 0, -1.1],
    [1.1, 0, -1.1],
    [-1.1, 0, 1.1],
    [1.1, 0, 1.1],
  ];
  return (
    <group
      position={position}
      onClick={(event) => {
        event.stopPropagation();
        useInfra.getState().select("transmission-line", [position[0], 8, position[2]]);
      }}
    >
      {legs.map((leg, index) => (
        <mesh key={index} position={[leg[0] * 0.45, 7, leg[2] * 0.45]}>
          <boxGeometry args={[0.16, 14, 0.16]} />
          <meshStandardMaterial color="#e7e5e4" metalness={0.78} roughness={0.25} />
        </mesh>
      ))}
      {[4, 8, 12].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[2.1, 0.08, 2.1]} />
          <meshStandardMaterial color="#d6d3d1" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 13.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 6, 8]} />
        <meshStandardMaterial color={PALETTE.hv} emissive={PALETTE.hv} emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

function Beacon({ position }: { position: Vec3 }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 3) * 0.12;
    ref.current.scale.setScalar(pulse);
  });
  return (
    <mesh ref={ref} position={[position[0], Math.max(1.4, position[1] + 1.2), position[2]]}>
      <sphereGeometry args={[0.22, 16, 16]} />
      <meshBasicMaterial color="#e8a317" />
    </mesh>
  );
}

function CameraDirector({ home }: { home: { position: Vec3; target: Vec3 } }) {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls) as ControlsLike;
  const request = useInfra((state) => state.cameraRequest);
  const reduced = useInfra((state) => state.reducedMotion);
  const booted = useRef(false);
  const from = useRef(new THREE.Vector3());
  const to = useRef(new THREE.Vector3());
  const lookFrom = useRef(new THREE.Vector3());
  const lookTo = useRef(new THREE.Vector3());
  const anim = useRef({ t: 1, active: false });
  const nonce = useRef(0);

  useEffect(() => {
    booted.current = false;
  }, [home]);

  useFrame((_, delta) => {
    if (!booted.current && controls) {
      camera.position.set(home.position[0], home.position[1], home.position[2]);
      controls.target.set(home.target[0], home.target[1], home.target[2]);
      controls.update();
      booted.current = true;
    }
    if (!request || request.nonce === nonce.current) {
      if (!anim.current.active) return;
    } else {
      nonce.current = request.nonce;
      from.current.copy(camera.position);
      to.current.set(request.position[0], request.position[1], request.position[2]);
      lookFrom.current.copy(controls?.target ?? new THREE.Vector3());
      lookTo.current.set(request.target[0], request.target[1], request.target[2]);
      anim.current = { t: reduced ? 1 : 0, active: true };
    }
    if (!anim.current.active || !controls) return;
    anim.current.t = Math.min(1, anim.current.t + delta * 1.5);
    const k = 1 - (1 - anim.current.t) ** 3;
    camera.position.lerpVectors(from.current, to.current, k);
    controls.target.lerpVectors(lookFrom.current, lookTo.current, k);
    controls.update();
    if (anim.current.t >= 1) anim.current.active = false;
  });

  return null;
}
