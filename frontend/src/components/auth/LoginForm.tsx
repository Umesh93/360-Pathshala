import { useState } from "react";
import { FiEye, FiEyeOff, FiSettings } from "react-icons/fi";
import logo from "../../assets/images/logo.png";
import { login } from "../../services/authService";
import type { LoginResponse } from "../../types/Auth";
import { API_BASE_URL } from "../../config/env";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  console.log("LoginForm rendered, API_BASE_URL:", API_BASE_URL);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");
    setError("");
    setLoading(true);

    try {
      console.log("Attempting login with:", { username, password });
      const data: LoginResponse = await login(username, password);
      console.log("Login response:", data);

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.roles?.[0] || "");
      localStorage.setItem("username", data.username);
      localStorage.setItem("userId", String(data.userId));
      if (data.schoolId) localStorage.setItem("schoolId", String(data.schoolId));

      const role = data.roles?.[0];
      console.log("Navigating with role:", role);
      if (role === "SUPER_ADMIN") {
        console.log("Navigating to /super-admin/dashboard");
        window.location.href = "/super-admin/dashboard";
      } else if (role === "SCHOOL_ADMIN" || role === "ADMIN") {
        console.log("Navigating to /admin/dashboard");
        window.location.href = "/admin/dashboard";
      } else {
        console.log("Navigating to /");
        window.location.href = "/";
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const message = err.response?.data?.message || err.message || "Invalid username or password";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    console.log("Button clicked, username:", username, "password:", password);
  };

  return (
    <div className="login-form-wrapper">
      <img src={logo} alt="360 Pathshala" className="login-logo" />

      <h1 className="welcome-title">Welcome Back 👋</h1>

      <p className="welcome-subtitle">Log in to your account to continue</p>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            Username <span>*</span>
          </label>

          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>
            Password <span>*</span>
          </label>

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <div className="login-options">
          <label className="remember-me">
            <input type="checkbox" />
            Remember me
          </label>

          <a href="#">Forgot Password?</a>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button
          type="submit"
          className="login-btn"
          disabled={loading}
          onClick={handleButtonClick}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <button className="settings-btn">
        <FiSettings />
      </button>
    </div>
  );
};

export default LoginForm;
