// src/pages/Signup.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/signup", formData);
      alert("User registered successfully!");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Signup failed.");
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Join Us Today</h2>
        <input name="name" placeholder="Full Name" onChange={handleChange} />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} />
        <button type="submit">Sign Up</button>
        <div className="divider">OR</div>
        <button className="google-btn">Continue With Google</button>
        <p>Already a member? <a href="/login">Sign in here</a></p>
      </form>
    </div>
  );
};

export default Signup;

