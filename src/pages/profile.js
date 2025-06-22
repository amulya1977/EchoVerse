import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/sidebar";
import {
  FaYoutube,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLink,
} from "react-icons/fa";
import "../styles/profile.css";


const Profile = () => {
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    username: "",
    bio: "",
    social: {
      youtube: "",
      facebook: "",
      twitter: "",
      instagram: "",
      website: "",
    },
  });

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/me", { withCredentials: true })
      .then((res) => {
        setProfileData((prev) => ({ ...prev, ...res.data.user }));
      })
      .catch((err) => console.error("Load error:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in profileData.social) {
      setProfileData((prev) => ({
        ...prev,
        social: { ...prev.social, [name]: value },
      }));
    } else {
      setProfileData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = () => {
    axios
      .put("http://localhost:5000/api/profile", profileData, {
        withCredentials: true,
      })
      .then(() => alert("Profile updated"))
      .catch((err) => console.error("Update error:", err));
  };

  return (
    <div className="profile-wrapper">
      <Sidebar />
      <div className="profile-container">
        <div className="profile-pic-box-ri small">
          <img src="/user.png" alt="Profile" className="profile-pic" />
          <button className="upload-btn">Upload</button>
        </div>

        <div className="profile-form lifted">
          <h2>Edit Profile</h2>
          <input
            type="text"
            name="name"
            value={profileData.name}
            onChange={handleChange}
            placeholder="Full Name"
          />
          <input
            type="email"
            name="email"
            value={profileData.email}
            onChange={handleChange}
            placeholder="Email"
          />
          <input
            type="text"
            name="username"
            value={profileData.username}
            onChange={handleChange}
            placeholder="Username"
          />
          <textarea
            name="bio"
            value={profileData.bio}
            onChange={handleChange}
            rows="3"
            maxLength="180"
            placeholder="Bio"
          />
          <div>{180 - profileData.bio.length} characters left</div>

          <h4>Add Your Social Handles below</h4>
          <div className="social-input">
            <FaYoutube className="icon" />
            <input
              type="text"
              name="youtube"
              value={profileData.social.youtube}
              onChange={handleChange}
              placeholder="https://"
            />
            <FaInstagram className="icon" />
            <input
              type="text"
              name="instagram"
              value={profileData.social.instagram}
              onChange={handleChange}
              placeholder="https://"
            />
            <FaFacebook className="icon" />
            <input
              type="text"
              name="facebook"
              value={profileData.social.facebook}
              onChange={handleChange}
              placeholder="https://"
            />
            <FaTwitter className="icon" />
            <input
              type="text"
              name="twitter"
              value={profileData.social.twitter}
              onChange={handleChange}
              placeholder="https://"
            />
            <FaLink className="icon" />
            <input
              type="text"
              name="website"
              value={profileData.social.website}
              onChange={handleChange}
              placeholder="https://"
            />
          </div>

          <button className="update-btn" onClick={handleUpdate}>
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;




