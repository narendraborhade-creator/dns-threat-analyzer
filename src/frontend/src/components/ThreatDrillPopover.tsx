import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import {
  scoreToThreatLevel,
  threatLevelColor,
  threatLevelLabel,
} from "../types/dns";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DrillTarget {
  domain: string;
  category: string;
  score: number;
  details: string;
  passed: boolean;
  color: string;
  screenX: number;
  screenY: number;
}

interface ThreatDrillPopoverProps {
  target: DrillTarget | null;
  onClose: () => void;
}

// ─── Score Arc ────────────────────────────────────────────────────────────────

function ScoreArc({ score, color }: { score: number; color: string }) {
  const size = 72;
  const strokeW = 5;
  const r = (size - strokeW * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const cx = size / 2;

  return (
    <svg
      width={size}
      height={size}
      style={{ transform: "rotate(-90deg)" }}
      aria-hidden="true"
    >
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeW}
      />
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeW}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{
          filter: `drop-shadow(0 0 4px ${color})`,
          transition: "stroke-dasharray 0.6s ease",
        }}
      />
    </svg>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ passed }: { passed: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "2px 8px",
        borderRadius: "3px",
        fontSize: "10px",
        fontFamily: "var(--font-mono)",
        fontWeight: 700,
        letterSpacing: "0.08em",
        background: passed ? "rgba(0,255,136,0.12)" : "rgba(255,32,64,0.12)",
        border: `1px solid ${passed ? "#00ff88" : "#ff2040"}40`,
        color: passed ? "#00ff88" : "#ff2040",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: passed ? "#00ff88" : "#ff2040",
          boxShadow: passed ? "0 0 6px #00ff88" : "0 0 6px #ff2040",
        }}
      />
      {passed ? "PASSED" : "FAILED"}
    </span>
  );
}

// ─── ThreatDrillPopover ───────────────────────────────────────────────────────

export function ThreatDrillPopover({
  target,
  onClose,
}: ThreatDrillPopoverProps) {
  const popoverRef = useRef<HTMLDialogElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!target) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [target, onClose]);

  // Close on outside click
  useEffect(() => {
    if (!target) return;
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    // Small delay to avoid immediate close from the click that opened it
    const timeout = setTimeout(
      () => window.addEventListener("mousedown", handler),
      50,
    );
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousedown", handler);
    };
  }, [target, onClose]);

  const getPosition = () => {
    if (!target) return {};
    const margin = 16;
    const popW = 320;
    const popH = 220;
    let left = target.screenX + 16;
    let top = target.screenY - 60;

    if (left + popW > window.innerWidth - margin) {
      left = target.screenX - popW - 16;
    }
    if (top + popH > window.innerHeight - margin) {
      top = window.innerHeight - popH - margin;
    }
    if (top < margin) top = margin;
    if (left < margin) left = margin;

    return { left, top };
  };

  return (
    <AnimatePresence>
      {target && (
        <motion.dialog
          ref={popoverRef}
          key="drill-popover"
          initial={{ opacity: 0, scale: 0.88, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          aria-label={`Threat detail: ${target.category}`}
          data-ocid="drill-popover"
          open
          style={{
            position: "fixed",
            zIndex: 9999,
            width: "320px",
            ...getPosition(),
            background: "rgba(9,9,16,0.97)",
            border: `1px solid ${target.color}50`,
            boxShadow: `0 0 24px ${target.color}20, 0 8px 32px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)`,
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          {/* Color accent top bar */}
          <div
            style={{
              height: "2px",
              background: `linear-gradient(90deg, ${target.color}, transparent)`,
            }}
          />

          <div style={{ padding: "14px 16px" }}>
            {/* Header row */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: target.color,
                    fontSize: "11px",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    marginBottom: "3px",
                  }}
                >
                  {target.category.toUpperCase()}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    fontSize: "10px",
                    fontFamily: "var(--font-mono)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {target.domain}
                </div>
              </div>

              {/* Score arc */}
              <div
                style={{
                  position: "relative",
                  flexShrink: 0,
                  marginLeft: "12px",
                }}
              >
                <ScoreArc score={target.score} color={target.color} />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: 700,
                    fontFamily: "var(--font-display)",
                    color: target.color,
                  }}
                >
                  {target.score}
                </div>
              </div>
            </div>

            {/* Status + Threat Level */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <StatusBadge passed={target.passed} />
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: "var(--font-mono)",
                  color: threatLevelColor(scoreToThreatLevel(target.score)),
                  letterSpacing: "0.08em",
                }}
              >
                {threatLevelLabel(scoreToThreatLevel(target.score))}
              </span>
            </div>

            {/* Details text */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "4px",
                padding: "10px 12px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  fontFamily: "var(--font-mono)",
                  color: "rgba(255,255,255,0.35)",
                  letterSpacing: "0.1em",
                  marginBottom: "5px",
                }}
              >
                TECHNICAL DETAILS
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                  color: "rgba(255,255,255,0.75)",
                  lineHeight: "1.55",
                }}
              >
                {target.details || "No additional details available."}
              </div>
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              data-ocid="drill-popover-close"
              style={{
                width: "100%",
                padding: "7px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "4px",
                color: "rgba(255,255,255,0.45)",
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.08em",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLButtonElement).style.color =
                  "rgba(255,255,255,0.8)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,255,255,0.04)";
                (e.currentTarget as HTMLButtonElement).style.color =
                  "rgba(255,255,255,0.45)";
              }}
            >
              DISMISS [ESC]
            </button>
          </div>
        </motion.dialog>
      )}
    </AnimatePresence>
  );
}
