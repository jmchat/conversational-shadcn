export interface ProductRating {
  rate: number;
  count: number;
}

export interface ApiProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

// Our internal product model - this is what our app uses
export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  shortDescription: string;
  category: string;
  status: string;
  specs: string[];
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

export interface FilterOptions {
  category?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  search?: string;
}

// This helps us maintain flexibility if we switch APIs
export interface ProductService {
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product>;
  getCategories(): Promise<string[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  searchProducts(options: FilterOptions): Promise<Product[]>;
}
