import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBlog,
  FaRegBell,
  FaPen,
  FaUserEdit,
  FaLock,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import "../styles/profile.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button className="hamburger" onClick={toggleSidebar}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-section">
          <h4>Dashboard</h4>
          <ul>
            <li>
              <Link to="/blogs" onClick={toggleSidebar}>
                <FaBlog className="sidebar-icon" /> Blogs
              </Link>
            </li>
            <li>
              <Link to="/notifications" onClick={toggleSidebar}>
                <FaRegBell className="sidebar-icon" /> Notifications
              </Link>
            </li>
            <li>
              <Link to="/write" onClick={toggleSidebar}>
                <FaPen className="sidebar-icon" /> Write
              </Link>
            </li>
          </ul>
        </div>
        <div className="sidebar-section">
          <h4>Settings</h4>
          <ul>
            <li>
              <Link to="/profile" onClick={toggleSidebar}>
                <FaUserEdit className="sidebar-icon" /> Edit Profile
              </Link>
            </li>
            <li>
              <Link to="/forgotpassword" onClick={toggleSidebar}>
                <FaLock className="sidebar-icon" /> Change Password
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
