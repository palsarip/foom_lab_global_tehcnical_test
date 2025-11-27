import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const api = {
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const response = await apiClient.get("/products", { params });
    return response.data;
  },

  getStocks: async (
    page = 1,
    limit = 10,
    search = "",
    sortBy = "",
    order = "",
    warehouse_id = ""
  ) => {
    const response = await apiClient.get("/stocks", {
      params: { page, limit, search, sortBy, order, warehouse_id },
    });
    return response.data;
  },

  getPurchaseRequests: async () => {
    const response = await apiClient.get("/purchase/request");
    return response.data;
  },

  getPurchaseRequest: async (id: number | string) => {
    const response = await apiClient.get(`/purchase/request/${id}`);
    return response.data;
  },

  createPurchaseRequest: async (data: {
    reference?: string;
    warehouse_id: number;
    items: Array<{ product_id: number; quantity: number }>;
  }) => {
    const response = await apiClient.post("/purchase/request", data);
    return response.data;
  },

  updatePurchaseRequest: async (
    id: number,
    data: {
      status?: string;
      items?: Array<{ product_id: number; quantity: number }>;
    }
  ) => {
    const response = await apiClient.put(`/purchase/request/${id}`, data);
    return response.data;
  },

  deletePurchaseRequest: async (id: number) => {
    const response = await apiClient.delete(`/purchase/request/${id}`);
    return response.data;
  },
};

export default apiClient;
