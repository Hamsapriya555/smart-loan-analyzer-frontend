import axios from "axios";

/**
 * Base Axios instance
 * Uses VITE_API_URL from .env
 * Example:
 * VITE_API_URL=https://smart-loan-analyzer-backend.onrender.com/api
 */
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false, // IMPORTANT: JWT via headers, not cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ================= AUTH =================
export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
  me: () => API.get("/auth/me"),
};

// ================= DASHBOARD =================
export const dashboardService = {
  getData: () => API.get("/dashboard"),
  updateFinancialInfo: (data) =>
    API.put("/dashboard/financial-info", data),
};

// ================= LOANS =================
export const loanService = {
  getLoans: () => API.get("/loan"),
  create: (data) => API.post("/loan", data),
  simulate: (loan, whatIf) =>
    API.post("/loan/simulate", { loan, whatIf }),
};

// ================= FINANCE =================
export const financeService = {
  analyze: ({ monthlyIncome, monthlyExpenses, loans }) =>
    API.post("/finance/analyze", {
      monthlyIncome,
      monthlyExpenses,
      loans,
    }),
};

// ================= STRESS =================
export const stressService = {
  analyze: (data) => API.post("/stress/analyze", data),
};

// ================= AI ASSISTANT =================
export const assistantService = {
  chat: (payload) => API.post("/assistant/chat", payload),
};

// ================= ADMIN =================
export const adminService = {
  getUsers: () => API.get("/admin/users"),
  getLoans: () => API.get("/admin/loans"),
};

// ================= SUGGESTIONS =================
export const suggestionsService = {
  get: (data) => API.post("/suggestions/get", data),
};

export default API;
