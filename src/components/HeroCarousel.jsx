import { useState, useEffect, useCallback } from "react";

export default function HeroCarousel({ items, onSelect }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((index) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 300);
  }, [animating]);

  const next = useCallback(() => {
    goTo((current + 1) % items.length);
  }, [current, items.length, goTo]);

  useEffect(() => {
    if (!items.length) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, items.length]);

  if (!items.length) return null;

  const hero = items[current];

  return (
    <div className="hero-carousel">
      <div
        className={`hero-banner ${animating ? "hero-fade-out" : "hero-fade-in"}`}
        style={{
          backgroundImage: hero.backdrop_path
            ? `linear-gradient(to right, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.1) 100%),
               linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%),
               url(https://image.tmdb.org/t/p/original${hero.backdrop_path})`
            : "none",
        }}
      >
        <div className="hero-content">
          <div className="hero-badge">
            {hero.media_type === "tv" ? "📺 Series" : "🎬 Movie"}
          </div>
          <h1 className="hero-title">{hero.title || hero.name}</h1>
          <div className="hero-meta">
            <span>⭐ {hero.vote_average?.toFixed(1)}</span>
            <span>•</span>
            <span>{(hero.release_date || hero.first_air_date || "").slice(0, 4)}</span>
          </div>
          <p className="hero-overview">{hero.overview?.slice(0, 180)}...</p>
          <div className="hero-actions">
            <button className="hero-btn primary" onClick={() => onSelect(hero)}>
              ▶ View Details
            </button>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="hero-dots">
        {items.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === current ? "active" : ""}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      {/* Prev / Next */}
      <button className="hero-arrow left" onClick={() => goTo((current - 1 + items.length) % items.length)}>‹</button>
      <button className="hero-arrow right" onClick={next}>›</button>
    </div>
  );
}
