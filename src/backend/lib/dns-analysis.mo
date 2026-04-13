import Types "../types/dns-analysis";
import Text "mo:core/Text";
import List "mo:core/List";
import Iter "mo:core/Iter";

module {

  // ---------------------------------------------------------------------------
  // Known reputable nameserver suffixes for hijacking / legitimacy checks
  // ---------------------------------------------------------------------------
  let knownNsSuffixes : [Text] = [
    "cloudflare.com",
    "awsdns",
    "azure-dns",
    "googledomains.com",
    "domaincontrol.com",
    "registrar-servers.com",
    "name-services.com",
    "verisigndns.com",
    "ultradns.net",
    "ultradns.com",
    "nsone.net",
    "dnsmadeeasy.com",
    "dnsimple.com",
    "name.com",
    "hover.com",
    "he.net",
    "hurricane.net",
    "dreamhost.com",
    "pair.com",
    "rackspace.com",
    "akamaiedge.net",
    "akamai.net",
  ];

  // DNSSEC-enabled well-known TLDs
  let dnssecTlds : [Text] = [
    "com", "net", "org", "gov", "edu", "int", "mil",
    "io", "co", "uk", "de", "fr", "nl", "se", "no",
    "dk", "fi", "is", "be", "at", "ch", "it", "es",
    "pt", "pl", "cz", "sk", "hu", "ro", "bg", "hr",
    "si", "ee", "lv", "lt", "ru", "ua", "by", "rs",
    "me", "ba", "mk", "al", "gr", "tr", "il", "ae",
    "sa", "jp", "kr", "cn", "in", "au", "nz", "ca",
    "mx", "br", "ar", "cl", "za", "eg", "ng", "ke",
    "app", "dev", "page", "web",
  ];

  // ---------------------------------------------------------------------------
  // Build the Cloudflare DoH URL for a given domain and record type
  // ---------------------------------------------------------------------------
  public func buildDohUrl(domain : Text, recordType : Text) : Text {
    "https://cloudflare-dns.com/dns-query?name=" # domain # "&type=" # recordType;
  };

  // ---------------------------------------------------------------------------
  // Minimal JSON text extractor — searches for "data":"..." values in answer
  // section of Cloudflare DoH JSON responses.
  // We do NOT attempt a full JSON parse — we extract "data" field values from
  // the Answer array using simple substring search.  The frontend receives the
  // raw JSON for rich visualisation.
  // ---------------------------------------------------------------------------
  public func extractAnswers(jsonText : Text) : [Text] {
    let parts = jsonText.split(#text "\"data\":\"");
    let buf = List.empty<Text>();
    var isFirst = true;
    for (part in parts) {
      if (isFirst) { isFirst := false } else {
        let inner = part.split(#text "\"");
        switch (inner.find(func(_ : Text) : Bool { true })) {
          case (?value) { buf.add(value) };
          case null {};
        };
      };
    };
    buf.toArray();
  };

  // Check whether a JSON body contains an "Answer" section (indicating a
  // successful non-NXDOMAIN response).
  func hasAnswerSection(json : Text) : Bool {
    json.contains(#text "\"Answer\"");
  };

  // Check whether json contains a specific text fragment (case-sensitive).
  func jsonContains(json : Text, fragment : Text) : Bool {
    json.contains(#text fragment);
  };

  // Extract the number of answer records from Status / Answer array size.
  // Simple heuristic: count occurrences of "\"type\":" inside the Answer block.
  func countAnswerRecords(json : Text) : Nat {
    var count = 0;
    let parts = json.split(#text "\"type\":");
    var isFirst = true;
    for (_ in parts) {
      if (isFirst) { isFirst := false } else { count += 1 };
    };
    count;
  };

  // ---------------------------------------------------------------------------
  // TLD extraction helper
  // ---------------------------------------------------------------------------
  func extractTld(domain : Text) : Text {
    let parts = domain.split(#char '.').toArray();
    if (parts.size() == 0) return "";
    parts[parts.size() - 1];
  };

  // ---------------------------------------------------------------------------
  // DNSSEC risk scoring
  // Checks DS, DNSKEY, and RRSIG records. High score = high risk.
  // ---------------------------------------------------------------------------
  public func scoreDnssec(jsonText : Text, domain : Text) : Types.CategoryScore {
    let hasDnskey = jsonContains(jsonText, "\"type\":48") or jsonContains(jsonText, "\"type\": 48");
    let hasRrsig  = jsonContains(jsonText, "\"type\":46") or jsonContains(jsonText, "\"type\": 46");
    let hasDs     = jsonContains(jsonText, "\"type\":43") or jsonContains(jsonText, "\"type\": 43");
    let answered  = hasAnswerSection(jsonText);

    if (not answered) {
      // No DNS response at all — treat as high risk
      return {
        category = #DnssecRisk;
        score    = 90;
        details  = "No DNS response received for " # domain # ". Cannot verify DNSSEC.";
        passed   = false;
      };
    };

    if (hasDnskey and hasRrsig and hasDs) {
      return {
        category = #DnssecRisk;
        score    = 5;
        details  = "DNSSEC fully configured: DNSKEY, RRSIG, and DS records all present for " # domain # ".";
        passed   = true;
      };
    };

    if (hasDnskey and hasRrsig) {
      return {
        category = #DnssecRisk;
        score    = 20;
        details  = "DNSSEC partially configured: DNSKEY+RRSIG present but no DS record for " # domain # ".";
        passed   = true;
      };
    };

    if (hasDnskey) {
      return {
        category = #DnssecRisk;
        score    = 55;
        details  = "DNSKEY present but no RRSIG signatures found. DNSSEC chain is incomplete for " # domain # ".";
        passed   = false;
      };
    };

    {
      category = #DnssecRisk;
      score    = 80;
      details  = "No DNSSEC records (DNSKEY/RRSIG/DS) found for " # domain # ". Domain is not DNSSEC-protected.";
      passed   = false;
    };
  };

  // ---------------------------------------------------------------------------
  // Nameserver legitimacy scoring
  // ---------------------------------------------------------------------------
  public func scoreNameserverLegitimacy(nsJson : Text, soaJson : Text, domain : Text) : Types.CategoryScore {
    if (not hasAnswerSection(nsJson)) {
      return {
        category = #NameserverLegitimacy;
        score    = 85;
        details  = "No NS records found for " # domain # ". Domain may be lame-delegated or not registered.";
        passed   = false;
      };
    };

    // Count NS records
    let nsCount = countAnswerRecords(nsJson);

    // Check if SOA is present (authoritative server responds)
    let hasSoa = hasAnswerSection(soaJson);

    // Check whether any NS value matches a known reputable suffix
    var knownCount = 0;
    for (suffix in knownNsSuffixes.values()) {
      if (jsonContains(nsJson, suffix)) {
        knownCount += 1;
      };
    };

    if (not hasSoa) {
      return {
        category = #NameserverLegitimacy;
        score    = 70;
        details  = "NS records present for " # domain # " but no SOA record returned. Possible lame delegation.";
        passed   = false;
      };
    };

    if (nsCount < 2) {
      return {
        category = #NameserverLegitimacy;
        score    = 45;
        details  = "Only one NS record found for " # domain # ". Recommend at least two for redundancy.";
        passed   = false;
      };
    };

    if (knownCount > 0) {
      return {
        category = #NameserverLegitimacy;
        score    = 5;
        details  = "Nameservers for " # domain # " are from a recognised provider and SOA is valid.";
        passed   = true;
      };
    };

    {
      category = #NameserverLegitimacy;
      score    = 30;
      details  = "NS records present for " # domain # " with valid SOA, but provider not in known-good list.";
      passed   = true;
    };
  };

  // ---------------------------------------------------------------------------
  // DNS hijacking risk scoring
  // ---------------------------------------------------------------------------
  public func scoreHijackingRisk(nsJson : Text, aJson : Text, domain : Text) : Types.CategoryScore {
    let hasNs = hasAnswerSection(nsJson);
    let hasA  = hasAnswerSection(aJson);

    if (not hasNs) {
      return {
        category = #HijackingRisk;
        score    = 75;
        details  = "No NS records found for " # domain # ". Cannot assess hijacking risk.";
        passed   = false;
      };
    };

    // Heuristic: if A record resolves to a RFC-1918 / loopback address, flag it
    let suspiciousIps = ["10.", "192.168.", "172.16.", "172.17.", "172.18.", "172.19.",
                         "172.2", "172.3", "127.", "0.0.0.0"];
    var hasSuspiciousIp = false;
    for (ip in suspiciousIps.values()) {
      if (jsonContains(aJson, ip)) {
        hasSuspiciousIp := true;
      };
    };

    // Check for multiple NS record providers — mixing unknown with known may indicate hijack
    var knownNsCount = 0;
    for (suffix in knownNsSuffixes.values()) {
      if (jsonContains(nsJson, suffix)) {
        knownNsCount += 1;
      };
    };

    if (hasSuspiciousIp) {
      return {
        category = #HijackingRisk;
        score    = 90;
        details  = "A record for " # domain # " resolves to a private/loopback IP. Possible DNS hijacking or misconfiguration.";
        passed   = false;
      };
    };

    if (not hasA) {
      return {
        category = #HijackingRisk;
        score    = 40;
        details  = "NS records present but no A record resolved for " # domain # ". Domain may be parked or misconfigured.";
        passed   = false;
      };
    };

    if (knownNsCount > 0) {
      return {
        category = #HijackingRisk;
        score    = 10;
        details  = "NS records trace to a recognised provider and A record resolves normally for " # domain # ".";
        passed   = true;
      };
    };

    {
      category = #HijackingRisk;
      score    = 35;
      details  = "NS and A records present for " # domain # " but NS provider is unknown. Monitor for unauthorised changes.";
      passed   = true;
    };
  };

  // ---------------------------------------------------------------------------
  // Amplification risk scoring (via TXT/SPF/DMARC)
  // ---------------------------------------------------------------------------
  public func scoreAmplificationRisk(txtJson : Text, domain : Text) : Types.CategoryScore {
    let hasSpf   = jsonContains(txtJson, "v=spf1");
    let hasDmarc = jsonContains(txtJson, "v=DMARC1");
    let txtCount = countAnswerRecords(txtJson);
    let answered = hasAnswerSection(txtJson);

    if (not answered) {
      return {
        category = #AmplificationRisk;
        score    = 50;
        details  = "No TXT records found for " # domain # ". Cannot assess SPF/DMARC amplification exposure.";
        passed   = false;
      };
    };

    // Large TXT payload = higher amplification factor
    let highPayload = txtJson.size() > 2000;

    if (hasSpf and hasDmarc and not highPayload) {
      return {
        category = #AmplificationRisk;
        score    = 10;
        details  = "SPF and DMARC policies present for " # domain # ". Low amplification and spoofing risk.";
        passed   = true;
      };
    };

    if (hasSpf and not hasDmarc) {
      return {
        category = #AmplificationRisk;
        score    = 40;
        details  = "SPF present but no DMARC policy for " # domain # ". Email spoofing partially mitigated.";
        passed   = false;
      };
    };

    if (not hasSpf and not hasDmarc and txtCount > 5) {
      return {
        category = #AmplificationRisk;
        score    = 65;
        details  = "No SPF/DMARC and many TXT records (" # txtCount.toText() # ") for " # domain # ". Elevated amplification risk.";
        passed   = false;
      };
    };

    if (highPayload) {
      return {
        category = #AmplificationRisk;
        score    = 55;
        details  = "Large TXT payload for " # domain # " increases DNS amplification potential.";
        passed   = false;
      };
    };

    {
      category = #AmplificationRisk;
      score    = 50;
      details  = "No SPF or DMARC policies detected for " # domain # ". Domain may be vulnerable to email spoofing.";
      passed   = false;
    };
  };

  // ---------------------------------------------------------------------------
  // Encrypted DNS support scoring (HTTPS/SVCB records)
  // ---------------------------------------------------------------------------
  public func scoreEncryptionRisk(httpsJson : Text, domain : Text) : Types.CategoryScore {
    let hasHttps = hasAnswerSection(httpsJson);
    // HTTPS record type = 65, SVCB = 64
    let hasSvcb  = jsonContains(httpsJson, "\"type\":64") or jsonContains(httpsJson, "\"type\": 64");
    let hasEch   = jsonContains(httpsJson, "ech=");
    let hasAlpn  = jsonContains(httpsJson, "alpn=");

    if (hasHttps and hasSvcb and hasEch) {
      return {
        category = #EncryptionRisk;
        score    = 5;
        details  = "HTTPS/SVCB records with ECH and ALPN present for " # domain # ". Excellent encrypted DNS support.";
        passed   = true;
      };
    };

    if (hasHttps and hasAlpn) {
      return {
        category = #EncryptionRisk;
        score    = 15;
        details  = "HTTPS record with ALPN negotiation present for " # domain # ". DoH/DoT supported.";
        passed   = true;
      };
    };

    if (hasHttps) {
      return {
        category = #EncryptionRisk;
        score    = 30;
        details  = "HTTPS record present for " # domain # " but without ALPN/ECH hints.";
        passed   = true;
      };
    };

    {
      category = #EncryptionRisk;
      score    = 70;
      details  = "No HTTPS or SVCB records found for " # domain # ". Encrypted DNS (DoH/DoT) not advertised.";
      passed   = false;
    };
  };

  // ---------------------------------------------------------------------------
  // TLD validity / DNSSEC at root scoring
  // ---------------------------------------------------------------------------
  public func scoreTldRisk(domain : Text, dsJson : Text) : Types.CategoryScore {
    let tld = extractTld(domain);

    // Check if TLD is in our known-good DNSSEC TLD list
    let knownTld = dnssecTlds.find(func(t : Text) : Bool { t == tld }) != null;

    let hasDs    = hasAnswerSection(dsJson);

    if (tld == "") {
      return {
        category = #TldRisk;
        score    = 95;
        details  = "Could not determine TLD from domain: " # domain # ".";
        passed   = false;
      };
    };

    if (knownTld and hasDs) {
      return {
        category = #TldRisk;
        score    = 5;
        details  = "TLD ." # tld # " is DNSSEC-enabled and DS record present for " # domain # ".";
        passed   = true;
      };
    };

    if (knownTld and not hasDs) {
      return {
        category = #TldRisk;
        score    = 35;
        details  = "TLD ." # tld # " supports DNSSEC but no DS record found for " # domain # ".";
        passed   = false;
      };
    };

    if (not knownTld and hasDs) {
      return {
        category = #TldRisk;
        score    = 25;
        details  = "TLD ." # tld # " not in known DNSSEC TLD list but DS record present for " # domain # ".";
        passed   = true;
      };
    };

    {
      category = #TldRisk;
      score    = 65;
      details  = "TLD ." # tld # " not in known DNSSEC TLD list and no DS record found for " # domain # ".";
      passed   = false;
    };
  };

  // ---------------------------------------------------------------------------
  // Weighted overall threat score
  // Weights: DNSSEC=25%, NS=20%, Hijacking=25%, Amplification=10%, Encryption=10%, TLD=10%
  // ---------------------------------------------------------------------------
  public func computeOverallScore(scores : [Types.CategoryScore]) : Nat {
    let weights : [{ cat : Types.ThreatCategory; weight : Nat }] = [
      { cat = #DnssecRisk;            weight = 25 },
      { cat = #NameserverLegitimacy;  weight = 20 },
      { cat = #HijackingRisk;         weight = 25 },
      { cat = #AmplificationRisk;     weight = 10 },
      { cat = #EncryptionRisk;        weight = 10 },
      { cat = #TldRisk;               weight = 10 },
    ];

    var weighted = 0;
    var totalWeight = 0;
    for (w in weights.values()) {
      let found = scores.find(func(s : Types.CategoryScore) : Bool {
        switch (s.category, w.cat) {
          case (#DnssecRisk, #DnssecRisk)                     true;
          case (#NameserverLegitimacy, #NameserverLegitimacy) true;
          case (#HijackingRisk, #HijackingRisk)               true;
          case (#AmplificationRisk, #AmplificationRisk)       true;
          case (#EncryptionRisk, #EncryptionRisk)             true;
          case (#TldRisk, #TldRisk)                           true;
          case _                                              false;
        };
      });
      switch (found) {
        case (?s) {
          weighted += s.score * w.weight;
          totalWeight += w.weight;
        };
        case null {};
      };
    };
    if (totalWeight == 0) return 0;
    weighted / totalWeight;
  };

  // ---------------------------------------------------------------------------
  // Assemble a DomainAnalysis record
  // ---------------------------------------------------------------------------
  public func buildDomainAnalysis(
    domain    : Text,
    scores    : [Types.CategoryScore],
    rawJson   : Text,
    checkedAt : Types.Timestamp,
  ) : Types.DomainAnalysis {
    {
      domain;
      overallScore   = computeOverallScore(scores);
      categoryScores = scores;
      checkedAt;
      rawDnsJson     = rawJson;
    };
  };

  // ---------------------------------------------------------------------------
  // Build a ComparisonResult
  // ---------------------------------------------------------------------------
  public func buildComparison(
    domainA    : Types.DomainAnalysis,
    domainB    : Types.DomainAnalysis,
    exportedAt : Types.Timestamp,
  ) : Types.ComparisonResult {
    { domainA; domainB; exportedAt };
  };

  // ---------------------------------------------------------------------------
  // JSON serialization helpers
  // ---------------------------------------------------------------------------
  func escapeJson(t : Text) : Text {
    t.replace(#text "\"", "\\\"").replace(#char '\\', "\\\\").replace(#char '\n', "\\n");
  };

  func categoryToText(c : Types.ThreatCategory) : Text {
    switch c {
      case (#DnssecRisk)           "DnssecRisk";
      case (#NameserverLegitimacy) "NameserverLegitimacy";
      case (#HijackingRisk)        "HijackingRisk";
      case (#AmplificationRisk)    "AmplificationRisk";
      case (#EncryptionRisk)       "EncryptionRisk";
      case (#TldRisk)              "TldRisk";
    };
  };

  func scoreToJson(s : Types.CategoryScore) : Text {
    "{\"category\":\"" # categoryToText(s.category) #
    "\",\"score\":" # s.score.toText() #
    ",\"details\":\"" # escapeJson(s.details) #
    "\",\"passed\":" # (if (s.passed) "true" else "false") # "}";
  };

  func analysisToJson(a : Types.DomainAnalysis) : Text {
    let catScores = a.categoryScores.map(scoreToJson);
    let scoresArr = "[" # catScores.values().join(",") # "]";
    "{\"domain\":\"" # escapeJson(a.domain) #
    "\",\"overallScore\":" # a.overallScore.toText() #
    ",\"checkedAt\":" # a.checkedAt.toText() #
    ",\"categoryScores\":" # scoresArr # "}";
  };

  public func exportComparisonAsJson(comparison : Types.ComparisonResult) : Text {
    "{\"domainA\":" # analysisToJson(comparison.domainA) #
    ",\"domainB\":" # analysisToJson(comparison.domainB) #
    ",\"exportedAt\":" # comparison.exportedAt.toText() # "}";
  };
};
