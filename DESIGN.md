# Design Brief

## Purpose & Context
DNS security threat analysis platform for technical security professionals performing real-time threat assessment. Users need immediate visual clarity on domain threat severity and legitimacy across multiple threat vectors.

## Tone
Futuristic tech-forward cyberpunk aesthetic with technical precision. Not playful, not minimalist — serious, credible, data-dense. Color-coded threat awareness (neon accents) conveys severity instantly.

## Palette
| Token           | OKLCH                 | Usage                              |
|-----------------|----------------------|-----------------------------------|
| background      | 0.12 0 0             | Deep charcoal dark base            |
| card            | 0.16 0 0             | Content cards, raised surfaces     |
| critical (red)  | 0.6 0.3 25           | High-risk threats, destructive     |
| warning (yellow)| 0.8 0.2 95           | Medium-risk, caution states        |
| safe (green)    | 0.65 0.25 142        | Verified, valid, secure states     |
| neutral         | 0.28 0 0             | Borders, separators, muted text    |

## Typography
| Layer    | Font         | Use Case                    |
|----------|--------------|---------------------------|
| Display  | Space Grotesk| Headers, threat scores, UI titles |
| Body     | Geist Mono   | Data labels, threat details, technical info |
| Mono     | Geist Mono   | DNS records, IP addresses, raw data |

## Shape Language
Zero border-radius (geometric purity). No rounded corners — all sharp edges for technical authority. Layered depth via shadows, not curves.

## Elevation & Depth
| Level  | Box Shadow                              |
|--------|----------------------------------------|
| Base   | None (flat on background)              |
| Card   | 0 8px 32px rgba(0,0,0,0.6) + inset highlight |
| Hover  | glow-red/yellow/green contextual       |

## Structural Zones
| Zone                | Styling                                      |
|------------------|----------------------------------------------|
| Header              | Dark card (0.16), full-bleed 3D rotating globe, floating DNS particles |
| Comparison Cards    | Alternating card (0.16) with threat badge overlay, left border neon accent |
| 3D Visualization    | Full-width canvas, centered threat matrix, radar overlay |
| Data Tables         | Monospace text, minimal borders, neon column highlights |
| Footer              | Muted background (0.28), text-right alignment |

## Component Patterns
- **Threat Badge**: Neon-colored (critical/warning/safe), left-aligned geometric icon, numeric score
- **Domain Card**: Header with domain name (mono), TLD validity (green/red), threat categories stacked (icon + label + severity indicator)
- **3D Chart**: Interactive rotation, threat severity mapped to hue (red→yellow→green), confidence as Z-axis height
- **Status Indicator**: Mono text label + neon glow box-shadow, no pill-shaped backgrounds

## Motion & Animation
- Header globe: continuous slow rotation (12s) + subtle bob (4s, -16px range)
- Threat particles: float up with fade-out, spawn randomized (12 per cycle)
- 3D chart interactions: smooth camera transitions (300ms cubic-bezier), axis labels slide-in on hover
- Transitions: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) for snappy feedback

## Constraints
- No rounded corners (--radius: 0)
- No blur effects on text (no backdrop-filter: blur)
- No full-page gradients — solid backgrounds + neon accents only
- No animated GIFs or raster particles — Canvas/WebGL only
- All threat data must render live (no demo images, real nameserver checks)

## Signature Detail
Floating DNS query particle field in header — thousands of tiny dots flowing upward, each representing a live DNS lookup. Fades on scroll. Reinforces that the tool is performing *active* security checks in real time, not showing cached data.

## Accessibility
- WCAG AA minimum contrast (neon accents paired with dark backgrounds meet 7:1+)
- All threat badges include descriptive title attributes
- 3D charts have keyboard navigation (arrow keys) + fallback text label
- Monospace data is always readable at 14px minimum

## Responsive Strategy
- Mobile-first breakpoints: sm (640px) stacks cards vertically
- md (768px) two-column comparison layout
- lg (1024px) full 3D chart width + sidebar threat list
- No horizontal scroll


