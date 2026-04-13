import { motion } from "motion/react";
import type { DomainAnalysis, ThreatCategory } from "../types/dns";
import {
  CATEGORY_LABELS,
  scoreToThreatLevel,
  threatLevelColor,
} from "../types/dns";

// ─── RiskMatrix ───────────────────────────────────────────────────────────────
// Plots both domains on a 2D matrix:
//   X-axis = category (left→right)
//   Y-axis = severity (bottom=safe, top=critical)

interface RiskMatrixProps {
  analysisA: DomainAnalysis;
  analysisB: DomainAnalysis;
  onCategoryClick?: (category: ThreatCategory) => void;
}

const Y_ZONES = [
  { label: "CRITICAL", range: [0, 33] as [number, number], color: "#ff2040" },
  { label: "WARNING", range: [34, 66] as [number, number], color: "#ffd700" },
  { label: "SECURE", range: [67, 100] as [number, number], color: "#00ff88" },
];

export function RiskMatrix({
  analysisA,
  analysisB,
  onCategoryClick,
}: RiskMatrixProps) {
  const categories = analysisA.categoryScores.map((cs) => cs.category);
  const colW = 100 / categories.length;

  // Map score (0-100) to Y% in SVG (100=top=safe, 0=bottom=critical)
  // We display safe at top so high score = high up = good
  const scoreToY = (score: number) => 100 - score;

  return (
    <div
      className="border border-border overflow-hidden"
      style={{ background: "rgba(11,11,22,0.97)" }}
      data-ocid="risk-matrix"
    >
      {/* Header */}
      <div
        className="px-5 py-3 border-b border-border flex items-center justify-between"
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <span
          className="text-xs font-mono tracking-widest"
          style={{ color: "rgba(0,207,255,0.5)" }}
        >
          RISK MATRIX — CATEGORY × SEVERITY
        </span>
        <div className="flex gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: "#00cfff", boxShadow: "0 0 4px #00cfff" }}
            />
            <span style={{ color: "rgba(147,163,203,0.6)" }}>
              {analysisA.domain}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: "#a78bfa", boxShadow: "0 0 4px #a78bfa" }}
            />
            <span style={{ color: "rgba(147,163,203,0.6)" }}>
              {analysisB.domain}
            </span>
          </span>
        </div>
      </div>

      {/* Matrix body */}
      <div className="p-4 flex gap-3">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between py-1 shrink-0 w-16">
          {Y_ZONES.map((zone) => (
            <div key={zone.label} className="flex items-center gap-1">
              <div
                className="w-1.5 h-1.5 shrink-0"
                style={{
                  background: zone.color,
                  boxShadow: `0 0 4px ${zone.color}`,
                }}
              />
              <span
                className="font-mono text-xs"
                style={{ color: `${zone.color}80`, fontSize: "0.58rem" }}
              >
                {zone.label}
              </span>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 relative">
          {/* Horizontal zone bands */}
          <div className="absolute inset-0 flex flex-col">
            {Y_ZONES.map((zone) => (
              <div
                key={zone.label}
                className="flex-1"
                style={{
                  background: `${zone.color}06`,
                  borderBottom: `1px solid ${zone.color}15`,
                }}
              />
            ))}
          </div>

          {/* Vertical category columns */}
          <div className="absolute inset-0 flex">
            {categories.map((cat) => (
              <div
                key={cat}
                className="flex-1 border-r border-border/30 last:border-r-0"
                style={{ borderColor: "rgba(255,255,255,0.04)" }}
              />
            ))}
          </div>

          {/* SVG for plotting dots + connectors */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
            aria-label="Risk matrix scatter plot"
          >
            <title>Risk Matrix</title>

            {/* Connector lines between domain A and B for each category */}
            {categories.map((cat, i) => {
              const csA = analysisA.categoryScores.find(
                (c) => c.category === cat,
              );
              const csB = analysisB.categoryScores.find(
                (c) => c.category === cat,
              );
              if (!csA || !csB) return null;

              const valA = Math.min(100, Math.max(0, Number(csA.score)));
              const valB = Math.min(100, Math.max(0, Number(csB.score)));
              const cx = colW * i + colW / 2;
              const cyA = scoreToY(valA);
              const cyB = scoreToY(valB);

              return (
                <line
                  key={`conn-${cat}`}
                  x1={cx}
                  y1={cyA}
                  x2={cx}
                  y2={cyB}
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth={0.5}
                  strokeDasharray="1,1"
                />
              );
            })}

            {/* Domain A dots */}
            {categories.map((cat, i) => {
              const cs = analysisA.categoryScores.find(
                (c) => c.category === cat,
              );
              if (!cs) return null;
              const val = Math.min(100, Math.max(0, Number(cs.score)));
              const cx = colW * i + colW / 2;
              const cy = scoreToY(val);
              const dotColor = "#00cfff";

              return (
                <g key={`a-${cat}`}>
                  <circle cx={cx} cy={cy} r={3} fill={`${dotColor}30`} />
                  <motion.circle
                    cx={cx}
                    cy={cy}
                    r={2}
                    fill={dotColor}
                    style={{ filter: `drop-shadow(0 0 3px ${dotColor})` }}
                    initial={{ opacity: 0, r: 0 }}
                    animate={{ opacity: 1, r: 2 }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                  />
                </g>
              );
            })}

            {/* Domain B dots */}
            {categories.map((cat, i) => {
              const cs = analysisB.categoryScores.find(
                (c) => c.category === cat,
              );
              if (!cs) return null;
              const val = Math.min(100, Math.max(0, Number(cs.score)));
              const cx = colW * i + colW / 2;
              const cy = scoreToY(val);
              const dotColor = "#a78bfa";

              return (
                <g key={`b-${cat}`}>
                  <circle cx={cx} cy={cy} r={3} fill={`${dotColor}30`} />
                  <motion.circle
                    cx={cx}
                    cy={cy}
                    r={2}
                    fill={dotColor}
                    style={{ filter: `drop-shadow(0 0 3px ${dotColor})` }}
                    initial={{ opacity: 0, r: 0 }}
                    animate={{ opacity: 1, r: 2 }}
                    transition={{ delay: i * 0.1 + 0.4 }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Invisible hit targets for categories */}
          <div className="absolute inset-0 flex">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className="flex-1 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => onCategoryClick?.(cat)}
                onKeyDown={(e) => e.key === "Enter" && onCategoryClick?.(cat)}
                aria-label={`View ${CATEGORY_LABELS[cat]} details`}
              />
            ))}
          </div>

          {/* Height guide: 200px fixed */}
          <div className="h-48" />
        </div>
      </div>

      {/* X-axis category labels */}
      <div className="px-4 pb-3 flex pl-[76px]">
        {categories.map((cat) => {
          const csA = analysisA.categoryScores.find((c) => c.category === cat);
          const csB = analysisB.categoryScores.find((c) => c.category === cat);
          const valA = csA ? Number(csA.score) : 50;
          const valB = csB ? Number(csB.score) : 50;
          const worstLevel = scoreToThreatLevel(Math.min(valA, valB));
          const labelColor = threatLevelColor(worstLevel);

          return (
            <button
              type="button"
              key={cat}
              className="flex-1 text-center cursor-pointer"
              onClick={() => onCategoryClick?.(cat as ThreatCategory)}
              onKeyDown={(e) =>
                e.key === "Enter" && onCategoryClick?.(cat as ThreatCategory)
              }
              aria-label={`View ${CATEGORY_LABELS[cat as ThreatCategory]} details`}
            >
              <span
                className="font-mono text-xs block truncate"
                style={{ color: labelColor, fontSize: "0.6rem" }}
                title={CATEGORY_LABELS[cat as ThreatCategory]}
              >
                {CATEGORY_LABELS[cat as ThreatCategory]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
