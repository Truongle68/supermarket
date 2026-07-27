export interface Category {
  id: string;
  parent_id?: string | null;
  name_vi: string;
  name_en: string;
  slug: string;
  icon?: string | null;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCategoryRequest {
  parent_id?: string | null;
  name_vi: string;
  name_en: string;
  slug: string;
  icon?: string;
  sort_order?: number;
}

export interface UpdateCategoryRequest {
  parent_id?: string | null;
  name_vi?: string;
  name_en?: string;
  slug?: string;
  icon?: string;
  sort_order?: number;
}

export interface ProductVariant {
  id?: string;
  variant_label: string;
  price_delta?: number;
  sku: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductVariantRequest {
  variant_label: string;
  price_delta?: number;
  sku: string;
}

export interface ProductImage {
  id?: string;
  url: string;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductImageRequest {
  url: string;
  sort_order?: number;
}

export interface CatalogProduct {
  id: string;
  category_id: string;
  sku: string;
  name_vi: string;
  name_en: string;
  description_vi?: string;
  description_en?: string;
  unit: string;
  base_price: number;
  sale_price: number;
  rating_avg: number;
  rating_count: number;
  is_active: boolean;
  variants?: ProductVariant[];
  images?: ProductImage[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductRequest {
  category_id: string;
  sku: string;
  name_vi: string;
  name_en: string;
  description_vi?: string;
  description_en?: string;
  unit: string;
  base_price: number;
  sale_price: number;
  is_active?: boolean;
  variants?: CreateProductVariantRequest[];
  images?: CreateProductImageRequest[];
}

export interface UpdateProductRequest {
  category_id?: string;
  sku?: string;
  name_vi?: string;
  name_en?: string;
  description_vi?: string;
  description_en?: string;
  unit?: string;
  base_price?: number;
  sale_price?: number;
  is_active?: boolean;
  variants?: CreateProductVariantRequest[];
  images?: CreateProductImageRequest[];
}

export interface ListProductsQuery {
  category_id?: string;
  page?: number;
  limit?: number;
}

export interface SearchProductsQuery {
  q?: string;
  category_id?: string;
  min_price?: number;
  max_price?: number;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface SearchProductsResponse {
  products: CatalogProduct[];
  total_count: number;
}
