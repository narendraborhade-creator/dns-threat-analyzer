import { motion } from "motion/react";
import { formatTimestamp } from "../lib/backend-client";
import type { DomainAnalysis } from "../types/dns";
import {
  scoreToThreatLevel,
  threatLevelColor,
  threatLevelLabel,
} from "../types/dns";

interface ThreatScoreCardProps {
  analysis: DomainAnalysis;
  side: "A" | "B";
  className?: string;
}

const SIDE_COLORS = {
  A: "#00cfff",
  B: "#a78bfa",
};

export function ThreatScoreCard({
  analysis,
  side,
  className = "",
}: ThreatScoreCardProps) {
  const score = Math.min(100, Math.max(0, Number(analysis.overallScore)));
  const level = scoreToThreatLevel(score);
  const color = threatLevelColor(level);
  const label = threatLevelLabel(level);
  const sideColor = SIDE_COLORS[side];

  const passedCount = analysis.categoryScores.filter((c) => c.passed).length;
  const totalCount = analysis.categoryScores.length;

  // SVG ring
  const ringR = 56;
  const ringCirc = 2 * Math.PI * ringR;
  const ringDash = (score / 100) * ringCirc;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`border border-border relative overflow-hidden ${className}`}
      style={{
        background: "rgba(11,11,22,0.97)",
        borderTopColor: sideColor,
        borderTopWidth: 2,
      }}
      data-ocid={`score-card-${side.toLowerCase()}`}
    >
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none scanlines"
        style={{ opacity: 0.4 }}
      />

      {/* Side label */}
      <div
        className="px-5 pt-4 pb-2 flex items-center justify-between border-b border-border"
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <div>
          <div
            className="text-xs font-mono tracking-[0.25em] uppercase mb-1"
            style={{ color: `${sideColor}99` }}
          >
            Domain {side}
          </div>
          <h3
            className="font-display font-bold text-base truncate max-w-[200px]"
            style={{ color: "#e8eeff" }}
            title={analysis.domain}
          >
            {analysis.domain}
          </h3>
          <div
            className="text-xs font-mono mt-0.5"
            style={{ color: "rgba(147,163,203,0.45)" }}
          >
            {formatTimestamp(analysis.checkedAt)}
          </div>
        </div>

        {/* Circular score ring */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg width={136} height={136} className="-rotate-90">
            <title>Threat score ring</title>
            {/* Track */}
            <circle
              cx={68}
              cy={68}
              r={ringR}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={8}
            />
            {/* Fill */}
            <motion.circle
              cx={68}
              cy={68}
              r={ringR}
              fill="none"
              stroke={color}
              strokeWidth={8}
              strokeLinecap="square"
              strokeDasharray={`${ringCirc}`}
              initial={{ strokeDashoffset: ringCirc }}
              animate={{ strokeDashoffset: ringCirc - ringDash }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="font-display font-bold"
              style={{ color, fontSize: "2rem", lineHeight: 1 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {score}
            </motion.span>
            <span
              className="font-mono text-xs tracking-widest mt-0.5"
              style={{ color: `${color}cc` }}
            >
              {label}
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-5 py-3 grid grid-cols-3 gap-3">
        {[
          {
            label: "CHECKS PASSED",
            value: `${passedCount}/${totalCount}`,
            color: passedCount === totalCount ? "#00ff88" : "#ffd700",
          },
          {
            label: "OVERALL SCORE",
            value: String(score),
            color,
          },
          {
            label: "STATUS",
            value: label,
            color,
          },
        ].map(({ label: lbl, value, color: c }) => (
          <div key={lbl} className="flex flex-col gap-1">
            <span
              className="text-xs font-mono tracking-wider"
              style={{ color: "rgba(147,163,203,0.45)", fontSize: "0.6rem" }}
            >
              {lbl}
            </span>
            <span className="font-mono font-bold text-sm" style={{ color: c }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom accent line */}
      <div
        className="h-px w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
        }}
      />
    </motion.div>
  );
}
