import { create } from "zustand";
import { persist } from "zustand/middleware";
import catalogService from "@/lib/services/catalog.service";
import {
  Category,
  CatalogProduct,
  CreateProductRequest,
  UpdateProductRequest,
  ListProductsQuery,
  SearchProductsQuery,
  DetailedCategory,
} from "@/lib/types";
import {
  generateProductId,
  generateSKU,
  formatDateISO,
  normalizeImageUrl,
} from "@/lib/utils";
import getVietnameseErrorMessage from "@/lib/utils/errorMapper";
import { toast } from "sonner";

export interface Product {
  id: string;
  sku: string;
  name: string;
  nameVi?: string;
  nameEn?: string;
  categoryId?: string;
  category?: string | DetailedCategory | null;
  price: number;
  originalPrice: number;
  stock: number;
  unit: string;
  image: string;
  badge: string;
  status: "active" | "out_of_stock" | "hidden";
  description?: string;
  descriptionVi?: string;
  descriptionEn?: string;
  salesCount: number;
  createdAt: string;
  source: "local" | "api";
}

export function mapCatalogProductToFrontend(bp: CatalogProduct): Product {
  const isSale = bp.sale_price < bp.base_price;
  const imageUrl = normalizeImageUrl(bp.images?.[0]?.url);

  return {
    id: bp.id,
    sku: bp.sku,
    name: bp.name_vi || bp.name_en || "",
    nameVi: bp.name_vi || "",
    nameEn: bp.name_en || "",
    categoryId: bp.category_id || bp.category?.id,
    category: bp.category,
    price: bp.sale_price || bp.base_price || 0,
    originalPrice: bp.base_price || bp.sale_price || 0,
    stock: 0,
    unit: bp.unit || "",
    image: imageUrl,
    badge: isSale ? "Khuyến mãi" : "",
    status: bp.is_active ? "active" : "hidden",
    description: bp.description_vi || bp.description_en || "",
    descriptionVi: bp.description_vi || "",
    descriptionEn: bp.description_en || "",
    salesCount: bp.rating_count || 0,
    createdAt: formatDateISO(bp.created_at),
    source: "api",
  };
}

interface ProductStore {
  products: Product[];
  categories: string[];
  apiCategories: Category[];
  isLoading: boolean;
  error: string | null;

  addProduct: (
    product: Omit<Product, "id" | "salesCount" | "createdAt" | "source">,
    apiCategoryId?: string,
  ) => void;
  updateProduct: (
    id: string,
    productData: Partial<Product>,
    apiCategoryId?: string,
  ) => void;
  deleteProduct: (id: string) => void;
  toggleProductStatus: (id: string) => void;

  // Async API Actions
  fetchCategoriesFromApi: () => Promise<Category[]>;
  fetchProductsFromApi: (params?: ListProductsQuery) => Promise<Product[]>;
  searchProductsFromApi: (params?: SearchProductsQuery) => Promise<Product[]>;
  createProductApi: (
    data: CreateProductRequest,
  ) => Promise<CatalogProduct | null>;
  updateProductApi: (
    id: string,
    data: UpdateProductRequest,
  ) => Promise<CatalogProduct | null>;
  deleteProductApi: (id: string) => Promise<boolean>;
}

const INITIAL_CATEGORIES: string[] = [];

