import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { DomainAnalysis } from "../types/dns";
import {
  CATEGORY_LABELS,
  scoreToThreatLevel,
  threatLevelColor,
} from "../types/dns";

// ─── Constants ────────────────────────────────────────────────────────────────

const DOMAIN_A_COLOR = "#00e5ff";
const DOMAIN_B_COLOR = "#ff00c8";

const CAT_KEYS = [
  "DnssecRisk",
  "NameserverLegitimacy",
  "HijackingRisk",
  "AmplificationRisk",
  "EncryptionRisk",
  "TldRisk",
] as const;

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: "rgba(9,9,16,0.97)",
        border: "1px solid rgba(0,207,255,0.3)",
        borderRadius: "6px",
        padding: "10px 14px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
      }}
    >
      <div
        style={{
          color: "#00cfff",
          fontSize: "10px",
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.1em",
          marginBottom: "8px",
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      {payload.map((entry) => {
        const level = scoreToThreatLevel(entry.value);
        const color = threatLevelColor(level);
        return (
          <div
            key={entry.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "4px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: entry.color,
                boxShadow: `0 0 6px ${entry.color}`,
              }}
            />
            <span
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
              }}
            >
              {entry.name}:
            </span>
            <span
              style={{
                color,
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
              }}
            >
              {entry.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Custom Angle Tick ────────────────────────────────────────────────────────

interface TickProps {
  payload?: { value: string };
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
}

function CustomAngleTick({ payload, x = 0, y = 0, cx = 0, cy = 0 }: TickProps) {
  if (!payload?.value) return null;
  const dx = x - cx;
  void (y - cy); // dy not used for positioning, anchor determined by x axis only
  const anchor = Math.abs(dx) < 2 ? "middle" : dx > 0 ? "start" : "end";

  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      dominantBaseline="middle"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        fill: "#00cfff",
        letterSpacing: "0.06em",
      }}
    >
      {payload.value}
    </text>
  );
}

// ─── RadarChart2D ─────────────────────────────────────────────────────────────

interface RadarChart2DProps {
  analysisA: DomainAnalysis;
  analysisB: DomainAnalysis;
}

export function RadarChart2D({ analysisA, analysisB }: RadarChart2DProps) {
  const data = CAT_KEYS.map((key) => {
    const csA = analysisA.categoryScores.find((c) => c.category === key);
    const csB = analysisB.categoryScores.find((c) => c.category === key);
    return {
      subject: CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS],
      [analysisA.domain]: Math.min(100, Math.max(0, Number(csA?.score ?? 50))),
      [analysisB.domain]: Math.min(100, Math.max(0, Number(csB?.score ?? 50))),
    };
  });

  return (
    <div
      className="w-full h-full flex flex-col"
      data-ocid="radar-chart-2d"
      role="img"
      aria-label="2D radar chart comparing DNS threat scores"
    >
      {/* Fallback notice */}
      <div
        style={{
          textAlign: "center",
          padding: "6px 0 4px",
          fontSize: "9px",
          fontFamily: "var(--font-mono)",
          color: "rgba(255,215,0,0.6)",
          letterSpacing: "0.1em",
        }}
      >
        ⚠ WebGL unavailable — 2D fallback mode
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart
            data={data}
            margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
          >
            <PolarGrid stroke="rgba(0,207,255,0.08)" gridType="polygon" />
            <PolarAngleAxis
              dataKey="subject"
              tick={(props: TickProps) => <CustomAngleTick {...props} />}
            />
            <PolarRadiusAxis
              domain={[0, 100]}
              tick={{
                fontSize: 9,
                fontFamily: "var(--font-mono)",
                fill: "rgba(255,255,255,0.3)",
              }}
              tickCount={5}
              stroke="rgba(255,255,255,0.06)"
            />
            <Radar
              name={analysisA.domain}
              dataKey={analysisA.domain}
              stroke={DOMAIN_A_COLOR}
              fill={DOMAIN_A_COLOR}
              fillOpacity={0.12}
              strokeWidth={2}
              dot={{ fill: DOMAIN_A_COLOR, r: 4, strokeWidth: 0 }}
              activeDot={{
                r: 6,
                fill: DOMAIN_A_COLOR,
                style: { filter: `drop-shadow(0 0 6px ${DOMAIN_A_COLOR})` },
              }}
            />
            <Radar
              name={analysisB.domain}
              dataKey={analysisB.domain}
              stroke={DOMAIN_B_COLOR}
              fill={DOMAIN_B_COLOR}
              fillOpacity={0.12}
              strokeWidth={2}
              dot={{ fill: DOMAIN_B_COLOR, r: 4, strokeWidth: 0 }}
              activeDot={{
                r: 6,
                fill: DOMAIN_B_COLOR,
                style: { filter: `drop-shadow(0 0 6px ${DOMAIN_B_COLOR})` },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "rgba(255,255,255,0.6)",
              }}
              formatter={(value: string) => (
                <span
                  style={{
                    color:
                      value === analysisA.domain
                        ? DOMAIN_A_COLOR
                        : DOMAIN_B_COLOR,
                  }}
                >
                  {value}
                </span>
              )}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
