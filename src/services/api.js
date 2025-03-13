import axios from "axios"
import { handleApiError } from '../utils/errorHandler'

const API_URL = `${process.env.REACT_APP_API_URL}/api`

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Helper function to check if we're offline and if the request is non-GET
const shouldShowOfflineWarning = (config) => {
  return !navigator.onLine && config.method !== 'get';
};

// Helper function to format error messages
const formatErrorMessage = (error) => {
  if (error.response) {
    // Server error with response
    return error.response.data?.message || error.response.statusText;
  } else if (error.request) {
    // Request made but no response
    return 'No response received from server. Please try again.';
  } else {
    // Error in setting up the request
    return error.message;
  }
};

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Check for offline status before making non-GET requests
    if (shouldShowOfflineWarning(config)) {
      throw new Error({
        message: 'This action requires an internet connection. Please connect to continue.',
        status: 503,
        statusText: 'Service Unavailable'
      });
    }
    
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password })
    return response.data
  } catch (err) {
    throw new Error({
      message: formatErrorMessage(err) || "Login failed. Please try again.",
      status: err.response?.status || 500,
      statusText: err.response?.statusText || "Internal Server Error"
    });
  }
}

export const signup = async (name, email, locale, password) => {
  try {
    const response = await api.post("/auth/signup", { name, email, locale, password })
    return response.data
  } catch (err) {
    throw new Error({
      message: formatErrorMessage(err) || "Signup failed. Please try again.",
      status: err.response?.status || 500,
      statusText: err.response?.statusText || "Internal Server Error"
    });
  }
}

// Credit Card endpoints
export const addCreditCard = async (cardData) => {
  try {
    const response = await api.post("/cards/add-card", cardData)
    return response.data
  } catch (err) {
    throw new Error({
      message: formatErrorMessage(err) || "Failed to add credit card. Please try again.",
      status: err.response?.status || 500,
      statusText: err.response?.statusText || "Internal Server Error"
    });
  }
}

export const getAllCards = async () => {
  try {
    const response = await api.get("/cards/all-cards")
    return response.data
  } catch (err) {
    throw new Error({
      message: formatErrorMessage(err) || "Failed to fetch credit cards. Please try again.",
      status: err.response?.status || 500,
      statusText: err.response?.statusText || "Internal Server Error"
    });
  }
}

export const getCardDetails = async (cardId) => {
  try {
    const response = await api.get(`/cards/${cardId}`)
    return response.data
  } catch (err) {
    throw new Error({
      message: formatErrorMessage(err) || "Failed to fetch card details. Please try again.",
      status: err.response?.status || 500,
      statusText: err.response?.statusText || "Internal Server Error"
    });
  }
}

export const updateRealTimeAvailableCredit = async (cardId, realTimeAvailableCredit) => {
  try {
    const response = await api.patch(`/cards/${cardId}/real-time-available-credit`, {
      realTimeAvailableCredit
    })
    return response.data
  } catch (err) {
    throw new Error({
      message: formatErrorMessage(err) || "Failed to update available credit. Please try again.",
      status: err.response?.status || 500,
      statusText: err.response?.statusText || "Internal Server Error"
    });
  }
}

export const deleteCard = async (cardId) => {
  try {
    const response = await api.delete(`/cards/${cardId}`)
    return response.data
  } catch (err) {
    throw new Error({
      message: formatErrorMessage(err) || "Failed to delete card. Please try again.",
      status: err.response?.status || 500,
      statusText: err.response?.statusText || "Internal Server Error"
    });
  }
}

// Transaction endpoints
export const createTransaction = async (transactionData) => {
  console.log("createTransaction")
  try {
    const response = await api.post("/transactions", transactionData)
    return response.data
  } catch (err) {
    console.log('errr', err)
    throw new Error({
      message: formatErrorMessage(err) || "Failed to create transaction. Please try again.",
      status: err.response?.status || 500,
      statusText: err.response?.statusText || "Internal Server Error"
    });
  }
}

export const createCashTransaction = async (transactionData) => {
  try {
    const response = await api.post("/transactions/cash", transactionData)
    return response.data
  } catch (err) {
    throw new Error({
      message: formatErrorMessage(err) || "Failed to create cash transaction. Please try again.",
      status: err.response?.status || 500,
      statusText: err.response?.statusText || "Internal Server Error"
    });
  }
}

