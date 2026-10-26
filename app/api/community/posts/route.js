// app/api/community/posts/route.js
//
// Guest (no-account) Community post submission — added Oct 2026 so
// publishing a visible-to-everyone post no longer requires completing
// Supabase Auth's email-confirmation step (hooks/useSupabaseAuth.js's
// signUp() inherits the project's "Confirm email" setting, which is
// the actual friction this route removes). A signed-in visitor's own
// post still goes straight from the browser to Supabase with the anon
// key, RLS-protected, unchanged — this route exists only for the
// guest path, writing through lib/communityStore.js's service-role
// client (see that file's header comment for why a server route,
// not a looser RLS policy).
//
// Every field is validated/whitelisted here, server-side, BEFORE it
// reaches lib/communityStore.js — this is now a public, unauthenticated
// write endpoint, so nothing from the request body is trusted as-is.
// lib/communityData.js's CATEGORIES/ASSET_TAGS/BIAS_OPTIONS are the
// single source of truth for the whitelists, same lists the client-side
// CreatePostModal.jsx already restricts its own dropdowns to — so a
// request can never claim a category/tag/bias this project doesn't
// actually have.

import { CATEGORIES, ASSET_TAGS, BIAS_OPTIONS } from "@/lib/communityData";
import { insertGuestPost, isCommunityStoreConfigured } from "@/lib/communityStore";

export const dynamic = "force-dynamic";

const CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id).filter((id) => id !== "all"));
const ASSET_TAG_IDS = new Set(ASSET_TAGS.map((a) => a.id));
const BIAS_IDS = new Set(BIAS_OPTIONS.map((b) => b.id));

const MAX_TITLE_LENGTH = 120;
const MAX_BODY_LENGTH = 2000;
const MAX_HANDLE_LENGTH = 24;
const MAX_ASSET_TAGS = 4;

function sanitizeHandle(raw) {
  const cleaned = (raw || "").toString().trim().replace(/[<>]/g, "").slice(0, MAX_HANDLE_LENGTH);
  return cleaned || "Guest";
}

function toNullableFiniteNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function POST(request) {
  if (!isCommunityStoreConfigured()) {
    return Response.json(
      { error: "Guest posting isn't configured on this deployment yet." },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const title = (body?.title || "").toString().trim().slice(0, MAX_TITLE_LENGTH);
  const postBody = (body?.body || "").toString().trim().slice(0, MAX_BODY_LENGTH);
  if (!title || !postBody) {
    return Response.json({ error: "A post needs a title and some content." }, { status: 400 });
  }

  const category = CATEGORY_IDS.has(body?.category) ? body.category : "setups";

  const assetTags = Array.isArray(body?.assetTags)
    ? body.assetTags.filter((tag) => ASSET_TAG_IDS.has(tag)).slice(0, MAX_ASSET_TAGS)
    : [];

  const bias = BIAS_IDS.has(body?.bias) ? body.bias : "none";
  const entry = bias === "none" ? null : toNullableFiniteNumber(body?.entry);
  const stopLoss = bias === "none" ? null : toNullableFiniteNumber(body?.stopLoss);
  const takeProfit = bias === "none" ? null : toNullableFiniteNumber(body?.takeProfit);

  const guestHandle = sanitizeHandle(body?.guestHandle);

  const post = await insertGuestPost({
    guestHandle,
    category,
    assetTags,
    title,
    body: postBody,
    bias,
    entry,
    stopLoss,
    takeProfit,
  });

  if (!post) {
    return Response.json(
      { error: "Couldn't publish your post right now — try again shortly." },
      { status: 502 }
    );
  }

  return Response.json({ post }, { status: 201 });
}
