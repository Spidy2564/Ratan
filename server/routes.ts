import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { contactFormSchema, productSchema, updateProductSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint for contact form submissions
  app.post("/api/contact", async (req, res) => {
    try {
      // Validate the request body against our schema
      const validatedData = contactFormSchema.parse(req.body);
      
      // Store the contact form submission
      const contactSubmission = await storage.createContactSubmission(validatedData);
      
      res.status(200).json({
        message: "Contact form submitted successfully",
        submission: contactSubmission
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error saving contact form:", error);
        res.status(500).json({ message: "Failed to submit contact form" });
      }
    }
  });

  // ===== PRODUCT ROUTES =====

  // GET /api/products - Get all products with optional filters
  app.get("/api/products", async (req, res) => {
    try {
      const { category, featured, inStock } = req.query;
      
      const filters: { category?: string; featured?: boolean; inStock?: boolean } = {};
      
      if (category && typeof category === 'string') {
        filters.category = category;
      }
      if (featured !== undefined) {
        filters.featured = featured === 'true';
      }
      if (inStock !== undefined) {
        filters.inStock = inStock === 'true';
      }
      
      const products = await storage.getProducts(Object.keys(filters).length > 0 ? filters : undefined);
      
      // Debug logging
      console.log('📦 Returning products:', products.length);
      if (products.length > 0) {
        console.log('🖼️ First product images field:', products[0].images);
        console.log('📄 First product full data:', JSON.stringify(products[0], null, 2));
      }
      
      res.status(200).json({
        success: true,
        data: products,
        count: products.length
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // GET /api/products/featured - Get featured products
  app.get("/api/products/featured", async (req, res) => {
    try {
      const featuredProducts = await storage.getFeaturedProducts();
      
      res.status(200).json({
        success: true,
        data: featuredProducts,
        count: featuredProducts.length
      });
    } catch (error) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  // GET /api/products/categories - Get all product categories
  app.get("/api/products/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      
      res.status(200).json({
        success: true,
        data: categories,
        count: categories.length
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // GET /api/products/:id - Get a single product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // POST /api/products - Create a new product
  app.post("/api/products", async (req, res) => {
    try {
      console.log('📝 Received product data:', JSON.stringify(req.body, null, 2));
      console.log('📸 Images field received:', req.body.images);
      console.log('📸 Images field type:', typeof req.body.images);
      
      // Extract images separately before validation
      const { images, ...productDataWithoutImages } = req.body;
      
      // Validate the main product data (without images)
      const validatedData = productSchema.parse(productDataWithoutImages);
      
      // Add images back to the validated data
      const productWithImages = {
        ...validatedData,
        images: images || null // Ensure images is included
      };
      
      console.log('✅ Final product data to save:', JSON.stringify(productWithImages, null, 2));
      
      // Create the product
      const product = await storage.createProduct(productWithImages);
      
      console.log('🎉 Product created successfully:', JSON.stringify(product, null, 2));
      
      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product
      });
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('❌ Validation error:', error);
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("❌ Error creating product:", error);
        res.status(500).json({ message: "Failed to create product" });
      }
    }
  });

  // PUT /api/products/:id - Update a product
  app.put("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      console.log('📝 Received update data:', JSON.stringify(req.body, null, 2));
      console.log('📸 Images field in update:', req.body.images);
      
      // Extract images separately before validation
      const { images, ...updateDataWithoutImages } = req.body;
      
      // Validate the main product data (without images)
      const validatedData = updateProductSchema.parse(updateDataWithoutImages);
      
      // Add images back to the validated data if provided
      const updateWithImages = {
        ...validatedData,
        ...(images !== undefined && { images })
      };
      
      console.log('✅ Final update data:', JSON.stringify(updateWithImages, null, 2));
      
      // Update the product
      const updatedProduct = await storage.updateProduct(productId, updateWithImages);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      console.log('🎉 Product updated successfully:', JSON.stringify(updatedProduct, null, 2));
      
      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: updatedProduct
      });
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('❌ Update validation error:', error);
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("❌ Error updating product:", error);
        res.status(500).json({ message: "Failed to update product" });
      }
    }
  });

  // DELETE /api/products/:id - Delete a product
  app.delete("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const deleted = await storage.deleteProduct(productId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(200).json({
        success: true,
        message: "Product deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}