import { useState, useEffect, useCallback } from "react";

export default function HeroCarousel({ items, onSelect }) {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = useCallback((idx) => {
    setFading(true);
    setTimeout(() => {
      setCurrent(idx);
      setFading(false);
    }, 350);
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % items.length);
  }, [current, items.length, goTo]);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (!items.length) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, items.length]);

  if (!items.length) return null;
  const hero = items[current];

  return (
    <div className="hero-carousel">

      {/* Background image layer */}
      <div
        className={`hero-slide ${fading ? "hero-fade-out" : "hero-fade-in"}`}
        style={{
          backgroundImage: hero.backdrop_path
            ? `url(https://image.tmdb.org/t/p/original${hero.backdrop_path})`
            : "none",
        }}
      />

      {/* Gradient overlay so text is always readable */}
      <div className="hero-overlay" />

      {/* Text content */}
      <div className="hero-content">
        <span className="hero-type-badge">
          {hero.media_type === "tv" ? "📺 Series" : "🎬 Movie"}
        </span>
        <h1 className="hero-title">{hero.title || hero.name}</h1>
        <div className="hero-meta">
          <span>⭐ {hero.vote_average?.toFixed(1)}</span>
          <span className="hero-sep">•</span>
          <span>{(hero.release_date || hero.first_air_date || "").slice(0, 4)}</span>
        </div>
        <p className="hero-overview">
          {hero.overview?.slice(0, 160)}{hero.overview?.length > 160 ? "..." : ""}
        </p>
        <button className="hero-btn" onClick={() => onSelect(hero)}>
          ▶ View Details
        </button>
      </div>

      {/* Left arrow */}
      <button
        className="hero-arrow hero-arrow-left"
        onClick={() => goTo((current - 1 + items.length) % items.length)}
      >‹</button>

      {/* Right arrow */}
      <button className="hero-arrow hero-arrow-right" onClick={next}>›</button>

      {/* Dot indicators */}
      <div className="hero-dots">
        {items.map((_, i) => (
          <button
            key={i}
            className={`hero-dot-btn ${i === current ? "active" : ""}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
