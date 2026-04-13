import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, ChevronRight, Shield } from "lucide-react";
import type { ThreatCategory } from "../types/dns";
import { CATEGORY_DESCRIPTIONS, CATEGORY_LABELS } from "../types/dns";

// ─── Remediation Data ─────────────────────────────────────────────────────────

interface RemediationStep {
  step: number;
  title: string;
  description: string;
  command?: string;
}

interface RemediationData {
  overview: string;
  severity: "critical" | "warning" | "info";
  steps: RemediationStep[];
  references: string[];
}

const REMEDIATION_GUIDE: Record<ThreatCategory, RemediationData> = {
  DnssecRisk: {
    overview:
      "DNSSEC adds cryptographic signatures to DNS records, allowing resolvers to verify the authenticity of responses and detect tampering.",
    severity: "critical",
    steps: [
      {
        step: 1,
        title: "Generate DNSSEC key pairs",
        description:
          "Create a Zone Signing Key (ZSK) and a Key Signing Key (KSK) for your zone using your DNS provider's tooling or BIND's dnssec-keygen.",
        command: "dnssec-keygen -a ECDSAP256SHA256 -b 256 -n ZONE example.com",
      },
      {
        step: 2,
        title: "Sign your DNS zone",
        description:
          "Sign all DNS records in your zone file with the ZSK. BIND users run dnssec-signzone; cloud providers typically offer a one-click option.",
        command:
          "dnssec-signzone -A -3 $(head -c 1000 /dev/random | sha1sum | cut -b 1-16) -N INCREMENT -o example.com -t db.example.com",
      },
      {
        step: 3,
        title: "Publish DS records to parent zone",
        description:
          "Submit the Delegation Signer (DS) record to your domain registrar or parent zone operator. This establishes the chain of trust.",
      },
      {
        step: 4,
        title: "Verify DNSSEC chain of trust",
        description:
          "Use Verisign's DNSSEC debugger or dig +dnssec to confirm signatures are valid and the chain reaches the root.",
        command: "dig +dnssec +short DS example.com @8.8.8.8",
      },
      {
        step: 5,
        title: "Enable key rollover schedule",
        description:
          "Schedule ZSK rollovers every 90 days and KSK rollovers annually. Automate with your DNS provider's rollover workflow.",
      },
    ],
    references: [
      "https://www.icann.org/resources/pages/dnssec-qaa-2014-01-29-en",
      "https://dnssec-debugger.verisignlabs.com/",
    ],
  },

  NameserverLegitimacy: {
    overview:
      "Legitimate authoritative nameservers must match registrar records, respond authoritatively, and come from reputable providers.",
    severity: "warning",
    steps: [
      {
        step: 1,
        title: "Audit your registered nameservers",
        description:
          "Log into your domain registrar and verify the listed nameservers match what DNS actually resolves. Discrepancies indicate potential hijacking.",
        command: "whois example.com | grep -i 'Name Server'",
      },
      {
        step: 2,
        title: "Check for authoritative responses",
        description:
          "Query each NS record directly. Every nameserver should return AA (Authoritative Answer) flag for your zone.",
        command: "dig +norec @ns1.example.com example.com SOA",
      },
      {
        step: 3,
        title: "Validate NS records match",
        description:
          "Compare NS records from parent zone (TLD) with authoritative nameserver self-reports. Mismatches are a red flag.",
        command: "dig NS example.com @a.gtld-servers.net",
      },
      {
        step: 4,
        title: "Use reputable DNS providers",
        description:
          "Migrate to enterprise DNS providers (Cloudflare, Route53, NS1) with DDoS protection, anycast routing, and SLA guarantees.",
      },
      {
        step: 5,
        title: "Enable registrar lock",
        description:
          "Enable Registrar Lock (also called Domain Lock or Transfer Lock) to prevent unauthorized nameserver changes via social engineering.",
      },
    ],
    references: [
      "https://www.icann.org/resources/pages/protecting-domain-names-2013-05-03-en",
    ],
  },

  HijackingRisk: {
    overview:
      "DNS hijacking reroutes traffic by modifying DNS responses. Mitigations include registrar lock, DNSSEC, and monitoring for unauthorized changes.",
    severity: "critical",
    steps: [
      {
        step: 1,
        title: "Enable two-factor authentication on registrar",
        description:
          "Enable TOTP or hardware key 2FA on your domain registrar account to prevent account takeover as an attack vector.",
      },
      {
        step: 2,
        title: "Set domain to locked status",
        description:
          "Enable all available domain locks: Registrar Lock prevents transfers, Update Lock prevents NS changes, Delete Lock prevents deletion.",
      },
      {
        step: 3,
        title: "Implement DNSSEC",
        description:
          "DNSSEC-signed zones make cache poisoning attacks significantly harder. Attackers cannot forge signed responses.",
      },
      {
        step: 4,
        title: "Configure CAA records",
        description:
          "Certification Authority Authorization (CAA) records restrict which CAs can issue TLS certificates for your domain.",
        command:
          'example.com CAA 0 issue "letsencrypt.org"\nexample.com CAA 0 issuewild ";"',
      },
      {
        step: 5,
        title: "Monitor for DNS changes",
        description:
          "Set up DNS monitoring alerts (SecurityTrails, DNSWatch, or custom cron jobs) to detect unauthorized record changes within minutes.",
        command: "dig +short NS example.com",
      },
    ],
    references: [
      "https://www.cisa.gov/sites/default/files/publications/DNS-Infrastructure-Security_2.pdf",
    ],
  },

  AmplificationRisk: {
    overview:
      "DNS amplification exploits open resolvers and large DNS responses to amplify DDoS attacks. Disable recursion on authoritative servers.",
    severity: "warning",
    steps: [
      {
        step: 1,
        title: "Disable open recursion on authoritative servers",
        description:
          "Your authoritative nameservers should NOT resolve queries for external domains. Disable recursion in your DNS server config.",
        command: "recursion no; // BIND named.conf\nallow-recursion { none; };",
      },
      {
        step: 2,
        title: "Implement Response Rate Limiting (RRL)",
        description:
          "Enable RRL on your nameservers to throttle repeated identical responses to the same client, reducing amplification potential.",
        command: "rate-limit {\n  responses-per-second 5;\n  window 5;\n};",
      },
      {
        step: 3,
        title: "Minimize ANY query response size",
        description:
          "Disable or restrict ANY query responses. Modern BIND/PowerDNS can be configured to return a minimal response to ANY queries.",
      },
      {
        step: 4,
        title: "Use anycast DNS with DDoS scrubbing",
        description:
          "Anycast-based DNS providers (Cloudflare, Akamai) provide built-in amplification protection through their network-level filtering.",
      },
    ],
    references: [
      "https://www.team-cymru.org/dns-rrl.html",
      "https://www.cloudflare.com/learning/ddos/dns-amplification-ddos-attack/",
    ],
  },

  EncryptionRisk: {
    overview:
      "DNS-over-HTTPS (DoH) and DNS-over-TLS (DoT) encrypt DNS queries in transit, preventing eavesdropping and man-in-the-middle attacks.",
    severity: "warning",
    steps: [
      {
        step: 1,
        title: "Enable DNS-over-HTTPS for your resolver",
        description:
          "Configure your recursive resolvers to support DoH. Cloudflare (1.1.1.1), Google (8.8.8.8), and Quad9 (9.9.9.9) all support DoH.",
      },
      {
        step: 2,
        title: "Configure DNS-over-TLS",
        description:
          "Deploy DoT on port 853. BIND 9.17+ and Unbound support DoT natively. Ensure TLS certificates are valid and auto-renewed.",
        command: "tls-port 853;\ntls-client-port 853;",
      },
      {
        step: 3,
        title: "Enforce HTTPS on all web properties",
        description:
          "Implement HSTS (HTTP Strict Transport Security) with a long max-age and includeSubDomains to force all connections over TLS.",
        command:
          "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
      },
      {
        step: 4,
        title: "Add TLSA records (DANE)",
        description:
          "DNS-based Authentication of Named Entities (DANE) pins TLS certificates via TLSA DNS records, preventing certificate substitution.",
        command: "dig TLSA _443._tcp.example.com",
      },
    ],
    references: [
      "https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/",
      "https://tools.ietf.org/html/rfc7858",
    ],
  },

  TldRisk: {
    overview:
      "High-risk TLDs have historically been associated with spam, phishing, or malware. Migrating to reputable TLDs improves trust signals.",
    severity: "info",
    steps: [
      {
        step: 1,
        title: "Assess your TLD reputation",
        description:
          "Check your TLD against Spamhaus's TLD reputation data, Cisco Umbrella's TLD rankings, and Google Safe Browsing's database.",
      },
      {
        step: 2,
        title: "Register on high-trust TLDs",
        description:
          "If operating a commercial service, register the .com, .net, or country-specific TLD equivalent. Major browsers give these higher implicit trust.",
      },
      {
        step: 3,
        title: "Implement email authentication",
        description:
          "Publish SPF, DKIM, and DMARC records to prevent domain spoofing and improve email deliverability — especially important for lower-trust TLDs.",
        command:
          'example.com TXT "v=spf1 include:_spf.google.com ~all"\n_dmarc.example.com TXT "v=DMARC1; p=reject; rua=mailto:dmarc@example.com"',
      },
      {
        step: 4,
        title: "Register defensive domains",
        description:
          "Register common typosquatting variations and high-risk TLD equivalents of your domain to prevent brand impersonation.",
      },
    ],
    references: [
      "https://www.spamhaus.org/statistics/tlds/",
      "https://umbrella.cisco.com/info/2016/10/05/cisco-umbrella-2016-annual-cybersecurity-report",
    ],
  },
};

