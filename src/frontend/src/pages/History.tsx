import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Clock,
  Loader2,
  Search,
  Shield,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Layout } from "../components/Layout";
import {
  useAnalysisHistory,
  useAnalyzeDomainMutation,
  useClearCacheMutation,
} from "../hooks/use-dns-analysis";
import {
  scoreToThreatLevel,
  threatLevelColor,
  threatLevelLabel,
} from "../types/dns";
import type { DomainAnalysis } from "../types/dns";

// ─── History Row ──────────────────────────────────────────────────────────────

interface HistoryRowProps {
  domain: string;
  onAnalyze: (domain: string) => void;
  onDelete: (domain: string) => void;
  result?: DomainAnalysis;
  isLoading?: boolean;
}

function HistoryRow({
  domain,
  onAnalyze,
  onDelete,
  result,
  isLoading,
}: HistoryRowProps) {
  const score = result
    ? Math.min(100, Math.max(0, Number(result.overallScore)))
    : null;
  const level = score !== null ? scoreToThreatLevel(score) : null;
  const color = level ? threatLevelColor(level) : "rgba(147,163,203,0.4)";
  const label = level ? threatLevelLabel(level) : "UNCHECKED";

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 px-5 py-3.5 border-b border-border transition-smooth hover:bg-muted/20"
      data-ocid={`history-row-${domain}`}
    >
      {/* Status dot */}
      <div
        className="w-2 h-2 shrink-0"
        style={{
          background: color,
          boxShadow: `0 0 6px ${color}`,
        }}
      />

      {/* Domain */}
      <span
        className="font-mono text-sm flex-1 min-w-0 truncate"
        style={{ color: "#e8eeff" }}
      >
        {domain}
      </span>

      {/* Score */}
      <div className="w-20 text-right">
        {isLoading ? (
          <Skeleton className="h-4 w-16 ml-auto" />
        ) : score !== null ? (
          <span className="font-display font-bold text-sm" style={{ color }}>
            {score}
            <span
              className="text-xs font-mono ml-1"
              style={{ color: "rgba(147,163,203,0.4)" }}
            >
              / 100
            </span>
          </span>
        ) : (
          <span
            className="text-xs font-mono"
            style={{ color: "rgba(147,163,203,0.3)" }}
          >
            —
          </span>
        )}
      </div>

      {/* Threat label */}
      <div className="w-20 text-right">
        <span className="text-xs font-mono tracking-wider" style={{ color }}>
          {label}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          onClick={() => onAnalyze(domain)}
          disabled={isLoading}
          className="h-7 w-7 p-0 flex items-center justify-center"
          style={{
            background: "rgba(0,207,255,0.08)",
            color: "#00cfff",
            border: "1px solid rgba(0,207,255,0.2)",
          }}
          aria-label={`Re-scan ${domain}`}
          data-ocid={`btn-rescan-${domain}`}
        >
          {isLoading ? (
            <Loader2 size={11} className="animate-spin" />
          ) : (
            <Search size={11} />
          )}
        </Button>

        <Link
          to="/compare"
          search={{ a: domain }}
          className="h-7 w-7 flex items-center justify-center transition-smooth"
          style={{
            background: "rgba(167,139,250,0.08)",
            color: "#a78bfa",
            border: "1px solid rgba(167,139,250,0.2)",
          }}
          aria-label={`Compare ${domain}`}
          data-ocid={`btn-compare-${domain}`}
        >
          <ArrowRight size={11} />
        </Link>

        <Button
          onClick={() => onDelete(domain)}
          className="h-7 w-7 p-0 flex items-center justify-center"
          style={{
            background: "rgba(255,32,64,0.06)",
            color: "rgba(255,32,64,0.5)",
            border: "1px solid rgba(255,32,64,0.15)",
          }}
          aria-label={`Clear cache for ${domain}`}
          data-ocid={`btn-clear-${domain}`}
        >
          <Trash2 size={11} />
        </Button>
      </div>
    </motion.div>
  );
}

