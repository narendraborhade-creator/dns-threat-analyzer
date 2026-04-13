import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Canvas } from "@react-three/fiber";
import { useSearch } from "@tanstack/react-router";
import {
  AlertTriangle,
  Download,
  GitCompare,
  Layers,
  Loader2,
  Shield,
  SplitSquareHorizontal,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CategoryBreakdown } from "../components/CategoryBreakdown";
import { Layout } from "../components/Layout";
import { RadarChart } from "../components/RadarChart";
import { RemediationModal } from "../components/RemediationModal";
import { RiskMatrix } from "../components/RiskMatrix";
import { ThreatMatrix3D } from "../components/ThreatMatrix3D";
import { ThreatScoreCard } from "../components/ThreatScoreCard";
import {
  useCompareDomainsMutation,
  useExportComparisonMutation,
} from "../hooks/use-dns-analysis";
import { cleanDomain, validateDomain } from "../lib/backend-client";
import {
  CATEGORY_LABELS,
  type ComparisonResult,
  type ThreatCategory,
  scoreToThreatLevel,
  threatLevelColor,
} from "../types/dns";

// ─── View mode ────────────────────────────────────────────────────────────────

type ViewMode = "split" | "single-a" | "single-b";

// ─── Common Findings ──────────────────────────────────────────────────────────

