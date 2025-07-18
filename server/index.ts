import express, { response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import transporter from './config/nodemailer.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import { protect } from './middleware/auth.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Removed import and instantiation of notificationService

const PORT = process.env.PORT || 5000;

// ================================
// 🔧 NOTIFICATION SERVICE CLASS
// ==============================

// ================================
// 🔒 SECURITY & MIDDLEWARE
// ================================

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(mongoSanitize());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// ================================
// 📁 STATIC FILES SETUP
// ================================

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory:', uploadsDir);
}

app.use(express.static(path.join(__dirname, '../dist')));
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(uploadsDir));

console.log('📁 Serving uploads from:', uploadsDir);

app.post('/api/mail', async (req, res) => {
  const { email } = req.body;

  const mailOptions = {
    from: "ironspidy25@gmail.com",
    to: ["priyanshusahu085@gmail.com", "ratan74082@gmail.com"], // use the email from the request
    subject: "Order Confirmation Email",
    text: "Thank you for your order!", // or use html: "<b>Thank you for your order!</b>"
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.json({
      success: true,
      message: "Email sent successfully"
    });
  } catch (error) {
    console.error("Email send error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message
    });
  }
});

// ================================
// 🗃️ DATABASE CONNECTION (OPTIONAL)
// ================================

const connectDB = async (): Promise<void> => {
  try {
    if (process.env.MONGODB_URI) {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } else {
      console.log('⚠️ No MongoDB URI provided - running with in-memory data');
    }
  } catch (error) {
    console.log('⚠️ Database connection failed - continuing with in-memory data');
  }
};

// ✅ FIXED: Don't fail on database connection
connectDB().catch(() => {
  console.log('📝 Continuing without database - using in-memory storage');
});

// ================================
// 🗄️ SAMPLE DATA
// ================================

let sampleProducts = [
  {
    id: 1,
    name: 'Naruto Uzumaki Orange T-Shirt',
    description: 'High-quality Naruto-themed orange t-shirt featuring the iconic orange jumpsuit design. Perfect for anime fans who want to show their love for the Hidden Leaf Village.',
    price: '599',
    category: 'T-Shirts',
    inStock: true,
    featured: true,
    images: null,
    imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f37f630e?w=500&h=600&fit=crop',
    tags: '["anime", "naruto", "orange", "jumpsuit", "ninja"]',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z'
  },
  {
    id: 2,
    name: 'Attack on Titan Scout Regiment T-Shirt',
    description: 'Official Attack on Titan Scout Regiment t-shirt with the Wings of Freedom logo. Join the fight against titans with this premium quality tee.',
    price: '649',
    category: 'T-Shirts',
    inStock: true,
    featured: false,
    images: null,
    imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=600&fit=crop',
    tags: '["anime", "attack-on-titan", "scout-regiment", "wings-of-freedom"]',
    createdAt: '2024-01-16T00:00:00.000Z',
    updatedAt: '2024-01-16T00:00:00.000Z'
  },
  {
    id: 3,
    name: 'One Piece Luffy Straw Hat Hoodie',
    description: 'Cozy hoodie featuring Monkey D. Luffy and his iconic straw hat. Perfect for staying warm while showing your pirate spirit.',
    price: '1299',
    category: 'Hoodies',
    inStock: true,
    featured: true,
    images: null,
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=600&fit=crop',
    tags: '["anime", "one-piece", "luffy", "straw-hat", "pirate"]',
    createdAt: '2024-01-17T00:00:00.000Z',
    updatedAt: '2024-01-17T00:00:00.000Z'
  },
  {
    id: 4,
    name: 'Demon Slayer Tanjiro Phone Cover',
    description: 'Protect your phone with this stunning Demon Slayer design featuring Tanjiro and his signature water breathing technique.',
    price: '299',
    category: 'Phone Covers',
    inStock: true,
    featured: false,
    images: null,
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=600&fit=crop',
    tags: '["anime", "demon-slayer", "phone-cover", "tanjiro", "water-breathing"]',
    createdAt: '2024-01-18T00:00:00.000Z',
    updatedAt: '2024-01-18T00:00:00.000Z'
  },
  {
    id: 5,
    name: 'Dragon Ball Z Saiyan Warrior Bottle',
    description: 'Stay hydrated like a Saiyan warrior with this premium Dragon Ball Z water bottle featuring Goku in Super Saiyan form.',
    price: '499',
    category: 'Bottles',
    inStock: true,
    featured: false,
    images: null,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=600&fit=crop',
    tags: '["anime", "dragon-ball-z", "goku", "saiyan", "water-bottle"]',
    createdAt: '2024-01-19T00:00:00.000Z',
    updatedAt: '2024-01-19T00:00:00.000Z'
  },
  {
    id: 6,
    name: 'My Hero Academia All Might Plate Set',
    description: 'Dine like a hero with this My Hero Academia plate set featuring All Might and other pro heroes. Perfect for anime-themed meals.',
    price: '799',
    category: 'Plates',
    inStock: true,
    featured: false,
    images: null,
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=600&fit=crop',
    tags: '["anime", "my-hero-academia", "all-might", "heroes", "dining"]',
    createdAt: '2024-01-20T00:00:00.000Z',
    updatedAt: '2024-01-20T00:00:00.000Z'
  }
];

