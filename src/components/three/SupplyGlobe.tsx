import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { SUPPLY_NODES } from "@/data/supply";
import { useInfra } from "@/lib/store";

function latLon(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

export function SupplyGlobe({ activeId }: { activeId: string | null }) {
  const reduced = useInfra((state) => state.reducedMotion);
  const quality = useInfra((state) => state.quality);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) {
    return (
      <div className="stage-fallback">
        <p>Preparing the supply map</p>
      </div>
    );
  }
  return (
    <Canvas camera={{ position: [0, 0.4, 3.3], fov: 42 }} dpr={quality === "low" ? 1 : [1, 1.5]} gl={{ antialias: true, alpha: false }}>
      <color attach="background" args={["#0c0e12"]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 2, 3]} intensity={1.5} color={"#fff4df"} />
      <GlobeDots />
      <Markers activeId={activeId} />
      <OrbitControls enablePan={false} autoRotate={!reduced} autoRotateSpeed={0.4} minDistance={2.2} maxDistance={6} />
    </Canvas>
  );
}

function GlobeDots() {
  const geometry = useMemo(() => {
    const list: number[] = [];
    for (let lat = -70; lat <= 75; lat += 4) {
      for (let lon = -180; lon < 180; lon += 4) {
        if (!roughLand(lat, lon)) continue;
        const point = latLon(lat, lon, 1.02);
        list.push(point.x, point.y, point.z);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(list), 3));
    return geo;
  }, []);
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.98, 48, 32]} />
        <meshStandardMaterial color="#121722" metalness={0.25} roughness={0.8} />
      </mesh>
      <points geometry={geometry}>
        <pointsMaterial color="#e7e5e4" size={0.02} sizeAttenuation />
      </points>
    </group>
  );
}

function Markers({ activeId }: { activeId: string | null }) {
  const campus = SUPPLY_NODES.find((node) => node.id === "campus");
  const campusPoint = campus ? latLon(campus.lat, campus.lon, 1.08) : null;
  return (
    <group>
      {SUPPLY_NODES.map((node) => {
        const point = latLon(node.lat, node.lon, 1.08);
        const active = activeId === node.id || (activeId !== null && node.componentIds.includes(activeId));
        return (
          <mesh key={node.id} position={point}>
            <sphereGeometry args={[active ? 0.04 : 0.022, 12, 12]} />
            <meshBasicMaterial color={node.id === "campus" ? "#e8a317" : active ? "#22d3ee" : "#fafaf9"} />
          </mesh>
        );
      })}
      {campusPoint
        ? SUPPLY_NODES.filter((node) => {
            if (node.id === "campus") return false;
            if (!activeId) return false;
            return node.id === activeId || node.componentIds.includes(activeId);
          }).map((node) => (
            <Arc key={`arc-${node.id}`} a={latLon(node.lat, node.lon, 1.08)} b={campusPoint} />
          ))
        : null}
    </group>
  );
}

function Arc({ a, b }: { a: THREE.Vector3; b: THREE.Vector3 }) {
  const ref = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(1.4);
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    return new THREE.TubeGeometry(curve, 28, 0.008, 5, false);
  }, [a, b]);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const material = ref.current.material as THREE.MeshBasicMaterial;
    material.opacity = 0.4 + Math.sin(clock.elapsedTime * 2) * 0.25;
  });
  return (
    <mesh ref={ref} geometry={geometry}>
      <meshBasicMaterial color="#e8a317" transparent opacity={0.75} />
    </mesh>
  );
}

function roughLand(lat: number, lon: number): boolean {
  const box = (lat0: number, lat1: number, lon0: number, lon1: number) =>
    lat >= lat0 && lat <= lat1 && lon >= lon0 && lon <= lon1;
  return (
    box(25, 70, -168, -52) ||
    box(7, 48, -118, -68) ||
    box(-55, 13, -82, -34) ||
    box(36, 71, -11, 42) ||
    box(-35, 37, -18, 52) ||
    box(12, 40, 32, 60) ||
    box(6, 55, 60, 145) ||
    box(-8, 28, 94, 122) ||
    box(-44, -11, 112, 154) ||
    box(31, 46, 129, 146)
  );
}
