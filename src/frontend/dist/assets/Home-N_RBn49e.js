import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, e as Route, f as useNavigate, L as LoaderCircle } from "./index-Ker5Reut.js";
import { c as cleanDomain, v as validateDomain, T as TriangleAlert, a as CircleCheckBig, C as ChevronRight, B as Badge } from "./backend-client-RnLy8-Q4.js";
import { a1 as MotionConfigContext, a2 as isHTMLElement, a3 as useConstant, a4 as PresenceContext, a5 as usePresence, a6 as useIsomorphicLayoutEffect, a7 as LayoutGroupContext, H as useCompareDomainsMutation, Y as useAnalysisHistory, K as Layout, q as motion, E as Shield, N as Button, a8 as Zap, W as Input, r as CATEGORY_LABELS, G as threatLevelLabel, t as threatLevelColor, v as scoreToThreatLevel } from "./dns-POfGHUKI.js";
import { A as ArrowRight, C as Clock } from "./clock-pSER57MQ.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  [
    "path",
    { d: "M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3", key: "11bfej" }
  ]
];
const Command = createLucideIcon("command", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M20 4v7a4 4 0 0 1-4 4H4", key: "6o5b7l" }],
  ["path", { d: "m9 10-5 5 5 5", key: "1kshq7" }]
];
const CornerDownLeft = createLucideIcon("corner-down-left", __iconNode);
function setRef(ref, value) {
  if (typeof ref === "function") {
    return ref(value);
  } else if (ref !== null && ref !== void 0) {
    ref.current = value;
  }
}
function composeRefs(...refs) {
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup === "function") {
        hasCleanup = true;
      }
      return cleanup;
    });
    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup === "function") {
            cleanup();
          } else {
            setRef(refs[i], null);
          }
        }
      };
    }
  };
}
function useComposedRefs(...refs) {
  return reactExports.useCallback(composeRefs(...refs), refs);
}
class PopChildMeasure extends reactExports.Component {
  getSnapshotBeforeUpdate(prevProps) {
    const element = this.props.childRef.current;
    if (isHTMLElement(element) && prevProps.isPresent && !this.props.isPresent && this.props.pop !== false) {
      const parent = element.offsetParent;
      const parentWidth = isHTMLElement(parent) ? parent.offsetWidth || 0 : 0;
      const parentHeight = isHTMLElement(parent) ? parent.offsetHeight || 0 : 0;
      const computedStyle = getComputedStyle(element);
      const size = this.props.sizeRef.current;
      size.height = parseFloat(computedStyle.height);
      size.width = parseFloat(computedStyle.width);
      size.top = element.offsetTop;
      size.left = element.offsetLeft;
      size.right = parentWidth - size.width - size.left;
      size.bottom = parentHeight - size.height - size.top;
    }
    return null;
  }
  /**
   * Required with getSnapshotBeforeUpdate to stop React complaining.
   */
  componentDidUpdate() {
  }
  render() {
    return this.props.children;
  }
}
function PopChild({ children, isPresent, anchorX, anchorY, root, pop }) {
  var _a;
  const id = reactExports.useId();
  const ref = reactExports.useRef(null);
  const size = reactExports.useRef({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  });
  const { nonce } = reactExports.useContext(MotionConfigContext);
  const childRef = ((_a = children.props) == null ? void 0 : _a.ref) ?? (children == null ? void 0 : children.ref);
  const composedRef = useComposedRefs(ref, childRef);
  reactExports.useInsertionEffect(() => {
    const { width, height, top, left, right, bottom } = size.current;
    if (isPresent || pop === false || !ref.current || !width || !height)
      return;
    const x = anchorX === "left" ? `left: ${left}` : `right: ${right}`;
    const y = anchorY === "bottom" ? `bottom: ${bottom}` : `top: ${top}`;
    ref.current.dataset.motionPopId = id;
    const style = document.createElement("style");
    if (nonce)
      style.nonce = nonce;
    const parent = root ?? document.head;
    parent.appendChild(style);
    if (style.sheet) {
      style.sheet.insertRule(`
          [data-motion-pop-id="${id}"] {
            position: absolute !important;
            width: ${width}px !important;
            height: ${height}px !important;
            ${x}px !important;
            ${y}px !important;
          }
        `);
    }
    return () => {
      var _a2;
      (_a2 = ref.current) == null ? void 0 : _a2.removeAttribute("data-motion-pop-id");
      if (parent.contains(style)) {
        parent.removeChild(style);
      }
    };
  }, [isPresent]);
  return jsxRuntimeExports.jsx(PopChildMeasure, { isPresent, childRef: ref, sizeRef: size, pop, children: pop === false ? children : reactExports.cloneElement(children, { ref: composedRef }) });
}
const PresenceChild = ({ children, initial, isPresent, onExitComplete, custom, presenceAffectsLayout, mode, anchorX, anchorY, root }) => {
  const presenceChildren = useConstant(newChildrenMap);
  const id = reactExports.useId();
  let isReusedContext = true;
  let context = reactExports.useMemo(() => {
    isReusedContext = false;
    return {
      id,
      initial,
      isPresent,
      custom,
      onExitComplete: (childId) => {
        presenceChildren.set(childId, true);
        for (const isComplete of presenceChildren.values()) {
          if (!isComplete)
            return;
        }
        onExitComplete && onExitComplete();
      },
      register: (childId) => {
        presenceChildren.set(childId, false);
        return () => presenceChildren.delete(childId);
      }
    };
  }, [isPresent, presenceChildren, onExitComplete]);
  if (presenceAffectsLayout && isReusedContext) {
    context = { ...context };
  }
  reactExports.useMemo(() => {
    presenceChildren.forEach((_, key) => presenceChildren.set(key, false));
  }, [isPresent]);
  reactExports.useEffect(() => {
    !isPresent && !presenceChildren.size && onExitComplete && onExitComplete();
  }, [isPresent]);
  children = jsxRuntimeExports.jsx(PopChild, { pop: mode === "popLayout", isPresent, anchorX, anchorY, root, children });
  return jsxRuntimeExports.jsx(PresenceContext.Provider, { value: context, children });
};
function newChildrenMap() {
  return /* @__PURE__ */ new Map();
}
const getChildKey = (child) => child.key || "";
function onlyElements(children) {
  const filtered = [];
  reactExports.Children.forEach(children, (child) => {
    if (reactExports.isValidElement(child))
      filtered.push(child);
  });
  return filtered;
}
const AnimatePresence = ({ children, custom, initial = true, onExitComplete, presenceAffectsLayout = true, mode = "sync", propagate = false, anchorX = "left", anchorY = "top", root }) => {
  const [isParentPresent, safeToRemove] = usePresence(propagate);
  const presentChildren = reactExports.useMemo(() => onlyElements(children), [children]);
  const presentKeys = propagate && !isParentPresent ? [] : presentChildren.map(getChildKey);
  const isInitialRender = reactExports.useRef(true);
  const pendingPresentChildren = reactExports.useRef(presentChildren);
  const exitComplete = useConstant(() => /* @__PURE__ */ new Map());
  const exitingComponents = reactExports.useRef(/* @__PURE__ */ new Set());
  const [diffedChildren, setDiffedChildren] = reactExports.useState(presentChildren);
  const [renderedChildren, setRenderedChildren] = reactExports.useState(presentChildren);
  useIsomorphicLayoutEffect(() => {
    isInitialRender.current = false;
    pendingPresentChildren.current = presentChildren;
    for (let i = 0; i < renderedChildren.length; i++) {
      const key = getChildKey(renderedChildren[i]);
      if (!presentKeys.includes(key)) {
        if (exitComplete.get(key) !== true) {
          exitComplete.set(key, false);
        }
      } else {
        exitComplete.delete(key);
        exitingComponents.current.delete(key);
      }
    }
  }, [renderedChildren, presentKeys.length, presentKeys.join("-")]);
  const exitingChildren = [];
  if (presentChildren !== diffedChildren) {
    let nextChildren = [...presentChildren];
    for (let i = 0; i < renderedChildren.length; i++) {
      const child = renderedChildren[i];
      const key = getChildKey(child);
      if (!presentKeys.includes(key)) {
        nextChildren.splice(i, 0, child);
        exitingChildren.push(child);
      }
    }
    if (mode === "wait" && exitingChildren.length) {
      nextChildren = exitingChildren;
    }
    setRenderedChildren(onlyElements(nextChildren));
    setDiffedChildren(presentChildren);
    return null;
  }
  const { forceRender } = reactExports.useContext(LayoutGroupContext);
  return jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: renderedChildren.map((child) => {
    const key = getChildKey(child);
    const isPresent = propagate && !isParentPresent ? false : presentChildren === renderedChildren || presentKeys.includes(key);
    const onExit = () => {
      if (exitingComponents.current.has(key)) {
        return;
      }
      if (exitComplete.has(key)) {
        exitingComponents.current.add(key);
        exitComplete.set(key, true);
      } else {
        return;
      }
      let isEveryExitComplete = true;
      exitComplete.forEach((isExitComplete) => {
        if (!isExitComplete)
          isEveryExitComplete = false;
      });
      if (isEveryExitComplete) {
        forceRender == null ? void 0 : forceRender();
        setRenderedChildren(pendingPresentChildren.current);
        propagate && (safeToRemove == null ? void 0 : safeToRemove());
        onExitComplete && onExitComplete();
      }
    };
    return jsxRuntimeExports.jsx(PresenceChild, { isPresent, initial: !isInitialRender.current || initial ? void 0 : false, custom, presenceAffectsLayout, mode, root, onExitComplete: isPresent ? void 0 : onExit, anchorX, anchorY, children: child }, key);
  }) });
};
const PROGRESS_STEPS = [
  "Resolving nameservers...",
  "Checking DNSSEC signatures...",
  "Validating chain of trust...",
  "Probing amplification vectors...",
  "Scanning hijacking risks...",
  "Analyzing TLD reputation...",
  "Testing DNS-over-HTTPS support...",
  "Cross-referencing threat intelligence...",
  "Computing risk scores...",
  "Finalizing analysis..."
];
function ScanProgress({ domains }) {
  const [stepIndex, setStepIndex] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % PROGRESS_STEPS.length);
    }, 900);
    return () => clearInterval(interval);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -8 },
      className: "border border-border p-6 card-inset-glow",
      style: { background: "rgba(11,11,22,0.95)" },
      "data-ocid": "scan-progress",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "text-xs font-mono",
                style: { color: "rgba(0,207,255,0.6)" },
                children: domains[0]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "w-6 h-px",
                style: { background: "rgba(0,207,255,0.3)" }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "text-xs font-mono",
                style: { color: "rgba(0,207,255,0.6)" },
                children: domains[1]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            LoaderCircle,
            {
              size: 14,
              className: "animate-spin",
              style: { color: "#00cfff" }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "relative h-0.5 w-full mb-4 overflow-hidden",
            style: { background: "rgba(0,207,255,0.1)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  className: "absolute left-0 top-0 h-full",
                  style: { background: "linear-gradient(90deg, #00cfff, #00ff88)" },
                  animate: { width: ["0%", "95%"] },
                  transition: { duration: PROGRESS_STEPS.length * 0.9, ease: "linear" }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  className: "absolute top-0 h-full w-8",
                  style: {
                    background: "linear-gradient(90deg, transparent, rgba(0,207,255,0.5), transparent)"
                  },
                  animate: { left: ["-10%", "110%"] },
                  transition: {
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut"
                  }
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, x: 8 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: -8 },
            transition: { duration: 0.25 },
            className: "flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "w-1 h-1 animate-pulse",
                  style: { background: "#00cfff", boxShadow: "0 0 6px #00cfff" }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "text-xs font-mono",
                  style: { color: "rgba(147,163,203,0.7)" },
                  children: PROGRESS_STEPS[stepIndex]
                }
              )
            ]
          },
          stepIndex
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 mt-4", children: PROGRESS_STEPS.map((step, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "h-0.5 flex-1 transition-all duration-500",
            style: {
              background: i <= stepIndex ? "rgba(0,207,255,0.6)" : "rgba(0,207,255,0.1)",
              boxShadow: i === stepIndex ? "0 0 4px rgba(0,207,255,0.6)" : "none"
            }
          },
          step
        )) })
      ]
    }
  );
}
function ScoreRing({ score, size = 72 }) {
  const level = scoreToThreatLevel(score);
  const color = threatLevelColor(level);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score / 100 * circumference;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", style: { width: size, height: size }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: size, height: size, style: { transform: "rotate(-90deg)" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("title", { children: `Security score: ${score}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "circle",
        {
          cx: size / 2,
          cy: size / 2,
          r: radius,
          fill: "none",
          stroke: "rgba(255,255,255,0.05)",
          strokeWidth: 3
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "circle",
        {
          cx: size / 2,
          cy: size / 2,
          r: radius,
          fill: "none",
          stroke: color,
          strokeWidth: 3,
          strokeDasharray: `${progress} ${circumference}`,
          strokeLinecap: "butt",
          style: { filter: `drop-shadow(0 0 6px ${color})` }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: "font-display font-bold text-base leading-none",
          style: { color },
          children: score
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: "text-[8px] font-mono tracking-widest uppercase",
          style: { color: "rgba(147,163,203,0.4)" },
          children: "SCORE"
        }
      )
    ] })
  ] });
}
function CategoryBar({
  category,
  score,
  passed
}) {
  const color = passed ? "#00ff88" : score >= 40 ? "#ffd700" : "#ff2040";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: "text-xs font-mono w-24 shrink-0 truncate",
        style: { color: "rgba(147,163,203,0.6)" },
        children: CATEGORY_LABELS[category]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "flex-1 h-1 overflow-hidden",
        style: { background: "rgba(255,255,255,0.05)" },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "h-full transition-smooth",
            style: {
              width: `${score}%`,
              background: color,
              boxShadow: `0 0 4px ${color}`
            }
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono w-7 text-right", style: { color }, children: score }),
    passed ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 11, style: { color: "#00ff88" } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 11, style: { color } })
  ] });
}
function DomainResultCard({
  analysis,
  side
}) {
  const score = Math.min(100, Math.max(0, Number(analysis.overallScore)));
  const level = scoreToThreatLevel(score);
  const color = threatLevelColor(level);
  const label = threatLevelLabel(level);
  const passedCount = analysis.categoryScores.filter((c) => c.passed).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, delay: side === "B" ? 0.1 : 0 },
      className: "flex-1 border border-border card-inset-glow min-w-0",
      style: { background: "rgba(11,11,22,0.95)" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "px-4 py-3 border-b border-border flex items-center justify-between gap-3",
            style: { background: "rgba(255,255,255,0.02)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "text-[10px] font-mono tracking-widest mb-0.5",
                    style: { color: "rgba(0,207,255,0.4)" },
                    children: [
                      "DOMAIN ",
                      side
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "font-display font-bold text-sm truncate",
                    style: { color: "#e8eeff" },
                    children: analysis.domain
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Badge,
                    {
                      className: "font-mono text-[10px] tracking-wider border-0 px-2",
                      style: {
                        background: `${color}20`,
                        color,
                        boxShadow: `0 0 6px ${color}30`
                      },
                      children: label
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "text-[10px] font-mono mt-1",
                      style: { color: "rgba(147,163,203,0.4)" },
                      children: [
                        passedCount,
                        "/",
                        analysis.categoryScores.length,
                        " checks"
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreRing, { score, size: 60 })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-4 space-y-2.5", children: analysis.categoryScores.map((cs) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          CategoryBar,
          {
            category: cs.category,
            score: Math.min(100, Math.max(0, Number(cs.score))),
            passed: cs.passed
          },
          cs.category
        )) })
      ]
    }
  );
}
function ComparisonResultView({
  result,
  onCompare
}) {
  const navigate = useNavigate();
  const scoreA = Math.min(
    100,
    Math.max(0, Number(result.domainA.overallScore))
  );
  const scoreB = Math.min(
    100,
    Math.max(0, Number(result.domainB.overallScore))
  );
  const winner = scoreA > scoreB ? "A" : scoreB > scoreA ? "B" : null;
  const winnerDomain = winner === "A" ? result.domainA.domain : result.domainB.domain;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 24 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 },
      className: "space-y-4",
      "data-ocid": "comparison-result",
      children: [
        winner && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "border border-border px-5 py-3 flex items-center justify-between",
            style: {
              background: "rgba(0,255,136,0.04)",
              borderColor: "rgba(0,255,136,0.2)"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 14, style: { color: "#00ff88" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "span",
                  {
                    className: "text-xs font-mono",
                    style: { color: "rgba(147,163,203,0.7)" },
                    children: [
                      "Domain ",
                      winner,
                      " is more secure:"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "text-xs font-mono font-bold",
                    style: { color: "#00ff88" },
                    children: winnerDomain
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: onCompare,
                    className: "text-[10px] font-mono tracking-widest transition-smooth hover:opacity-80",
                    style: { color: "rgba(0,207,255,0.5)" },
                    children: "↺ RESCAN"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    onClick: () => navigate({
                      to: "/compare",
                      search: {
                        a: result.domainA.domain,
                        b: result.domainB.domain
                      }
                    }),
                    className: "h-7 gap-1 font-mono text-[10px] tracking-wider uppercase",
                    style: {
                      background: "rgba(0,207,255,0.08)",
                      color: "#00cfff",
                      border: "1px solid rgba(0,207,255,0.2)"
                    },
                    "data-ocid": "btn-full-compare",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 10 }),
                      "Full Analysis"
                    ]
                  }
                )
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DomainResultCard, { analysis: result.domainA, side: "A" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DomainResultCard, { analysis: result.domainB, side: "B" })
        ] })
      ]
    }
  );
}
const DEMO_COMPARISONS = [
  { a: "cloudflare.com", b: "google.com" },
  { a: "github.com", b: "gitlab.com" },
  { a: "amazon.com", b: "microsoft.com" }
];
function RecentComparisons({
  history,
  onLaunch,
  isPending
}) {
  const pairs = history.length >= 2 ? Array.from({ length: Math.floor(history.length / 2) }, (_, i) => ({
    a: history[i * 2],
    b: history[i * 2 + 1]
  })).slice(0, 3) : DEMO_COMPARISONS;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { delay: 0.4 },
      className: "border border-border",
      style: { background: "rgba(11,11,22,0.9)" },
      "data-ocid": "recent-comparisons",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "px-5 py-3 border-b border-border flex items-center gap-2",
            style: { background: "rgba(255,255,255,0.02)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 11, style: { color: "rgba(0,207,255,0.5)" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "text-xs font-mono tracking-widest",
                  style: { color: "rgba(0,207,255,0.5)" },
                  children: history.length >= 2 ? "RECENT COMPARISONS" : "QUICK LAUNCH"
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: pairs.map((pair) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => onLaunch(pair.a, pair.b),
            disabled: isPending,
            className: "w-full flex items-center justify-between px-5 py-3 transition-smooth hover:bg-muted/20 disabled:opacity-50",
            "data-ocid": `quick-compare-${pair.a}-${pair.b}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-mono", style: { color: "#e8eeff" }, children: pair.a }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "flex items-center gap-1 text-[10px] font-mono",
                    style: { color: "rgba(82,100,140,0.5)" },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "vs" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-mono", style: { color: "#e8eeff" }, children: pair.b })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "text-[10px] font-mono",
                    style: { color: "rgba(147,163,203,0.35)" },
                    children: "COMPARE"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ChevronRight,
                  {
                    size: 12,
                    style: { color: "rgba(0,207,255,0.35)" }
                  }
                )
              ] })
            ]
          },
          `${pair.a}-${pair.b}`
        )) })
      ]
    }
  );
}
function ThreatTeaser() {
  const categories = Object.keys(CATEGORY_LABELS);
  const mockScores = [42, 85, 28, 71, 55, 90];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: 0.5 },
      className: "border border-border p-5 grid-overlay relative overflow-hidden",
      style: { background: "rgba(0,207,255,0.02)" },
      "data-ocid": "threat-teaser",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute -top-8 right-8 w-48 h-48 pointer-events-none",
            style: {
              background: "radial-gradient(circle, rgba(0,207,255,0.06) 0%, transparent 70%)"
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute -bottom-8 left-16 w-32 h-32 pointer-events-none",
            style: {
              background: "radial-gradient(circle, rgba(255,32,64,0.05) 0%, transparent 70%)"
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "text-[10px] font-mono tracking-widest mb-1",
                  style: { color: "rgba(0,207,255,0.4)" },
                  children: "⬡ THREAT MATRIX PREVIEW"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: "text-xs font-mono",
                  style: { color: "rgba(147,163,203,0.5)" },
                  children: "Full 3D threat visualization available in comparison view"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 18, style: { color: "rgba(0,207,255,0.2)" } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: categories.map((cat, i) => {
            const score = mockScores[i] ?? 50;
            const color = score >= 70 ? "#00ff88" : score >= 40 ? "#ffd700" : "#ff2040";
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: { scaleX: 0 },
                animate: { scaleX: 1 },
                transition: { delay: 0.5 + i * 0.08, duration: 0.4 },
                className: "space-y-1.5",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: "text-[10px] font-mono",
                        style: { color: "rgba(147,163,203,0.5)" },
                        children: CATEGORY_LABELS[cat]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono", style: { color }, children: score })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "h-1 overflow-hidden",
                      style: { background: "rgba(255,255,255,0.04)" },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        motion.div,
                        {
                          className: "h-full",
                          initial: { width: 0 },
                          animate: { width: `${score}%` },
                          transition: {
                            delay: 0.6 + i * 0.08,
                            duration: 0.6,
                            ease: "easeOut"
                          },
                          style: { background: color, boxShadow: `0 0 4px ${color}` }
                        }
                      )
                    }
                  )
                ]
              },
              cat
            );
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 pt-3 border-t border-border flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: "text-[10px] font-mono",
                style: { color: "rgba(82,100,140,0.4)" },
                children: "Sample domain — enter your targets above to run a live scan"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex items-center gap-1",
                style: { color: "rgba(0,207,255,0.3)" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 10 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono", children: "LIVE DATA" })
                ]
              }
            )
          ] })
        ] })
      ]
    }
  );
}
function KeyboardHints() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 justify-end flex-wrap", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex items-center gap-0.5 px-1.5 py-0.5 border border-border font-mono text-[9px]",
          style: {
            background: "rgba(255,255,255,0.03)",
            color: "rgba(147,163,203,0.4)"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CornerDownLeft, { size: 9 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Enter" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: "text-[10px] font-mono",
          style: { color: "rgba(82,100,140,0.4)" },
          children: "run scan"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex items-center gap-0.5 px-1.5 py-0.5 border border-border font-mono text-[9px]",
          style: {
            background: "rgba(255,255,255,0.03)",
            color: "rgba(147,163,203,0.4)"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Command, { size: 9 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "K" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: "text-[10px] font-mono",
          style: { color: "rgba(82,100,140,0.4)" },
          children: "focus input"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "px-1.5 py-0.5 border border-border font-mono text-[9px]",
          style: {
            background: "rgba(255,255,255,0.03)",
            color: "rgba(147,163,203,0.4)"
          },
          children: "Tab"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: "text-[10px] font-mono",
          style: { color: "rgba(82,100,140,0.4)" },
          children: "next field"
        }
      )
    ] })
  ] });
}
function DomainInputField({
  label,
  value,
  onChange,
  error,
  disabled,
  placeholder,
  id,
  inputRef
}) {
  const hasError = !!error;
  const borderColor = hasError ? "rgba(255,32,64,0.5)" : value ? "rgba(0,207,255,0.3)" : "rgba(35,38,58,1)";
  const glowColor = hasError ? "rgba(255,32,64,0.15)" : "rgba(0,207,255,0.08)";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "label",
      {
        htmlFor: id,
        className: "block text-[10px] font-mono tracking-widest mb-2",
        style: { color: hasError ? "#ff2040" : "rgba(0,207,255,0.5)" },
        children: label
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          ref: inputRef,
          id,
          value,
          onChange: (e) => onChange(e.target.value),
          placeholder,
          disabled,
          className: "font-mono text-sm h-11 pr-4 transition-smooth",
          style: {
            background: "rgba(7,7,17,0.9)",
            color: "#e8eeff",
            border: `1px solid ${borderColor}`,
            boxShadow: `0 0 12px ${glowColor}`
          },
          "data-ocid": id
        }
      ),
      value && !hasError && /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          className: "absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5",
          style: { background: "#00cfff", boxShadow: "0 0 6px #00cfff" }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: hasError && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.p,
      {
        initial: { opacity: 0, y: -4 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -4 },
        className: "mt-1.5 text-[10px] font-mono flex items-center gap-1.5",
        style: { color: "#ff2040" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 9 }),
          error
        ]
      }
    ) })
  ] });
}
function HomePage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [domainA, setDomainA] = reactExports.useState(search.a ?? "");
  const [domainB, setDomainB] = reactExports.useState(search.b ?? "");
  const [errorA, setErrorA] = reactExports.useState(null);
  const [errorB, setErrorB] = reactExports.useState(null);
  const [result, setResult] = reactExports.useState(null);
  const [scanDomains, setScanDomains] = reactExports.useState(null);
  const inputARef = reactExports.useRef(null);
  const autoRanRef = reactExports.useRef(false);
  const { mutateAsync: compareDomains, isPending } = useCompareDomainsMutation();
  const { data: history } = useAnalysisHistory();
  reactExports.useEffect(() => {
    const handler = (e) => {
      var _a;
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        (_a = inputARef.current) == null ? void 0 : _a.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const initialA = search.a;
  const initialB = search.b;
  reactExports.useEffect(() => {
    if (autoRanRef.current) return;
    if (initialA && initialB) {
      autoRanRef.current = true;
      const cleanA = cleanDomain(initialA);
      const cleanB = cleanDomain(initialB);
      handleCompare(cleanA, cleanB);
    }
  }, [initialA, initialB]);
  const validate = (a, b) => {
    const va = validateDomain(a);
    const vb = validateDomain(b);
    setErrorA(va.valid ? null : va.error ?? "Invalid domain");
    setErrorB(vb.valid ? null : vb.error ?? "Invalid domain");
    return va.valid && vb.valid;
  };
  const handleCompare = async (a, b) => {
    const cleanA = cleanDomain(a ?? domainA);
    const cleanB = cleanDomain(b ?? domainB);
    if (!validate(cleanA, cleanB)) return;
    setScanDomains([cleanA, cleanB]);
    setResult(null);
    navigate({
      to: "/",
      search: { a: cleanA, b: cleanB },
      replace: true
    });
    try {
      const data = await compareDomains({ domainA: cleanA, domainB: cleanB });
      setScanDomains(null);
      setResult(data);
    } catch (err) {
      setScanDomains(null);
      setErrorA(
        err instanceof Error ? err.message : "Analysis failed. Please try again."
      );
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    handleCompare();
  };
  const handleQuickLaunch = (a, b) => {
    setDomainA(a);
    setDomainB(b);
    handleCompare(a, b);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { showHero: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 },
        className: "border border-border card-inset-glow relative overflow-hidden",
        style: { background: "rgba(11,11,22,0.95)" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "absolute top-0 left-0 right-0 h-px pointer-events-none",
              style: {
                background: "linear-gradient(90deg, transparent, rgba(0,207,255,0.4), transparent)"
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 pt-5 pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "text-[10px] font-mono tracking-[0.25em] uppercase mb-1.5",
                    style: { color: "rgba(0,207,255,0.45)" },
                    children: "⬡ DNS Security Comparison"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "h1",
                  {
                    className: "font-display font-bold text-lg",
                    style: { color: "#e8eeff" },
                    children: "Compare Two Domains"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 20, style: { color: "rgba(0,207,255,0.2)" } })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, "data-ocid": "form-compare", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 items-start mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  DomainInputField,
                  {
                    label: "DOMAIN A",
                    value: domainA,
                    onChange: (v) => {
                      setDomainA(v);
                      if (errorA) setErrorA(null);
                    },
                    error: errorA,
                    disabled: isPending,
                    placeholder: "e.g. cloudflare.com",
                    id: "input-domain-a",
                    inputRef: inputARef
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center pt-6 shrink-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "w-px h-4",
                      style: { background: "rgba(0,207,255,0.15)" }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "px-2 py-1 border border-border text-[10px] font-mono my-1",
                      style: {
                        background: "rgba(0,207,255,0.04)",
                        color: "rgba(0,207,255,0.4)"
                      },
                      children: "VS"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "w-px h-4",
                      style: { background: "rgba(0,207,255,0.15)" }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  DomainInputField,
                  {
                    label: "DOMAIN B",
                    value: domainB,
                    onChange: (v) => {
                      setDomainB(v);
                      if (errorB) setErrorB(null);
                    },
                    error: errorB,
                    disabled: isPending,
                    placeholder: "e.g. google.com",
                    id: "input-domain-b"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(KeyboardHints, {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    whileHover: !isPending ? { scale: 1.02 } : {},
                    whileTap: !isPending ? { scale: 0.98 } : {},
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        type: "submit",
                        disabled: isPending || !domainA.trim() || !domainB.trim(),
                        className: "gap-2 font-mono text-xs tracking-widest uppercase px-8 h-11 relative overflow-hidden",
                        style: {
                          background: isPending ? "rgba(0,207,255,0.04)" : "rgba(0,207,255,0.1)",
                          color: isPending ? "rgba(0,207,255,0.4)" : "#00cfff",
                          border: `1px solid ${isPending ? "rgba(0,207,255,0.15)" : "rgba(0,207,255,0.35)"}`,
                          boxShadow: isPending ? "none" : "0 0 20px rgba(0,207,255,0.2), 0 0 40px rgba(0,207,255,0.08), inset 0 1px 0 rgba(0,207,255,0.15)"
                        },
                        "data-ocid": "btn-compare",
                        children: [
                          !isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(
                            motion.div,
                            {
                              className: "absolute inset-0 pointer-events-none",
                              animate: { x: ["-100%", "200%"] },
                              transition: {
                                duration: 3,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "easeInOut",
                                repeatDelay: 2
                              },
                              style: {
                                background: "linear-gradient(90deg, transparent, rgba(0,207,255,0.15), transparent)"
                              }
                            }
                          ),
                          isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 12, className: "animate-spin" }),
                            "Scanning..."
                          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 12 }),
                            "Run Comparison",
                            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 12 })
                          ] })
                        ]
                      }
                    )
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "px-6 py-3 border-t border-border flex items-center gap-3 flex-wrap",
              style: { background: "rgba(255,255,255,0.01)" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "text-[10px] font-mono",
                    style: { color: "rgba(82,100,140,0.5)" },
                    children: "Quick pairs:"
                  }
                ),
                [
                  { a: "cloudflare.com", b: "google.com" },
                  { a: "github.com", b: "gitlab.com" }
                ].map((pair) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => handleQuickLaunch(pair.a, pair.b),
                    disabled: isPending,
                    className: "text-[10px] font-mono px-2 py-1 border border-border transition-smooth hover:border-accent disabled:opacity-40",
                    style: {
                      color: "rgba(0,207,255,0.55)",
                      background: "transparent"
                    },
                    "data-ocid": `quick-pair-${pair.a}`,
                    children: [
                      pair.a,
                      " vs ",
                      pair.b
                    ]
                  },
                  `${pair.a}-${pair.b}`
                ))
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isPending && scanDomains && /* @__PURE__ */ jsxRuntimeExports.jsx(ScanProgress, { domains: scanDomains }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: result && !isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ComparisonResultView,
      {
        result,
        onCompare: () => {
          setResult(null);
          handleCompare();
        }
      }
    ) }),
    !result && !isPending && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { delay: 0.3 },
        className: "grid grid-cols-1 lg:grid-cols-5 gap-4",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ThreatTeaser, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            RecentComparisons,
            {
              history: history ?? [],
              onLaunch: handleQuickLaunch,
              isPending
            }
          ) })
        ]
      }
    ),
    result && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { delay: 0.6 },
        className: "border border-border px-6 py-4 flex items-center justify-between gap-4",
        style: { background: "rgba(0,207,255,0.02)" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: "text-xs font-mono font-bold",
                style: { color: "#e8eeff" },
                children: "Dive deeper with full 3D visualization"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: "text-[10px] font-mono mt-0.5",
                style: { color: "rgba(147,163,203,0.4)" },
                children: "Interactive threat matrix, radar charts, and exportable report"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: () => navigate({
                to: "/compare",
                search: {
                  a: result.domainA.domain,
                  b: result.domainB.domain
                }
              }),
              className: "gap-2 font-mono text-xs tracking-wider uppercase shrink-0",
              style: {
                background: "rgba(0,207,255,0.1)",
                color: "#00cfff",
                border: "1px solid rgba(0,207,255,0.25)",
                boxShadow: "0 0 16px rgba(0,207,255,0.12)"
              },
              "data-ocid": "btn-open-3d-compare",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 12 }),
                "Open 3D View"
              ]
            }
          )
        ]
      }
    )
  ] }) });
}
export {
  HomePage as default
};
