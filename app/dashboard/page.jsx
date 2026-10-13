// app/dashboard/page.jsx
//
// User Dashboard — a server component shell (so it can export
// metadata) wrapping components/dashboard/DashboardHub.jsx, the "use
// client" component that actually reads the person's localStorage-
// backed state across the Demo Trading Lab, Academy progress, and
// saved presets (all client-only concerns) — same page/component
// split as app/learn/page.jsx + components/academy/AcademyHub.jsx and
// app/learn/lab/page.jsx + components/academy/TradingLab.jsx.

import DashboardHub from "@/components/dashboard/DashboardHub";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "Your Dashboard — Trading Lab, Academy & Community | OmniFin Portal",
  description:
    "A unified view of your Demo Trading Lab account, OmniFin Academy curriculum progress, saved conversion & calculator presets, and your Trader Community & Setup Hub activity, with quick links across the OmniFin ecosystem.",
  path: "/dashboard",
});

export default function DashboardPage() {
  return <DashboardHub />;
}