// ─── History Page ─────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const [filter, setFilter] = useState("");
  const [scanningDomains, setScanningDomains] = useState<Set<string>>(
    new Set(),
  );
  const [scanResults, setScanResults] = useState<Map<string, DomainAnalysis>>(
    new Map(),
  );

  const { data: history, isLoading: historyLoading } = useAnalysisHistory();
  const { mutateAsync: clearCache } = useClearCacheMutation();
  const { mutateAsync: analyzeDomain } = useAnalyzeDomainMutation();

  const filteredHistory = (history ?? []).filter((d) =>
    d.toLowerCase().includes(filter.toLowerCase()),
  );

  const handleAnalyze = async (domain: string) => {
    setScanningDomains((prev) => new Set([...prev, domain]));
    try {
      const result = await analyzeDomain(domain);
      setScanResults((prev) => new Map([...prev, [domain, result]]));
      toast.success(`${domain} analysis complete`);
    } catch {
      toast.error(`Failed to scan ${domain}`);
    } finally {
      setScanningDomains((prev) => {
        const next = new Set(prev);
        next.delete(domain);
        return next;
      });
    }
  };

  const handleDelete = async (domain: string) => {
    try {
      await clearCache(domain);
      setScanResults((prev) => {
        const next = new Map(prev);
        next.delete(domain);
        return next;
      });
      toast.success(`Cache cleared for ${domain}`);
    } catch {
      toast.error(`Failed to clear cache for ${domain}`);
    }
  };

  return (
    <Layout showHero>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header + filter */}
        <div
          className="border border-border p-5 card-inset-glow"
          style={{ background: "rgba(11,11,22,0.92)" }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div
                className="text-xs font-mono tracking-[0.25em] uppercase mb-1"
                style={{ color: "rgba(0,207,255,0.5)" }}
              >
                ⬡ Analysis History
              </div>
              <h2
                className="font-display font-bold text-lg"
                style={{ color: "#e8eeff" }}
              >
                {history?.length ?? 0} Domains Analysed
              </h2>
            </div>

            <div className="relative w-full sm:w-64">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "rgba(0,207,255,0.4)" }}
              />
              <Input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter domains..."
                className="pl-8 font-mono text-xs border-border"
                style={{ background: "rgba(7,7,17,0.8)", color: "#e8eeff" }}
                data-ocid="input-filter"
              />
            </div>
          </div>
        </div>

        {/* History table */}
        <div
          className="border border-border"
          style={{ background: "rgba(11,11,22,0.95)" }}
          data-ocid="history-table"
        >
          {/* Table header */}
          <div
            className="flex items-center gap-4 px-5 py-2.5 border-b border-border"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            <div className="w-2 shrink-0" />
            <span
              className="text-xs font-mono flex-1"
              style={{ color: "rgba(147,163,203,0.4)" }}
            >
              DOMAIN
            </span>
            <span
              className="text-xs font-mono w-20 text-right"
              style={{ color: "rgba(147,163,203,0.4)" }}
            >
              SCORE
            </span>
            <span
              className="text-xs font-mono w-20 text-right"
              style={{ color: "rgba(147,163,203,0.4)" }}
            >
              STATUS
            </span>
            <div className="w-24 shrink-0" />
          </div>

          {/* Loading */}
          {historyLoading && (
            <div className="p-8 flex items-center justify-center gap-3">
              <Loader2
                size={18}
                className="animate-spin"
                style={{ color: "#00cfff" }}
              />
              <span
                className="text-xs font-mono"
                style={{ color: "rgba(0,207,255,0.5)" }}
              >
                LOADING HISTORY...
              </span>
            </div>
          )}

          {/* Empty state */}
          {!historyLoading && filteredHistory.length === 0 && (
            <div
              className="p-12 flex flex-col items-center justify-center text-center"
              data-ocid="empty-history"
            >
              <div className="mb-4">
                <Activity size={36} style={{ color: "rgba(0,207,255,0.2)" }} />
              </div>
              <p
                className="font-display font-semibold text-base"
                style={{ color: "rgba(147,163,203,0.6)" }}
              >
                {filter ? "No domains match your filter" : "No analyses yet"}
              </p>
              <p
                className="text-xs font-mono mt-2"
                style={{ color: "rgba(82,100,140,0.5)" }}
              >
                {filter
                  ? "Try a different search term"
                  : "Analyze a domain to see it here"}
              </p>
              {!filter && (
                <Button
                  asChild
                  className="mt-4 gap-2 font-mono text-xs tracking-wider uppercase"
                  style={{
                    background: "rgba(0,207,255,0.08)",
                    color: "#00cfff",
                    border: "1px solid rgba(0,207,255,0.2)",
                  }}
                  data-ocid="btn-go-analyze"
                >
                  <Link to="/">
                    <Shield size={11} />
                    Start Analyzing
                  </Link>
                </Button>
              )}
            </div>
          )}

          {/* Rows */}
          {!historyLoading &&
            filteredHistory.map((domain, i) => (
              <motion.div
                key={domain}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <HistoryRow
                  domain={domain}
                  onAnalyze={handleAnalyze}
                  onDelete={handleDelete}
                  result={scanResults.get(domain)}
                  isLoading={scanningDomains.has(domain)}
                />
              </motion.div>
            ))}
        </div>

        {/* Batch scan CTA */}
        {filteredHistory.length > 0 && (
          <div
            className="border border-border p-4 flex items-center justify-between"
            style={{ background: "rgba(0,207,255,0.02)" }}
          >
            <div className="flex items-center gap-3">
              <Clock size={13} style={{ color: "rgba(0,207,255,0.4)" }} />
              <span
                className="text-xs font-mono"
                style={{ color: "rgba(147,163,203,0.5)" }}
              >
                {filteredHistory.length} domain
                {filteredHistory.length !== 1 ? "s" : ""} in history
              </span>
            </div>
            <Button
              onClick={() => filteredHistory.slice(0, 3).forEach(handleAnalyze)}
              disabled={scanningDomains.size > 0}
              className="gap-2 font-mono text-xs tracking-wider uppercase h-8 px-4"
              style={{
                background: "rgba(0,207,255,0.08)",
                color: "#00cfff",
                border: "1px solid rgba(0,207,255,0.2)",
              }}
              data-ocid="btn-batch-scan"
            >
              <Search size={11} />
              Scan Recent 3
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
