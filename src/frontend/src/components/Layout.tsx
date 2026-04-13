import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, GitCompare, Shield, Zap } from "lucide-react";
import { GlobeBackground } from "./GlobeBackground";
import { ParticleField } from "./ParticleField";

// ─── Header ───────────────────────────────────────────────────────────────────

function Header() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const navItems = [
    { href: "/", label: "Analyze", icon: Shield },
    { href: "/compare", label: "Compare", icon: GitCompare },
    { href: "/history", label: "History", icon: Activity },
  ];

  return (
    <header
      className="relative z-50 border-b border-border"
      style={{
        background: "rgba(9, 9, 16, 0.92)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            data-ocid="nav-logo"
          >
            <div className="relative w-7 h-7 flex items-center justify-center">
              <div
                className="absolute inset-0 border border-neon-cyan opacity-60 group-hover:opacity-100 transition-smooth"
                style={{ transform: "rotate(45deg)" }}
              />
              <Zap size={14} className="text-neon-cyan relative z-10" />
            </div>
            <span
              className="font-display font-bold text-base tracking-widest uppercase"
              style={{
                color: "#00cfff",
                textShadow: "0 0 12px rgba(0,207,255,0.6)",
              }}
            >
              DNS<span className="text-foreground/70">·</span>SENTINEL
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1" data-ocid="nav-main">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = currentPath === href;
              return (
                <Link
                  key={href}
                  to={href}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono tracking-widest uppercase transition-smooth"
                  style={{
                    color: isActive ? "#00cfff" : "rgba(147,163,203,0.7)",
                    borderBottom: isActive
                      ? "1px solid #00cfff"
                      : "1px solid transparent",
                    textShadow: isActive
                      ? "0 0 8px rgba(0,207,255,0.5)"
                      : "none",
                  }}
                  data-ocid={`nav-${label.toLowerCase()}`}
                >
                  <Icon size={11} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse-glow"
              style={{
                background: "#00ff88",
                boxShadow: "0 0 6px rgba(0,255,136,0.8)",
              }}
            />
            <span
              className="text-xs font-mono"
              style={{ color: "rgba(0,255,136,0.7)" }}
            >
              LIVE
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Hero Banner (immersive 3D header) ───────────────────────────────────────

function HeroBanner() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        height: "200px",
        background: "linear-gradient(180deg, #070711 0%, #090912 100%)",
      }}
    >
      {/* 3D Globe */}
      <GlobeBackground className="opacity-90" />
      {/* Particle field overlay */}
      <ParticleField className="opacity-60" particleCount={180} />

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay opacity-40" />

      {/* Scan line */}
      <div
        className="absolute left-0 right-0 h-px pointer-events-none animate-scan-line"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,207,255,0.4), transparent)",
        }}
      />

      {/* Hero text — positioned left */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-lg">
            <div
              className="text-xs font-mono tracking-[0.3em] uppercase mb-2 animate-fade-in"
              style={{ color: "rgba(0,207,255,0.6)" }}
            >
              ⬡ Real-Time Threat Intelligence
            </div>
            <h1
              className="font-display font-bold text-2xl sm:text-3xl leading-tight tracking-tight animate-fade-in-up"
              style={{
                color: "#e8eeff",
                textShadow: "0 0 40px rgba(0,207,255,0.15)",
              }}
            >
              DNS Security
              <br />
              <span
                style={{
                  color: "#00cfff",
                  textShadow: "0 0 20px rgba(0,207,255,0.6)",
                }}
              >
                Analysis Platform
              </span>
            </h1>
            <p
              className="mt-2 text-xs font-mono leading-relaxed animate-fade-in"
              style={{
                color: "rgba(147,163,203,0.65)",
                animationDelay: "0.2s",
              }}
            >
              DNSSEC · Nameserver Legitimacy · Hijacking Risk · Amplification
              Detection
            </p>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{
          background: "linear-gradient(0deg, #090912 0%, transparent 100%)",
        }}
      />
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer
      className="relative border-t border-border"
      style={{ background: "rgba(7, 7, 17, 0.95)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap size={12} style={{ color: "#00cfff" }} />
            <span
              className="font-display font-semibold text-xs tracking-widest uppercase"
              style={{ color: "rgba(0,207,255,0.5)" }}
            >
              DNS·SENTINEL
            </span>
          </div>
          <p
            className="text-xs font-mono"
            style={{ color: "rgba(82, 100, 140, 0.7)" }}
          >
            © {year}. Built with love using{" "}
            <a
              href={utmLink}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-smooth"
              style={{ color: "rgba(0,207,255,0.5)" }}
            >
              caffeine.ai
            </a>
          </p>
          <div
            className="flex items-center gap-3 text-xs font-mono"
            style={{ color: "rgba(82, 100, 140, 0.5)" }}
          >
            <span>v1.0.0</span>
            <span>·</span>
            <span style={{ color: "rgba(0,255,136,0.5)" }}>● ONLINE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Layout ────────────────────────────────────────────────────────────────────

interface LayoutProps {
  children: React.ReactNode;
  showHero?: boolean;
}

export function Layout({ children, showHero = false }: LayoutProps) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#090910" }}
    >
      <Header />
      {showHero && <HeroBanner />}
      <main className="flex-1 relative">
        {/* Background particle field for main content */}
        <ParticleField className="opacity-20" particleCount={100} />
        <div className="relative z-10">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
