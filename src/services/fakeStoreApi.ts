import { ApiProduct, Product, ProductService, FilterOptions } from "@/types/product";

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

  async getFilteredProducts(options: FilterOptions): Promise<Product[]> {
    try {
      let products = await this.getProducts();

      // Apply filters
      if (options.category) {
        products = products.filter(p => p.category.toLowerCase() === options.category?.toLowerCase());
      }

      if (options.search) {
        const searchLower = options.search.toLowerCase();
        products = products.filter(p => 
          p.name.toLowerCase().includes(searchLower) || 
          p.description.toLowerCase().includes(searchLower)
        );
      }

      if (options.productType) {
        products = products.filter(p => p.category.toLowerCase().includes(options.productType?.toLowerCase() || ''));
      }

      if (options.features) {
        products = products.filter(p => 
          options.features?.some(feature => 
            p.description.toLowerCase().includes(feature.toLowerCase())
          )
        );
      }

      if (options.priceRange) {
        products = products.filter(p => {
          const { min, max } = options.priceRange || {};
          if (min !== undefined && p.price < min) return false;
          if (max !== undefined && p.price > max) return false;
          return true;
        });
      }

      // Apply limit if specified
      if (options.limit !== undefined) {
        products = products.slice(0, options.limit);
      }

      return products;
    } catch (error) {
      console.error('Error filtering products:', error);
      throw error;
    }
  }
}

// Singleton instance
export const productService = new FakeStoreApiService();
