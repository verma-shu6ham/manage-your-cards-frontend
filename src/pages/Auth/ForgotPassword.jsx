import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../services/api";
import { formatError } from '../../utils/errorHandler';
import { withErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import "./Auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, submitting, success, error
  const [error, setError] = useState("");
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    try {
      setStatus("submitting");
      setError("");
      
      await forgotPassword(email);
      setStatus("success");
    } catch (err) {
      const formattedError = formatError(err);
      setError(formattedError.message || "Failed to process password reset request");
      setStatus("error");
    }
  };
  
  return (
    <div className="auth-container">
      <h2>Reset Your Password</h2>
      
      {status === "success" ? (
        <div className="reset-success">
          <p>If an account exists with the email <strong>{email}</strong>, you will receive a password reset link shortly.</p>
          <p>Please check your email inbox and follow the instructions to reset your password.</p>
          <Link to="/login" className="auth-link">Return to Login</Link>
        </div>
      ) : (
        <>
          <p className="auth-description">
            Enter your email address below and we'll send you a link to reset your password.
          </p>
          
          {error && <div className="error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <span className="label-input">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                disabled={status === "submitting"}
              />
            </span>
            
            <button 
              type="submit" 
              disabled={status === "submitting"}
              className="auth-button"
            >
              {status === "submitting" ? "Sending..." : "Send Reset Link"}
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

export default withErrorBoundary(ForgotPassword);
