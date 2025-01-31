import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`
  }
  return config
})

export const fetchCardDetails = async (id) => {
  try {
    const response = await api.get(`/credit-card/${id}`)
    return response.data
  } catch (error) {
    throw new Error("Failed to fetch card details. Please try again.")
  }
}

export const updateRealTimeAvailableCredit = async (id, realTimeAvailable) => {
  try {
    await api.patch(`/credit-card/${id}/real-time-available-credit`, { realTimeAvailable })
  } catch (error) {
    throw new Error("Failed to update balance. Please try again.")
  }
}


export default api

