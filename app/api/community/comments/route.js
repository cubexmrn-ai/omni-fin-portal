// app/api/community/comments/route.js
//
// Guest (no-account) Community comment submission — the comment-side
// counterpart to app/api/community/posts/route.js (see that file's
// header comment for the full "why a server route" reasoning). Before
// this, commenting had no guest path at all — hooks/useCommunityPosts.js's
// addComment() simply returned `{ error: "Sign in to comment." }` for
// anyone not signed in. This route gives guests the same friction-free
// write path posts now have.

import { insertGuestComment, isCommunityStoreConfigured } from "@/lib/communityStore";

export const dynamic = "force-dynamic";

const MAX_BODY_LENGTH = 1000;
const MAX_HANDLE_LENGTH = 24;

function sanitizeHandle(raw) {
  const cleaned = (raw || "").toString().trim().replace(/[<>]/g, "").slice(0, MAX_HANDLE_LENGTH);
  return cleaned || "Guest";
}

export async function POST(request) {
  if (!isCommunityStoreConfigured()) {
    return Response.json(
      { error: "Guest commenting isn't configured on this deployment yet." },
      { status: 503 }
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const postId = (payload?.postId || "").toString().trim();
  const commentBody = (payload?.body || "").toString().trim().slice(0, MAX_BODY_LENGTH);
  if (!postId || !commentBody) {
    return Response.json({ error: "A comment needs some content." }, { status: 400 });
  }

  const guestHandle = sanitizeHandle(payload?.guestHandle);

  const comment = await insertGuestComment({ postId, guestHandle, body: commentBody });
  if (!comment) {
    return Response.json(
      { error: "Couldn't post your comment right now — try again shortly." },
      { status: 502 }
    );
  }

  return Response.json({ comment }, { status: 201 });
}
