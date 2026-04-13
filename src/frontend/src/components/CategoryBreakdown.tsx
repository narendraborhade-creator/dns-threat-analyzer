import { AlertTriangle, CheckCircle, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import type {
  CategoryScore,
  DomainAnalysis,
  ThreatCategory,
} from "../types/dns";
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  scoreToThreatLevel,
  threatLevelColor,
} from "../types/dns";

interface CategoryRowProps {
  scoreA: CategoryScore;
  scoreB: CategoryScore | null;
  domainA: string;
  domainB: string | null;
  index: number;
  onRemediate: (category: ThreatCategory) => void;
}

function CategoryRow({
  scoreA,
  scoreB,
  domainA,
  domainB,
  index,
  onRemediate,
}: CategoryRowProps) {
  const valA = Math.min(100, Math.max(0, Number(scoreA.score)));
  const valB = scoreB ? Math.min(100, Math.max(0, Number(scoreB.score))) : null;

  const colorA = threatLevelColor(scoreToThreatLevel(valA));
  const colorB =
    valB !== null ? threatLevelColor(scoreToThreatLevel(valB)) : null;

  const hasDanger = !scoreA.passed || (scoreB && !scoreB.passed);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="w-full text-left border border-border hover:border-border/80 transition-colors cursor-pointer group"
      style={{
        background: hasDanger
          ? "rgba(255,32,64,0.03)"
          : "rgba(255,255,255,0.01)",
      }}
      data-ocid={`category-row-${scoreA.category.toLowerCase()}`}
      onClick={() => onRemediate(scoreA.category)}
      aria-label={`View remediation for ${CATEGORY_LABELS[scoreA.category]}`}
    >
      {/* Category header */}
      <div className="px-4 pt-3 pb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="font-mono font-bold text-xs tracking-wider"
              style={{ color: "#e8eeff" }}
            >
              {CATEGORY_LABELS[scoreA.category]}
            </span>
            {hasDanger && (
              <AlertTriangle size={10} style={{ color: "#ffd700" }} />
            )}
          </div>
          <p
            className="text-xs font-mono mt-0.5 truncate"
            style={{ color: "rgba(147,163,203,0.4)", fontSize: "0.65rem" }}
          >
            {CATEGORY_DESCRIPTIONS[scoreA.category]}
          </p>
        </div>
        <ChevronRight
          size={12}
          className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: "rgba(0,207,255,0.5)" }}
        />
      </div>

      {/* Score bars */}
      <div className="px-4 pb-3 space-y-2">
        {/* Domain A bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-mono"
              style={{ color: "rgba(0,207,255,0.6)", fontSize: "0.6rem" }}
            >
              {domainA}
            </span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-xs" style={{ color: colorA }}>
                {valA}
              </span>
              {scoreA.passed ? (
                <CheckCircle size={10} style={{ color: "#00ff88" }} />
              ) : (
                <AlertTriangle size={10} style={{ color: colorA }} />
              )}
            </div>
          </div>
          <div className="h-1.5 bg-muted relative overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full"
              initial={{ width: 0 }}
              animate={{ width: `${valA}%` }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                delay: index * 0.05 + 0.2,
              }}
              style={{
                background: `linear-gradient(90deg, ${colorA}80, ${colorA})`,
                boxShadow: `0 0 6px ${colorA}60`,
              }}
            />
          </div>
        </div>

        {/* Domain B bar (if split view) */}
        {scoreB && colorB && domainB && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-mono"
                style={{ color: "rgba(167,139,250,0.6)", fontSize: "0.6rem" }}
              >
                {domainB}
              </span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-xs" style={{ color: colorB }}>
                  {valB}
                </span>
                {scoreB.passed ? (
                  <CheckCircle size={10} style={{ color: "#00ff88" }} />
                ) : (
                  <AlertTriangle size={10} style={{ color: colorB }} />
                )}
              </div>
            </div>
            <div className="h-1.5 bg-muted relative overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full"
                initial={{ width: 0 }}
                animate={{ width: `${valB}%` }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                  delay: index * 0.05 + 0.3,
                }}
                style={{
                  background: `linear-gradient(90deg, ${colorB}80, ${colorB})`,
                  boxShadow: `0 0 6px ${colorB}60`,
                }}
              />
            </div>
          </div>
        )}

        {/* Failing detail snippet */}
        {!scoreA.passed && scoreA.details && (
          <p
            className="font-mono text-xs leading-relaxed mt-1"
            style={{ color: "rgba(255,32,64,0.55)", fontSize: "0.62rem" }}
          >
            {scoreA.details.slice(0, 100)}
            {scoreA.details.length > 100 ? "…" : ""}
          </p>
        )}
      </div>
    </motion.button>
  );
}

// ─── Category Breakdown ───────────────────────────────────────────────────────

interface CategoryBreakdownProps {
  analysisA: DomainAnalysis;
  analysisB?: DomainAnalysis;
  onRemediate: (category: ThreatCategory) => void;
}

export function CategoryBreakdown({
  analysisA,
  analysisB,
  onRemediate,
}: CategoryBreakdownProps) {
  return (
    <div className="space-y-2">
      {analysisA.categoryScores.map((csA, i) => {
        const csB =
          analysisB?.categoryScores.find((c) => c.category === csA.category) ??
          null;

        return (
          <CategoryRow
            key={csA.category}
            scoreA={csA}
            scoreB={csB}
            domainA={analysisA.domain}
            domainB={analysisB?.domain ?? null}
            index={i}
            onRemediate={onRemediate}
          />
        );
      })}
    </div>
  );
}
