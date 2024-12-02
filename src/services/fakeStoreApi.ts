import { ApiProduct, Product, ProductService } from "@/types/product";

const API_BASE_URL = "https://fakestoreapi.com";

// Helper function to convert API product to our internal model
const convertApiProduct = (apiProduct: ApiProduct): Product => {
  return {
    id: apiProduct.id,
    name: apiProduct.title,
    price: apiProduct.price,
    description: apiProduct.description,
    shortDescription: apiProduct.description.split('.')[0] + '.',
    category: apiProduct.category,
    status: apiProduct.rating.count > 100 ? "In Stock" : 
           apiProduct.rating.count > 20 ? "Low Stock" : 
           "Out of Stock",
    specs: [], // We could potentially extract specs from description
    imageUrl: apiProduct.image,
    rating: apiProduct.rating
  };
};

export class FakeStoreApiService implements ProductService {
  async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const products: ApiProduct[] = await response.json();
      return products.map(convertApiProduct);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getProduct(id: number): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      
      const product: ApiProduct = await response.json();
      return convertApiProduct(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      
      return response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/category/${category}`);
      if (!response.ok) throw new Error('Failed to fetch products by category');
      
      const products: ApiProduct[] = await response.json();
      return products.map(convertApiProduct);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }

  async getFilteredProducts(filters: {
    productType?: string;
    category?: string;
    search?: string;
    features?: string[];
    priceRange?: { min?: number; max?: number; }
  }): Promise<Product[]> {
    try {
      // Fetch all products first
      const allProducts = await this.getProducts();
      
      // Apply filters
      return allProducts.filter(product => {
        let matches = true;
        
        // Product type filtering
        if (filters.productType) {
          const searchTerm = filters.productType.toLowerCase();
          matches = matches && (
            product.category.toLowerCase().startsWith(searchTerm) ||
            product.name.toLowerCase().startsWith(searchTerm)
          );
        }

        // Category filtering
        if (filters.category && matches) {
          matches = product.category.toLowerCase() === filters.category.toLowerCase();
        }

        // Search term filtering
        if (filters.search && matches) {
          const searchTerms = filters.search.toLowerCase().split(/\s+/);
          matches = matches && searchTerms.every(term =>
            product.name.toLowerCase().includes(term) ||
            product.description.toLowerCase().includes(term)
          );
        }

        // Feature filtering
        if (filters.features && filters.features.length > 0 && matches) {
          matches = matches && filters.features.every(feature =>
            product.description.toLowerCase().includes(feature.toLowerCase()) ||
            product.name.toLowerCase().includes(feature.toLowerCase())
          );
        }

        // Price range filtering
        if (filters.priceRange && matches) {
          if (filters.priceRange.min !== undefined) {
            matches = matches && product.price >= filters.priceRange.min;
          }
          if (filters.priceRange.max !== undefined) {
            matches = matches && product.price <= filters.priceRange.max;
          }
        }

        return matches;
      });
    } catch (error) {
      console.error('Error fetching filtered products:', error);
      throw error;
    }
  }
}

// Singleton instance
export const productService = new FakeStoreApiService();
