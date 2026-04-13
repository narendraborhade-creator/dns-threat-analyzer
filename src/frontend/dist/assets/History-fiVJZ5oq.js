import { c as createLucideIcon, j as jsxRuntimeExports, r as reactExports, L as LoaderCircle, d as Link } from "./index-Ker5Reut.js";
import { A as cn, Y as useAnalysisHistory, Z as useClearCacheMutation, $ as useAnalyzeDomainMutation, K as Layout, W as Input, a0 as Activity, N as Button, E as Shield, q as motion, t as threatLevelColor, G as threatLevelLabel, v as scoreToThreatLevel } from "./dns-POfGHUKI.js";
import { u as ue } from "./index-Bj2sAHzR.js";
import { C as Clock, A as ArrowRight } from "./clock-pSER57MQ.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "m21 21-4.34-4.34", key: "14j7rj" }],
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }]
];
const Search = createLucideIcon("search", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]
];
const Trash2 = createLucideIcon("trash-2", __iconNode);
function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "skeleton",
      className: cn("bg-accent animate-pulse rounded-md", className),
      ...props
    }
  );
}
function HistoryRow({
  domain,
  onAnalyze,
  onDelete,
  result,
  isLoading
}) {
  const score = result ? Math.min(100, Math.max(0, Number(result.overallScore))) : null;
  const level = score !== null ? scoreToThreatLevel(score) : null;
  const color = level ? threatLevelColor(level) : "rgba(147,163,203,0.4)";
  const label = level ? threatLevelLabel(level) : "UNCHECKED";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, x: -12 },
      animate: { opacity: 1, x: 0 },
      className: "flex items-center gap-4 px-5 py-3.5 border-b border-border transition-smooth hover:bg-muted/20",
      "data-ocid": `history-row-${domain}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "w-2 h-2 shrink-0",
            style: {
              background: color,
              boxShadow: `0 0 6px ${color}`
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "font-mono text-sm flex-1 min-w-0 truncate",
            style: { color: "#e8eeff" },
            children: domain
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 text-right", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-16 ml-auto" }) : score !== null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-display font-bold text-sm", style: { color }, children: [
          score,
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "text-xs font-mono ml-1",
              style: { color: "rgba(147,163,203,0.4)" },
              children: "/ 100"
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "text-xs font-mono",
            style: { color: "rgba(147,163,203,0.3)" },
            children: "—"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono tracking-wider", style: { color }, children: label }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: () => onAnalyze(domain),
              disabled: isLoading,
              className: "h-7 w-7 p-0 flex items-center justify-center",
              style: {
                background: "rgba(0,207,255,0.08)",
                color: "#00cfff",
                border: "1px solid rgba(0,207,255,0.2)"
              },
              "aria-label": `Re-scan ${domain}`,
              "data-ocid": `btn-rescan-${domain}`,
              children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 11, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 11 })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/compare",
              search: { a: domain },
              className: "h-7 w-7 flex items-center justify-center transition-smooth",
              style: {
                background: "rgba(167,139,250,0.08)",
                color: "#a78bfa",
                border: "1px solid rgba(167,139,250,0.2)"
              },
              "aria-label": `Compare ${domain}`,
              "data-ocid": `btn-compare-${domain}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 11 })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: () => onDelete(domain),
              className: "h-7 w-7 p-0 flex items-center justify-center",
              style: {
                background: "rgba(255,32,64,0.06)",
                color: "rgba(255,32,64,0.5)",
                border: "1px solid rgba(255,32,64,0.15)"
              },
              "aria-label": `Clear cache for ${domain}`,
              "data-ocid": `btn-clear-${domain}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 11 })
            }
          )
        ] })
      ]
    }
  );
}
function HistoryPage() {
  const [filter, setFilter] = reactExports.useState("");
  const [scanningDomains, setScanningDomains] = reactExports.useState(
    /* @__PURE__ */ new Set()
  );
  const [scanResults, setScanResults] = reactExports.useState(
    /* @__PURE__ */ new Map()
  );
  const { data: history, isLoading: historyLoading } = useAnalysisHistory();
  const { mutateAsync: clearCache } = useClearCacheMutation();
  const { mutateAsync: analyzeDomain } = useAnalyzeDomainMutation();
  const filteredHistory = (history ?? []).filter(
    (d) => d.toLowerCase().includes(filter.toLowerCase())
  );
  const handleAnalyze = async (domain) => {
    setScanningDomains((prev) => /* @__PURE__ */ new Set([...prev, domain]));
    try {
      const result = await analyzeDomain(domain);
      setScanResults((prev) => new Map([...prev, [domain, result]]));
      ue.success(`${domain} analysis complete`);
    } catch {
      ue.error(`Failed to scan ${domain}`);
    } finally {
      setScanningDomains((prev) => {
        const next = new Set(prev);
        next.delete(domain);
        return next;
      });
    }
  };
  const handleDelete = async (domain) => {
    try {
      await clearCache(domain);
      setScanResults((prev) => {
        const next = new Map(prev);
        next.delete(domain);
        return next;
      });
      ue.success(`Cache cleared for ${domain}`);
    } catch {
      ue.error(`Failed to clear cache for ${domain}`);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { showHero: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "border border-border p-5 card-inset-glow",
        style: { background: "rgba(11,11,22,0.92)" },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "text-xs font-mono tracking-[0.25em] uppercase mb-1",
                style: { color: "rgba(0,207,255,0.5)" },
                children: "⬡ Analysis History"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "h2",
              {
                className: "font-display font-bold text-lg",
                style: { color: "#e8eeff" },
                children: [
                  (history == null ? void 0 : history.length) ?? 0,
                  " Domains Analysed"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full sm:w-64", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Search,
              {
                size: 13,
                className: "absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none",
                style: { color: "rgba(0,207,255,0.4)" }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: filter,
                onChange: (e) => setFilter(e.target.value),
                placeholder: "Filter domains...",
                className: "pl-8 font-mono text-xs border-border",
                style: { background: "rgba(7,7,17,0.8)", color: "#e8eeff" },
                "data-ocid": "input-filter"
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "border border-border",
        style: { background: "rgba(11,11,22,0.95)" },
        "data-ocid": "history-table",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-center gap-4 px-5 py-2.5 border-b border-border",
              style: { background: "rgba(255,255,255,0.02)" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "text-xs font-mono flex-1",
                    style: { color: "rgba(147,163,203,0.4)" },
                    children: "DOMAIN"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "text-xs font-mono w-20 text-right",
                    style: { color: "rgba(147,163,203,0.4)" },
                    children: "SCORE"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "text-xs font-mono w-20 text-right",
                    style: { color: "rgba(147,163,203,0.4)" },
                    children: "STATUS"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-24 shrink-0" })
              ]
            }
          ),
          historyLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 flex items-center justify-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              LoaderCircle,
              {
                size: 18,
                className: "animate-spin",
                style: { color: "#00cfff" }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: "text-xs font-mono",
                style: { color: "rgba(0,207,255,0.5)" },
                children: "LOADING HISTORY..."
              }
            )
          ] }),
          !historyLoading && filteredHistory.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "p-12 flex flex-col items-center justify-center text-center",
              "data-ocid": "empty-history",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { size: 36, style: { color: "rgba(0,207,255,0.2)" } }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    className: "font-display font-semibold text-base",
                    style: { color: "rgba(147,163,203,0.6)" },
                    children: filter ? "No domains match your filter" : "No analyses yet"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    className: "text-xs font-mono mt-2",
                    style: { color: "rgba(82,100,140,0.5)" },
                    children: filter ? "Try a different search term" : "Analyze a domain to see it here"
                  }
                ),
                !filter && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    asChild: true,
                    className: "mt-4 gap-2 font-mono text-xs tracking-wider uppercase",
                    style: {
                      background: "rgba(0,207,255,0.08)",
                      color: "#00cfff",
                      border: "1px solid rgba(0,207,255,0.2)"
                    },
                    "data-ocid": "btn-go-analyze",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 11 }),
                      "Start Analyzing"
                    ] })
                  }
                )
              ]
            }
          ),
          !historyLoading && filteredHistory.map((domain, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              transition: { delay: i * 0.05 },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                HistoryRow,
                {
                  domain,
                  onAnalyze: handleAnalyze,
                  onDelete: handleDelete,
                  result: scanResults.get(domain),
                  isLoading: scanningDomains.has(domain)
                }
              )
            },
            domain
          ))
        ]
      }
    ),
    filteredHistory.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "border border-border p-4 flex items-center justify-between",
        style: { background: "rgba(0,207,255,0.02)" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 13, style: { color: "rgba(0,207,255,0.4)" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "span",
              {
                className: "text-xs font-mono",
                style: { color: "rgba(147,163,203,0.5)" },
                children: [
                  filteredHistory.length,
                  " domain",
                  filteredHistory.length !== 1 ? "s" : "",
                  " in history"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: () => filteredHistory.slice(0, 3).forEach(handleAnalyze),
              disabled: scanningDomains.size > 0,
              className: "gap-2 font-mono text-xs tracking-wider uppercase h-8 px-4",
              style: {
                background: "rgba(0,207,255,0.08)",
                color: "#00cfff",
                border: "1px solid rgba(0,207,255,0.2)"
              },
              "data-ocid": "btn-batch-scan",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 11 }),
                "Scan Recent 3"
              ]
            }
          )
        ]
      }
    )
  ] }) });
}
export {
  HistoryPage as default
};
