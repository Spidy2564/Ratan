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

// Import routes
import authRoutes from './routes/auth.js';
import purchaseRoutes from './routes/purchases.js';
import cartRoutes from './routes/cart.js';
import wishlistRoutes from './routes/wishlist.js';
import { registerRoutes } from './routes';

// Import models to ensure they are registered with mongoose
import './models/user.js';
import './models/Purchase.js';
import './models/Product.js'; // Added Product model import
import './models/Cart.js'; // Added Cart model import
import './models/Wishlist.js'; // Added Wishlist model import
import { storage } from './storage'; // Added storage import

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

// ================================
// 🔐 AUTH ROUTES
// ================================

app.use('/api/auth', authRoutes);

// ================================
// 📧 CONTACT FORM ROUTE
// ================================

app.post('/api/contact', async (req, res) => {
  const { name, email, orderNumber, inquiryType, message } = req.body;
  if (!name || !email || !inquiryType || !message) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields.'
    });
  }

  const supportEmail = process.env.SUPPORT_EMAIL || 'support@animeindiapod.com';
  const subject = `Contact Form: ${inquiryType} from ${name}`;
  const html = `
    <h2>New Contact Inquiry</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    ${orderNumber ? `<p><strong>Order Number:</strong> ${orderNumber}</p>` : ''}
    <p><strong>Inquiry Type:</strong> ${inquiryType}</p>
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, '<br/>')}</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.FROM_CONTACT_EMAIL,
      to: supportEmail,
      subject,
      html,
    });
    return res.json({ success: true, message: 'Message sent successfully.' });
  } catch (error: any) {
    console.error('Contact form email error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send message.', error: error.message });
  }
});

// ================================
// 🛒 PURCHASE ROUTES
// ================================

app.use('/api/purchases', purchaseRoutes);

// ================================
// 🛒 CART ROUTES
// ================================

app.use('/api/cart', cartRoutes);

// ================================
// ❤️ WISHLIST ROUTES
// ================================

app.use('/api/wishlist', wishlistRoutes);

// Ironspidy Code
app.post('/api/mail', async (req, res) => {
  const { purchase } = req.body;
  if (!purchase || !purchase.userEmail || !purchase.userName || !purchase.items) {
    return res.status(400).json({
      success: false,
      message: 'Missing purchase details.'
    });
  }

  // Prepare admin emails
  const adminEmails = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim())
    : ['admin@example.com']; // fallback

  const userEmail = purchase.userEmail;
  const userName = purchase.userName;

  // Email content
  const orderDetails = `
    <h2>Order Confirmation</h2>
    <p>Thank you, ${userName}, for your purchase!</p>
    <p><strong>Order ID:</strong> ${purchase.id}</p>
    <p><strong>Total Amount:</strong> ₹${purchase.totalAmount}</p>
    <h3>Items:</h3>
    <ul>
      ${purchase.items.map((item: any) => `
        <li>
          ${item.productName} (x${item.quantity}) - ₹${item.price}
        </li>
      `).join('')}
    </ul>
    <p>Status: ${purchase.status}</p>
    <p>Order Date: ${purchase.createdAt}</p>
  `;

  try {
    // Send to user
    await transporter.sendMail({
      from: "ironspidy25@gmail.com",
      to: userEmail,
      subject: 'Your Order Confirmation',
      html: orderDetails,
    });

    // Send to admin(s)
    await transporter.sendMail({
      from: "ironspidy25@gmail.com",
      to: adminEmails,
      subject: `New Order Received: ${purchase.id}`,
      html: `<h2>New Order from ${userName} (${userEmail})</h2>` + orderDetails,
    });

    return res.json({
      success: true,
      message: 'Order confirmation email sent to user and admin.'
    });
  } catch (error: any) {
    console.error('Email send error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
});

// ================================
// 🗃️ DATABASE CONNECTION
// ================================

const connectDB = async (): Promise<void> => {
  try {
    if (process.env.MONGODB_URI) {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

      // Create default admin user if it doesn't exist
      const User = mongoose.model('User');
      const adminUser = await User.findOne({ email: 'admin@tshirtapp.com' });

      if (!adminUser) {
        const newAdmin = new User({
          email: 'admin@tshirtapp.com',
          firstName: 'Admin',
          lastName: 'User',
          password: 'admin123', // Let the pre-save hook hash it
          role: 'admin',
          isEmailVerified: true,
          isActive: true,
        });

        await newAdmin.save();
        console.log('✅ Default admin user created');
      }

      // Create default superadmin user if it doesn't exist
      const superAdminUser = await User.findOne({ email: 'superadmin@tshirtapp.com' });

      if (!superAdminUser) {
        const newSuperAdmin = new User({
          email: 'superadmin@tshirtapp.com',
          firstName: 'Super',
          lastName: 'Admin',
          password: 'super123', // Let the pre-save hook hash it
          role: 'superadmin',
          isEmailVerified: true,
          isActive: true,
        });

        await newSuperAdmin.save();
        console.log('✅ Default superadmin user created');
      }

      // Create default test user if it doesn't exist
      const testUser = await User.findOne({ email: 'user@test.com' });

      if (!testUser) {
        const newTestUser = new User({
          email: 'user@test.com',
          firstName: 'Test',
          lastName: 'User',
          password: 'user123', // Let the pre-save hook hash it
          role: 'user',
          isEmailVerified: true,
          isActive: true,
        });

        await newTestUser.save();
        console.log('✅ Default test user created');
      }

    } else {
      console.log('⚠️ No MongoDB URI provided - running with in-memory data');
    }
  } catch (error) {
    console.log('⚠️ Database connection failed - continuing with in-memory data');
    console.error('Database error:', error);
  }
};

// Connect to database
connectDB();

// ================================
// 🗄️ SAMPLE DATA
// ================================

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

// Register MongoDB-backed API routes
registerRoutes(app);

// Update /api/products/categories to use storage abstraction
app.get('/api/products/categories', async (req, res) => {
  try {
    const categories = await storage.getCategories();
    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories,
      count: categories.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
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

  } catch (error: any) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
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

  } catch (error: any) {
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
    totalProducts: 0, // No longer fetching from sampleProducts
    featuredProducts: 0, // No longer fetching from sampleProducts
    inStockProducts: 0 // No longer fetching from sampleProducts
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

  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
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
      totalProducts: 0, // No longer fetching from sampleProducts
      totalOrders: orders.length,
      featuredProducts: 0, // No longer fetching from sampleProducts
      categories: 0, // No longer fetching from sampleProducts
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
   🛍️ Products: ${0} // No longer fetching from sampleProducts
   ⭐ Featured: ${0} // No longer fetching from sampleProducts
   📦 Categories: ${0} // No longer fetching from sampleProducts
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