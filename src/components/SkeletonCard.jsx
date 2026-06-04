/**
 * SkeletonCard — animated placeholder shown while movie cards are loading.
 * Matches the same dimensions as MovieCard so the layout doesn't jump.
 */
export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-poster" />
      <div className="skeleton-body">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-subtitle" />
      </div>
    </div>
  );
}

/**
 * SkeletonGrid — renders N skeleton cards in the same grid as movies
 */
export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="movies-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
