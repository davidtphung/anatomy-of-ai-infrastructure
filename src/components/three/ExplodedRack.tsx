import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { PALETTE } from "@/components/three/palette";
import { useInfra } from "@/lib/store";

const TRAYS = 6;

export function ExplodedRack() {
  const explode = useInfra((state) => state.explode);
  const zoom = useInfra((state) => state.rackZoom);
  const reduced = useInfra((state) => state.reducedMotion);
  const select = useInfra((state) => state.select);
  const quality = useInfra((state) => state.quality);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const camera = useMemo(() => {
    if (zoom === "package") return { position: [1.6, 1.15, 2.1] as [number, number, number], target: [0, 0.9, 0] as [number, number, number] };
    if (zoom === "server") return { position: [2.4, 1.6, 2.8] as [number, number, number], target: [0, 1.05, 0] as [number, number, number] };
    return { position: [3.4, 2.2, 4.2] as [number, number, number], target: [0, 1.2, 0] as [number, number, number] };
  }, [zoom]);

  if (!ready) return <div className="stage-fallback">Opening the rack</div>;

  return (
    <Canvas
      dpr={quality === "low" ? [1, 1] : [1, 1.5]}
      camera={{ position: camera.position, fov: 38, near: 0.02, far: 40 }}
      gl={{ antialias: quality !== "low", alpha: false }}
    >
      <color attach="background" args={["#0c0e12"]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 6, 3]} intensity={1.6} color={"#fff6e8"} />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} color={"#67e8f9"} />
      <pointLight position={[0, 2, 1]} intensity={4} color={PALETTE.compute} distance={8} />
      <RackModel explode={explode} zoom={zoom} onPick={(id) => select(id, [0, 1, 0])} />
      <OrbitControls
        makeDefault
        enableDamping
        target={camera.target}
        autoRotate={!reduced && zoom === "cabinet"}
        autoRotateSpeed={0.45}
        minDistance={0.6}
        maxDistance={9}
      />
    </Canvas>
  );
}

function RackModel({
  explode,
  zoom,
  onPick,
}: {
  explode: number;
  zoom: "cabinet" | "server" | "package";
  onPick: (id: string) => void;
}) {
  const focusTray = 3;
  return (
    <group>
      {[-0.55, 0.55].map((x) =>
        [-0.4, 0.4].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 1.25, z]}>
            <boxGeometry args={[0.06, 2.5, 0.06]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.25} />
          </mesh>
        )),
      )}
      <mesh position={[-0.72, 1.2, 0]} onClick={(event) => { event.stopPropagation(); onPick("rack-pdu"); }}>
        <boxGeometry args={[0.08, 2.1, 0.12]} />
        <meshStandardMaterial color={PALETTE.lv} emissive={PALETTE.lv} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.72, 1.2, 0]} onClick={(event) => { event.stopPropagation(); onPick("rack-pdu"); }}>
        <boxGeometry args={[0.08, 2.1, 0.12]} />
        <meshStandardMaterial color={PALETTE.battery} emissive={PALETTE.battery} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[-0.85, 1.2, 0.15]} onClick={(event) => { event.stopPropagation(); onPick("cdu"); }}>
        <cylinderGeometry args={[0.05, 0.05, 2.2, 12]} />
        <meshStandardMaterial color={PALETTE.supplyWater} emissive={PALETTE.supplyWater} emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0.85, 1.2, 0.15]} onClick={(event) => { event.stopPropagation(); onPick("cold-plate"); }}>
        <cylinderGeometry args={[0.05, 0.05, 2.2, 12]} />
        <meshStandardMaterial color={PALETTE.returnWater} emissive={PALETTE.returnWater} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 2.45, -0.15]} onClick={(event) => { event.stopPropagation(); onPick("tor-switch"); }}>
        <boxGeometry args={[1.15, 0.14, 0.45]} />
        <meshStandardMaterial color="#0e7490" emissive={PALETTE.network} emissiveIntensity={0.45} metalness={0.6} roughness={0.3} />
      </mesh>
      {Array.from({ length: TRAYS }).map((_, index) => {
        const spread = (index - (TRAYS - 1) / 2) * explode * 0.34;
        const y = 0.35 + index * 0.32 + spread;
        const faded = zoom !== "cabinet" && index !== focusTray;
        return (
          <Tray
            key={index}
            y={y}
            faded={faded}
            detailed={zoom !== "cabinet" && index === focusTray}
            atoms={zoom === "package" && index === focusTray}
            onPick={onPick}
          />
        );
      })}
    </group>
  );
}

function Tray({
  y,
  faded,
  detailed,
  atoms,
  onPick,
}: {
  y: number;
  faded: boolean;
  detailed: boolean;
  atoms: boolean;
  onPick: (id: string) => void;
}) {
  const opacity = faded ? 0.12 : 1;
  return (
    <group position={[0, y, detailed ? 0.35 : 0]}>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onPick("gpu-server");
        }}
      >
        <boxGeometry args={[1.25, 0.16, 0.72]} />
        <meshStandardMaterial color="#111827" metalness={0.7} roughness={0.35} transparent opacity={opacity} />
      </mesh>
      {Array.from({ length: 8 }).map((_, gpu) => {
        const col = gpu % 4;
        const row = Math.floor(gpu / 4);
        const x = -0.42 + col * 0.28;
        const z = -0.12 + row * 0.24;
        return (
          <group key={gpu} position={[x, 0.12, z]}>
            <mesh
              onClick={(event) => {
                event.stopPropagation();
                onPick("accelerator");
              }}
            >
              <boxGeometry args={[0.2, 0.08, 0.16]} />
              <meshStandardMaterial
                color="#2e1064"
                emissive={PALETTE.compute}
                emissiveIntensity={detailed ? 0.7 : 0.35}
                metalness={0.45}
                roughness={0.3}
                transparent
                opacity={opacity}
              />
            </mesh>
            <mesh position={[-0.05, 0.05, 0]} onClick={(event) => { event.stopPropagation(); onPick("hbm"); }}>
              <boxGeometry args={[0.05, 0.02, 0.08]} />
              <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.3} transparent opacity={opacity} />
            </mesh>
          </group>
        );
      })}
      <mesh
        position={[0, 0.07, 0]}
        onClick={(event) => {
          event.stopPropagation();
          onPick("cold-plate");
        }}
      >
        <boxGeometry args={[1.05, 0.02, 0.42]} />
        <meshStandardMaterial color={PALETTE.chilled} emissive={PALETTE.chilled} emissiveIntensity={0.25} transparent opacity={opacity} />
      </mesh>
      <mesh position={[0.52, 0.1, -0.22]} onClick={(event) => { event.stopPropagation(); onPick("nic"); }}>
        <boxGeometry args={[0.12, 0.06, 0.1]} />
        <meshStandardMaterial color="#083344" emissive={PALETTE.network} emissiveIntensity={0.8} transparent opacity={opacity} />
      </mesh>
      {atoms ? <Lattice /> : null}
    </group>
  );
}

function Lattice() {
  const points = useMemo(() => {
    const list: [number, number, number][] = [];
    for (let x = -2; x <= 2; x += 1) {
      for (let y = -1; y <= 1; y += 1) {
        for (let z = -2; z <= 2; z += 1) {
          list.push([x * 0.16, 0.45 + y * 0.16, z * 0.16]);
        }
      }
    }
    return list;
  }, []);
  return (
    <group>
      {points.map((point, index) => (
        <mesh key={index} position={point}>
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshStandardMaterial color="#e5e7eb" emissive="#e8a317" emissiveIntensity={index % 7 === 0 ? 0.8 : 0.05} metalness={0.2} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}
