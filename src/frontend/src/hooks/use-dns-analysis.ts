import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { ComparisonResult, DomainAnalysis } from "../types/dns";

// ─── Query Keys ────────────────────────────────────────────────────────────────

export const queryKeys = {
  analysis: (domain: string) => ["dns-analysis", domain] as const,
  comparison: (a: string, b: string) => ["dns-comparison", a, b] as const,
  history: () => ["dns-history"] as const,
  cached: (domain: string) => ["dns-cached", domain] as const,
};

// ─── Individual Domain Analysis ────────────────────────────────────────────────

export function useAnalyzeDomain(domain: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<DomainAnalysis>({
    queryKey: queryKeys.analysis(domain),
    queryFn: async () => {
      if (!actor) throw new Error("Backend not ready");
      return actor.analyzeDomain(domain) as Promise<DomainAnalysis>;
    },
    enabled: !!actor && !isFetching && domain.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

// ─── Get Cached Analysis ───────────────────────────────────────────────────────

export function useCachedAnalysis(domain: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<DomainAnalysis | null>({
    queryKey: queryKeys.cached(domain),
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCachedAnalysis(domain) as Promise<DomainAnalysis | null>;
    },
    enabled: !!actor && !isFetching && domain.length > 0,
    staleTime: 60 * 1000,
  });
}

// ─── Compare Two Domains ───────────────────────────────────────────────────────

export function useCompareDomains(
  domainA: string,
  domainB: string,
  enabled = true,
) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ComparisonResult>({
    queryKey: queryKeys.comparison(domainA, domainB),
    queryFn: async () => {
      if (!actor) throw new Error("Backend not ready");
      return actor.compareDomains(
        domainA,
        domainB,
      ) as Promise<ComparisonResult>;
    },
    enabled:
      !!actor &&
      !isFetching &&
      domainA.length > 0 &&
      domainB.length > 0 &&
      enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

// ─── List Analysed Domains (History) ──────────────────────────────────────────

export function useAnalysisHistory() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<string[]>({
    queryKey: queryKeys.history(),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAnalysedDomains();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30 * 1000,
  });
}

// ─── Analyze Domain Mutation (on-demand trigger) ──────────────────────────────

export function useAnalyzeDomainMutation() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<DomainAnalysis, Error, string>({
    mutationFn: async (domain: string) => {
      if (!actor) throw new Error("Backend not ready");
      return actor.analyzeDomain(domain) as Promise<DomainAnalysis>;
    },
    onSuccess: (data, domain) => {
      queryClient.setQueryData(queryKeys.analysis(domain), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.history() });
    },
  });
}

// ─── Compare Domains Mutation ─────────────────────────────────────────────────

export function useCompareDomainsMutation() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<
    ComparisonResult,
    Error,
    { domainA: string; domainB: string }
  >({
    mutationFn: async ({ domainA, domainB }) => {
      if (!actor) throw new Error("Backend not ready");
      return actor.compareDomains(
        domainA,
        domainB,
      ) as Promise<ComparisonResult>;
    },
    onSuccess: (data, { domainA, domainB }) => {
      queryClient.setQueryData(queryKeys.comparison(domainA, domainB), data);
      queryClient.setQueryData(queryKeys.analysis(domainA), data.domainA);
      queryClient.setQueryData(queryKeys.analysis(domainB), data.domainB);
      queryClient.invalidateQueries({ queryKey: queryKeys.history() });
    },
  });
}

// ─── Export Comparison ─────────────────────────────────────────────────────────

export function useExportComparisonMutation() {
  const { actor } = useActor(createActor);

  return useMutation<string, Error, { domainA: string; domainB: string }>({
    mutationFn: async ({ domainA, domainB }) => {
      if (!actor) throw new Error("Backend not ready");
      return actor.exportComparison(domainA, domainB);
    },
  });
}

// ─── Clear Cache ───────────────────────────────────────────────────────────────

export function useClearCacheMutation() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (domain: string) => {
      if (!actor) throw new Error("Backend not ready");
      return actor.clearCache(domain);
    },
    onSuccess: (_, domain) => {
      queryClient.removeQueries({ queryKey: queryKeys.analysis(domain) });
      queryClient.removeQueries({ queryKey: queryKeys.cached(domain) });
      queryClient.invalidateQueries({ queryKey: queryKeys.history() });
    },
  });
}
