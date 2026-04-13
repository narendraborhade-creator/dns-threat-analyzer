import { RouterProvider, createRouter } from "@tanstack/react-router";
import { createRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Suspense, lazy } from "react";
import { Route as rootRoute } from "./routes/__root";
import { Route as indexRoute } from "./routes/index";

// Lazy-load pages
const ComparePage = lazy(() => import("./pages/Compare"));
const HistoryPage = lazy(() => import("./pages/History"));

// ─── Page Loader ───────────────────────────────────────────────────────────────

function PageLoader() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#090910" }}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2
          size={32}
          className="animate-spin"
          style={{ color: "#00cfff" }}
        />
        <p
          className="text-xs font-mono tracking-widest"
          style={{ color: "rgba(0,207,255,0.5)" }}
        >
          INITIALIZING...
        </p>
      </div>
    </div>
  );
}

// ─── Routes ────────────────────────────────────────────────────────────────────

const compareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/compare",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <ComparePage />
    </Suspense>
  ),
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <HistoryPage />
    </Suspense>
  ),
});

// ─── Router ────────────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  indexRoute,
  compareRoute,
  historyRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  return <RouterProvider router={router} />;
}
