import React, { useState } from "react";
import "./Login.css";
import { useDispatch } from "react-redux";
import Service from "../Service";
import { userlogin } from "../../../Shared/Slice/AuthSlice";
import showToast from "../../../Shared/Utils/ToastNotification";

const Login = () => {
  const dispatch = useDispatch();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = "Email is required";
    if (!form.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await Service.Login(form);

      if (response?.status === 200) {
        showToast("success", "Login successful");
        console.log("response.data.user : ",response.data)
        // save in redux
        dispatch(userlogin(response.data));

        // optional: save token
        // localStorage.setItem("token", response.data.token);
      } else {
        showToast("error", response?.data?.message || "Login failed");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      showToast("error", err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <div className="brand">
          <h1>POD Document Analyzer</h1>
          <p>AI-powered document insights made simple</p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <h2>Sign in</h2>
          <p className="subtitle">Enter your credentials to access your account</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="options">
              <a href="#">Forgot Password?</a>
            </div>

            <p className="signup-text">
              Don’t have an account? <a href="/Sign-up">Sign Up</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
