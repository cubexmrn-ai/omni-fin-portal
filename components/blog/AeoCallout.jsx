// components/blog/AeoCallout.jsx
//
// AEO (Answer Engine Optimization) callout — a short, direct 2-sentence
// answer rendered at the very top of every /blog/[slug] post, ahead of
// any other content, so an AI answer engine or a zero-click search
// snippet can lift a complete, self-contained answer without having
// to parse the rest of the article. Visually distinct (bordered,
// shaded) so a human reader also immediately gets the takeaway before
// deciding whether to read on.

export default function AeoCallout({ answer }) {
  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50 p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Quick answer</p>
      <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-800">{answer}</p>
    </div>
  );
}
