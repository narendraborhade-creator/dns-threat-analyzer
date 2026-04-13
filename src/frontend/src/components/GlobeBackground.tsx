import { Line, Sphere } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// ─── Globe Mesh ────────────────────────────────────────────────────────────────

function GlobeWireframe() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.06;
      groupRef.current.rotation.x = Math.sin(Date.now() * 0.0003) * 0.08;
    }
  });

  // Generate lat/lon grid lines
  const gridLines = useMemo(() => {
    const lines: { id: string; points: THREE.Vector3[] }[] = [];
    const R = 2.2;

    // Latitude lines
    for (let lat = -75; lat <= 75; lat += 25) {
      const phi = (lat * Math.PI) / 180;
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        points.push(
          new THREE.Vector3(
            R * Math.cos(phi) * Math.cos(theta),
            R * Math.sin(phi),
            R * Math.cos(phi) * Math.sin(theta),
          ),
        );
      }
      lines.push({ id: `lat-${lat}`, points });
    }

    // Longitude lines
    for (let lon = 0; lon < 360; lon += 30) {
      const theta = (lon * Math.PI) / 180;
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= 48; i++) {
        const phi = (i / 48) * Math.PI - Math.PI / 2;
        points.push(
          new THREE.Vector3(
            R * Math.cos(phi) * Math.cos(theta),
            R * Math.sin(phi),
            R * Math.cos(phi) * Math.sin(theta),
          ),
        );
      }
      lines.push({ id: `lon-${lon}`, points });
    }

    return lines;
  }, []);

  // DNS query arc nodes — glowing points on globe surface
  const queryNodes = useMemo(() => {
    const nodes = [
      { id: "nyc", lat: 40.7, lon: -74.0, color: "#ff2040" },
      { id: "lon", lat: 51.5, lon: -0.12, color: "#00ff88" },
      { id: "tyo", lat: 35.7, lon: 139.7, color: "#ffd700" },
      { id: "syd", lat: -33.9, lon: 151.2, color: "#00ff88" },
      { id: "par", lat: 48.9, lon: 2.35, color: "#ffd700" },
      { id: "hkg", lat: 22.3, lon: 114.2, color: "#ff2040" },
      { id: "sgp", lat: 1.35, lon: 103.8, color: "#00ff88" },
      { id: "sfo", lat: 37.8, lon: -122.4, color: "#ffd700" },
      { id: "mow", lat: 55.7, lon: 37.6, color: "#ff2040" },
      { id: "gru", lat: -23.5, lon: -46.6, color: "#00ff88" },
    ];

    return nodes.map(({ id, lat, lon, color }) => {
      const phi = (lat * Math.PI) / 180;
      const theta = (lon * Math.PI) / 180;
      const R = 2.22;
      return {
        id,
        color,
        pos: new THREE.Vector3(
          R * Math.cos(phi) * Math.cos(theta),
          R * Math.sin(phi),
          R * Math.cos(phi) * Math.sin(theta),
        ),
      };
    });
  }, []);

  return (
    <group ref={groupRef}>
      {/* Wireframe grid lines */}
      {gridLines.map((line) => (
        <Line
          key={line.id}
          points={line.points}
          color="#00cfff"
          lineWidth={0.4}
          transparent
          opacity={0.15}
        />
      ))}

      {/* Globe surface - subtle */}
      <Sphere args={[2.18, 64, 64]}>
        <meshBasicMaterial
          color="#020518"
          transparent
          opacity={0.6}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Outer atmosphere glow */}
      <Sphere args={[2.4, 32, 32]}>
        <meshBasicMaterial
          color="#00cfff"
          transparent
          opacity={0.02}
          side={THREE.FrontSide}
        />
      </Sphere>

      {/* Query node dots */}
      {queryNodes.map((node) => (
        <mesh key={node.id} position={node.pos}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color={node.color} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Pulsing Ring ─────────────────────────────────────────────────────────────

function PulsingRing() {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      const t = clock.getElapsedTime();
      ringRef.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.05);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.06 + Math.sin(t * 0.8) * 0.03;
    }
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[2.6, 0.015, 8, 128]} />
      <meshBasicMaterial color="#00cfff" transparent opacity={0.06} />
    </mesh>
  );
}

// ─── Globe Scene ───────────────────────────────────────────────────────────────

function GlobeScene() {
  const sceneRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (sceneRef.current) {
      sceneRef.current.position.y =
        Math.sin(clock.getElapsedTime() * 0.3) * 0.06;
    }
  });

  return (
    <group ref={sceneRef}>
      <GlobeWireframe />
      <PulsingRing />
      <ambientLight intensity={0.1} />
      <pointLight position={[5, 5, 5]} intensity={0.3} color="#00cfff" />
      <pointLight position={[-5, -3, -3]} intensity={0.2} color="#ff2040" />
    </group>
  );
}

// ─── GlobeBackground Component ────────────────────────────────────────────────

interface GlobeBackgroundProps {
  className?: string;
}

export function GlobeBackground({ className = "" }: GlobeBackgroundProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <GlobeScene />
      </Canvas>
    </div>
  );
}
