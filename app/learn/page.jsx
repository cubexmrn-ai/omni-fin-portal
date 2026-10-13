// app/learn/page.jsx
//
// OmniFin Academy hub — a server component shell (so it can export
// metadata) wrapping components/academy/AcademyHub.jsx, the "use
// client" component that actually renders the progress banner, level
// roadmap, and search/category filter (progress lives in localStorage,
// which only exists client-side — same page/component split as
// app/ai-news/page.jsx + components/NewsFeed.jsx elsewhere in this
// project).

import AcademyHub from "@/components/academy/AcademyHub";
import AcademyStructuredData from "@/components/academy/AcademyStructuredData";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "OmniFin Academy — Learn Trading & Personal Finance | OmniFin Portal",
  description:
    "A free, gamified School of Pipsology-style curriculum: 5 levels from money basics to professional risk management, with bite-sized lessons, visual diagrams, embedded calculators, and end-of-module quizzes.",
  path: "/learn",
});

export default function AcademyPage() {
  return (
    <>
      <AcademyStructuredData />
      <AcademyHub />
    </>
  );
}
