"use client";

// app/global-error.jsx
//
// The one error boundary that CAN catch an error thrown by the root
// layout itself (app/layout.jsx — header, footer, providers), which
// app/error.jsx cannot, per Next.js App Router's own convention
// (global-error.jsx must render its own <html>/<body>, since the root
// layout that would normally provide them is exactly what may have
// failed). Kept intentionally minimal and dependency-free — it must
// render standalone, without relying on any provider/context this
// deployment's own layout sets up, since those are the very thing that
// might be broken when this fires.
export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <p className="text-4xl" aria-hidden="true">
          ⚠️
        </p>
        <h1 className="mt-4 text-xl font-bold text-slate-900">
          OmniFin Portal hit an unexpected error
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Something went wrong loading the site shell itself. Please try
          again in a moment.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-card"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
