import { useState, useContext, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { CommentContext } from "../context/CommentContext";

const STARS = [1, 2, 3, 4, 5];
const FALLBACK_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export default function CommentBox({ mediaId, onNeedLogin }) {
  const { user } = useAuth();
  const { getComments, fetchComments, addComment } = useContext(CommentContext);

  const [text,        setText]        = useState("");
  const [rating,      setRating]      = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [posting,     setPosting]     = useState(false);
  const [error,       setError]       = useState("");

  // Fetch comments from API on mount
  useEffect(() => {
    fetchComments(mediaId);
  }, [mediaId, fetchComments]);

  const comments = getComments(mediaId);

  const handlePost = async () => {
    if (!user)        { onNeedLogin(); return; }
    if (!text.trim()) return;

    setPosting(true);
    setError("");
    try {
      await addComment(mediaId, {
        text:   text.trim(),
        rating,
      });
      setText("");
      setRating(0);
    } catch {
      setError("Failed to post comment. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const fmt = (iso) => {
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      });
    } catch { return iso; }
  };

  return (
    <div className="comments-section">
      <h3>💬 Reviews &amp; Comments ({comments.length})</h3>

      <div className="comment-input-area">
        <div className="star-rating">
          {STARS.map((s) => (
            <button
              key={s}
              className={`star-btn ${s <= (hoverRating || rating) ? "active" : ""}`}
              onMouseEnter={() => setHoverRating(s)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => {
                if (!user) { onNeedLogin(); return; }
                setRating((prev) => (prev === s ? 0 : s));
              }}
              aria-label={`${s} star`}
            >★</button>
          ))}
          {rating > 0 && <span className="rating-label">{rating}/5</span>}
        </div>

        <div className="comment-row">
          <img
            src={user?.photoURL || FALLBACK_AVATAR}
            alt=""
            className="comment-avatar-small"
          />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={user ? "Write a review..." : "Sign in to comment..."}
            onKeyDown={(e) => e.key === "Enter" && handlePost()}
            onClick={() => { if (!user) onNeedLogin(); }}
            readOnly={!user}
          />
          <button
            onClick={handlePost}
            className="comment-post-btn"
            disabled={posting}
          >
            {posting ? "Posting..." : user ? "Post" : "Sign In"}
          </button>
        </div>
        {error && <p className="login-error">{error}</p>}
      </div>

      <div className="comments-list">
        {comments.length === 0 && (
          <p className="no-comments">No reviews yet — be the first!</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="comment-item">
            <img
              src={c.userPhoto || FALLBACK_AVATAR}
              alt={c.userName}
              className="comment-avatar"
            />
            <div className="comment-body">
              <div className="comment-header">
                <strong>{c.userName}</strong>
                {c.rating > 0 && (
                  <span className="comment-stars" title={`${c.rating}/5`}>
                    {"★".repeat(c.rating)}{"☆".repeat(5 - c.rating)}
                  </span>
                )}
                <small>{fmt(c.createdAt)}</small>
              </div>
              <p>{c.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}