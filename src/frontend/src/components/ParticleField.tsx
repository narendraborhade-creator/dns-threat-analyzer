import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// ─── Particle System ──────────────────────────────────────────────────────────

interface ParticleData {
  positions: Float32Array;
  velocities: Float32Array;
  colors: Float32Array;
  count: number;
}

function createParticles(count: number): ParticleData {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  // Neon color palette: red, yellow, green, cyan
  const palette = [
    [1.0, 0.13, 0.25], // neon red
    [1.0, 0.84, 0.0], // neon yellow
    [0.0, 1.0, 0.53], // neon green
    [0.0, 0.81, 1.0], // neon cyan
  ];

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 30;
    positions[i3 + 1] = (Math.random() - 0.5) * 12;
    positions[i3 + 2] = (Math.random() - 0.5) * 10 - 3;

    velocities[i3] = (Math.random() - 0.5) * 0.008;
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.004;
    velocities[i3 + 2] = 0;

    const color = palette[Math.floor(Math.random() * palette.length)];
    colors[i3] = color[0];
    colors[i3 + 1] = color[1];
    colors[i3 + 2] = color[2];
  }

  return { positions, velocities, colors, count };
}

function Particles({ count = 280 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const data = useMemo(() => createParticles(count), [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(data.positions.slice(), 3),
    );
    geo.setAttribute("color", new THREE.Float32BufferAttribute(data.colors, 3));
    return geo;
  }, [data]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.045,
        vertexColors: true,
        transparent: true,
        opacity: 0.65,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );

  useFrame(({ clock }) => {
    const positions = geometry.attributes.position as THREE.BufferAttribute;
    const pos = positions.array as Float32Array;
    const time = clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // DNS query flow: drift rightward with oscillation
      pos[i3] += data.velocities[i3] + Math.sin(time * 0.5 + i * 0.1) * 0.001;
      pos[i3 + 1] +=
        data.velocities[i3 + 1] + Math.cos(time * 0.3 + i * 0.15) * 0.0005;

      // Wrap horizontally
      if (pos[i3] > 15) pos[i3] = -15;
      if (pos[i3] < -15) pos[i3] = 15;
      if (pos[i3 + 1] > 6) pos[i3 + 1] = -6;
      if (pos[i3 + 1] < -6) pos[i3 + 1] = 6;
    }

    positions.needsUpdate = true;

    // Subtle opacity pulse
    if (pointsRef.current) {
      material.opacity = 0.5 + Math.sin(time * 0.4) * 0.15;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

// ─── Connection Lines (DNS query arcs) ───────────────────────────────────────

function ConnectionLines() {
  const linesRef = useRef<THREE.LineSegments>(null);
  const { geometry, material } = useMemo(() => {
    const count = 30;
    const positions = new Float32Array(count * 6);
    const colors = new Float32Array(count * 6);

    for (let i = 0; i < count; i++) {
      const i6 = i * 6;
      positions[i6] = (Math.random() - 0.5) * 28;
      positions[i6 + 1] = (Math.random() - 0.5) * 10;
      positions[i6 + 2] = (Math.random() - 0.5) * 8;
      positions[i6 + 3] = positions[i6] + (Math.random() - 0.5) * 6;
      positions[i6 + 4] = positions[i6 + 1] + (Math.random() - 0.5) * 3;
      positions[i6 + 5] = positions[i6 + 2];

      // Cyan color for all connection lines
      colors[i6] = 0.0;
      colors[i6 + 1] = 0.81;
      colors[i6 + 2] = 1.0;
      colors[i6 + 3] = 0.0;
      colors[i6 + 4] = 0.81;
      colors[i6 + 5] = 1.0;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return { geometry: geo, material: mat };
  }, []);

  useFrame(({ clock }) => {
    if (linesRef.current) {
      material.opacity = 0.04 + Math.sin(clock.getElapsedTime() * 0.5) * 0.04;
    }
  });

  return (
    <lineSegments ref={linesRef} geometry={geometry} material={material} />
  );
}

// ─── ParticleField Component ──────────────────────────────────────────────────

interface ParticleFieldProps {
  className?: string;
  particleCount?: number;
}

export function ParticleField({
  className = "",
  particleCount = 280,
}: ParticleFieldProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: false, alpha: true }}
        dpr={[1, 1.2]}
      >
        <Particles count={particleCount} />
        <ConnectionLines />
      </Canvas>
    </div>
  );
}
