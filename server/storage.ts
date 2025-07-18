import { 
  users, 
  type User, 
  type InsertUser, 
  ContactSubmission, 
  InsertContactSubmission,
  type Product,
  type InsertProduct,
  type UpdateProduct
} from "@shared/schema";

// Extend the product types to include images if not already included
interface ExtendedProduct extends Omit<Product, 'images'> {
  images?: string;
}

interface ExtendedInsertProduct extends Omit<InsertProduct, 'images'> {
  images?: string;
}

interface ExtendedUpdateProduct extends Omit<UpdateProduct, 'images'> {
  images?: string;
}

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Contact submission methods
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
  getContactSubmission(id: number): Promise<ContactSubmission | undefined>;
  markContactSubmissionAsRead(id: number): Promise<ContactSubmission | undefined>;
  
  // Product methods - updated to use extended types
  getProducts(filters?: { category?: string; featured?: boolean; inStock?: boolean }): Promise<ExtendedProduct[]>;
  getProduct(id: number): Promise<ExtendedProduct | undefined>;
  createProduct(product: ExtendedInsertProduct): Promise<ExtendedProduct>;
  updateProduct(id: number, updates: ExtendedUpdateProduct): Promise<ExtendedProduct | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  getCategories(): Promise<string[]>;
  getFeaturedProducts(): Promise<ExtendedProduct[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contactSubmissions: Map<number, ContactSubmission>;
  private products: Map<number, ExtendedProduct>;
  private userId: number;
  private contactSubmissionId: number;
  private productId: number;

  constructor() {
    this.users = new Map();
    this.contactSubmissions = new Map();
    this.products = new Map();
    this.userId = 1;
    this.contactSubmissionId = 1;
    this.productId = 1;
    
    // Add some sample products for testing
    this.initializeSampleProducts();
  }

  private async initializeSampleProducts() {
    const sampleProducts: ExtendedInsertProduct[] = [
      {
        name: "Naruto Uzumaki Funko Pop Figure",
        description: "Collectible Funko Pop figure of Naruto Uzumaki in his classic orange outfit. Perfect for any anime fan's collection!",
        price: "24.99",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop",
        category: "Figures & Collectibles",
        inStock: true,
        featured: true,
        tags: JSON.stringify(["naruto", "funko", "figure", "collectible", "anime"]),
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop"
        ])
      },
      {
        name: "Attack on Titan Survey Corps Hoodie",
        description: "Premium quality hoodie featuring the Survey Corps logo from Attack on Titan. Comfortable cotton blend material.",
        price: "39.99",
        imageUrl: "https://images.unsplash.com/photo-1556821840-3a9fbc86339e?w=500&h=300&fit=crop",
        category: "Clothing & Apparel",
        inStock: true,
        featured: true,
        tags: JSON.stringify(["attack on titan", "hoodie", "survey corps", "clothing", "anime"])
      },
      {
        name: "Dragon Ball Z Goku Statue",
        description: "High-detail resin statue of Son Goku in Super Saiyan form. Hand-painted with incredible attention to detail.",
        price: "129.99",
        imageUrl: "https://images.unsplash.com/photo-1607734834519-d8576ae60ea8?w=500&h=300&fit=crop",
        category: "Figures & Collectibles",
        inStock: true,
        featured: true,
        tags: JSON.stringify(["dragon ball z", "goku", "statue", "super saiyan", "collectible"])
      },
      {
        name: "My Hero Academia Manga Set Vol 1-10",
        description: "Complete manga collection of My Hero Academia volumes 1-10. Brand new condition with beautiful artwork.",
        price: "89.99",
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=300&fit=crop",
        category: "Manga & Books",
        inStock: true,
        featured: false,
        tags: JSON.stringify(["my hero academia", "manga", "books", "collection", "deku"])
      },
      {
        name: "Sailor Moon Crystal Transformation Wand",
        description: "Replica transformation wand from Sailor Moon Crystal series. LED lights and sound effects included!",
        price: "45.99",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop",
        category: "Cosplay & Props",
        inStock: true,
        featured: false,
        tags: JSON.stringify(["sailor moon", "wand", "cosplay", "prop", "magical girl"])
      },
      {
        name: "One Piece Straw Hat Pirates Flag",
        description: "Official Straw Hat Pirates Jolly Roger flag. High-quality polyester fabric, perfect for room decoration.",
        price: "19.99",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop",
        category: "Home & Decor",
        inStock: true,
        featured: false,
        tags: JSON.stringify(["one piece", "straw hat", "flag", "decoration", "luffy"])
      },
      {
        name: "Demon Slayer Tanjiro Cosplay Costume",
        description: "Complete Tanjiro Kamado cosplay costume with haori jacket, uniform, and accessories. Multiple sizes available.",
        price: "79.99",
        imageUrl: "https://images.unsplash.com/photo-1556821840-3a9fbc86339e?w=500&h=300&fit=crop",
        category: "Cosplay & Props",
        inStock: true,
        featured: false,
        tags: JSON.stringify(["demon slayer", "tanjiro", "cosplay", "costume", "kimetsu no yaiba"])
      },
      {
        name: "Studio Ghibli Totoro Plushie",
        description: "Soft and cuddly Totoro plushie from My Neighbor Totoro. Made with premium materials, perfect for gifts!",
        price: "34.99",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop",
        category: "Plushies & Toys",
        inStock: true,
        featured: true,
        tags: JSON.stringify(["totoro", "ghibli", "plushie", "soft toy", "kawaii"])
      },
      {
        name: "Akira Kaneda's Bike Model Kit",
        description: "1/15 scale model kit of Kaneda's iconic red motorcycle from Akira. Detailed plastic model for experienced builders.",
        price: "67.99",
        imageUrl: "https://images.unsplash.com/photo-1607734834519-d8576ae60ea8?w=500&h=300&fit=crop",
        category: "Model Kits",
        inStock: false,
        featured: false,
        tags: JSON.stringify(["akira", "kaneda", "motorcycle", "model kit", "cyberpunk"])
      },
      {
        name: "Pokemon Pikachu Nendoroid Figure",
        description: "Adorable Nendoroid figure of Pikachu with multiple expressions and accessories. Highly poseable and detailed.",
        price: "54.99",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop",
        category: "Figures & Collectibles",
        inStock: true,
        featured: true,
        tags: JSON.stringify(["pokemon", "pikachu", "nendoroid", "figure", "kawaii"])
      },
      {
        name: "Jujutsu Kaisen Gojo Sunglasses",
        description: "Replica sunglasses worn by Satoru Gojo from Jujutsu Kaisen. UV protection and stylish design.",
        price: "29.99",
        imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&h=300&fit=crop",
        category: "Accessories",
        inStock: true,
        featured: false,
        tags: JSON.stringify(["jujutsu kaisen", "gojo", "sunglasses", "accessory", "cosplay"])
      },
      {
        name: "Evangelion Unit-01 Action Figure",
        description: "Highly detailed action figure of Evangelion Unit-01. Multiple points of articulation and weapon accessories included.",
        price: "94.99",
        imageUrl: "https://images.unsplash.com/photo-1607734834519-d8576ae60ea8?w=500&h=300&fit=crop",
        category: "Figures & Collectibles",
        inStock: true,
        featured: false,
        tags: JSON.stringify(["evangelion", "unit-01", "action figure", "mecha", "shinji"])
      }
    ];

    for (const product of sampleProducts) {
      await this.createProduct(product);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Contact submission methods
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const id = this.contactSubmissionId++;
    const now = new Date();
    const contactSubmission: ContactSubmission = { 
      ...submission, 
      id, 
      createdAt: now, 
      isRead: false 
    };
    this.contactSubmissions.set(id, contactSubmission);
    return contactSubmission;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return Array.from(this.contactSubmissions.values());
  }

  async getContactSubmission(id: number): Promise<ContactSubmission | undefined> {
    return this.contactSubmissions.get(id);
  }

  async markContactSubmissionAsRead(id: number): Promise<ContactSubmission | undefined> {
    const submission = this.contactSubmissions.get(id);
    if (submission) {
      const updatedSubmission = { ...submission, isRead: true };
      this.contactSubmissions.set(id, updatedSubmission);
      return updatedSubmission;
    }
    return undefined;
  }

  // Product methods
  async getProducts(filters?: { category?: string; featured?: boolean; inStock?: boolean }): Promise<ExtendedProduct[]> {
    let products = Array.from(this.products.values());
    
    console.log('🔍 Storage: Getting products, total count:', products.length);
    
    if (filters) {
      if (filters.category) {
        products = products.filter(product => product.category === filters.category);
      }
      if (filters.featured !== undefined) {
        products = products.filter(product => product.featured === filters.featured);
      }
      if (filters.inStock !== undefined) {
        products = products.filter(product => product.inStock === filters.inStock);
      }
    }
    
    const sortedProducts = products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    console.log('📦 Storage: Returning filtered products:', sortedProducts.length);
    if (sortedProducts.length > 0 && sortedProducts[0].images) {
      console.log('🖼️ Storage: First product has images:', sortedProducts[0].images);
    }
    
    return sortedProducts;
  }

  async getProduct(id: number): Promise<ExtendedProduct | undefined> {
    const product = this.products.get(id);
    console.log(`🔍 Storage: Getting product ${id}:`, product ? 'found' : 'not found');
    if (product && product.images) {
      console.log('🖼️ Storage: Product images:', product.images);
    }
    return product;
  }

  async createProduct(productData: ExtendedInsertProduct): Promise<ExtendedProduct> {
    const id = this.productId++;
    const now = new Date();
    
    console.log('💾 Storage: Creating product with data:', JSON.stringify(productData, null, 2));
    console.log('📸 Storage: Images field being saved:', productData.images);
    
    const product: ExtendedProduct = {
      ...productData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    this.products.set(id, product);
    
    console.log('✅ Storage: Product created successfully:', JSON.stringify(product, null, 2));
    console.log('🎉 Storage: Final images field:', product.images);
    
    return product;
  }

  async updateProduct(id: number, updates: ExtendedUpdateProduct): Promise<ExtendedProduct | undefined> {
    const product = this.products.get(id);
    if (!product) {
      console.log(`❌ Storage: Product ${id} not found for update`);
      return undefined;
    }

    console.log('💾 Storage: Updating product with data:', JSON.stringify(updates, null, 2));
    console.log('📸 Storage: New images field:', updates.images);

    const updatedProduct: ExtendedProduct = {
      ...product,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.products.set(id, updatedProduct);
    
    console.log('✅ Storage: Product updated successfully:', JSON.stringify(updatedProduct, null, 2));
    
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    console.log(`🗑️ Storage: Deleting product ${id}`);
    const deleted = this.products.delete(id);
    console.log(`${deleted ? '✅' : '❌'} Storage: Product ${id} deletion ${deleted ? 'successful' : 'failed'}`);
    return deleted;
  }

  async getCategories(): Promise<string[]> {
    const categories = new Set<string>();
    for (const product of this.products.values()) {
      categories.add(product.category);
    }
    return Array.from(categories).sort();
  }

  async getFeaturedProducts(): Promise<ExtendedProduct[]> {
    return this.getProducts({ featured: true });
  }
}

export const storage = new MemStorage();