import { useActor } from "@caffeineai/core-infrastructure";
import type { ComparisonResult, DomainAnalysis } from "../types/dns";

/**
 * Re-export useActor for use in hooks.
 * The actor implements the full backendInterface from backend.d.ts.
 */
export { useActor };

/**
 * Convert backend bigint scores to number for display.
 */
export function normalizeScore(score: bigint): number {
  return Math.min(100, Math.max(0, Number(score)));
}

/**
 * Compute overall threat label for a domain analysis.
 */
export function getDomainThreatSummary(analysis: DomainAnalysis): {
  score: number;
  passedChecks: number;
  totalChecks: number;
  failedCategories: string[];
} {
  const score = normalizeScore(analysis.overallScore);
  const totalChecks = analysis.categoryScores.length;
  const passedChecks = analysis.categoryScores.filter((c) => c.passed).length;
  const failedCategories = analysis.categoryScores
    .filter((c) => !c.passed)
    .map((c) => c.category);

  return { score, passedChecks, totalChecks, failedCategories };
}

/**
 * Format a Unix timestamp bigint to a readable date string.
 */
export function formatTimestamp(ts: bigint): string {
  const ms = Number(ts) / 1_000_000; // nanoseconds → ms
  if (ms < 1e10) return "Just now"; // if near-zero, it's not set
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(ms));
}

/**
 * Validate a domain string before sending to backend.
 */
export function validateDomain(domain: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = domain.trim().toLowerCase();
  if (!trimmed) return { valid: false, error: "Domain cannot be empty" };
  if (trimmed.length > 253) return { valid: false, error: "Domain too long" };
  // Basic domain pattern
  const pattern = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;
  if (!pattern.test(trimmed)) {
    return { valid: false, error: "Invalid domain format (e.g. example.com)" };
  }
  return { valid: true };
}

/**
 * Strip protocol and trailing slashes from a URL to get a clean domain.
 */
export function cleanDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "");
}

export type { DomainAnalysis, ComparisonResult };
