// src/pages/ForgotPassword.js
import React, { useState } from "react";
import Sidebar from "../components/sidebar";


const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // your axios POST logic here
  };

  return (
    <div className="profile-wrapper">
      <Sidebar />
      <div className="profile-form">
        <h2>Forgot Password</h2>
        <input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="update-btn" onClick={handleSubmit}>Send Reset Link</button>
      </div>
    </div>
  );
};

export default ForgotPassword;

