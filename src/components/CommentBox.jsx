import { useState, useContext, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { CommentContext } from "../context/CommentContext";

const STARS        = [1, 2, 3, 4, 5];
const FALLBACK_AVT = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export default function CommentBox({ mediaId, onNeedLogin }) {
  const { user }                          = useAuth();
  const { getComments, fetchComments,
          addComment, editComment,
          deleteComment }                 = useContext(CommentContext);

  const [text,        setText]        = useState("");
  const [rating,      setRating]      = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [posting,     setPosting]     = useState(false);
  const [error,       setError]       = useState("");
  const [replyTo,     setReplyTo]     = useState(null); // { id, userName }
  const [editingId,   setEditingId]   = useState(null);
  const [editText,    setEditText]    = useState("");

  useEffect(() => { fetchComments(mediaId); }, [mediaId, fetchComments]);

  const comments = getComments(mediaId);

  const handlePost = async () => {
    if (!user)        { onNeedLogin(); return; }
    if (!text.trim()) return;
    setPosting(true);
    setError("");
    try {
      await addComment(mediaId, {
        text:     text.trim(),
        rating:   replyTo ? 0 : rating,
        parentId: replyTo ? replyTo.id : null,
      });
      setText("");
      setRating(0);
      setReplyTo(null);
    } catch { setError("Failed to post. Try again."); }
    finally  { setPosting(false); }
  };

  const handleEdit = async (id) => {
    if (!editText.trim()) return;
    try {
      await editComment(mediaId, id, editText.trim());
      setEditingId(null);
      setEditText("");
    } catch { setError("Failed to edit."); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this comment?")) return;
    try { await deleteComment(mediaId, id); }
    catch { setError("Failed to delete."); }
  };

  const fmt = (iso) => {
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      });
    } catch { return iso; }
  };

  const CommentItem = ({ c, isReply = false }) => (
    <div className={`comment-item ${isReply ? "comment-reply" : ""}`}>
      <img
        src={c.userPhoto || FALLBACK_AVT}
        alt={c.userName}
        className="comment-avatar"
      />
      <div className="comment-body">
        <div className="comment-header">
          <strong>{c.userName}</strong>
          {c.rating > 0 && !isReply && (
            <span className="comment-stars">
              {"★".repeat(c.rating)}{"☆".repeat(5 - c.rating)}
            </span>
          )}
          <small>{fmt(c.createdAt)}</small>
          {c.isEdited && <span className="edited-badge">edited</span>}
        </div>

        {editingId === c.id ? (
          <div className="comment-edit-row">
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEdit(c.id)}
              autoFocus
            />
            <button onClick={() => handleEdit(c.id)} className="comment-post-btn">
              Save
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="comment-cancel-btn"
            >
              Cancel
            </button>
          </div>
        ) : (
          <p>{c.text}</p>
        )}

        <div className="comment-actions">
          {/* Reply — any logged-in user */}
          {!isReply && (
            <button
              className="comment-action-btn"
              onClick={() => {
                if (!user) { onNeedLogin(); return; }
                setReplyTo(replyTo?.id === c.id ? null : { id: c.id, userName: c.userName });
                setText("");
              }}
            >
              {replyTo?.id === c.id ? "Cancel Reply" : "Reply"}
            </button>
          )}

          {/* Edit & Delete — only comment owner */}
          {user?.uid === c.uid && editingId !== c.id && (
            <>
              <button
                className="comment-action-btn"
                onClick={() => { setEditingId(c.id); setEditText(c.text); }}
              >
                Edit
              </button>
              <button
                className="comment-action-btn delete"
                onClick={() => handleDelete(c.id)}
              >
                Delete
              </button>
            </>
          )}
        </div>

        {/* Replies */}
        {!isReply && c.replies?.length > 0 && (
          <div className="replies-list">
            {c.replies.map((r) => (
              <CommentItem key={r.id} c={r} isReply />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="comments-section">
      <h3>Reviews &amp; Comments ({comments.length})</h3>

      <div className="comment-input-area">
        {replyTo && (
          <div className="reply-indicator">
            Replying to <strong>{replyTo.userName}</strong>
            <button onClick={() => setReplyTo(null)}>✕</button>
          </div>
        )}

        {!replyTo && (
          <div className="star-rating">
            {STARS.map((s) => (
              <button
                key={s}
                className={`star-btn ${s <= (hoverRating || rating) ? "active" : ""}`}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => {
                  if (!user) { onNeedLogin(); return; }
                  setRating((p) => (p === s ? 0 : s));
                }}
                aria-label={`${s} star`}
              >★</button>
            ))}
            {rating > 0 && <span className="rating-label">{rating}/5</span>}
          </div>
        )}

        <div className="comment-row">
          <img
            src={user?.photoURL || FALLBACK_AVT}
            alt=""
            className="comment-avatar-small"
          />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              replyTo
                ? `Reply to ${replyTo.userName}...`
                : user ? "Write a review..." : "Sign in to comment..."
            }
            onKeyDown={(e) => e.key === "Enter" && handlePost()}
            onClick={() => { if (!user) onNeedLogin(); }}
            readOnly={!user}
          />
          <button
            onClick={handlePost}
            className="comment-post-btn"
            disabled={posting}
          >
            {posting ? "..." : user ? "Post" : "Sign In"}
          </button>
        </div>
        {error && <p className="login-error">{error}</p>}
      </div>

      <div className="comments-list">
        {comments.length === 0 && (
          <p className="no-comments">No reviews yet — be the first!</p>
        )}
        {comments.map((c) => (
          <CommentItem key={c.id} c={c} />
        ))}
      </div>
    </div>
  );
}