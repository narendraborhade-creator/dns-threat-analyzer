import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface CategoryScore {
    score: bigint;
    details: string;
    category: ThreatCategory;
    passed: boolean;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface DomainAnalysis {
    overallScore: bigint;
    domain: string;
    rawDnsJson: string;
    checkedAt: Timestamp;
    categoryScores: Array<CategoryScore>;
}
export interface ComparisonResult {
    exportedAt: Timestamp;
    domainA: DomainAnalysis;
    domainB: DomainAnalysis;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export enum ThreatCategory {
    AmplificationRisk = "AmplificationRisk",
    EncryptionRisk = "EncryptionRisk",
    NameserverLegitimacy = "NameserverLegitimacy",
    TldRisk = "TldRisk",
    DnssecRisk = "DnssecRisk",
    HijackingRisk = "HijackingRisk"
}
export interface backendInterface {
    analyzeDomain(domain: string): Promise<DomainAnalysis>;
    clearCache(domain: string): Promise<void>;
    compareDomains(domainA: string, domainB: string): Promise<ComparisonResult>;
    exportComparison(domainA: string, domainB: string): Promise<string>;
    getCachedAnalysis(domain: string): Promise<DomainAnalysis | null>;
    listAnalysedDomains(): Promise<Array<string>>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