// ─── Remediation Modal ────────────────────────────────────────────────────────

interface RemediationModalProps {
  category: ThreatCategory | null;
  open: boolean;
  onClose: () => void;
}

const SEVERITY_COLORS = {
  critical: "#ff2040",
  warning: "#ffd700",
  info: "#00cfff",
};

export function RemediationModal({
  category,
  open,
  onClose,
}: RemediationModalProps) {
  if (!category) return null;

  const data = REMEDIATION_GUIDE[category];
  const accentColor = SEVERITY_COLORS[data.severity];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-2xl border-border p-0 overflow-hidden"
        style={{
          background: "rgba(9,9,16,0.98)",
          borderColor: `${accentColor}40`,
          boxShadow: `0 0 40px ${accentColor}20, 0 25px 60px rgba(0,0,0,0.8)`,
          maxHeight: "85vh",
        }}
        data-ocid="modal-remediation"
      >
        {/* Header */}
        <DialogHeader
          className="px-6 pt-5 pb-4 border-b border-border"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 shrink-0"
              style={{
                background: `${accentColor}15`,
                border: `1px solid ${accentColor}30`,
              }}
            >
              <Shield size={16} style={{ color: accentColor }} />
            </div>
            <div className="min-w-0">
              <div
                className="text-xs font-mono tracking-widest mb-0.5"
                style={{ color: `${accentColor}80` }}
              >
                REMEDIATION GUIDE
              </div>
              <DialogTitle
                className="font-display font-bold text-base"
                style={{ color: "#e8eeff" }}
              >
                {CATEGORY_LABELS[category]}
              </DialogTitle>
            </div>
            <Badge
              className="ml-auto shrink-0 font-mono text-xs tracking-wider border-0 uppercase"
              style={{
                background: `${accentColor}15`,
                color: accentColor,
                boxShadow: `0 0 6px ${accentColor}30`,
              }}
            >
              {data.severity}
            </Badge>
          </div>
          <p
            className="font-mono text-sm leading-relaxed mt-3"
            style={{ color: "rgba(147,163,203,0.7)" }}
          >
            {data.overview}
          </p>
          <p
            className="font-mono text-xs mt-1 italic"
            style={{ color: "rgba(147,163,203,0.35)" }}
          >
            {CATEGORY_DESCRIPTIONS[category]}
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1" style={{ maxHeight: "60vh" }}>
          <div className="px-6 py-5 space-y-4">
            {data.steps.map((step, i) => (
              <div
                key={step.step}
                className="relative pl-10"
                style={{ opacity: i === 0 ? 1 : 0.95 }}
              >
                {/* Step number */}
                <div
                  className="absolute left-0 top-0 w-7 h-7 flex items-center justify-center font-mono font-bold text-xs"
                  style={{
                    background: `${accentColor}15`,
                    border: `1px solid ${accentColor}30`,
                    color: accentColor,
                  }}
                >
                  {step.step}
                </div>

                {/* Connector line */}
                {i < data.steps.length - 1 && (
                  <div
                    className="absolute left-3.5 top-8 w-px"
                    style={{
                      height: "calc(100% + 1rem)",
                      background: `linear-gradient(${accentColor}30, transparent)`,
                    }}
                  />
                )}

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4
                      className="font-display font-semibold text-sm"
                      style={{ color: "#e8eeff" }}
                    >
                      {step.title}
                    </h4>
                    <ChevronRight
                      size={12}
                      style={{ color: `${accentColor}50` }}
                    />
                  </div>
                  <p
                    className="font-mono text-xs leading-relaxed"
                    style={{ color: "rgba(147,163,203,0.65)" }}
                  >
                    {step.description}
                  </p>

                  {step.command && (
                    <div
                      className="mt-2 px-3 py-2 overflow-x-auto"
                      style={{
                        background: "rgba(0,0,0,0.5)",
                        border: `1px solid ${accentColor}20`,
                        borderLeft: `2px solid ${accentColor}60`,
                      }}
                    >
                      <pre
                        className="font-mono text-xs whitespace-pre-wrap"
                        style={{ color: `${accentColor}cc` }}
                      >
                        {step.command}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* References */}
            {data.references.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle
                    size={12}
                    style={{ color: "rgba(0,255,136,0.6)" }}
                  />
                  <span
                    className="text-xs font-mono tracking-wider"
                    style={{ color: "rgba(0,255,136,0.6)" }}
                  >
                    REFERENCES
                  </span>
                </div>
                <div className="space-y-1">
                  {data.references.map((ref) => (
                    <a
                      key={ref}
                      href={ref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block font-mono text-xs hover:underline truncate"
                      style={{ color: "rgba(0,207,255,0.5)" }}
                    >
                      {ref}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
