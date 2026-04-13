import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useCallback, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { DomainAnalysis } from "../types/dns";
import { scoreToThreatLevel, threatLevelColor } from "../types/dns";
import type { DrillTarget } from "./ThreatDrillPopover";

// ─── Color Constants ──────────────────────────────────────────────────────────

const DOMAIN_A_COLOR = "#00e5ff";
const DOMAIN_B_COLOR = "#ff00c8";

// ─── Node data shape ──────────────────────────────────────────────────────────

interface ChainNode {
  id: string;
  label: string;
  sublabel?: string;
  position: THREE.Vector3;
  color: string;
  score: number;
  type: "root" | "tld" | "nameserver" | "domain";
  passed: boolean;
  details: string;
}

interface ChainEdge {
  from: THREE.Vector3;
  to: THREE.Vector3;
  color: string;
  validated: boolean;
  id: string;
}

// ─── Build chain from analysis ────────────────────────────────────────────────

function buildChain(
  analysis: DomainAnalysis,
  baseColor: string,
  xOffset: number,
): { nodes: ChainNode[]; edges: ChainEdge[] } {
  const parts = analysis.domain.split(".");
  const tld = parts[parts.length - 1];
  const sld = parts.slice(-2).join(".");

  const dnssecScore = analysis.categoryScores.find(
    (c) => c.category === "DnssecRisk",
  );
  const nsScore = analysis.categoryScores.find(
    (c) => c.category === "NameserverLegitimacy",
  );
  const tldsScore = analysis.categoryScores.find(
    (c) => c.category === "TldRisk",
  );

  const dnssecN = Math.min(100, Math.max(0, Number(dnssecScore?.score ?? 50)));
  const nsN = Math.min(100, Math.max(0, Number(nsScore?.score ?? 50)));
  const tldN = Math.min(100, Math.max(0, Number(tldsScore?.score ?? 50)));

  const nodes: ChainNode[] = [
    {
      id: `${xOffset}-root`,
      label: "Root DNS",
      sublabel: ".",
      position: new THREE.Vector3(xOffset, 4, 0),
      color: threatLevelColor(scoreToThreatLevel(dnssecN)),
      score: dnssecN,
      type: "root",
      passed: dnssecScore?.passed ?? false,
      details: dnssecScore?.details ?? "Root zone DNSSEC validation",
    },
    {
      id: `${xOffset}-tld`,
      label: `.${tld.toUpperCase()} TLD`,
      sublabel: `TLD Score: ${tldN}`,
      position: new THREE.Vector3(xOffset, 1.5, 0),
      color: threatLevelColor(scoreToThreatLevel(tldN)),
      score: tldN,
      type: "tld",
      passed: tldsScore?.passed ?? false,
      details: tldsScore?.details ?? "TLD reputation and legitimacy",
    },
    {
      id: `${xOffset}-ns`,
      label: "Nameserver",
      sublabel: sld,
      position: new THREE.Vector3(xOffset, -1, 0),
      color: threatLevelColor(scoreToThreatLevel(nsN)),
      score: nsN,
      type: "nameserver",
      passed: nsScore?.passed ?? false,
      details: nsScore?.details ?? "Authoritative nameserver validation",
    },
    {
      id: `${xOffset}-domain`,
      label: analysis.domain,
      sublabel: `Score: ${Number(analysis.overallScore)}`,
      position: new THREE.Vector3(xOffset, -3.5, 0),
      color: baseColor,
      score: Math.min(100, Number(analysis.overallScore)),
      type: "domain",
      passed: Number(analysis.overallScore) >= 70,
      details: `Overall security score for ${analysis.domain}`,
    },
  ];

  const edges: ChainEdge[] = [
    {
      from: nodes[0].position,
      to: nodes[1].position,
      color: nodes[1].color,
      validated: nodes[1].passed,
      id: `${xOffset}-root-tld`,
    },
    {
      from: nodes[1].position,
      to: nodes[2].position,
      color: nodes[2].color,
      validated: nodes[2].passed,
      id: `${xOffset}-tld-ns`,
    },
    {
      from: nodes[2].position,
      to: nodes[3].position,
      color: nodes[3].color,
      validated: nodes[3].passed,
      id: `${xOffset}-ns-domain`,
    },
  ];

  return { nodes, edges };
}

// ─── Animated arc edge ────────────────────────────────────────────────────────

