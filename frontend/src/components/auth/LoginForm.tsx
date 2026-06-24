import { useState } from "react";
import { FiEye, FiEyeOff, FiSettings } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (username === "superadmin" && password === "superadmin") {
      localStorage.setItem("token", "mock-token");
      localStorage.setItem("role", "SUPER_ADMIN");

      navigate("/super-admin/dashboard");

      return;
    }

    setError("Invalid username or password");
  };

  return (
    <div className="login-form-wrapper">
      <img src={logo} alt="360 Pathshala" className="login-logo" />

      <h1 className="welcome-title">Welcome Back 👋</h1>

      <p className="welcome-subtitle">Log in to your account to continue</p>

      <form className="login-form" onSubmit={handleLogin}>
        <div className="form-group">
          <label>
            Username <span>*</span>
          </label>

          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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

        <button type="submit" className="login-btn">
          Log In
        </button>
      </form>

      <button className="settings-btn">
        <FiSettings />
      </button>
    </div>
  );
};

export default LoginForm;
