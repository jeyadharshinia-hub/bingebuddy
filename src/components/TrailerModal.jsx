import { useEffect } from "react";

/**
 * TrailerModal — displays a YouTube trailer in a fullscreen overlay.
 *
 * Props:
 *   trailerKey  — YouTube video key from TMDB (e.g. "dQw4w9WgXcQ")
 *   onClose     — callback to hide the modal
 */
export default function TrailerModal({ trailerKey, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Prevent background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!trailerKey) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Stop click propagating so clicking the iframe doesn't close */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <iframe
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
          title="Trailer"
          allowFullScreen
          allow="autoplay; encrypted-media"
        />
      </div>
    </div>
  );
}
