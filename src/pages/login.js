import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // ✅ new state

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData, {
        withCredentials: true, // ✅ make sure cookies are sent
      });

      localStorage.setItem("user", JSON.stringify(res.data.user));
      setSuccess(res.data.message || "Signin successful"); // ✅ show success message

      setTimeout(() => {
        navigate("/");
      }, 1500); // ✅ redirect after 1.5s
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="login-title">Welcome Back</h2>

        {error && <p className="login-error">{error}</p>}
        {success && <p className="login-success">{success}</p>} {/* ✅ success message */}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit" className="login-btn">Sign In</button>

        <div className="or-separator">or</div>

        <button type="button" className="google-btn">
          Continue With Google
        </button>

        <p className="signup-note">
          Don't have an account? <a href="/signup">Join us today</a>
        </p>
      </form>
    </div>
  );
};

export default Login;