function CommonFindings({
  result,
  onRemediate,
}: {
  result: ComparisonResult;
  onRemediate: (c: ThreatCategory) => void;
}) {
  const shared = result.domainA.categoryScores.filter((csA) => {
    const csB = result.domainB.categoryScores.find(
      (c) => c.category === csA.category,
    );
    return !csA.passed && csB && !csB.passed;
  });

  if (shared.length === 0) {
    return (
      <div
        className="border border-border px-5 py-4 flex items-center gap-3"
        style={{ background: "rgba(0,255,136,0.04)" }}
        data-ocid="common-findings-empty"
      >
        <Shield size={14} style={{ color: "#00ff88" }} />
        <span className="font-mono text-xs" style={{ color: "#00ff88" }}>
          No shared risks detected — domains differ in their vulnerability
          profile.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2" data-ocid="common-findings">
      {shared.map((csA, i) => {
        const csB = result.domainB.categoryScores.find(
          (c) => c.category === csA.category,
        );
        const valA = Math.min(100, Math.max(0, Number(csA.score)));
        const valB = csB ? Math.min(100, Math.max(0, Number(csB.score))) : 0;
        const worst = Math.min(valA, valB);
        const level = scoreToThreatLevel(worst);
        const color = threatLevelColor(level);

        return (
          <motion.button
            type="button"
            key={csA.category}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="w-full text-left border border-border px-4 py-3 flex items-center gap-4 hover:border-border/60 transition-colors cursor-pointer"
            style={{ background: `${color}06` }}
            onClick={() => onRemediate(csA.category as ThreatCategory)}
            aria-label={`Remediate ${CATEGORY_LABELS[csA.category]}`}
          >
            <AlertTriangle size={12} style={{ color }} />
            <div className="flex-1 min-w-0">
              <span
                className="font-mono font-bold text-xs"
                style={{ color: "#e8eeff" }}
              >
                {CATEGORY_LABELS[csA.category]}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="font-mono text-xs"
                  style={{ color: "rgba(0,207,255,0.6)", fontSize: "0.6rem" }}
                >
                  {result.domainA.domain}: {valA}
                </span>
                <span
                  style={{ color: "rgba(147,163,203,0.3)", fontSize: "0.6rem" }}
                >
                  /
                </span>
                <span
                  className="font-mono text-xs"
                  style={{ color: "rgba(167,139,250,0.6)", fontSize: "0.6rem" }}
                >
                  {result.domainB.domain}: {valB}
                </span>
              </div>
            </div>
            <Badge
              className="shrink-0 font-mono text-xs border-0 uppercase tracking-wider"
              style={{
                background: `${color}15`,
                color,
                boxShadow: `0 0 4px ${color}30`,
                fontSize: "0.55rem",
              }}
            >
              {level}
            </Badge>
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  label,
  action,
}: {
  label: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="px-5 py-3 border-b border-border flex items-center justify-between"
      style={{ background: "rgba(255,255,255,0.02)" }}
    >
      <span
        className="text-xs font-mono tracking-widest"
        style={{ color: "rgba(0,207,255,0.5)" }}
      >
        {label}
      </span>
      {action}
    </div>
  );
}

// ─── Compare Form ─────────────────────────────────────────────────────────────

interface CompareFormProps {
  domainA: string;
  domainB: string;
  onDomainAChange: (v: string) => void;
  onDomainBChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  error: string | null;
}

function CompareForm({
  domainA,
  domainB,
  onDomainAChange,
  onDomainBChange,
  onSubmit,
  isPending,
  error,
}: CompareFormProps) {
  return (
    <div
      className="border border-border p-5 card-inset-glow"
      style={{ background: "rgba(11,11,22,0.92)" }}
    >
      <div
        className="text-xs font-mono tracking-[0.25em] uppercase mb-4"
        style={{ color: "rgba(0,207,255,0.5)" }}
      >
        ⬡ DNS Security Comparison
      </div>
      <form
        onSubmit={onSubmit}
        className="grid sm:grid-cols-[1fr_auto_1fr_auto] gap-3 items-end"
        data-ocid="form-compare"
      >
        <div>
          <label
            htmlFor="input-domain-a"
            className="block text-xs font-mono mb-1.5"
            style={{ color: "rgba(0,207,255,0.6)" }}
          >
            DOMAIN A
          </label>
          <Input
            id="input-domain-a"
            value={domainA}
            onChange={(e) => onDomainAChange(e.target.value)}
            placeholder="cloudflare.com"
            className="font-mono text-sm border-border"
            style={{
              background: "rgba(7,7,17,0.8)",
              color: "#e8eeff",
              borderTopColor: "#00cfff",
            }}
            disabled={isPending}
            data-ocid="input-domain-a"
          />
        </div>

        <div className="flex items-end pb-0.5">
          <div className="flex items-center justify-center w-8 h-9">
            <GitCompare size={16} style={{ color: "rgba(147,163,203,0.4)" }} />
          </div>
        </div>

        <div>
          <label
            htmlFor="input-domain-b"
            className="block text-xs font-mono mb-1.5"
            style={{ color: "rgba(167,139,250,0.6)" }}
          >
            DOMAIN B
          </label>
          <Input
            id="input-domain-b"
            value={domainB}
            onChange={(e) => onDomainBChange(e.target.value)}
            placeholder="example.com"
            className="font-mono text-sm border-border"
            style={{
              background: "rgba(7,7,17,0.8)",
              color: "#e8eeff",
              borderTopColor: "#a78bfa",
            }}
            disabled={isPending}
            data-ocid="input-domain-b"
          />
        </div>

        <Button
          type="submit"
          disabled={isPending || !domainA.trim() || !domainB.trim()}
          className="gap-2 font-mono text-xs tracking-widest uppercase"
          style={{
            background: "rgba(0,207,255,0.1)",
            color: "#00cfff",
            border: "1px solid rgba(0,207,255,0.3)",
          }}
          data-ocid="btn-compare"
        >
          {isPending ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Shield size={12} />
          )}
          {isPending ? "Analyzing..." : "Compare"}
        </Button>
      </form>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-xs font-mono flex items-center gap-2"
          style={{ color: "#ff2040" }}
          data-ocid="error-compare"
        >
          <AlertTriangle size={11} />
          {error}
        </motion.p>
      )}
    </div>
  );
}

// ─── View Toggle ──────────────────────────────────────────────────────────────

function ViewToggle({
  mode,
  domainA,
  domainB,
  onChange,
}: {
  mode: ViewMode;
  domainA: string;
  domainB: string;
  onChange: (m: ViewMode) => void;
}) {
  const options: { mode: ViewMode; label: string; icon: React.ReactNode }[] = [
    {
      mode: "split",
      label: "Split View",
      icon: <SplitSquareHorizontal size={11} />,
    },
    {
      mode: "single-a",
      label: domainA || "Domain A",
      icon: <Layers size={11} />,
    },
    {
      mode: "single-b",
      label: domainB || "Domain B",
      icon: <Layers size={11} />,
    },
  ];

  return (
    <div
      className="flex gap-px border border-border overflow-hidden"
      data-ocid="view-toggle"
    >
      {options.map((opt) => (
        <button
          key={opt.mode}
          type="button"
          onClick={() => onChange(opt.mode)}
          className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs tracking-wider transition-colors"
          style={{
            background:
              mode === opt.mode
                ? "rgba(0,207,255,0.12)"
                : "rgba(255,255,255,0.02)",
            color: mode === opt.mode ? "#00cfff" : "rgba(147,163,203,0.5)",
            borderRight: "1px solid rgba(255,255,255,0.06)",
          }}
          aria-pressed={mode === opt.mode}
        >
          {opt.icon}
          <span className="hidden sm:inline truncate max-w-[120px]">
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Compare Page ─────────────────────────────────────────────────────────────

export default function ComparePage() {
  const search = useSearch({ strict: false }) as { a?: string; b?: string };
  const [domainA, setDomainA] = useState(search?.a ?? "cloudflare.com");
  const [domainB, setDomainB] = useState(search?.b ?? "google.com");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [remediationCategory, setRemediationCategory] =
    useState<ThreatCategory | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { mutateAsync: compare, isPending } = useCompareDomainsMutation();
  const { mutateAsync: exportComparison, isPending: isExporting } =
    useExportComparisonMutation();

  const handleRemediate = (category: ThreatCategory) => {
    setRemediationCategory(category);
    setModalOpen(true);
  };

  const handleCompare = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const cleanA = cleanDomain(domainA);
      const cleanB = cleanDomain(domainB);

      const vA = validateDomain(cleanA);
      const vB = validateDomain(cleanB);

      if (!vA.valid) {
        setError(`Domain A: ${vA.error}`);
        return;
      }
      if (!vB.valid) {
        setError(`Domain B: ${vB.error}`);
        return;
      }
      if (cleanA === cleanB) {
        setError("Please enter two different domains");
        return;
      }

      setError(null);
      try {
        const data = await compare({ domainA: cleanA, domainB: cleanB });
        setResult(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Comparison failed. Please try again.",
        );
      }
    },
    [domainA, domainB, compare],
  );

  const [hasAutoRan, setHasAutoRan] = useState(false);

  useEffect(() => {
    if (!hasAutoRan && search?.a && search?.b) {
      setHasAutoRan(true);
      const cleanA = cleanDomain(search.a);
      const cleanB = cleanDomain(search.b);
      compare({ domainA: cleanA, domainB: cleanB })
        .then((data) => setResult(data))
        .catch((err) =>
          setError(err instanceof Error ? err.message : "Auto-compare failed"),
        );
    }
  }, [hasAutoRan, search?.a, search?.b, compare]);

  const handleExport = async () => {
    if (!result) return;
    try {
      const json = await exportComparison({
        domainA: result.domainA.domain,
        domainB: result.domainB.domain,
      });
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dns-comparison-${result.domainA.domain}-vs-${result.domainB.domain}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Comparison exported");
    } catch {
      toast.error("Export failed");
    }
  };

  // Determine which analyses to show based on view mode
  const showA = viewMode === "split" || viewMode === "single-a";
  const showB = viewMode === "split" || viewMode === "single-b";

  return (
    <Layout showHero>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Compare Form */}
        <CompareForm
          domainA={domainA}
          domainB={domainB}
          onDomainAChange={setDomainA}
          onDomainBChange={setDomainB}
          onSubmit={handleCompare}
          isPending={isPending}
          error={error}
        />

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* View Toggle + Export */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <ViewToggle
                mode={viewMode}
                domainA={result.domainA.domain}
                domainB={result.domainB.domain}
                onChange={setViewMode}
              />
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="gap-1.5 font-mono text-xs tracking-wider uppercase h-8 px-4"
                style={{
                  background: "rgba(0,255,136,0.08)",
                  color: "#00ff88",
                  border: "1px solid rgba(0,255,136,0.2)",
                }}
                data-ocid="btn-export"
              >
                {isExporting ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <Download size={11} />
                )}
                Export JSON
              </Button>
            </div>

            {/* Threat Score Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {showA && <ThreatScoreCard analysis={result.domainA} side="A" />}
              {showB && <ThreatScoreCard analysis={result.domainB} side="B" />}
            </div>

            {/* Category Breakdown */}
            <div
              className="border border-border overflow-hidden"
              style={{ background: "rgba(11,11,22,0.95)" }}
              data-ocid="category-breakdown"
            >
              <SectionHeader label="CATEGORY BREAKDOWN — CLICK ANY ROW FOR REMEDIATION" />
              <div className="p-4">
                <CategoryBreakdown
                  analysisA={result.domainA}
                  analysisB={viewMode === "split" ? result.domainB : undefined}
                  onRemediate={handleRemediate}
                />
              </div>
            </div>

            {/* Risk Matrix */}
            <RiskMatrix
              analysisA={result.domainA}
              analysisB={result.domainB}
              onCategoryClick={handleRemediate}
            />

            {/* 3D Threat Matrix */}
            <div
              className="border border-border overflow-hidden"
              style={{ background: "rgba(11,11,22,0.95)", height: "360px" }}
              data-ocid="threat-matrix-3d"
            >
              <SectionHeader
                label="3D THREAT MATRIX"
                action={
                  <div className="flex gap-3 text-xs font-mono">
                    <span style={{ color: "#00cfff" }}>
                      ■ {result.domainA.domain}
                    </span>
                    <span style={{ color: "#a78bfa" }}>
                      ■ {result.domainB.domain}
                    </span>
                  </div>
                }
              />
              <div style={{ height: "calc(100% - 44px)" }}>
                <Canvas
                  camera={{ position: [8, 6, 8], fov: 50 }}
                  gl={{ antialias: true, alpha: true }}
                  dpr={[1, 1.5]}
                >
                  <ThreatMatrix3D
                    analysisA={result.domainA}
                    analysisB={result.domainB}
                  />
                </Canvas>
              </div>
            </div>

            {/* 3D Radar Chart — shows both domains overlaid */}
            <div
              className="border border-border overflow-hidden"
              style={{ background: "rgba(11,11,22,0.95)", height: "360px" }}
              data-ocid="radar-chart-combined"
            >
              <SectionHeader label="THREAT RADAR — DOMAIN A (CYAN) vs DOMAIN B (MAGENTA)" />
              <div style={{ height: "calc(100% - 44px)" }}>
                <RadarChart
                  analysisA={result.domainA}
                  analysisB={result.domainB}
                />
              </div>
            </div>

            {/* Common Findings */}
            <div
              className="border border-border overflow-hidden"
              style={{ background: "rgba(11,11,22,0.95)" }}
            >
              <SectionHeader label="COMMON FINDINGS — SHARED VULNERABILITIES" />
              <div className="p-4">
                <CommonFindings result={result} onRemediate={handleRemediate} />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Remediation Modal */}
      <RemediationModal
        category={remediationCategory}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </Layout>
  );
}
