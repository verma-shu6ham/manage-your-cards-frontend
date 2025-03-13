import axios from "axios"
import { handleApiError } from '../utils/errorHandler'

const API_URL = `${process.env.REACT_APP_API_URL}/api`

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    throw handleApiError(err, {
      message: "Login failed. Please check your credentials and try again."
    })
  }
}

export const signup = async (name, email, locale, password) => {
  try {
    const response = await api.post("/auth/signup", { name, email, locale, password })
    return response.data
  } catch (err) {
    throw handleApiError(err, {
      message: "Signup failed. Please check your details and try again."
    })
  }
}

// Credit Card endpoints
export const addCreditCard = async (cardData) => {
  try {
    const response = await api.post("/cards/add-card", cardData)
    return response.data
  } catch (err) {
    throw handleApiError(err, {
      message: "Failed to add credit card. Please check your card details and try again."
    })
  }
}

export const getAllCards = async () => {
  try {
    const response = await api.get("/cards/all-cards")
    return response.data
  } catch (err) {
    throw handleApiError(err, {
      message: "Failed to fetch credit cards. Please try again later."
    })
  }
}

export const getCardDetails = async (cardId) => {
  try {
    const response = await api.get(`/cards/${cardId}`)
    return response.data
  } catch (err) {
    throw handleApiError(err, {
      message: "Failed to fetch card details. Please try again later."
    })
  }
}

export const updateRealTimeAvailableCredit = async (cardId, realTimeAvailableCredit) => {
  try {
    const response = await api.patch(`/cards/${cardId}/real-time-available-credit`, {
      realTimeAvailableCredit
    })
    return response.data
  } catch (err) {
    throw handleApiError(err, {
      message: "Failed to update real-time available credit. Please try again later."
    })
  }
}

export const deleteCard = async (cardId) => {
  try {
    const response = await api.delete(`/cards/${cardId}`)
    return response
  } catch (err) {
    throw handleApiError(err, {
      message: "Failed to delete credit card. Please try again later."
    })
  }
}

// Transaction endpoints
export const createTransaction = async (transactionData) => {
  console.log("createTransaction")
  try {
    const response = await api.post("/transactions", transactionData)
    return response.data
  } catch (err) {
    console.log(err)
    throw handleApiError(err, {
      message: "Failed to create transaction. Please check your details and try again."
    })
  }
}

export const createCashTransaction = async (transactionData) => {
  try {
    const response = await api.post("/transactions/cash", transactionData)
    return response.data
  } catch (err) {
    throw handleApiError(err, {
      message: "Failed to create cash transaction. Please check your details and try again."
    })
  }
}

export const getTransactions = async (filters = {}) => {
  try {
    const response = await api.get("/transactions", { params: filters })
    return response.data.transactions
  } catch (err) {
    throw handleApiError(err, {
      message: "Failed to fetch transactions. Please try again later."
    })
  }
}

export const deleteTransaction = async (transactionId) => {
  try {
    const response = await api.delete(`/transactions/${transactionId}`)
    return response.data
  } catch (err) {
    throw handleApiError(err, {
      message: "Failed to delete transaction. Please try again later."
    })
  }
}

export const updateTransaction = async (transactionId, transactionData) => {
  try {
    const response = await api.patch(`/transactions/${transactionId}`, transactionData)
    return response.data
  } catch (err) {
    throw handleApiError(err, {
      message: "Failed to update transaction. Please check your details and try again."
    })
  }
}

// Monthly Expense endpoints
export const getMonthlySpending = async (params) => {
  try {
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});

    cleanParams.spendingType = 'monthly';


    const response = await api.get("/transactions/monthly-spending", {
      params: cleanParams
    });

    return response.data;
  } catch (err) {
    throw handleApiError(err, {
      message: "Failed to fetch monthly spending data. Please try again later."
    })
  }
};

export const getBillingSpending = async (params) => {
  try {
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});
    cleanParams.spendingType = 'billing';

    const response = await api.get("/transactions/monthly-spending", {
      params: cleanParams
    });
    return response.data.monthlySummary[0];
  } catch (err) {
    throw handleApiError(err, {
      message: "Failed to fetch billing spending data. Please try again later."
    })
  }
};

export const getSpendingSummary = async (params) => {
  try {
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});

    const response = await api.get("/transactions/spending-summary", {
      params: cleanParams
    });
    return response.data.summary;
  } catch (err) {
    throw handleApiError(err, {
      message: "Failed to fetch spending summary. Please try again later."
    })
  }
};

// User endpoints
export const getProfile = async () => {
  try {
    const response = await api.get("/user/profile")
    return response.data
  } catch (err) {
    throw handleApiError(err, {
      message: "Failed to fetch profile information. Please try again later."
    })
  }
}

export const getUserCategories = async () => {
  try {
    const response = await api.get("/user/categories")
    return response.data
  } catch (err) {
    throw handleApiError(err, {
      message: "Failed to fetch categories. Please try again later."
    })
  }
}

export const updateLocale = async (locale) => {
  try {
    const response = await api.patch("/user/locale", { locale })
    return response.data
  } catch (err) {
    throw handleApiError(err, {
      message: "Failed to update country preference. Please try again later."
    })
  }
}

export const addCategory = async ({ category, subcategory }) => {
  try {
    const response = await api.post("user/categories", { category, subcategory })
    return response.data
  } catch (err) {
    throw handleApiError(err, {
      message: "Failed to add category/subcategory. Please check your details and try again."
    })
  }
}

export const deleteCategory = async (data) => {
  try {
    const response = await api.delete("user/categories", { data })
    return response.data
  } catch (err) {
    throw handleApiError(err, {
      message: "Failed to delete category/subcategory. Please try again later."
    })
  }
}

export const deleteAccount = async () => {
  try {
    const response = await api.delete("/users/delete-account")
    return response.data
  } catch (err) {
    throw handleApiError(err, {
      message: "Failed to delete account. Please try again later."
    })
  }
}

export default api
