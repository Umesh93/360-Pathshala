import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiSettings } from "react-icons/fi";
import logo from "../../assets/images/logo.png";
import { login } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import type { LoginResponse } from "../../types/Auth";

const getDashboardRoute = (role: string): string => {
  switch (role) {
    case "SUPER_ADMIN":
      return "/super-admin/dashboard";
    case "SCHOOL_ADMIN":
    case "ADMIN":
      return "/admin/dashboard";
    case "TEACHER":
      return "/teacher/dashboard";
    case "STUDENT":
      return "/student/dashboard";
    case "PARENT":
      return "/parent/dashboard";
    default:
      return "/";
  }
};

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data: LoginResponse = await login(username, password);

      setAuth({
        token: data.token,
        role: data.roles?.[0] || "",
        userId: data.userId,
        schoolId: data.schoolId,
        username: data.username,
        roles: data.roles || [],
      });

      navigate(getDashboardRoute(data.roles?.[0] || ""));
    } catch (err) {
      const axiosError = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Invalid username or password";
      setError(message);
    } finally {
      setLoading(false);
    }
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

        <button type="submit" className="login-btn" disabled={loading}>
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
