import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../../services/api";
import { formatError } from '../../utils/errorHandler';
import { withErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import "./Auth.css";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, submitting, success, error
  const [error, setError] = useState("");
  
  useEffect(() => {
    if (!token) {
      setError("Reset token is missing");
      setStatus("error");
    }
  }, [token]);
  
  useEffect(() => {
    if (password === confirmPassword) {
      setPasswordMismatch(false);
    } else {
      setPasswordMismatch(true);
    }
  }, [password, confirmPassword]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    try {
      setStatus("submitting");
      setError("");
      
      await resetPassword(token, password);
      setStatus("success");
      
      // Redirect to login after successful password reset
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      const formattedError = formatError(err);
      setError(formattedError.message || "Failed to reset password");
      setStatus("error");
    }
  };
  
  return (
    <div className="auth-container">
      <h2>Reset Your Password</h2>
      
      {status === "success" ? (
        <div className="reset-success">
          <p>Your password has been successfully reset!</p>
          <p>You will be redirected to the login page in a few seconds...</p>
        </div>
      ) : (
        <>
          {error && <div className="error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <span className="label-input">
              <label htmlFor="password">New Password</label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter new password"
                disabled={status === "submitting" || status === "error"}
              />
            </span>
            
            <span className="label-input">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                className={passwordMismatch ? "mismatch" : ""}
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
                disabled={status === "submitting" || status === "error"}
              />
              <button
                className="show-password"
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </span>
            
            {passwordMismatch && (
              <p className="password-mismatch">Passwords do not match</p>
            )}
            
            <button 
              type="submit" 
              disabled={status === "submitting" || status === "error" || passwordMismatch}
              className="auth-button"
            >
              {status === "submitting" ? "Resetting..." : "Reset Password"}
            </button>
          </form>
          
          <p className="auth-links">
            <Link to="/login" className="auth-link">Back to Login</Link>
          </p>
        </>
      )}
    </div>
  );
}

export default withErrorBoundary(ResetPassword);
