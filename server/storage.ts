import Product from './models/Product.js';

// Remove all interface/type references to Product
// Remove call to this.initializeSampleProducts()

export interface IStorage {
  // User methods
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  // Contact submission methods
  createContactSubmission(submission: any): Promise<any>;
  getContactSubmissions(): Promise<any[]>;
  getContactSubmission(id: number): Promise<any | undefined>;
  markContactSubmissionAsRead(id: number): Promise<any | undefined>;
  // Product methods
  getProducts(filters?: { category?: string; featured?: boolean; inStock?: boolean }): Promise<any[]>;
  getProduct(id: any): Promise<any | undefined>;
  createProduct(productData: any): Promise<any>;
  updateProduct(id: any, updates: any): Promise<any | undefined>;
  deleteProduct(id: any): Promise<boolean>;
  getCategories(): Promise<string[]>;
  getFeaturedProducts(): Promise<any[]>;
}

export class MongoStorage implements IStorage {
  constructor() {}

  // User methods (dummy/in-memory for now)
  async getUser(id: number): Promise<any | undefined> { return undefined; }
  async getUserByUsername(username: string): Promise<any | undefined> { return undefined; }
  async createUser(user: any): Promise<any> { return user; }

  // Contact submission methods (dummy/in-memory for now)
  async createContactSubmission(submission: any): Promise<any> { return submission; }
  async getContactSubmissions(): Promise<any[]> { return []; }
  async getContactSubmission(id: number): Promise<any | undefined> { return undefined; }
  async markContactSubmissionAsRead(id: number): Promise<any | undefined> { return undefined; }

  // Product methods (MongoDB only)
  async getProducts(filters?: { category?: string; featured?: boolean; inStock?: boolean }): Promise<any[]> {
    const query: any = {};
    if (filters) {
      if (filters.category) query.category = filters.category;
      if (filters.featured !== undefined) query.featured = filters.featured;
      if (filters.inStock !== undefined) query.inStock = filters.inStock;
    }
    const products = await Product.find(query).lean();
    return products;
  }

  async getProduct(id: any): Promise<any | undefined> {
    const product = await Product.findById(id).lean();
    return product || undefined;
  }

  async createProduct(productData: any): Promise<any> {
    const product = new Product(productData);
    await product.save();
    return product.toObject();
  }

  async updateProduct(id: any, updates: any): Promise<any | undefined> {
    const product = await Product.findByIdAndUpdate(id, updates, { new: true }).lean();
    return product || undefined;
  }

  async deleteProduct(id: any): Promise<boolean> {
    const result = await Product.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async getCategories(): Promise<string[]> {
    const categories = await Product.distinct('category');
    return categories;
  }

  async getFeaturedProducts(): Promise<any[]> {
    const products = await Product.find({ featured: true }).lean();
    return products;
  }
}

export const storage = new MongoStorage();