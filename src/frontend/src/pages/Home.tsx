import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Clock,
  Command,
  CornerDownLeft,
  Loader2,
  Shield,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { ThreatCategory } from "../backend.d";
import { Layout } from "../components/Layout";
import {
  useAnalysisHistory,
  useCompareDomainsMutation,
} from "../hooks/use-dns-analysis";
import { cleanDomain, validateDomain } from "../lib/backend-client";
import { Route } from "../routes/index";
import {
  CATEGORY_LABELS,
  type ComparisonResult,
  type DomainAnalysis,
  scoreToThreatLevel,
  threatLevelColor,
  threatLevelLabel,
} from "../types/dns";

// ─── Progress messages ────────────────────────────────────────────────────────

const PROGRESS_STEPS = [
  "Resolving nameservers...",
  "Checking DNSSEC signatures...",
  "Validating chain of trust...",
  "Probing amplification vectors...",
  "Scanning hijacking risks...",
  "Analyzing TLD reputation...",
  "Testing DNS-over-HTTPS support...",
  "Cross-referencing threat intelligence...",
  "Computing risk scores...",
  "Finalizing analysis...",
];

// ─── Animated progress loader ─────────────────────────────────────────────────

function ScanProgress({ domains }: { domains: [string, string] }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % PROGRESS_STEPS.length);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="border border-border p-6 card-inset-glow"
      style={{ background: "rgba(11,11,22,0.95)" }}
      data-ocid="scan-progress"
    >
      {/* Domain pair header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <div
            className="text-xs font-mono"
            style={{ color: "rgba(0,207,255,0.6)" }}
          >
            {domains[0]}
          </div>
          <div
            className="w-6 h-px"
            style={{ background: "rgba(0,207,255,0.3)" }}
          />
          <div
            className="text-xs font-mono"
            style={{ color: "rgba(0,207,255,0.6)" }}
          >
            {domains[1]}
          </div>
        </div>
        <Loader2
          size={14}
          className="animate-spin"
          style={{ color: "#00cfff" }}
        />
      </div>

      {/* Progress bar */}
      <div
        className="relative h-0.5 w-full mb-4 overflow-hidden"
        style={{ background: "rgba(0,207,255,0.1)" }}
      >
        <motion.div
          className="absolute left-0 top-0 h-full"
          style={{ background: "linear-gradient(90deg, #00cfff, #00ff88)" }}
          animate={{ width: ["0%", "95%"] }}
          transition={{ duration: PROGRESS_STEPS.length * 0.9, ease: "linear" }}
        />
        <motion.div
          className="absolute top-0 h-full w-8"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(0,207,255,0.5), transparent)",
          }}
          animate={{ left: ["-10%", "110%"] }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Step message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.25 }}
          className="flex items-center gap-2"
        >
          <div
            className="w-1 h-1 animate-pulse"
            style={{ background: "#00cfff", boxShadow: "0 0 6px #00cfff" }}
          />
          <span
            className="text-xs font-mono"
            style={{ color: "rgba(147,163,203,0.7)" }}
          >
            {PROGRESS_STEPS[stepIndex]}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Step dots */}
      <div className="flex gap-1 mt-4">
        {PROGRESS_STEPS.map((step, i) => (
          <div
            key={step}
            className="h-0.5 flex-1 transition-all duration-500"
            style={{
              background:
                i <= stepIndex ? "rgba(0,207,255,0.6)" : "rgba(0,207,255,0.1)",
              boxShadow:
                i === stepIndex ? "0 0 4px rgba(0,207,255,0.6)" : "none",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Score Ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const level = scoreToThreatLevel(score);
  const color = threatLevelColor(level);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <title>{`Security score: ${score}`}</title>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={3}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="butt"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display font-bold text-base leading-none"
          style={{ color }}
        >
          {score}
        </span>
        <span
          className="text-[8px] font-mono tracking-widest uppercase"
          style={{ color: "rgba(147,163,203,0.4)" }}
        >
          SCORE
        </span>
      </div>
    </div>
  );
}

// ─── Category Bar ──────────────────────────────────────────────────────────────

function CategoryBar({
  category,
  score,
  passed,
}: { category: ThreatCategory; score: number; passed: boolean }) {
  const color = passed ? "#00ff88" : score >= 40 ? "#ffd700" : "#ff2040";
  return (
    <div className="flex items-center gap-3">
      <span
        className="text-xs font-mono w-24 shrink-0 truncate"
        style={{ color: "rgba(147,163,203,0.6)" }}
      >
        {CATEGORY_LABELS[category]}
      </span>
      <div
        className="flex-1 h-1 overflow-hidden"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        <div
          className="h-full transition-smooth"
          style={{
            width: `${score}%`,
            background: color,
            boxShadow: `0 0 4px ${color}`,
          }}
        />
      </div>
      <span className="text-xs font-mono w-7 text-right" style={{ color }}>
        {score}
      </span>
      {passed ? (
        <CheckCircle size={11} style={{ color: "#00ff88" }} />
      ) : (
        <AlertTriangle size={11} style={{ color }} />
      )}
    </div>
  );
}

// ─── Mini Domain Card ──────────────────────────────────────────────────────────

function DomainResultCard({
  analysis,
  side,
}: { analysis: DomainAnalysis; side: "A" | "B" }) {
  const score = Math.min(100, Math.max(0, Number(analysis.overallScore)));
  const level = scoreToThreatLevel(score);
  const color = threatLevelColor(level);
  const label = threatLevelLabel(level);
  const passedCount = analysis.categoryScores.filter((c) => c.passed).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: side === "B" ? 0.1 : 0 }}
      className="flex-1 border border-border card-inset-glow min-w-0"
      style={{ background: "rgba(11,11,22,0.95)" }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b border-border flex items-center justify-between gap-3"
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <div className="min-w-0">
          <div
            className="text-[10px] font-mono tracking-widest mb-0.5"
            style={{ color: "rgba(0,207,255,0.4)" }}
          >
            DOMAIN {side}
          </div>
          <div
            className="font-display font-bold text-sm truncate"
            style={{ color: "#e8eeff" }}
          >
            {analysis.domain}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <Badge
              className="font-mono text-[10px] tracking-wider border-0 px-2"
              style={{
                background: `${color}20`,
                color,
                boxShadow: `0 0 6px ${color}30`,
              }}
            >
              {label}
            </Badge>
            <div
              className="text-[10px] font-mono mt-1"
              style={{ color: "rgba(147,163,203,0.4)" }}
            >
              {passedCount}/{analysis.categoryScores.length} checks
            </div>
          </div>
          <ScoreRing score={score} size={60} />
        </div>
      </div>
      {/* Categories */}
      <div className="px-4 py-4 space-y-2.5">
        {analysis.categoryScores.map((cs) => (
          <CategoryBar
            key={cs.category}
            category={cs.category}
            score={Math.min(100, Math.max(0, Number(cs.score)))}
            passed={cs.passed}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Comparison Result ────────────────────────────────────────────────────────

function ComparisonResultView({
  result,
  onCompare,
}: {
  result: ComparisonResult;
  onCompare: () => void;
}) {
  const navigate = useNavigate();

  const scoreA = Math.min(
    100,
    Math.max(0, Number(result.domainA.overallScore)),
  );
  const scoreB = Math.min(
    100,
    Math.max(0, Number(result.domainB.overallScore)),
  );
  const winner = scoreA > scoreB ? "A" : scoreB > scoreA ? "B" : null;
  const winnerDomain =
    winner === "A" ? result.domainA.domain : result.domainB.domain;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
      data-ocid="comparison-result"
    >
      {/* Summary banner */}
      {winner && (
        <div
          className="border border-border px-5 py-3 flex items-center justify-between"
          style={{
            background: "rgba(0,255,136,0.04)",
            borderColor: "rgba(0,255,136,0.2)",
          }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle size={14} style={{ color: "#00ff88" }} />
            <span
              className="text-xs font-mono"
              style={{ color: "rgba(147,163,203,0.7)" }}
            >
              Domain {winner} is more secure:
            </span>
            <span
              className="text-xs font-mono font-bold"
              style={{ color: "#00ff88" }}
            >
              {winnerDomain}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCompare}
              className="text-[10px] font-mono tracking-widest transition-smooth hover:opacity-80"
              style={{ color: "rgba(0,207,255,0.5)" }}
            >
              ↺ RESCAN
            </button>
            <Button
              onClick={() =>
                navigate({
                  to: "/compare",
                  search: {
                    a: result.domainA.domain,
                    b: result.domainB.domain,
                  } as Record<string, string>,
                })
              }
              className="h-7 gap-1 font-mono text-[10px] tracking-wider uppercase"
              style={{
                background: "rgba(0,207,255,0.08)",
                color: "#00cfff",
                border: "1px solid rgba(0,207,255,0.2)",
              }}
              data-ocid="btn-full-compare"
            >
              <Zap size={10} />
              Full Analysis
            </Button>
          </div>
        </div>
      )}

      {/* Side-by-side cards */}
      <div className="flex gap-4">
        <DomainResultCard analysis={result.domainA} side="A" />
        <DomainResultCard analysis={result.domainB} side="B" />
      </div>
    </motion.div>
  );
}

// ─── Recent Comparisons ───────────────────────────────────────────────────────

const DEMO_COMPARISONS = [
  { a: "cloudflare.com", b: "google.com" },
  { a: "github.com", b: "gitlab.com" },
  { a: "amazon.com", b: "microsoft.com" },
];

function RecentComparisons({
  history,
  onLaunch,
  isPending,
}: {
  history: string[];
  onLaunch: (a: string, b: string) => void;
  isPending: boolean;
}) {
  const pairs =
    history.length >= 2
      ? Array.from({ length: Math.floor(history.length / 2) }, (_, i) => ({
          a: history[i * 2],
          b: history[i * 2 + 1],
        })).slice(0, 3)
      : DEMO_COMPARISONS;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="border border-border"
      style={{ background: "rgba(11,11,22,0.9)" }}
      data-ocid="recent-comparisons"
    >
      <div
        className="px-5 py-3 border-b border-border flex items-center gap-2"
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <Clock size={11} style={{ color: "rgba(0,207,255,0.5)" }} />
        <span
          className="text-xs font-mono tracking-widest"
          style={{ color: "rgba(0,207,255,0.5)" }}
        >
          {history.length >= 2 ? "RECENT COMPARISONS" : "QUICK LAUNCH"}
        </span>
      </div>
      <div className="divide-y divide-border">
        {pairs.map((pair) => (
          <button
            key={`${pair.a}-${pair.b}`}
            type="button"
            onClick={() => onLaunch(pair.a, pair.b)}
            disabled={isPending}
            className="w-full flex items-center justify-between px-5 py-3 transition-smooth hover:bg-muted/20 disabled:opacity-50"
            data-ocid={`quick-compare-${pair.a}-${pair.b}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono" style={{ color: "#e8eeff" }}>
                {pair.a}
              </span>
              <div
                className="flex items-center gap-1 text-[10px] font-mono"
                style={{ color: "rgba(82,100,140,0.5)" }}
              >
                <span>vs</span>
              </div>
              <span className="text-sm font-mono" style={{ color: "#e8eeff" }}>
                {pair.b}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-mono"
                style={{ color: "rgba(147,163,203,0.35)" }}
              >
                COMPARE
              </span>
              <ChevronRight
                size={12}
                style={{ color: "rgba(0,207,255,0.35)" }}
              />
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Threat Teaser ────────────────────────────────────────────────────────────

function ThreatTeaser() {
  const categories = Object.keys(CATEGORY_LABELS) as ThreatCategory[];
  const mockScores = [42, 85, 28, 71, 55, 90];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="border border-border p-5 grid-overlay relative overflow-hidden"
      style={{ background: "rgba(0,207,255,0.02)" }}
      data-ocid="threat-teaser"
    >
      {/* Ambient glow blobs */}
      <div
        className="absolute -top-8 right-8 w-48 h-48 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(0,207,255,0.06) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-8 left-16 w-32 h-32 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,32,64,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div
              className="text-[10px] font-mono tracking-widest mb-1"
              style={{ color: "rgba(0,207,255,0.4)" }}
            >
              ⬡ THREAT MATRIX PREVIEW
            </div>
            <p
              className="text-xs font-mono"
              style={{ color: "rgba(147,163,203,0.5)" }}
            >
              Full 3D threat visualization available in comparison view
            </p>
          </div>
          <Shield size={18} style={{ color: "rgba(0,207,255,0.2)" }} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {categories.map((cat, i) => {
            const score = mockScores[i] ?? 50;
            const color =
              score >= 70 ? "#00ff88" : score >= 40 ? "#ffd700" : "#ff2040";
            return (
              <motion.div
                key={cat}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-mono"
                    style={{ color: "rgba(147,163,203,0.5)" }}
                  >
                    {CATEGORY_LABELS[cat]}
                  </span>
                  <span className="text-[10px] font-mono" style={{ color }}>
                    {score}
                  </span>
                </div>
                <div
                  className="h-1 overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <motion.div
                    className="h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{
                      delay: 0.6 + i * 0.08,
                      duration: 0.6,
                      ease: "easeOut",
                    }}
                    style={{ background: color, boxShadow: `0 0 4px ${color}` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <span
            className="text-[10px] font-mono"
            style={{ color: "rgba(82,100,140,0.4)" }}
          >
            Sample domain — enter your targets above to run a live scan
          </span>
          <div
            className="flex items-center gap-1"
            style={{ color: "rgba(0,207,255,0.3)" }}
          >
            <Zap size={10} />
            <span className="text-[10px] font-mono">LIVE DATA</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Keyboard Hints ───────────────────────────────────────────────────────────

function KeyboardHints() {
  return (
    <div className="flex items-center gap-4 justify-end flex-wrap">
      <div className="flex items-center gap-1.5">
        <div
          className="flex items-center gap-0.5 px-1.5 py-0.5 border border-border font-mono text-[9px]"
          style={{
            background: "rgba(255,255,255,0.03)",
            color: "rgba(147,163,203,0.4)",
          }}
        >
          <CornerDownLeft size={9} />
          <span>Enter</span>
        </div>
        <span
          className="text-[10px] font-mono"
          style={{ color: "rgba(82,100,140,0.4)" }}
        >
          run scan
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className="flex items-center gap-0.5 px-1.5 py-0.5 border border-border font-mono text-[9px]"
          style={{
            background: "rgba(255,255,255,0.03)",
            color: "rgba(147,163,203,0.4)",
          }}
        >
          <Command size={9} />
          <span>K</span>
        </div>
        <span
          className="text-[10px] font-mono"
          style={{ color: "rgba(82,100,140,0.4)" }}
        >
          focus input
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className="px-1.5 py-0.5 border border-border font-mono text-[9px]"
          style={{
            background: "rgba(255,255,255,0.03)",
            color: "rgba(147,163,203,0.4)",
          }}
        >
          Tab
        </div>
        <span
          className="text-[10px] font-mono"
          style={{ color: "rgba(82,100,140,0.4)" }}
        >
          next field
        </span>
      </div>
    </div>
  );
}

// ─── Main Input Form ──────────────────────────────────────────────────────────

function DomainInputField({
  label,
  value,
  onChange,
  error,
  disabled,
  placeholder,
  id,
  inputRef,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error: string | null;
  disabled: boolean;
  placeholder: string;
  id: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const hasError = !!error;
  const borderColor = hasError
    ? "rgba(255,32,64,0.5)"
    : value
      ? "rgba(0,207,255,0.3)"
      : "rgba(35,38,58,1)";
  const glowColor = hasError ? "rgba(255,32,64,0.15)" : "rgba(0,207,255,0.08)";

  return (
    <div className="flex-1 min-w-0">
      <label
        htmlFor={id}
        className="block text-[10px] font-mono tracking-widest mb-2"
        style={{ color: hasError ? "#ff2040" : "rgba(0,207,255,0.5)" }}
      >
        {label}
      </label>
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="font-mono text-sm h-11 pr-4 transition-smooth"
          style={{
            background: "rgba(7,7,17,0.9)",
            color: "#e8eeff",
            border: `1px solid ${borderColor}`,
            boxShadow: `0 0 12px ${glowColor}`,
          }}
          data-ocid={id}
        />
        {value && !hasError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5"
            style={{ background: "#00cfff", boxShadow: "0 0 6px #00cfff" }}
          />
        )}
      </div>
      <AnimatePresence>
        {hasError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 text-[10px] font-mono flex items-center gap-1.5"
            style={{ color: "#ff2040" }}
          >
            <AlertTriangle size={9} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const [domainA, setDomainA] = useState(search.a ?? "");
  const [domainB, setDomainB] = useState(search.b ?? "");
  const [errorA, setErrorA] = useState<string | null>(null);
  const [errorB, setErrorB] = useState<string | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [scanDomains, setScanDomains] = useState<[string, string] | null>(null);

  const inputARef = useRef<HTMLInputElement>(null);
  const autoRanRef = useRef(false);
  const { mutateAsync: compareDomains, isPending } =
    useCompareDomainsMutation();
  const { data: history } = useAnalysisHistory();

  // ⌘K / Ctrl+K — focus Domain A input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputARef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Auto-run if both params are set from URL — capture initial values only
  const initialA = search.a;
  const initialB = search.b;
  useEffect(() => {
    if (autoRanRef.current) return;
    if (initialA && initialB) {
      autoRanRef.current = true;
      const cleanA = cleanDomain(initialA);
      const cleanB = cleanDomain(initialB);
      handleCompare(cleanA, cleanB);
    }
    // handleCompare is stable (defined below) — intentional mount-only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialA, initialB]);

  const validate = (a: string, b: string): boolean => {
    const va = validateDomain(a);
    const vb = validateDomain(b);
    setErrorA(va.valid ? null : (va.error ?? "Invalid domain"));
    setErrorB(vb.valid ? null : (vb.error ?? "Invalid domain"));
    return va.valid && vb.valid;
  };

  const handleCompare = async (a?: string, b?: string) => {
    const cleanA = cleanDomain(a ?? domainA);
    const cleanB = cleanDomain(b ?? domainB);
    if (!validate(cleanA, cleanB)) return;

    setScanDomains([cleanA, cleanB]);
    setResult(null);

    // Sync URL
    navigate({
      to: "/",
      search: { a: cleanA, b: cleanB },
      replace: true,
    });

    try {
      const data = await compareDomains({ domainA: cleanA, domainB: cleanB });
      setScanDomains(null);
      setResult(data);
    } catch (err) {
      setScanDomains(null);
      setErrorA(
        err instanceof Error
          ? err.message
          : "Analysis failed. Please try again.",
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCompare();
  };

  const handleQuickLaunch = (a: string, b: string) => {
    setDomainA(a);
    setDomainB(b);
    handleCompare(a, b);
  };

  return (
    <Layout showHero>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* ── Main Input Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="border border-border card-inset-glow relative overflow-hidden"
          style={{ background: "rgba(11,11,22,0.95)" }}
        >
          {/* Ambient top-edge glow */}
          <div
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(0,207,255,0.4), transparent)",
            }}
          />

          <div className="px-6 pt-5 pb-2">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div
                  className="text-[10px] font-mono tracking-[0.25em] uppercase mb-1.5"
                  style={{ color: "rgba(0,207,255,0.45)" }}
                >
                  ⬡ DNS Security Comparison
                </div>
                <h1
                  className="font-display font-bold text-lg"
                  style={{ color: "#e8eeff" }}
                >
                  Compare Two Domains
                </h1>
              </div>
              <Shield size={20} style={{ color: "rgba(0,207,255,0.2)" }} />
            </div>

            <form onSubmit={handleSubmit} data-ocid="form-compare">
              <div className="flex gap-4 items-start mb-4">
                <DomainInputField
                  label="DOMAIN A"
                  value={domainA}
                  onChange={(v) => {
                    setDomainA(v);
                    if (errorA) setErrorA(null);
                  }}
                  error={errorA}
                  disabled={isPending}
                  placeholder="e.g. cloudflare.com"
                  id="input-domain-a"
                  inputRef={inputARef}
                />

                {/* VS Divider */}
                <div className="flex flex-col items-center justify-center pt-6 shrink-0">
                  <div
                    className="w-px h-4"
                    style={{ background: "rgba(0,207,255,0.15)" }}
                  />
                  <div
                    className="px-2 py-1 border border-border text-[10px] font-mono my-1"
                    style={{
                      background: "rgba(0,207,255,0.04)",
                      color: "rgba(0,207,255,0.4)",
                    }}
                  >
                    VS
                  </div>
                  <div
                    className="w-px h-4"
                    style={{ background: "rgba(0,207,255,0.15)" }}
                  />
                </div>

                <DomainInputField
                  label="DOMAIN B"
                  value={domainB}
                  onChange={(v) => {
                    setDomainB(v);
                    if (errorB) setErrorB(null);
                  }}
                  error={errorB}
                  disabled={isPending}
                  placeholder="e.g. google.com"
                  id="input-domain-b"
                />
              </div>

              {/* Submit button */}
              <div className="flex items-center justify-between gap-4">
                <KeyboardHints />
                <motion.div
                  whileHover={!isPending ? { scale: 1.02 } : {}}
                  whileTap={!isPending ? { scale: 0.98 } : {}}
                >
                  <Button
                    type="submit"
                    disabled={isPending || !domainA.trim() || !domainB.trim()}
                    className="gap-2 font-mono text-xs tracking-widest uppercase px-8 h-11 relative overflow-hidden"
                    style={{
                      background: isPending
                        ? "rgba(0,207,255,0.04)"
                        : "rgba(0,207,255,0.1)",
                      color: isPending ? "rgba(0,207,255,0.4)" : "#00cfff",
                      border: `1px solid ${isPending ? "rgba(0,207,255,0.15)" : "rgba(0,207,255,0.35)"}`,
                      boxShadow: isPending
                        ? "none"
                        : "0 0 20px rgba(0,207,255,0.2), 0 0 40px rgba(0,207,255,0.08), inset 0 1px 0 rgba(0,207,255,0.15)",
                    }}
                    data-ocid="btn-compare"
                  >
                    {/* Shimmer on hover */}
                    {!isPending && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{
                          duration: 3,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                          repeatDelay: 2,
                        }}
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, rgba(0,207,255,0.15), transparent)",
                        }}
                      />
                    )}
                    {isPending ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Zap size={12} />
                        Run Comparison
                        <ArrowRight size={12} />
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </form>
          </div>

          {/* Quick examples */}
          <div
            className="px-6 py-3 border-t border-border flex items-center gap-3 flex-wrap"
            style={{ background: "rgba(255,255,255,0.01)" }}
          >
            <span
              className="text-[10px] font-mono"
              style={{ color: "rgba(82,100,140,0.5)" }}
            >
              Quick pairs:
            </span>
            {[
              { a: "cloudflare.com", b: "google.com" },
              { a: "github.com", b: "gitlab.com" },
            ].map((pair) => (
              <button
                key={`${pair.a}-${pair.b}`}
                type="button"
                onClick={() => handleQuickLaunch(pair.a, pair.b)}
                disabled={isPending}
                className="text-[10px] font-mono px-2 py-1 border border-border transition-smooth hover:border-accent disabled:opacity-40"
                style={{
                  color: "rgba(0,207,255,0.55)",
                  background: "transparent",
                }}
                data-ocid={`quick-pair-${pair.a}`}
              >
                {pair.a} vs {pair.b}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Loading state ── */}
        <AnimatePresence>
          {isPending && scanDomains && <ScanProgress domains={scanDomains} />}
        </AnimatePresence>

        {/* ── Comparison Result ── */}
        <AnimatePresence>
          {result && !isPending && (
            <ComparisonResultView
              result={result}
              onCompare={() => {
                setResult(null);
                handleCompare();
              }}
            />
          )}
        </AnimatePresence>

        {/* ── Recent / quick launch & threat teaser (when no result) ── */}
        {!result && !isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-4"
          >
            {/* Threat teaser — spans 3 cols */}
            <div className="lg:col-span-3">
              <ThreatTeaser />
            </div>

            {/* Recent comparisons — spans 2 cols */}
            <div className="lg:col-span-2">
              <RecentComparisons
                history={history ?? []}
                onLaunch={handleQuickLaunch}
                isPending={isPending}
              />
            </div>
          </motion.div>
        )}

        {/* ── Full comparison CTA ── */}
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="border border-border px-6 py-4 flex items-center justify-between gap-4"
            style={{ background: "rgba(0,207,255,0.02)" }}
          >
            <div>
              <p
                className="text-xs font-mono font-bold"
                style={{ color: "#e8eeff" }}
              >
                Dive deeper with full 3D visualization
              </p>
              <p
                className="text-[10px] font-mono mt-0.5"
                style={{ color: "rgba(147,163,203,0.4)" }}
              >
                Interactive threat matrix, radar charts, and exportable report
              </p>
            </div>
            <Button
              onClick={() =>
                navigate({
                  to: "/compare",
                  search: {
                    a: result.domainA.domain,
                    b: result.domainB.domain,
                  } as Record<string, string>,
                })
              }
              className="gap-2 font-mono text-xs tracking-wider uppercase shrink-0"
              style={{
                background: "rgba(0,207,255,0.1)",
                color: "#00cfff",
                border: "1px solid rgba(0,207,255,0.25)",
                boxShadow: "0 0 16px rgba(0,207,255,0.12)",
              }}
              data-ocid="btn-open-3d-compare"
            >
              <ArrowRight size={12} />
              Open 3D View
            </Button>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
