import { ENDPOINT } from "../constants/end-point";
import httpClient from "../httpClient";
import {
  ApiResponse,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CatalogProduct,
  CreateProductRequest,
  UpdateProductRequest,
  ListProductsQuery,
  SearchProductsQuery,
  SearchProductsResponse,
} from "@/lib/types";

export const catalogService = {
  // Category Endpoints
  createCategory: async (data: CreateCategoryRequest): Promise<ApiResponse<Category>> => {
    const res = await httpClient.post(ENDPOINT.CATALOG.CATEGORIES, data);
    return res.data;
  },

  getCategoryDetails: async (id: string): Promise<ApiResponse<Category>> => {
    const res = await httpClient.get(ENDPOINT.CATALOG.CATEGORY_BY_ID(id));
    return res.data;
  },

  getChildCategories: async (id: string): Promise<ApiResponse<Category[]>> => {
    const res = await httpClient.get(ENDPOINT.CATALOG.CATEGORY_CHILDREN(id));
    return res.data;
  },

  updateCategory: async (id: string, data: UpdateCategoryRequest): Promise<ApiResponse<Category>> => {
    const res = await httpClient.put(ENDPOINT.CATALOG.CATEGORY_BY_ID(id), data);
    return res.data;
  },

  deleteCategory: async (id: string): Promise<ApiResponse<null>> => {
    const res = await httpClient.delete(ENDPOINT.CATALOG.CATEGORY_BY_ID(id));
    return res.data;
  },

  listCategories: async (): Promise<ApiResponse<Category[]>> => {
    const res = await httpClient.get(ENDPOINT.CATALOG.CATEGORIES);
    return res.data;
  },

  getProductsByCategory: async (id: string): Promise<ApiResponse<CatalogProduct[]>> => {
    const res = await httpClient.get(ENDPOINT.CATALOG.CATEGORY_PRODUCTS(id));
    return res.data;
  },

  // Product Endpoints
  createProduct: async (data: CreateProductRequest): Promise<ApiResponse<CatalogProduct>> => {
    const res = await httpClient.post(ENDPOINT.CATALOG.PRODUCTS, data);
    return res.data;
  },

  getProductDetails: async (id: string): Promise<ApiResponse<CatalogProduct>> => {
    const res = await httpClient.get(ENDPOINT.CATALOG.PRODUCT_BY_ID(id));
    return res.data;
  },

  updateProduct: async (id: string, data: UpdateProductRequest): Promise<ApiResponse<CatalogProduct>> => {
    const res = await httpClient.put(ENDPOINT.CATALOG.PRODUCT_BY_ID(id), data);
    return res.data;
  },

  deleteProduct: async (id: string): Promise<ApiResponse<null>> => {
    const res = await httpClient.delete(ENDPOINT.CATALOG.PRODUCT_BY_ID(id));
    return res.data;
  },

  listProducts: async (params?: ListProductsQuery): Promise<ApiResponse<CatalogProduct[]>> => {
    const res = await httpClient.get(ENDPOINT.CATALOG.PRODUCTS, { params });
    return res.data;
  },

  searchProducts: async (params?: SearchProductsQuery): Promise<ApiResponse<SearchProductsResponse>> => {
    const res = await httpClient.get(ENDPOINT.CATALOG.PRODUCT_SEARCH, { params });
    return res.data;
  },
};

export default catalogService;