let nextProductId = 7;

// Store orders in memory
let orders: any[] = [];
let nextOrderId = 1;

// ================================
// 🛣️ API ROUTES
// ================================

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running perfectly!',
    timestamp: new Date().toISOString(),
    connectedAdmins: 0, // Removed notificationService.getConnectedAdmins()
    environment: process.env.NODE_ENV || 'development',
    emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
  });
});

// ================================
// 📋 PRODUCTS ENDPOINTS
// ================================

app.get('/api/products', (req, res) => {
  console.log(`📋 GET /api/products - Returning ${sampleProducts.length} products`);

  let filteredProducts = [...sampleProducts];
  const { category, featured, inStock } = req.query;

  if (category && category !== 'All') {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }

  if (featured !== undefined) {
    const featuredFilter = featured === 'true';
    filteredProducts = filteredProducts.filter(p => p.featured === featuredFilter);
  }

  if (inStock !== undefined) {
    const inStockFilter = inStock === 'true';
    filteredProducts = filteredProducts.filter(p => p.inStock === inStockFilter);
  }

  res.status(200).json({
    success: true,
    message: 'Products retrieved successfully',
    data: filteredProducts,
    count: filteredProducts.length,
    total: sampleProducts.length
  });
});

app.get('/api/products/categories', (req, res) => {
  const categories = [...new Set(sampleProducts.map(p => p.category))];

  res.status(200).json({
    success: true,
    message: 'Categories retrieved successfully',
    data: categories,
    count: categories.length
  });
});

app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const product = sampleProducts.find(p => p.id === Number(id));

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Product retrieved successfully',
    data: product
  });
});

app.post('/api/products', (req, res) => {
  try {
    const { name, description, price, category, images, imageUrl, inStock, featured, tags } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, description, price, category'
      });
    }

    let productImages = null;
    let mainImageUrl = '';

    if (images && images !== 'null' && images !== '[]') {
      try {
        if (typeof images === 'string') {
          const parsedImages = JSON.parse(images);
          if (Array.isArray(parsedImages) && parsedImages.length > 0) {
            productImages = images;
            mainImageUrl = parsedImages[0];
          }
        } else if (Array.isArray(images) && images.length > 0) {
          productImages = JSON.stringify(images);
          mainImageUrl = images[0];
        }
      } catch (e) {
        console.log('⚠️ Error parsing images');
      }
    }

    if (!mainImageUrl && imageUrl) {
      mainImageUrl = imageUrl;
    }

    if (!mainImageUrl) {
      mainImageUrl = 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=600&fit=crop';
    }

    const newProduct = {
      id: nextProductId++,
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price).toFixed(0),
      category,
      images: productImages,
      imageUrl: mainImageUrl,
      inStock: inStock !== false,
      featured: featured || false,
      tags: tags || '[]',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    sampleProducts.push(newProduct);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });

  } catch (error) {
    console.error('❌ Product creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const productIndex = sampleProducts.findIndex(p => p.id == id);

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updatedProduct = {
      ...sampleProducts[productIndex],
      ...updateData,
      id: parseInt(id),
      updatedAt: new Date().toISOString()
    };

    sampleProducts[productIndex] = updatedProduct;

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });

  } catch (error) {
    console.error('❌ Product update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;

    const productIndex = sampleProducts.findIndex(p => p.id == id);

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const deletedProduct = sampleProducts.splice(productIndex, 1)[0];

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: {
        id: parseInt(id),
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Product deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
});

// ================================
// 📸 IMAGE UPLOAD ENDPOINT
// ================================

app.post('/api/upload', (req, res) => {
  try {
    const { image, filename } = req.body;

    if (!image || !filename) {
      return res.status(400).json({
        success: false,
        error: 'Image data and filename are required'
      });
    }

    if (!image.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image format. Must be base64 encoded image.'
      });
    }

    const base64Match = image.match(/^data:image\/([a-zA-Z]*);base64,(.+)$/);
    if (!base64Match) {
      return res.status(400).json({
        success: false,
        error: 'Invalid base64 image format'
      });
    }

    const imageType = base64Match[1];
    const base64Data = base64Match[2];

    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000);
    const fileExtension = filename.includes('.') ?
      filename.split('.').pop() :
      imageType || 'jpg';
    const uniqueFilename = `product_${timestamp}_${randomNum}.${fileExtension}`;

    const filePath = path.join(uploadsDir, uniqueFilename);

    fs.writeFileSync(filePath, base64Data, 'base64');

    const imageUrl = `/uploads/${uniqueFilename}`;

    res.status(200).json({
      success: true,
      imageUrl: imageUrl,
      filename: uniqueFilename,
      originalFilename: filename,
      fileSize: fs.statSync(filePath).size
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    });
  }
});

