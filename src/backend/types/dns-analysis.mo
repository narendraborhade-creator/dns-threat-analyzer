import Common "common";

module {
  public type Timestamp = Common.Timestamp;

  // The six threat categories evaluated per domain
  public type ThreatCategory = {
    #DnssecRisk;
    #NameserverLegitimacy;
    #HijackingRisk;
    #AmplificationRisk;
    #EncryptionRisk;
    #TldRisk;
  };

  // Per-category score result (0–100 scale, lower = safer)
  public type CategoryScore = {
    category : ThreatCategory;
    score : Nat;           // 0–100
    details : Text;        // human-readable finding
    passed : Bool;
  };

  // Overall analysis result for a single domain
  public type DomainAnalysis = {
    domain : Text;
    overallScore : Nat;         // 0–100, weighted average of categories
    categoryScores : [CategoryScore];
    checkedAt : Timestamp;
    rawDnsJson : Text;          // Raw JSON from DNS APIs (for frontend parsing)
  };

  // Status of an in-progress analysis job
  public type AnalysisStatus = {
    #Pending;
    #InProgress : { completedChecks : Nat; totalChecks : Nat };
    #Complete : DomainAnalysis;
    #Failed : Text;
  };

  // A comparison of two domains
  public type ComparisonResult = {
    domainA : DomainAnalysis;
    domainB : DomainAnalysis;
    exportedAt : Timestamp;
  };

  // Input for requesting a DNS analysis
  public type AnalysisRequest = {
    domain : Text;
  };
};
