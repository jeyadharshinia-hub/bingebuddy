function Navbar({ isLoggedIn }) {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        🎬 BingeBuddy
      </div>

      <div className="nav-links">
        <a href="#">Home</a>
        <a href="#">Trending</a>
        <a href="#">Movies</a>
        <a href="#">Series</a>
        <a href="#">🤍 Watchlist</a>
      </div>

      <div className="profile-section">
        <img
          src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
          alt="profile"
          className="profile-pic"
        />

        <span>
          {isLoggedIn ? "Profile" : "Guest"}
        </span>
      </div>
    </nav>
  );
}

export default Navbar;