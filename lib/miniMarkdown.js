// lib/miniMarkdown.js
//
// A small, dependency-free Markdown-to-HTML renderer for the Live
// Markdown Editor tool (components/tools/MarkdownEditorTool.jsx).
// Deliberately NOT a full CommonMark implementation — no npm package
// is installed for this project, and adding one just for a single
// preview pane isn't worth the dependency weight per this project's
// "lightweight JS modules" principle. Covers the markdown people
// actually use day to day: headings, bold/italic, inline code, code
// blocks, links, images, blockquotes, horizontal rules, ordered/
// unordered lists, and paragraphs.
//
// All raw text is HTML-escaped BEFORE any markdown syntax is applied,
// so pasted HTML/script tags render as literal text in the preview
// rather than executing — this still uses dangerouslySetInnerHTML to
// render the result, so that escaping step is load-bearing, not
// cosmetic.

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInline(text) {
  let out = escapeHtml(text);
  // Images before links (images share the link syntax with a leading !).
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img alt="$1" src="$2" class="inline-block max-w-full rounded" />');
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" class="text-brand-600 underline" target="_blank" rel="noopener noreferrer">$1</a>');
  out = out.replace(/`([^`]+)`/g, '<code class="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em]">$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  out = out.replace(/(?<!_)_([^_]+)_(?!_)/g, "<em>$1</em>");
  return out;
}

export function renderMarkdown(markdown) {
  const lines = (markdown || "").replace(/\r\n/g, "\n").split("\n");
  const htmlParts = [];
  let i = 0;
  let listBuffer = null; // { type: "ul" | "ol", items: [] }

  function flushList() {
    if (!listBuffer) return;
    const tag = listBuffer.type;
    const itemsHtml = listBuffer.items.map((item) => `<li>${renderInline(item)}</li>`).join("");
    htmlParts.push(`<${tag} class="${tag === "ul" ? "list-disc" : "list-decimal"} pl-6 space-y-1">${itemsHtml}</${tag}>`);
    listBuffer = null;
  }

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block.
    if (/^```/.test(line.trim())) {
      flushList();
      const codeLines = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        codeLines.push(lines[i]);
        i++;
      }
      htmlParts.push(
        `<pre class="rounded-lg bg-slate-900 text-slate-100 p-3 overflow-x-auto text-xs"><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`
      );
      i++; // skip closing fence
      continue;
    }

    // Horizontal rule.
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim())) {
      flushList();
      htmlParts.push('<hr class="my-4 border-slate-200" />');
      i++;
      continue;
    }

    // Headings.
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const sizeClass = { 1: "text-2xl", 2: "text-xl", 3: "text-lg", 4: "text-base", 5: "text-sm", 6: "text-xs" }[level];
      htmlParts.push(`<h${level} class="${sizeClass} font-bold text-slate-900 mt-4 mb-2">${renderInline(headingMatch[2])}</h${level}>`);
      i++;
      continue;
    }

    // Blockquote.
    if (/^>\s?/.test(line)) {
      flushList();
      const quoteLines = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      htmlParts.push(
        `<blockquote class="border-l-4 border-brand-300 pl-4 italic text-slate-600 my-2">${renderInline(quoteLines.join(" "))}</blockquote>`
      );
      continue;
    }

    // Unordered list item.
    const ulMatch = line.match(/^\s*[-*+]\s+(.*)$/);
    if (ulMatch) {
      if (!listBuffer || listBuffer.type !== "ul") {
        flushList();
        listBuffer = { type: "ul", items: [] };
      }
      listBuffer.items.push(ulMatch[1]);
      i++;
      continue;
    }

    // Ordered list item.
    const olMatch = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (olMatch) {
      if (!listBuffer || listBuffer.type !== "ol") {
        flushList();
        listBuffer = { type: "ol", items: [] };
      }
      listBuffer.items.push(olMatch[1]);
      i++;
      continue;
    }

    flushList();

    // Blank line -> paragraph break (no-op, just skip).
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Plain paragraph line.
    htmlParts.push(`<p class="my-2 leading-relaxed">${renderInline(line)}</p>`);
    i++;
  }

  flushList();
  return htmlParts.join("\n");
}
