import { useState } from "react";
import { Link } from "react-router-dom";

import { authError, requestPasswordReset } from "../../services/authService";
import PasswordRecoveryLayout from "./PasswordRecoveryLayout";

const SUCCESS_MESSAGE =
  "If an account exists for this email, a password reset link has been sent.";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      setMessage(SUCCESS_MESSAGE);
    } catch (reason) {
      setError(authError(reason, "Unable to send the reset link. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PasswordRecoveryLayout>
      <h1 className="welcome-title">Forgot Password?</h1>
      <p className="welcome-subtitle">
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>
      {message ? (
        <div className="recovery-success" role="status">
          <p>{message}</p>
          <Link to="/login" className="recovery-link">Back to Login</Link>
        </div>
      ) : (
        <form className="login-form" onSubmit={submit} noValidate>
          <div className="form-group">
            <label htmlFor="recovery-email">Email Address <span>*</span></label>
            <input
              id="recovery-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>
          {error && <p className="error-message" role="alert">{error}</p>}
          <button type="submit" className="login-btn" disabled={submitting}>
            {submitting ? "Sending..." : "Send Reset Link"}
          </button>
          <Link to="/login" className="recovery-link">Back to Login</Link>
        </form>
      )}
    </PasswordRecoveryLayout>
  );
}
