import Map "mo:core/Map";
import Types "types/dns-analysis";
import DnsAnalysisMixin "mixins/dns-analysis-api";

actor {
  // Cache: domain text → most recent DomainAnalysis
  let analysisCache = Map.empty<Text, Types.DomainAnalysis>();

  include DnsAnalysisMixin(analysisCache);
};
