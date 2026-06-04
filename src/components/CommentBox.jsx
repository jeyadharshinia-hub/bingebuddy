import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import useComments from "../hooks/useComments";

const STARS = [1, 2, 3, 4, 5];

export default function CommentBox({ mediaId, onNeedLogin }) {
  const { user } = useAuth();
  const { comments, addComment } = useComments(mediaId);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handlePost = () => {
    if (!user) { onNeedLogin(); return; }
    if (!text.trim()) return;
    addComment(user, text, rating);
    setText("");
    setRating(0);
  };

  const fmt = (iso) => {
    try { return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
    catch { return iso; }
  };

  return (
    <div className="comments-section">
      <h3>💬 Reviews & Comments</h3>

      <div className="comment-input-area">
        {/* Star Rating */}
        <div className="star-rating">
          {STARS.map((s) => (
            <button
              key={s}
              className={`star-btn ${s <= (hoverRating || rating) ? "active" : ""}`}
              onMouseEnter={() => setHoverRating(s)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => {
                if (!user) { onNeedLogin(); return; }
                setRating(s);
              }}
            >★</button>
          ))}
          {rating > 0 && <span className="rating-label">{rating}/5</span>}
        </div>

        <div className="comment-row">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={user ? "Write a review..." : "Sign in to comment..."}
            onKeyDown={(e) => e.key === "Enter" && handlePost()}
          />
          <button onClick={handlePost} className="comment-post-btn">
            {user ? "Post" : "Sign In"}
          </button>
        </div>
      </div>

      <div className="comments-list">
        {comments.length === 0 && (
          <p className="no-comments">No reviews yet. Be the first!</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="comment-item">
            <img src={c.userPhoto} alt={c.userName} className="comment-avatar" />
            <div className="comment-body">
              <div className="comment-header">
                <strong>{c.userName}</strong>
                {c.rating > 0 && (
                  <span className="comment-stars">
                    {"★".repeat(c.rating)}{"☆".repeat(5 - c.rating)}
                  </span>
                )}
                <small>{fmt(c.time)}</small>
              </div>
              <p>{c.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
