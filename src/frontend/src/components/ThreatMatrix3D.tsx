import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { CategoryScore, DomainAnalysis } from "../types/dns";
import {
  CATEGORY_LABELS,
  scoreToThreatLevel,
  threatLevelColor,
} from "../types/dns";
import type { DrillTarget } from "./ThreatDrillPopover";

// ─── Constants ────────────────────────────────────────────────────────────────

const DOMAIN_A_COLOR = "#00e5ff"; // cyan
const DOMAIN_B_COLOR = "#ff00c8"; // magenta
const CAT_KEYS = [
  "DnssecRisk",
  "NameserverLegitimacy",
  "HijackingRisk",
  "AmplificationRisk",
  "EncryptionRisk",
  "TldRisk",
] as const;

const SPACING = 2.0;
const MAX_HEIGHT = 5;

// ─── Grid Floor ───────────────────────────────────────────────────────────────

function GridFloor() {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const lines: number[] = [];
    const cols = CAT_KEYS.length + 1;
    const size = SPACING;
    const half = (cols * size) / 2;
    for (let i = 0; i <= cols; i++) {
      const x = i * size - half;
      lines.push(x, 0, -half, x, 0, half);
      lines.push(-half, 0, i * size - half, half, 0, i * size - half);
    }
    geo.setAttribute("position", new THREE.Float32BufferAttribute(lines, 3));
    return geo;
  }, []);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#00cfff" transparent opacity={0.08} />
    </lineSegments>
  );
}

// ─── Axis Label ───────────────────────────────────────────────────────────────

function AxisLabel({
  position,
}: { position: [number, number, number]; text: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (ref.current) ref.current.quaternion.copy(camera.quaternion);
  });

  return (
    <mesh ref={ref} position={position}>
      <planeGeometry args={[1.6, 0.32]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

// ─── Clickable Bar ────────────────────────────────────────────────────────────

interface BarProps {
  position: [number, number, number];
  height: number;
  color: string;
  domainLabel: string;
  categoryKey: string;
  score: number;
  details: string;
  passed: boolean;
  onDrill: (t: DrillTarget) => void;
}

function Bar3D({
  position,
  height,
  color,
  domainLabel,
  categoryKey,
  score,
  details,
  passed,
  onDrill,
}: BarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const scaledH = Math.max((height / 100) * MAX_HEIGHT, 0.05);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const baseGlow = hovered ? 0.8 : 0.35;
    const pulse = baseGlow + Math.sin(t * 2 + position[0]) * 0.08;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = pulse;
  });

  const handleClick = useCallback(
    (e: { stopPropagation: () => void; clientX: number; clientY: number }) => {
      e.stopPropagation();
      onDrill({
        domain: domainLabel,
        category:
          CATEGORY_LABELS[categoryKey as keyof typeof CATEGORY_LABELS] ??
          categoryKey,
        score,
        details,
        passed,
        color,
        screenX: e.clientX,
        screenY: e.clientY,
      });
    },
    [domainLabel, categoryKey, score, details, passed, color, onDrill],
  );

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: R3F Three.js mesh elements do not support keyboard events
    <mesh
      ref={meshRef}
      position={[position[0], scaledH / 2, position[2]]}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
      onClick={handleClick}
      scale={hovered ? [1.08, 1, 1.08] : [1, 1, 1]}
    >
      <boxGeometry args={[0.72, scaledH, 0.72]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.35}
        transparent
        opacity={hovered ? 1 : 0.88}
        roughness={0.2}
        metalness={0.6}
      />
    </mesh>
  );
}

// ─── Score Indicator Ring ─────────────────────────────────────────────────────

function ScoreRing({ x, z, color }: { x: number; z: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.15 + Math.sin(t * 1.2 + x) * 0.06;
    }
  });
  return (
    <mesh ref={ref} position={[x, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.5, 0.65, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ─── Matrix Scene ─────────────────────────────────────────────────────────────

interface SceneProps {
  analysisA: DomainAnalysis;
  analysisB: DomainAnalysis;
  onDrill: (t: DrillTarget) => void;
}

function MatrixScene({ analysisA, analysisB, onDrill }: SceneProps) {
  const totalWidth = CAT_KEYS.length * SPACING;
  const startX = -totalWidth / 2 + SPACING / 2;

  const getScore = (analysis: DomainAnalysis, key: string): CategoryScore => {
    return (
      analysis.categoryScores.find((c) => c.category === key) ?? {
        category: key as CategoryScore["category"],
        score: BigInt(50),
        details: "No data",
        passed: false,
      }
    );
  };

  return (
    <group>
      <GridFloor />

      {CAT_KEYS.map((catKey, i) => {
        const x = startX + i * SPACING;
        const csA = getScore(analysisA, catKey);
        const csB = getScore(analysisB, catKey);
        const scoreA = Math.min(100, Math.max(0, Number(csA.score)));
        const scoreB = Math.min(100, Math.max(0, Number(csB.score)));
        const colA = threatLevelColor(scoreToThreatLevel(scoreA));
        const colB = threatLevelColor(scoreToThreatLevel(scoreB));
        const label = CATEGORY_LABELS[catKey as keyof typeof CATEGORY_LABELS];

        return (
          <group key={catKey}>
            {/* Domain A bar */}
            <Bar3D
              position={[x - 0.42, 0, 0]}
              height={scoreA}
              color={DOMAIN_A_COLOR}
              domainLabel={analysisA.domain}
              categoryKey={catKey}
              score={scoreA}
              details={csA.details}
              passed={csA.passed}
              onDrill={onDrill}
            />
            {/* Domain B bar */}
            <Bar3D
              position={[x + 0.42, 0, 0]}
              height={scoreB}
              color={DOMAIN_B_COLOR}
              domainLabel={analysisB.domain}
              categoryKey={catKey}
              score={scoreB}
              details={csB.details}
              passed={csB.passed}
              onDrill={onDrill}
            />
            {/* Glow rings under bars */}
            <ScoreRing x={x - 0.42} z={0} color={colA} />
            <ScoreRing x={x + 0.42} z={0} color={colB} />
            {/* Billboard label */}
            <AxisLabel position={[x, -0.35, 0]} text={label} />
          </group>
        );
      })}

      {/* Lighting rig */}
      <ambientLight intensity={0.12} />
      <pointLight position={[0, 10, 5]} intensity={0.8} color="#00e5ff" />
      <pointLight position={[-6, 6, -4]} intensity={0.4} color="#a78bfa" />
      <pointLight position={[6, 4, -4]} intensity={0.4} color="#ff00c8" />
      <directionalLight position={[0, 8, 0]} intensity={0.3} color="#ffffff" />
    </group>
  );
}

// ─── ThreatMatrix3D ───────────────────────────────────────────────────────────

interface ThreatMatrix3DProps {
  analysisA: DomainAnalysis;
  analysisB: DomainAnalysis;
  onDrill?: (t: DrillTarget) => void;
}

export function ThreatMatrix3D({
  analysisA,
  analysisB,
  onDrill,
}: ThreatMatrix3DProps) {
  const handleDrill = useCallback((t: DrillTarget) => onDrill?.(t), [onDrill]);

  return (
    <Canvas
      camera={{ position: [0, 5, 10], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
      style={{ width: "100%", height: "100%" }}
      data-ocid="threat-matrix-3d"
    >
      <MatrixScene
        analysisA={analysisA}
        analysisB={analysisB}
        onDrill={handleDrill}
      />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={4}
        maxDistance={20}
      />
    </Canvas>
  );
}
