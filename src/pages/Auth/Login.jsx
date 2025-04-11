import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { login } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext/AuthContext"
import "./Auth.css"
import { formatError } from '../../utils/errorHandler'
import { withErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary'

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser, setLocale } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError("")
      setLoading(true)
      const data = await login(email, password)
      if (data && data.user) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('userId', data?.user?.id)
        setUser({ token: data.token, userId: data?.user?.id })
        localStorage.setItem('locale', data.user.locale)
        setLocale(data.user.locale)
        navigate("/dashboard")
        window.location.reload();
      }
    } catch (err) {
      const formattedError = formatError(err);
      setError(formattedError.message || "Failed to log in. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <h2>Welcome Back</h2>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <span className="label-input">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </span>
        <span className="label-input">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
          <button className="show-password" type="button" onClick={() => setShowPassword(prev => !prev)}>{showPassword ? `Hide` : 'Show'}</button>
        </span>
        <div className="forgot-password">
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
      <p>
        Don't have an account?{" "}
        <Link to="/signup">Sign up</Link>
      </p>
    </div>
  )
}

export default withErrorBoundary(Login)
