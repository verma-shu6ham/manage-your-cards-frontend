import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../../services/api";
import { localeCurrencyMap } from "../../constants/localeAndSymbol";
import "./Auth.css";
import { formatError } from '../../utils/errorHandler';
import { withErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary'

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [locale, setLocale] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [countryDropdown, setCountryDropdown] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const navigate = useNavigate();

  const handleName = (e) => {
    setName(e.target.value);
  };

  const handleEmail = (e) => {
    setEmail(e.target.value);
  };

  const handlePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleConfirmPassword = (e) => {
    setConfirmPassword(e.target.value);
  };

  useEffect(() => {
    if (password === confirmPassword) {
      setPasswordMismatch(false);
    } else {
      setPasswordMismatch(true);
    }
  }, [password, confirmPassword]);

  const handleSelectChange = (locale) => {
    setInputValue(`${localeCurrencyMap[locale].country} (${localeCurrencyMap[locale].currency})`)
    setLocale(locale);
    setCountryDropdown(false)
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setLocale(e.target.value);
  };

  const filteredOptions = Object.entries(localeCurrencyMap).filter(
    ([loc, { country }]) =>
      country.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const response = await signup(name, email, locale, password);
      setLoading(false);
      setSignupSuccess(true);
      // Don't navigate immediately, show success message first
    } catch (err) {
      setLoading(false);
      const formattedError = formatError(err);
      setError(formattedError.message);
    }
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest(".country-dropdown")) {
      setCountryDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>

      {error && <p className="error">{error}</p>}
      
      {signupSuccess ? (
        <div className="verification-status success">
          <h3>Account Created Successfully!</h3>
          <p>Thank you for signing up, {name}!</p>
          <p>We've sent a verification email to <strong>{email}</strong>.</p>
          <p>Please check your inbox and click the verification link to activate your account.</p>
          <p className="verification-note">
            If you don't see the email, please check your spam folder.
          </p>
          <button 
            className="auth-button"
            onClick={() => navigate("/login")}
            style={{ marginTop: "20px" }}
          >
            Go to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form">
          <span className="label-input">
            <label htmlFor="name">Full Name</label>
            <input type="text" placeholder="Name" value={name} onChange={handleName} required />
          </span>
          <span className="label-input">
            <label htmlFor="email">Email</label>
            <input type="email" placeholder="Email" value={email} onChange={handleEmail} required />
          </span>
          <span className="label-input country-dropdown">
            <label htmlFor="country">Country</label>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Type country or select country"
              onFocus={() => setCountryDropdown(true)}
            />
            <button
              className="country-dropdown-icon"
              type="button"
              onClick={() => setCountryDropdown((prev) => !prev)}
            >
              {countryDropdown ? "▲" : "▼"}
            </button>
            {countryDropdown && (
              <ul
                className="country-dropdown-list"
                onClick={(e) => e.stopPropagation()}
              >
                {filteredOptions.length > 0 ? (
                  filteredOptions.map(([loc, { country, currency }]) => (
                    <li key={loc} onClick={() => handleSelectChange(loc)}>
                      {country} ({currency})
                    </li>
                  ))
                ) : (
                  <li>No matching results</li>
                )}
              </ul>
            )}
          </span>
          <span className="label-input">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePassword}
              required
            />
          </span>
          <span className="label-input">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              className={`label-input ${passwordMismatch ? "mismatch" : ""}`}
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={handleConfirmPassword}
              required
            />
            <button
              className="show-password"
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? `Hide` : "Show"}
            </button>
          </span>
          <button type="submit" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
      )}
      
      {!signupSuccess && (
        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      )}
    </div>
  );
}

export default withErrorBoundary(Signup);
