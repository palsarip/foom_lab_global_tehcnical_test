export interface Product {
  id: number;
  name: string;
  sku: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Warehouse {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Stock {
  id: number;
  warehouse_id: number;
  product_id: number;
  quantity: number;
  Product: Product;
  Warehouse: Warehouse;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseRequestItem {
  id?: number;
  purchase_request_id?: number;
  product_id: number;
  quantity: number;
  Product?: Product;
}

export interface PurchaseRequest {
  id: number;
  reference: string;
  warehouse_id: number;
  status: "DRAFT" | "PENDING" | "COMPLETED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  PurchaseRequestItems?: PurchaseRequestItem[];
  Warehouse?: Warehouse;
  vendor?: string;
  qty_total?: number;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
