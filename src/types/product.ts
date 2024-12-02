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
  rating: ProductRating;
}

// Our internal product model - this is what our app uses
export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  shortDescription: string;
  category: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  specs: string[];
  imageUrl: string;
  rating: ProductRating;
}

// This helps us maintain flexibility if we switch APIs
export interface ProductService {
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product>;
  getCategories(): Promise<string[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
}
