import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/navbar.css';

const Navbar = ({ onPublish, onSaveDraft }) => {
  const [user, setUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const isEditorPage = location.pathname === '/write';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/me', {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const handleClickOutside = useCallback((event) => {
    if (!event.target.closest(".profile-dropdown-container")) {
      setIsProfileOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [handleClickOutside]);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(search)}`);
  };

  return (
    <nav className={`navbar ${isEditorPage ? "editor-navbar" : ""}`}>
      <div className="navbar-left">
        <Link to="/" className="logo">✒️</Link>
        {!isEditorPage && (
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="search"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        )}
      </div>

      <div className="navbar-right">
        {isEditorPage ? (
          <>
            <button className="editor-action-btn" onClick={onPublish}>
              Publish
            </button>
            <button className="editor-action-btn outline" onClick={onSaveDraft}>
              Save Draft
            </button>
          </>
        ) : (
          <>
            <button
              className="nav-link"
              onClick={() => {
                if (!user) {
                  alert("Please log in to write a blog.");
                  navigate("/login");
                } else {
                  navigate("/write");
                }
              }}
              style={{
                background: "none",
                border: "none",
                color: "inherit",
                font: "inherit",
                cursor: "pointer",
                padding: 0,
                textDecoration: "none"
              }}
            >
              Write
            </button>

            {user ? (
              <div className="profile-dropdown-container">
                <button
                  className="profile-dropdown-btn"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  aria-label="User profile"
                >
                  <img src="/user.png" alt="Profile" className="profile-icon" />
                </button>

                {isProfileOpen && (
                  <div className="custom-dropdown1 profile-dropdown" role="menu">
                    <Link to={`/profilepage/${user?.username}`} className="dropdown-item">Profile</Link>
                    <Link to="/profile" className="dropdown-item">Dashboard</Link>
                    <Link to="/profile" className="dropdown-item">Settings</Link>
                    <button onClick={handleLogout} className="dropdown-item">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="nav-btn">Sign In</Link>
                <Link to="/signup" className="nav-btn nav-btn-outline">Sign Up</Link>
              </>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
