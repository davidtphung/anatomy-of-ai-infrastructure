import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import type { FlowPath } from "@/components/three/layout";

export function FlowParticles({
  paths,
  enabled,
  motion,
}: {
  paths: FlowPath[];
  enabled: (path: FlowPath) => boolean;
  motion: boolean;
}) {
  const visible = paths.filter(enabled);
  return (
    <group>
      {visible.map((path) => (
        <FlowLine key={path.id} path={path} motion={motion} />
      ))}
    </group>
  );
}

function FlowLine({ path, motion }: { path: FlowPath; motion: boolean }) {
  const count = 18;
  const ref = useRef<THREE.Points>(null);
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(path.points.map((point) => new THREE.Vector3(...point))),
    [path.points],
  );
  const seeds = useMemo(() => Array.from({ length: count }, (_, index) => index / count), []);
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (!motion || !ref.current) return;
    const attribute = ref.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    const offset = (clock.elapsedTime * 0.07) % 1;
    for (let index = 0; index < count; index += 1) {
      const point = curve.getPoint((seeds[index] + offset) % 1);
      attribute.setXYZ(index, point.x, point.y, point.z);
    }
    attribute.needsUpdate = true;
  });

  return (
    <group>
      <Line points={path.points} color={path.color} lineWidth={1.4} transparent opacity={0.85} />
      {motion ? (
        <points ref={ref} geometry={geometry}>
          <pointsMaterial color={path.color} size={0.22} sizeAttenuation transparent opacity={0.95} />
        </points>
      ) : null}
    </group>
  );
}

export function Pipe({
  a,
  b,
  color,
  radius,
}: {
  a: [number, number, number];
  b: [number, number, number];
  color: string;
  radius: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const args = useMemo(() => {
    const start = new THREE.Vector3(...a);
    const end = new THREE.Vector3(...b);
    const length = Math.max(0.05, start.distanceTo(end));
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const direction = end.clone().sub(start).normalize();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    return { mid, length, quaternion };
  }, [a, b]);

  return (
    <mesh ref={ref} position={args.mid} quaternion={args.quaternion}>
      <cylinderGeometry args={[radius, radius, args.length, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.35} metalness={0.25} />
    </mesh>
  );
}