// ================================
// 🛒 ORDER ENDPOINTS
// ================================

app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;

    console.log('📦 Creating new order:', orderData);

    // Create order
    const order = {
      id: `ORDER_${nextOrderId++}_${Date.now()}`,
      ...orderData,
      createdAt: new Date().toISOString(),
      status: 'completed'
    };

    // Store order
    orders.push(order);

    console.log('💾 Order stored:', order.id);

    // Send notifications
    // Removed notificationService.sendOrderNotification(order)

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
      notificationSent: true // Placeholder, as notificationService is removed
    });

  } catch (error) {
    console.error('❌ Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

app.get('/api/orders', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Orders retrieved successfully',
    data: orders,
    count: orders.length
  });
});

app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const order = orders.find(o => o.id === id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Order retrieved successfully',
    data: order
  });
});

// ================================
// 📊 ADMIN ANALYTICS ENDPOINTS
// ================================

app.get('/api/admin/stats', (req, res) => {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Get recent orders (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const recentOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= weekAgo;
  });

  const recentRevenue = recentOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  const stats = {
    totalOrders,
    totalRevenue,
    completedOrders,
    averageOrderValue,
    recentOrders: recentOrders.length,
    recentRevenue,
    connectedAdmins: 0, // Removed notificationService.getConnectedAdmins()
    totalProducts: sampleProducts.length,
    featuredProducts: sampleProducts.filter(p => p.featured).length,
    inStockProducts: sampleProducts.filter(p => p.inStock).length
  };

  res.status(200).json({
    success: true,
    message: 'Admin statistics retrieved successfully',
    data: stats
  });
});

// ================================
// 🧪 UPLOAD TEST ENDPOINTS
// ================================

app.get('/api/upload/health', (req, res) => {
  const uploadsExists = fs.existsSync(uploadsDir);

  res.json({
    success: true,
    status: 'Upload endpoint is working!',
    uploadsDirectory: uploadsDir,
    exists: uploadsExists,
    writable: uploadsExists ? 'yes' : 'directory will be created on first upload',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/upload/list', (req, res) => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      return res.json({
        success: true,
        message: 'No uploads directory found',
        files: []
      });
    }

    const files = fs.readdirSync(uploadsDir).map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        url: `/uploads/${filename}`,
        size: stats.size,
        created: stats.birthtime,
        accessible: `http://localhost:${PORT}/uploads/${filename}`
      };
    });

    res.json({
      success: true,
      message: 'Uploaded files retrieved',
      files,
      count: files.length,
      uploadsDir
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ================================
// 🎭 FRONTEND ROUTES
// ================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Anime Store API with Real-time Notifications!',
    version: '2.0.0',
    features: [
      'Real-time admin notifications via WebSocket',
      'Email alerts for new orders (if configured)',
      'Complete order management system',
      'Product CRUD operations',
      'Image upload support',
      'Admin analytics dashboard'
    ],
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      categories: '/api/products/categories',
      orders: '/api/orders',
      adminStats: '/api/admin/stats',
      upload: '/api/upload'
    },
    stats: {
      totalProducts: sampleProducts.length,
      totalOrders: orders.length,
      featuredProducts: sampleProducts.filter(p => p.featured).length,
      categories: [...new Set(sampleProducts.map(p => p.category))].length,
      connectedAdmins: 0 // Removed notificationService.getConnectedAdmins()
    },
    notifications: {
      emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      adminEmails: process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').length : 0,
      webSocketActive: true
    }
  });
});

