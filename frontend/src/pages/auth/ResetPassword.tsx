import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useSearchParams } from "react-router-dom";

import { authError, resetPassword } from "../../services/authService";
import PasswordRecoveryLayout from "./PasswordRecoveryLayout";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token")?.trim() ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(token ? "" : "This password reset link is invalid or has expired.");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!token) return setError("This password reset link is invalid or has expired.");
    if (newPassword.length < 8 || newPassword.length > 128)
      return setError("Password must be between 8 and 128 characters.");
    if (newPassword !== confirmPassword)
      return setError("Password confirmation does not match.");
    setSubmitting(true);
    try {
      await resetPassword(token, newPassword, confirmPassword);
      setSuccess(true);
    } catch (reason) {
      const message = authError(reason, "This password reset link is invalid or has expired.");
      setError(message.toLowerCase().includes("invalid or expired") ? "This password reset link is invalid or has expired." : message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PasswordRecoveryLayout>
      <h1 className="welcome-title">Reset Password</h1>
      <p className="welcome-subtitle">Choose a new password for your account.</p>
      {success ? (
        <div className="recovery-success" role="status">
          <p>Password reset successfully.</p>
          <Link to="/login" className="recovery-primary-link">Go to Login</Link>
        </div>
      ) : (
        <form className="login-form" onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="new-password">New Password <span>*</span></label>
            <div className="password-wrapper">
              <input id="new-password" type={showNewPassword ? "text" : "password"} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
              <button type="button" className="password-toggle" aria-label={showNewPassword ? "Hide password" : "Show password"} onClick={() => setShowNewPassword((visible) => !visible)}>
                {showNewPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password <span>*</span></label>
            <div className="password-wrapper">
              <input id="confirm-password" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
              <button type="button" className="password-toggle" aria-label={showConfirmPassword ? "Hide password" : "Show password"} onClick={() => setShowConfirmPassword((visible) => !visible)}>
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          {error && <p className="error-message" role="alert">{error}</p>}
          {token && <button type="submit" className="login-btn" disabled={submitting}>{submitting ? "Resetting..." : "Reset Password"}</button>}
          <Link to="/forgot-password" className="recovery-link">Request a New Reset Link</Link>
        </form>
      )}
    </PasswordRecoveryLayout>
  );
}
