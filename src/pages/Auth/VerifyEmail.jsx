import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { verifyEmail } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext/AuthContext";
import { formatError } from '../../utils/errorHandler';
import { withErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import "./Auth.css";

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setUser, setLocale } = useAuth();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  
  useEffect(() => {
    // Prevent duplicate API calls
    if (isVerifying) return;
    
    const verifyUserEmail = async () => {
      if (!token) {
        setStatus("error");
        setError("Verification token is missing");
        return;
      }
      
      try {
        setIsVerifying(true);
        const data = await verifyEmail(token);
        if (data && data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data?.user?.id);
          setUser({token: data.token, userId: data?.user?.id});
          localStorage.setItem('locale', data.user.locale);
          setLocale(data.user.locale);
          setStatus("success");
          
          // Redirect to dashboard after successful verification
          setTimeout(() => {
            navigate("/dashboard");
          }, 3000);
        }
      } catch (err) {
        const formattedError = formatError(err);
        setError(formattedError.message || "Email verification failed");
        setStatus("error");
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyUserEmail();
  }, [token, navigate, setUser, setLocale]);
  
  return (
    <div className="auth-container">
      <h2>Email Verification</h2>
      
      {status === "verifying" && (
        <div className="verification-status">
          <p>Verifying your email address...</p>
          <div className="loading-spinner"></div>
        </div>
      )}
      
      {status === "success" && (
        <div className="verification-status success">
          <p>Your email has been successfully verified!</p>
          <p>You will be redirected to the dashboard in a few seconds...</p>
        </div>
      )}
      
      {status === "error" && (
        <div className="verification-status error">
          <p>Verification failed: {error}</p>
          <p>Please try again or contact support if the problem persists.</p>
          <button 
            className="auth-button"
            onClick={() => navigate("/login")}
          >
            Return to Login
          </button>
        </div>
      )}
    </div>
  );
}

export default withErrorBoundary(VerifyEmail);
