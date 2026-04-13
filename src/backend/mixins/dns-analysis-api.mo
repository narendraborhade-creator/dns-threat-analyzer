import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Types "../types/dns-analysis";
import DnsLib "../lib/dns-analysis";
import OutCall "mo:caffeineai-http-outcalls/outcall";

// DNS Analysis API mixin.
// Exposes all public endpoints for live DNS security analysis and comparison.
mixin (analysisCache : Map.Map<Text, Types.DomainAnalysis>) {

  // ---------------------------------------------------------------------------
  // Transform callback required by the IC HTTP outcalls subsystem.
  // ---------------------------------------------------------------------------
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // ---------------------------------------------------------------------------
  // Internal: fire a single DoH GET request and return the raw JSON body.
  // ---------------------------------------------------------------------------
  func dohGet(domain : Text, recordType : Text) : async Text {
    let url = DnsLib.buildDohUrl(domain, recordType);
    let headers : [OutCall.Header] = [
      { name = "Accept"; value = "application/dns-json" },
    ];
    await OutCall.httpGetRequest(url, headers, transform);
  };

  // ---------------------------------------------------------------------------
  // Perform a full DNS security analysis on a single domain.
  // ---------------------------------------------------------------------------
  public func analyzeDomain(domain : Text) : async Types.DomainAnalysis {
    // Run all six record-type lookups sequentially (IC consensus requires it).
    let dnskeyJson = await dohGet(domain, "DNSKEY");
    let nsJson     = await dohGet(domain, "NS");
    let soaJson    = await dohGet(domain, "SOA");
    let aJson      = await dohGet(domain, "A");
    let txtJson    = await dohGet(domain, "TXT");
    let httpsJson  = await dohGet(domain, "HTTPS");
    let dsJson     = await dohGet(domain, "DS");

    // Combine DNSKEY + DS into a single blob for the DNSSEC scorer
    let dnssecJson = dnskeyJson # dsJson;

    let scores : [Types.CategoryScore] = [
      DnsLib.scoreDnssec(dnssecJson, domain),
      DnsLib.scoreNameserverLegitimacy(nsJson, soaJson, domain),
      DnsLib.scoreHijackingRisk(nsJson, aJson, domain),
      DnsLib.scoreAmplificationRisk(txtJson, domain),
      DnsLib.scoreEncryptionRisk(httpsJson, domain),
      DnsLib.scoreTldRisk(domain, dsJson),
    ];

    // Combine raw JSON blobs for frontend visualisation
    let rawJson =
      "{\"dnskey\":" # dnskeyJson #
      ",\"ns\":"     # nsJson     #
      ",\"soa\":"    # soaJson    #
      ",\"a\":"      # aJson      #
      ",\"txt\":"    # txtJson    #
      ",\"https\":"  # httpsJson  #
      ",\"ds\":"     # dsJson     # "}";

    let analysis = DnsLib.buildDomainAnalysis(
      domain,
      scores,
      rawJson,
      Time.now(),
    );

    // Cache the result
    analysisCache.add(domain, analysis);
    analysis;
  };

  // ---------------------------------------------------------------------------
  // Compare two domains.
  // ---------------------------------------------------------------------------
  public func compareDomains(domainA : Text, domainB : Text) : async Types.ComparisonResult {
    // Analyse sequentially — IC HTTP outcall limit makes true parallelism unsafe
    let analysisA = await analyzeDomain(domainA);
    let analysisB = await analyzeDomain(domainB);
    DnsLib.buildComparison(analysisA, analysisB, Time.now());
  };

  // ---------------------------------------------------------------------------
  // Return the cached analysis for a domain.
  // ---------------------------------------------------------------------------
  public query func getCachedAnalysis(domain : Text) : async ?Types.DomainAnalysis {
    analysisCache.get(domain);
  };

  // ---------------------------------------------------------------------------
  // List all analysed domains.
  // ---------------------------------------------------------------------------
  public query func listAnalysedDomains() : async [Text] {
    analysisCache.keys().toArray();
  };

  // ---------------------------------------------------------------------------
  // Export a comparison as JSON.
  // ---------------------------------------------------------------------------
  public func exportComparison(domainA : Text, domainB : Text) : async Text {
    let cachedA = analysisCache.get(domainA);
    let cachedB = analysisCache.get(domainB);

    let analysisA = switch (cachedA) {
      case (?a) a;
      case null { await analyzeDomain(domainA) };
    };
    let analysisB = switch (cachedB) {
      case (?b) b;
      case null { await analyzeDomain(domainB) };
    };

    let comparison = DnsLib.buildComparison(analysisA, analysisB, Time.now());
    DnsLib.exportComparisonAsJson(comparison);
  };

  // ---------------------------------------------------------------------------
  // Clear cached analysis for a domain.
  // ---------------------------------------------------------------------------
  public func clearCache(domain : Text) : async () {
    analysisCache.remove(domain);
  };
};
