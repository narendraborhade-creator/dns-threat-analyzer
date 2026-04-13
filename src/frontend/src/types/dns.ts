import { ThreatCategory } from "../backend.d";

export type { ThreatCategory };

export interface DomainAnalysis {
  domain: string;
  overallScore: bigint;
  categoryScores: CategoryScore[];
  checkedAt: bigint;
  rawDnsJson: string;
}

export interface CategoryScore {
  category: ThreatCategory;
  score: bigint;
  details: string;
  passed: boolean;
}

export interface ComparisonResult {
  domainA: DomainAnalysis;
  domainB: DomainAnalysis;
  exportedAt: bigint;
}

export type ThreatLevel = "critical" | "warning" | "safe";

export function scoreToThreatLevel(score: bigint | number): ThreatLevel {
  const n = typeof score === "bigint" ? Number(score) : score;
  if (n >= 70) return "safe";
  if (n >= 40) return "warning";
  return "critical";
}

export function threatLevelColor(level: ThreatLevel): string {
  switch (level) {
    case "critical":
      return "#ff2040";
    case "warning":
      return "#ffd700";
    case "safe":
      return "#00ff88";
  }
}

export function threatLevelLabel(level: ThreatLevel): string {
  switch (level) {
    case "critical":
      return "CRITICAL";
    case "warning":
      return "WARNING";
    case "safe":
      return "SECURE";
  }
}

export const CATEGORY_LABELS: Record<ThreatCategory, string> = {
  [ThreatCategory.DnssecRisk]: "DNSSEC",
  [ThreatCategory.NameserverLegitimacy]: "NS Legitimacy",
  [ThreatCategory.HijackingRisk]: "Hijacking",
  [ThreatCategory.AmplificationRisk]: "Amplification",
  [ThreatCategory.EncryptionRisk]: "Encryption",
  [ThreatCategory.TldRisk]: "TLD Risk",
};

export const CATEGORY_DESCRIPTIONS: Record<ThreatCategory, string> = {
  [ThreatCategory.DnssecRisk]: "DNSSEC signature validation and chain of trust",
  [ThreatCategory.NameserverLegitimacy]:
    "Authoritative nameserver legitimacy check",
  [ThreatCategory.HijackingRisk]: "DNS hijacking and cache poisoning vectors",
  [ThreatCategory.AmplificationRisk]:
    "DNS amplification attack surface exposure",
  [ThreatCategory.EncryptionRisk]: "DNS-over-HTTPS / DNS-over-TLS adoption",
  [ThreatCategory.TldRisk]: "Top-level domain reputation and abuse history",
};