export const getTransactions = async (filters = {}) => {
  try {
    const response = await api.get("/transactions", { params: filters })
    return response.data
  } catch (err) {
    throw new Error({
      message: formatErrorMessage(err) || "Failed to fetch transactions. Please try again.",
      status: err.response?.status || 500,
      statusText: err.response?.statusText || "Internal Server Error"
    });
  }
}

export const deleteTransaction = async (transactionId) => {
  try {
    const response = await api.delete(`/transactions/${transactionId}`)
    return response.data
  } catch (err) {
    throw new Error({
      message: formatErrorMessage(err) || "Failed to delete transaction. Please try again.",
      status: err.response?.status || 500,
      statusText: err.response?.statusText || "Internal Server Error"
    });
  }
}

export const updateTransaction = async (transactionId, transactionData) => {
  try {
    const response = await api.patch(`/transactions/${transactionId}`, transactionData)
    return response.data
  } catch (err) {
    throw new Error({
      message: formatErrorMessage(err) || "Failed to update transaction. Please try again.",
      status: err.response?.status || 500,
      statusText: err.response?.statusText || "Internal Server Error"
    });
  }
}

// Monthly Expense endpoints
export const getMonthlySpending = async (params) => {
  try {
    const response = await api.get("/transactions/monthly-spending", { params })
    return response.data
  } catch (err) {
    throw new Error({
      message: formatErrorMessage(err) || "Failed to fetch monthly spending. Please try again.",
      status: err.response?.status || 500,
      statusText: err.response?.statusText || "Internal Server Error"
    });
  }
}

export const getBillingSpending = async (params) => {
  try {
    const response = await api.get("/transactions/billing-spending", { params })
    return response.data
  } catch (err) {
    throw new Error({
      message: formatErrorMessage(err) || "Failed to fetch billing spending. Please try again.",
      status: err.response?.status || 500,
      statusText: err.response?.statusText || "Internal Server Error"
    });
  }
}

export const getSpendingSummary = async (params) => {
  try {
    const response = await api.get("/transactions/spending-summary", { params })
    return response.data
  } catch (err) {
    throw new Error({
      message: formatErrorMessage(err) || "Failed to fetch spending summary. Please try again.",
      status: err.response?.status || 500,
      statusText: err.response?.statusText || "Internal Server Error"
    });
  }
}

// User endpoints
export const getProfile = async () => {
  try {
    const response = await api.get("/user/profile")
    return response.data
  } catch (err) {
    throw new Error({
      message: formatErrorMessage(err) || "Failed to fetch profile. Please try again.",
      status: err.response?.status || 500,
      statusText: err.response?.statusText || "Internal Server Error"
    });
  }
}

export const getUserCategories = async () => {
  try {
    const response = await api.get("/user/categories")
    return response.data
  } catch (err) {
    throw new Error({
      message: formatErrorMessage(err) || "Failed to fetch categories. Please try again.",
      status: err.response?.status || 500,
      statusText: err.response?.statusText || "Internal Server Error"
    });
  }
}

export const updateLocale = async (locale) => {
  try {
    const response = await api.patch("/user/locale", { locale })
    return response.data
  } catch (err) {
    throw new Error({
      message: formatErrorMessage(err) || "Failed to update locale. Please try again.",
      status: err.response?.status || 500,
      statusText: err.response?.statusText || "Internal Server Error"
    });
  }
}

export const addCategory = async ({ category, subcategory }) => {
  try {
    const response = await api.post("/user/categories", { category, subcategory })
    return response.data
  } catch (err) {
    throw new Error({
      message: formatErrorMessage(err) || "Failed to add category. Please try again.",
      status: err.response?.status || 500,
      statusText: err.response?.statusText || "Internal Server Error"
    });
  }
}

export const deleteCategory = async (data) => {
  try {
    const response = await api.delete("/user/categories", { data })
    return response.data
  } catch (err) {
    throw new Error({
      message: formatErrorMessage(err) || "Failed to delete category. Please try again.",
      status: err.response?.status || 500,
      statusText: err.response?.statusText || "Internal Server Error"
    });
  }
}

export const deleteAccount = async () => {
  try {
    const response = await api.delete("/users/delete-account")
    return response.data
  } catch (err) {
    throw new Error({
      message: formatErrorMessage(err) || "Failed to delete account. Please try again.",
      status: err.response?.status || 500,
      statusText: err.response?.statusText || "Internal Server Error"
    });
  }
}

export default api