function ChainEdge3D({ from, to, color, validated }: ChainEdge) {
  const ref = useRef<THREE.Mesh>(null);
  const progressRef = useRef(0);

  const midPt = useMemo(
    () =>
      new THREE.Vector3()
        .addVectors(from, to)
        .multiplyScalar(0.5)
        .add(new THREE.Vector3(0.3, 0, 0.4)),
    [from, to],
  );

  const curve = useMemo(
    () => new THREE.QuadraticBezierCurve3(from, midPt, to),
    [from, midPt, to],
  );

  const fullPoints = useMemo(() => curve.getPoints(40), [curve]);

  // Animated particle along the edge
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.getElapsedTime() * 0.4) % 1;
    progressRef.current = t;
    const pt = curve.getPoint(t);
    ref.current.position.copy(pt);
  });

  const lineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    for (let i = 0; i < fullPoints.length - 1; i++) {
      positions.push(fullPoints[i].x, fullPoints[i].y, fullPoints[i].z);
      positions.push(
        fullPoints[i + 1].x,
        fullPoints[i + 1].y,
        fullPoints[i + 1].z,
      );
    }
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    return geo;
  }, [fullPoints]);

  return (
    <group>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={validated ? 0.55 : 0.2}
        />
      </lineSegments>
      {/* Traveling particle */}
      <mesh ref={ref}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

// ─── Chain Node 3D ────────────────────────────────────────────────────────────

interface ChainNodeProps {
  node: ChainNode;
  onDrill: (t: DrillTarget) => void;
}

function ChainNode3D({ node, onDrill }: ChainNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = hovered
      ? 1.0
      : 0.45 + Math.sin(t * 1.5 + node.position.x) * 0.15;
    meshRef.current.scale.setScalar(hovered ? 1.15 : 1);
  });

  const sizeMap = { root: 0.45, tld: 0.38, nameserver: 0.35, domain: 0.42 };
  const size = sizeMap[node.type];

  const handleClick = useCallback(
    (e: { stopPropagation: () => void; clientX: number; clientY: number }) => {
      e.stopPropagation();
      onDrill({
        domain: node.label,
        category: node.type.charAt(0).toUpperCase() + node.type.slice(1),
        score: node.score,
        details: node.details,
        passed: node.passed,
        color: node.color,
        screenX: e.clientX,
        screenY: e.clientY,
      });
    },
    [node, onDrill],
  );

  return (
    <group position={node.position.toArray() as [number, number, number]}>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: R3F Three.js mesh elements do not support keyboard events */}
      <mesh
        ref={meshRef}
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
        <octahedronGeometry args={[size, 0]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={0.45}
          roughness={0.2}
          metalness={0.7}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Outer ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[size + 0.1, size + 0.18, 32]} />
        <meshBasicMaterial
          color={node.color}
          transparent
          opacity={hovered ? 0.5 : 0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Label */}
      {hovered && (
        <Html center distanceFactor={6} style={{ pointerEvents: "none" }}>
          <div
            style={{
              background: "rgba(9,9,16,0.95)",
              border: `1px solid ${node.color}`,
              boxShadow: `0 0 12px ${node.color}40`,
              borderRadius: "4px",
              padding: "6px 10px",
              whiteSpace: "nowrap",
            }}
          >
            <div
              style={{
                color: node.color,
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
              }}
            >
              {node.label}
            </div>
            {node.sublabel && (
              <div
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "9px",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {node.sublabel}
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── Full Scene ───────────────────────────────────────────────────────────────

interface SceneProps {
  analysisA: DomainAnalysis;
  analysisB: DomainAnalysis;
  onDrill: (t: DrillTarget) => void;
}

function ChainScene({ analysisA, analysisB, onDrill }: SceneProps) {
  const chainA = useMemo(
    () => buildChain(analysisA, DOMAIN_A_COLOR, -2.5),
    [analysisA],
  );
  const chainB = useMemo(
    () => buildChain(analysisB, DOMAIN_B_COLOR, 2.5),
    [analysisB],
  );

  // Horizontal connector between same-level nodes
  const crossConnectors = useMemo(() => {
    const connectors: { from: THREE.Vector3; to: THREE.Vector3 }[] = [];
    for (let i = 0; i < chainA.nodes.length; i++) {
      connectors.push({
        from: chainA.nodes[i].position,
        to: chainB.nodes[i].position,
      });
    }
    return connectors;
  }, [chainA.nodes, chainB.nodes]);

  const crossGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    for (const { from, to } of crossConnectors) {
      positions.push(from.x, from.y, from.z, to.x, to.y, to.z);
    }
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    return geo;
  }, [crossConnectors]);

  return (
    <group>
      {/* Cross connector lines */}
      <lineSegments geometry={crossGeo}>
        <lineBasicMaterial color="#4444aa" transparent opacity={0.12} />
      </lineSegments>

      {/* Chain A */}
      {chainA.edges.map((edge) => (
        <ChainEdge3D key={edge.id} {...edge} />
      ))}
      {chainA.nodes.map((node) => (
        <ChainNode3D key={node.id} node={node} onDrill={onDrill} />
      ))}

      {/* Chain B */}
      {chainB.edges.map((edge) => (
        <ChainEdge3D key={edge.id} {...edge} />
      ))}
      {chainB.nodes.map((node) => (
        <ChainNode3D key={node.id} node={node} onDrill={onDrill} />
      ))}

      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <pointLight
        position={[-3, 6, 3]}
        intensity={0.7}
        color={DOMAIN_A_COLOR}
      />
      <pointLight position={[3, 6, 3]} intensity={0.7} color={DOMAIN_B_COLOR} />
      <pointLight position={[0, -5, 2]} intensity={0.3} color="#a78bfa" />
    </group>
  );
}

// ─── NameserverChain3D ────────────────────────────────────────────────────────

interface NameserverChain3DProps {
  analysisA: DomainAnalysis;
  analysisB: DomainAnalysis;
  onDrill?: (t: DrillTarget) => void;
}

export function NameserverChain3D({
  analysisA,
  analysisB,
  onDrill,
}: NameserverChain3DProps) {
  const handleDrill = useCallback((t: DrillTarget) => onDrill?.(t), [onDrill]);

  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
      style={{ width: "100%", height: "100%" }}
      data-ocid="nameserver-chain-3d"
    >
      <ChainScene
        analysisA={analysisA}
        analysisB={analysisB}
        onDrill={handleDrill}
      />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={20}
      />
    </Canvas>
  );
}
