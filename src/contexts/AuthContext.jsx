import { createContext, useState, useContext, useEffect } from "react"
import api from "../services/api"

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser({ token })
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password })
      localStorage.setItem("token", response.data.token)
      api.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`
      setUser({ token: response.data.token })
      return response.data
    } catch (error) {
      throw error.response.data
    }
  }

  const signup = async (name, email, password) => {
    try {
      const response = await api.post("/auth/signup", { name, email, password })
      localStorage.setItem("token", response.data.token)
      api.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`
      setUser({ token: response.data.token })
      return response.data
    } catch (error) {
      throw error.response.data
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    delete api.defaults.headers.common["Authorization"]
    setUser(null)
  }

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

