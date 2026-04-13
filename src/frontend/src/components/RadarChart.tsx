import { OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { DomainAnalysis } from "../types/dns";
import {
  CATEGORY_LABELS,
  scoreToThreatLevel,
  threatLevelColor,
} from "../types/dns";
import type { DrillTarget } from "./ThreatDrillPopover";

// ─── Constants ────────────────────────────────────────────────────────────────

const DOMAIN_A_COLOR = "#00e5ff";
const DOMAIN_B_COLOR = "#ff00c8";
const RADIUS = 3.2;
const CAT_KEYS = [
  "DnssecRisk",
  "NameserverLegitimacy",
  "HijackingRisk",
  "AmplificationRisk",
  "EncryptionRisk",
  "TldRisk",
] as const;
type CatKey = (typeof CAT_KEYS)[number];

function getAngle(i: number, n: number): number {
  return (i / n) * Math.PI * 2 - Math.PI / 2;
}

function radialPoint(
  score: number,
  i: number,
  n: number,
  r: number,
): THREE.Vector3 {
  const angle = getAngle(i, n);
  const rr = (score / 100) * r;
  return new THREE.Vector3(Math.cos(angle) * rr, 0, Math.sin(angle) * rr);
}

// ─── Web ring ─────────────────────────────────────────────────────────────────

function WebRing({ scale, n, r }: { scale: number; n: number; r: number }) {
  const pts = useMemo(
    () =>
      Array.from({ length: n + 1 }, (_, i) => {
        const angle = getAngle(i % n, n);
        return new THREE.Vector3(
          Math.cos(angle) * r * scale,
          0,
          Math.sin(angle) * r * scale,
        );
      }),
    [scale, n, r],
  );

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      positions.push(pts[i].x, pts[i].y, pts[i].z);
      positions.push(pts[i + 1].x, pts[i + 1].y, pts[i + 1].z);
    }
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    return geo;
  }, [pts]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#00cfff" transparent opacity={0.1} />
    </lineSegments>
  );
}

// ─── Domain Polygon ───────────────────────────────────────────────────────────

interface PolygonProps {
  scores: number[];
  color: string;
  domainLabel: string;
  catKeys: readonly CatKey[];
  onDrill: (t: DrillTarget) => void;
  details: { passed: boolean; details: string }[];
}

function DomainPolygon({
  scores,
  color,
  domainLabel,
  catKeys,
  onDrill,
  details,
}: PolygonProps) {
  const n = catKeys.length;
  const points = useMemo(
    () => scores.map((s, i) => radialPoint(s, i, n, RADIUS)),
    [scores, n],
  );

  // Filled surface geometry
  const fillGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const verts: number[] = [];
    const center = new THREE.Vector3(0, 0, 0);
    for (let i = 0; i < n; i++) {
      const a = points[i];
      const b = points[(i + 1) % n];
      verts.push(center.x, center.y, center.z, a.x, a.y, a.z, b.x, b.y, b.z);
    }
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    return geo;
  }, [points, n]);

  // Outline geometry
  const lineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    for (let i = 0; i < n; i++) {
      const a = points[i];
      const b = points[(i + 1) % n];
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    return geo;
  }, [points, n]);

  return (
    <group>
      {/* Fill mesh */}
      <mesh geometry={fillGeo} rotation={[-0.0, 0, 0]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Outline */}
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color={color} transparent opacity={0.9} />
      </lineSegments>
      {/* Data point nodes */}
      {points.map((pt, i) => (
        <DataNode
          key={`${domainLabel}-${catKeys[i]}`}
          position={[pt.x, pt.y, pt.z]}
          color={color}
          score={scores[i]}
          domainLabel={domainLabel}
          catKey={catKeys[i]}
          passed={details[i]?.passed ?? false}
          detailText={details[i]?.details ?? ""}
          onDrill={onDrill}
        />
      ))}
    </group>
  );
}

// ─── Clickable Data Node ──────────────────────────────────────────────────────

interface NodeProps {
  position: [number, number, number];
  color: string;
  score: number;
  domainLabel: string;
  catKey: CatKey;
  passed: boolean;
  detailText: string;
  onDrill: (t: DrillTarget) => void;
}

