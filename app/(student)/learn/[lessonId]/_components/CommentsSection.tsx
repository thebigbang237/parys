// app/(student)/learn/[lessonId]/_components/CommentsSection.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type User = { id: string; name: string | null; image: string | null };

type Reply = {
  id: string;
  content: string;
  created_at: Date;
  user: User;
};

type Comment = {
  id: string;
  content: string;
  created_at: Date;
  user: User;
  replies: Reply[]; // ← replies don't have their own replies
};

// ── Avatar helper ──
function Avatar({ user, size = "sm" }: { user: User; size?: "sm" | "md" }) {
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const sizeClass = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";

  if (user.image) {
    return (
      <img
        src={user.image}
        alt={user.name || ""}
        className={cn("rounded-full object-cover flex-shrink-0", sizeClass)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-[#fdf0fa] flex items-center justify-center flex-shrink-0 font-medium text-[#ff63ce]",
        sizeClass,
      )}
    >
      {initials}
    </div>
  );
}

// ── Single comment ──
function CommentItem({
  comment,
  lessonId,
  currentUser,
  onReplyAdded,
}: {
  comment: Comment;
  lessonId: string;
  currentUser: User;
  onReplyAdded: (commentId: string, reply: Reply) => void;
}) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitReply() {
    if (!replyText.trim()) return;
    setSubmitting(true);

    const res = await fetch(`/api/lessons/${lessonId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyText, parent_id: comment.id }),
    });

    const data = await res.json();
    if (res.ok) {
      onReplyAdded(comment.id, data as Reply);
      setReplyText("");
      setShowReplyBox(false);
    }
    setSubmitting(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Avatar user={comment.user} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {comment.user.name || "Anonyme"}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(comment.created_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {comment.content}
          </p>
          <button
            onClick={() => setShowReplyBox(!showReplyBox)}
            className="text-xs text-gray-500 hover:text-[#ff63ce] transition-colors mt-2"
          >
            Répondre
          </button>
        </div>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="ml-11 space-y-3 border-l-2 border-[#f0e0ec] pl-4">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <Avatar user={reply.user} size="sm" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {reply.user.name || "Anonyme"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(reply.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {reply.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply box */}
      {showReplyBox && (
        <div className="ml-11 flex gap-3">
          <Avatar user={currentUser} size="sm" />
          <div className="flex-1">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Écrire une réponse..."
              rows={2}
              className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#ff63ce] resize-none"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={submitReply}
                disabled={submitting || !replyText.trim()}
                className="bg-[#ff63ce] text-white px-4 py-1.5 text-xs tracking-[1px] uppercase disabled:opacity-50 hover:bg-[#111] transition-colors"
              >
                {submitting ? "..." : "Répondre"}
              </button>
              <button
                onClick={() => setShowReplyBox(false)}
                className="text-xs text-gray-500 hover:text-gray-600"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main comments section ──
export default function CommentsSection({
  lessonId,
  initialComments,
  currentUser,
}: {
  lessonId: string;
  initialComments: Comment[];
  currentUser: User;
}) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitComment() {
    if (!newComment.trim()) return;
    setSubmitting(true);

    const res = await fetch(`/api/lessons/${lessonId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment }),
    });

    const data = await res.json();
    if (res.ok) {
      setComments((prev) => [{ ...data, replies: [] }, ...prev]);
      setNewComment("");
    }
    setSubmitting(false);
  }

  function handleReplyAdded(commentId: string, reply: Reply) {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, replies: [...c.replies, reply] } : c,
      ),
    );
  }

  return (
    <div>
      <h2 className="font-serif text-2xl font-medium text-gray-900 mb-6">
        Discussion ({comments.length})
      </h2>

      {/* New comment */}
      <div className="flex gap-3 mb-8">
        <Avatar user={currentUser} size="md" />
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Poser une question ou partager un commentaire..."
            rows={3}
            className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#ff63ce] transition-colors resize-none"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={submitComment}
              disabled={submitting || !newComment.trim()}
              className="bg-[#ff63ce] text-white px-6 py-2 text-xs tracking-[2px] uppercase disabled:opacity-50 hover:bg-[#111] transition-colors"
            >
              {submitting ? "Envoi..." : "Publier"}
            </button>
          </div>
        </div>
      </div>

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">
          Sois la première à poser une question sur cette leçon.
        </p>
      ) : (
        <div className="space-y-6 divide-y divide-[#f0e0ec]">
          {comments.map((comment) => (
            <div key={comment.id} className="pt-6 first:pt-0">
              <CommentItem
                comment={comment}
                lessonId={lessonId}
                currentUser={currentUser}
                onReplyAdded={handleReplyAdded}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
