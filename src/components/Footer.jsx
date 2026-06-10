import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-brand">
          <h2>🎬 BingeBuddy</h2>
          <p>
            Discover trending movies and TV series, explore cast details,
            watch trailers, and build your personal watchlist.
          </p>
        </div>

        <div className="footer-links">
          <h4>Navigation</h4>
          <Link to="/">Home</Link>
          <Link to="/discover">Discover</Link>
          <Link to="/watchlist">Watchlist</Link>
          <Link to="/profile">Profile</Link>
        </div>

        <div className="footer-links">
          <h4>Resources</h4>
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noreferrer"
          >
            TMDB
          </a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact</a>
        </div>

        <div className="footer-links">
          <h4>Developer</h4>
          <p>Jeyadharshini A</p>
          <a
            href="https://github.com/jeyadharshinia-hub/"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            href="www.linkedin.com/in/jeyadharshini-al"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
        </div>

      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} BingeBuddy. All rights reserved.
        </p>

        <p>
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </div>
    </footer>
  );
}