app.get('*', (req, res) => {
  // Only serve React app for non-API routes
  if (!req.path.startsWith('/api/')) {
    const indexPath = path.join(__dirname, '../dist/index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.json({
        success: true,
        message: 'Anime Store API - Frontend not built yet',
        note: 'Run `npm run build` to generate frontend files',
        currentPath: req.path,
        availableEndpoints: [
          'GET /api/health',
          'GET /api/products',
          'GET /api/products/categories',
          'GET /api/products/:id',
          'POST /api/products',
          'PUT /api/products/:id',
          'DELETE /api/products/:id',
          'POST /api/upload',
          'GET /api/upload/health',
          'GET /api/upload/list',
          'POST /api/orders',
          'GET /api/orders',
          'GET /api/orders/:id',
          'GET /api/admin/stats',
          'POST /api/mail',
        ]
      });
    }
  } else {
    res.status(404).json({
      success: false,
      message: 'API route not found',
      path: req.originalUrl
    });
  }
});

// ================================
// 🚫 ERROR HANDLING
// ================================

app.use('/api/*', (req, res) => {
  console.log('❌ API route not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'API route not found',
    path: req.originalUrl,
    method: req.method
  });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🚨 Global Error Handler:', err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    })
  });
});

// ================================
// 🚀 SERVER STARTUP
// ================================

const serverInstance = server.listen(PORT, () => {
  console.log(`
🎉 ===============================================
🎌 ANIME STORE SERVER SUCCESSFULLY STARTED!
🎉 ===============================================

🚀 Server Details:
   Port: ${PORT}
   Environment: ${process.env.NODE_ENV || 'development'}
   Process ID: ${process.pid}
   Node Version: ${process.version}

🌐 Access URLs:
   📱 Local: http://localhost:${PORT}
   📋 Health: http://localhost:${PORT}/api/health
   🛍️ Products: http://localhost:${PORT}/api/products
   📂 Categories: http://localhost:${PORT}/api/products/categories
   📸 Upload: http://localhost:${PORT}/api/upload/health
   📊 Admin Stats: http://localhost:${PORT}/api/admin/stats

📊 Current Data:
   🛍️ Products: ${sampleProducts.length}
   ⭐ Featured: ${sampleProducts.filter(p => p.featured).length}
   📦 Categories: ${[...new Set(sampleProducts.map(p => p.category))].length}
   🛒 Orders: ${orders.length}

🔔 Notification System:
   📧 Email: ${process.env.EMAIL_USER ? '✅ Configured' : '❌ Not configured (WebSocket only)'}
   📱 Admin Emails: ${process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').length : 0}
   🔗 WebSocket: ✅ Active
   👑 Connected Admins: ${0} // Removed notificationService.getConnectedAdmins()

📁 File System:
   📂 Uploads: ${uploadsDir}
   📄 Static Files: ${path.join(__dirname, '../dist')}

🛠️ Available API Endpoints:
   GET    /api/health
   GET    /api/products
   GET    /api/products/categories
   GET    /api/products/:id
   POST   /api/products
   PUT    /api/products/:id
   DELETE /api/products/:id
   POST   /api/upload
   GET    /api/upload/health
   GET    /api/upload/list
   POST   /api/orders (🔔 triggers notifications)
   GET    /api/orders
   GET    /api/orders/:id
   GET    /api/admin/stats

🎯 Test the Complete Flow:
   1. 👩‍💼 Admin: http://localhost:${PORT}/admin
   2. 🛍️ Customer: http://localhost:${PORT}/products
   3. 📦 Buy Product → 🔔 Admin gets notification!

✅ Your anime store is ready for business!
===============================================
  `);
});

// // ================================
// // 🔄 GRACEFUL SHUTDOWN
// // ================================

// const gracefulShutdown = (signal: string) => {
//   console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

//   serverInstance.close(() => {
//     console.log('🔌 HTTP server closed');

//     io.close(() => {
//       console.log('🔌 WebSocket server closed');

//       mongoose.connection.close(() => {
//         console.log('🔌 Database connection closed');
//         console.log('✅ Graceful shutdown completed');
//         process.exit(0);
//       });
//     });
//   });

//   setTimeout(() => {
//     console.error('⚠️ Could not close connections in time, forcefully shutting down');
//     process.exit(1);
//   }, 10000);
// };

// process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
// process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// process.on('uncaughtException', (error) => {
//   console.error('🚨 Uncaught Exception:', error);
//   gracefulShutdown('uncaughtException');
// });

// process.on('unhandledRejection', (reason, promise) => {
//   console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
//   gracefulShutdown('unhandledRejection');
// });

export default app;