function DataNode({
  position,
  color,
  score,
  domainLabel,
  catKey,
  passed,
  detailText,
  onDrill,
}: NodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = hovered
      ? 1.2
      : 0.6 + Math.sin(t * 2 + position[0]) * 0.2;
    meshRef.current.scale.setScalar(hovered ? 1.5 : 1);
  });

  const handleClick = useCallback(
    (e: { stopPropagation: () => void; clientX: number; clientY: number }) => {
      e.stopPropagation();
      onDrill({
        domain: domainLabel,
        category:
          CATEGORY_LABELS[catKey as keyof typeof CATEGORY_LABELS] ?? catKey,
        score,
        details: detailText,
        passed,
        color,
        screenX: e.clientX,
        screenY: e.clientY,
      });
    },
    [domainLabel, catKey, score, detailText, passed, color, onDrill],
  );

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: R3F Three.js mesh elements do not support keyboard events
    <mesh
      ref={meshRef}
      position={position}
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
    >
      <sphereGeometry args={[0.14, 12, 12]} />
    </mesh>
  );
}

// ─── Axis Lines + Labels ──────────────────────────────────────────────────────

function AxisLines({ catKeys }: { catKeys: readonly CatKey[] }) {
  const n = catKeys.length;

  const linesGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    for (let i = 0; i < n; i++) {
      const angle = getAngle(i, n);
      positions.push(
        0,
        0,
        0,
        Math.cos(angle) * RADIUS,
        0,
        Math.sin(angle) * RADIUS,
      );
    }
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    return geo;
  }, [n]);

  return (
    <group>
      <lineSegments geometry={linesGeo}>
        <lineBasicMaterial color="#00cfff" transparent opacity={0.15} />
      </lineSegments>
      {catKeys.map((key, i) => {
        const angle = getAngle(i, n);
        const labelR = RADIUS + 0.65;
        return (
          <Text
            key={key}
            position={[Math.cos(angle) * labelR, 0, Math.sin(angle) * labelR]}
            fontSize={0.3}
            color="#00cfff"
            anchorX="center"
            anchorY="middle"
            font={undefined}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            {CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS]}
          </Text>
        );
      })}
    </group>
  );
}

// ─── Radar Scene ──────────────────────────────────────────────────────────────

interface RadarSceneProps {
  analysisA: DomainAnalysis;
  analysisB: DomainAnalysis;
  onDrill: (t: DrillTarget) => void;
}

function RadarScene({ analysisA, analysisB, onDrill }: RadarSceneProps) {
  const n = CAT_KEYS.length;

  const getScores = (analysis: DomainAnalysis) =>
    CAT_KEYS.map((key) => {
      const cs = analysis.categoryScores.find((c) => c.category === key);
      return {
        score: Math.min(100, Math.max(0, Number(cs?.score ?? 50))),
        passed: cs?.passed ?? false,
        details: cs?.details ?? "No data",
      };
    });

  const dataA = getScores(analysisA);
  const dataB = getScores(analysisB);

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {/* Web rings */}
      {[0.25, 0.5, 0.75, 1.0].map((s) => (
        <WebRing key={s} scale={s} n={n} r={RADIUS} />
      ))}

      {/* Axis lines + labels */}
      <AxisLines catKeys={CAT_KEYS} />

      {/* Domain polygons */}
      <DomainPolygon
        scores={dataA.map((d) => d.score)}
        color={DOMAIN_A_COLOR}
        domainLabel={analysisA.domain}
        catKeys={CAT_KEYS}
        onDrill={onDrill}
        details={dataA}
      />
      <DomainPolygon
        scores={dataB.map((d) => d.score)}
        color={DOMAIN_B_COLOR}
        domainLabel={analysisB.domain}
        catKeys={CAT_KEYS}
        onDrill={onDrill}
        details={dataB}
      />

      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 6, 0]} intensity={0.5} color="#00e5ff" />
      <pointLight position={[0, -6, 0]} intensity={0.3} color="#ff00c8" />
    </group>
  );
}

// ─── RadarChart (3D) ──────────────────────────────────────────────────────────

interface RadarChartProps {
  analysisA: DomainAnalysis;
  analysisB: DomainAnalysis;
  onDrill?: (t: DrillTarget) => void;
}

export function RadarChart({ analysisA, analysisB, onDrill }: RadarChartProps) {
  const handleDrill = useCallback((t: DrillTarget) => onDrill?.(t), [onDrill]);

  return (
    <Canvas
      camera={{ position: [0, 7, 0.1], fov: 55 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
      style={{ width: "100%", height: "100%" }}
      data-ocid="radar-chart-3d"
    >
      <RadarScene
        analysisA={analysisA}
        analysisB={analysisB}
        onDrill={handleDrill}
      />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={16}
      />
    </Canvas>
  );
}