const INITIAL_PRODUCTS: Product[] = [];

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      apiCategories: [],
      isLoading: false,
      error: null,

      addProduct: (newProductData, apiCategoryId?: string) => {
        const productSku = newProductData.sku?.trim() || generateSKU();
        const primaryName =
          newProductData.nameVi ||
          newProductData.name ||
          newProductData.nameEn ||
          "";
        const tempId = generateProductId(get().products.length + 1);

        const newProduct: Product = {
          ...newProductData,
          name: primaryName,
          id: tempId,
          sku: productSku,
          salesCount: 0,
          createdAt: formatDateISO(),
          source: "local",
        };

        // Optimistic insert
        set((state) => ({ products: [newProduct, ...state.products] }));

        const matchedApiCat = get().apiCategories.find(
          (c) =>
            c.id === newProductData.categoryId ||
            c.name_vi === newProductData.category ||
            c.name_en === newProductData.category,
        );
        const catId =
          newProductData.categoryId ||
          matchedApiCat?.id ||
          apiCategoryId ||
          (typeof newProductData.category === "object"
            ? newProductData.category?.id
            : undefined);
        if (catId) {
          get()
            .createProductApi({
              category_id: catId,
              sku: productSku,
              name_vi: newProductData.nameVi || primaryName,
              name_en: newProductData.nameEn || primaryName,
              description_vi:
                newProductData.descriptionVi ||
                newProductData.description ||
                "",
              description_en:
                newProductData.descriptionEn ||
                newProductData.description ||
                "",
              unit: newProductData.unit,
              base_price: newProductData.originalPrice || newProductData.price,
              sale_price: newProductData.price,
              is_active: newProductData.status === "active",
              images: newProductData.image
                ? [{ url: newProductData.image, sort_order: 1 }]
                : [],
            })
            .then((created) => {
              if (!created) throw new Error("createProductApi returned null");
              toast.success("Thêm sản phẩm mới thành công!");
              // Swap the temp local row for the confirmed server row
              set((state) => ({
                products: state.products.map((p) =>
                  p.id === tempId ? mapCatalogProductToFrontend(created) : p,
                ),
              }));
            })
            .catch((err) => {
              const errMsg = getVietnameseErrorMessage(
                err,
                "Không thể lưu sản phẩm — vui lòng thử lại.",
              );
              toast.error(errMsg);
              // roll back the optimistic row instead of leaving an orphaned
              set((state) => ({
                products: state.products.filter((p) => p.id !== tempId),
                error: errMsg,
              }));
            });
        }
      },

      updateProduct: (id, updatedFields, apiCategoryId?: string) => {
        // Keep a snapshot of the previous state for rollback
        const previousProduct = get().products.find((p) => p.id === id);

        set((state) => ({
          products: state.products.map((item) => {
            if (item.id === id) {
              const updatedStock =
                updatedFields.stock !== undefined
                  ? updatedFields.stock
                  : item.stock;
              let autoStatus = updatedFields.status || item.status;

              if (updatedStock === 0 && autoStatus === "active") {
                autoStatus = "out_of_stock";
              } else if (updatedStock > 0 && autoStatus === "out_of_stock") {
                autoStatus = "active";
              }

              const primaryName =
                updatedFields.nameVi ||
                updatedFields.name ||
                updatedFields.nameEn ||
                item.name;

              return {
                ...item,
                ...updatedFields,
                name: primaryName,
                status: autoStatus,
              };
            }
            return item;
          }),
        }));

        if (previousProduct?.source === "api") {
          const matchedApiCat = get().apiCategories.find(
            (c) =>
              c.id === updatedFields.categoryId ||
              c.name_vi === updatedFields.category ||
              c.name_en === updatedFields.category,
          );
          const targetCategory =
            updatedFields.categoryId ||
            matchedApiCat?.id ||
            apiCategoryId ||
            (typeof updatedFields.category === "object"
              ? updatedFields.category?.id
              : undefined);
          const payload: UpdateProductRequest = {};
          if (updatedFields.nameVi || updatedFields.name)
            payload.name_vi = updatedFields.nameVi || updatedFields.name;
          if (updatedFields.nameEn || updatedFields.name)
            payload.name_en = updatedFields.nameEn || updatedFields.name;
          if (updatedFields.descriptionVi || updatedFields.description)
            payload.description_vi =
              updatedFields.descriptionVi || updatedFields.description;
          if (updatedFields.descriptionEn || updatedFields.description)
            payload.description_en =
              updatedFields.descriptionEn || updatedFields.description;
          if (updatedFields.sku) payload.sku = updatedFields.sku;
          if (updatedFields.price !== undefined)
            payload.sale_price = updatedFields.price;
          if (updatedFields.originalPrice !== undefined)
            payload.base_price = updatedFields.originalPrice;
          if (updatedFields.unit !== undefined)
            payload.unit = updatedFields.unit;
          if (updatedFields.status !== undefined)
            payload.is_active = updatedFields.status === "active";
          if (targetCategory) payload.category_id = targetCategory;
          if (updatedFields.image)
            payload.images = [{ url: updatedFields.image, sort_order: 1 }];

          if (Object.keys(payload).length > 0) {
            get()
              .updateProductApi(id, payload)
              .then(() => {
                toast.success("Cập nhật thông tin sản phẩm thành công!");
              })
              .catch((err) => {
                const errMsg = getVietnameseErrorMessage(
                  err,
                  "Không thể cập nhật sản phẩm — đã khôi phục lại.",
                );
                toast.error(errMsg);
                if (previousProduct) {
                  set((state) => ({
                    products: state.products.map((p) =>
                      p.id === id ? previousProduct : p,
                    ),
                    error: errMsg,
                  }));
                }
              });
          }
        }
      },

      deleteProduct: (id) => {
        // Keep a snapshot + original index for rollback
        const state = get();
        const index = state.products.findIndex((p) => p.id === id);
        const removedProduct = state.products[index];
        if (!removedProduct) return;

        set((s) => ({ products: s.products.filter((item) => item.id !== id) }));

        if (removedProduct.source === "api") {
          get()
            .deleteProductApi(id)
            .then(() => {
              toast.success("Đã xóa sản phẩm thành công!");
            })
            .catch((err) => {
              const errMsg = getVietnameseErrorMessage(
                err,
                "Không thể xóa sản phẩm — đã khôi phục lại.",
              );
              toast.error(errMsg);
              set((s) => {
                const restored = [...s.products];
                restored.splice(index, 0, removedProduct);
                return {
                  products: restored,
                  error: errMsg,
                };
              });
            });
        }
      },

      toggleProductStatus: (id) => {
        const previousProduct = get().products.find((p) => p.id === id);

        set((state) => ({
          products: state.products.map((item) => {
            if (item.id === id) {
              const nextStatus =
                item.status === "active"
                  ? item.stock === 0
                    ? "out_of_stock"
                    : "hidden"
                  : item.status === "hidden"
                    ? item.stock === 0
                      ? "out_of_stock"
                      : "active"
                    : "active";

              return { ...item, status: nextStatus };
            }
            return item;
          }),
        }));

        if (previousProduct?.source === "api") {
          const updated = get().products.find((p) => p.id === id);
          if (updated) {
            get()
              .updateProductApi(id, { is_active: updated.status === "active" })
              .then(() => {
                toast.success("Đã cập nhật trạng thái sản phẩm!");
              })
              .catch((err) => {
                const errMsg = getVietnameseErrorMessage(
                  err,
                  "Không thể cập nhật trạng thái — đã khôi phục lại.",
                );
                toast.error(errMsg);
                set((state) => ({
                  products: state.products.map((p) =>
                    p.id === id ? previousProduct : p,
                  ),
                  error: errMsg,
                }));
              });
          }
        }
      },

      // API Actions
      fetchCategoriesFromApi: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await catalogService.listCategories();
          if (res.success && res.data) {
            const catNames = res.data.map((c) => c.name_vi || c.name_en);
            set({
              apiCategories: res.data,
              categories: Array.from(
                new Set([...catNames, ...get().categories]),
              ),
              isLoading: false,
            });
            return res.data;
          }
        } catch (err: any) {
          set({
            error: getVietnameseErrorMessage(
              err,
              "Không thể tải danh sách danh mục",
            ),
            isLoading: false,
          });
        }
        return [];
      },

      fetchProductsFromApi: async (params?: ListProductsQuery) => {
        set({ isLoading: true, error: null });
        try {
          const res = await catalogService.listProducts(params);
          if (res.success && res.data) {
            const rawList = Array.isArray(res.data)
              ? res.data
              : (res.data as any).products || [];
            const mappedProducts = rawList.map((p: CatalogProduct) =>
              mapCatalogProductToFrontend(p),
            );
            set({ products: mappedProducts, isLoading: false });
            return mappedProducts;
          }
        } catch (err: any) {
          set({
            error: getVietnameseErrorMessage(
              err,
              "Không thể tải danh sách sản phẩm",
            ),
          });
        } finally {
          set({ isLoading: false });
        }
        return [];
      },

      searchProductsFromApi: async (params?: SearchProductsQuery) => {
        set({ isLoading: true, error: null });
        try {
          const res = await catalogService.searchProducts(params);
          if (res.success && res.data) {
            const rawList = Array.isArray(res.data)
              ? res.data
              : (res.data as any).products || [];
            const mappedProducts = rawList.map((p: CatalogProduct) =>
              mapCatalogProductToFrontend(p),
            );
            set({ products: mappedProducts, isLoading: false });
            return mappedProducts;
          }
        } catch (err: any) {
          set({
            error: getVietnameseErrorMessage(
              err,
              "Không thể tìm kiếm sản phẩm",
            ),
          });
        } finally {
          set({ isLoading: false });
        }
        return [];
      },

      createProductApi: async (data: CreateProductRequest) => {
        set({ isLoading: true, error: null });
        try {
          const res = await catalogService.createProduct(data);
          if (res.success && res.data) {
            set({ isLoading: false });
            return res.data;
          }
        } catch (err: any) {
          set({
            error: getVietnameseErrorMessage(err, "Không thể tạo sản phẩm"),
            isLoading: false,
          });
          throw err;
        }
        return null;
      },

      updateProductApi: async (id: string, data: UpdateProductRequest) => {
        set({ isLoading: true, error: null });
        try {
          const res = await catalogService.updateProduct(id, data);
          if (res.success && res.data) {
            set({ isLoading: false });
            return res.data;
          }
        } catch (err: any) {
          set({
            error: getVietnameseErrorMessage(err, "Không thể cập nhật sản phẩm"),
            isLoading: false,
          });
          throw err;
        }
        return null;
      },

      deleteProductApi: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await catalogService.deleteProduct(id);
          if (res.success) {
            set({ isLoading: false });
            return true;
          }
        } catch (err: any) {
          set({
            error: getVietnameseErrorMessage(err, "Không thể xóa sản phẩm"),
            isLoading: false,
          });
          throw err;
        }
        return false;
      },
    }),
    {
      name: "supermarket-admin-products",
      partialize: (state) => ({
        products: state.products.filter((p) => p.source === "local"),
      }),
    },
  ),
);
