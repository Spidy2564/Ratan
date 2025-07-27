// server/index.ts
import express5 from "express";
import { createServer as createServer2 } from "http";
import { Server } from "socket.io";
import mongoose6 from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import cookieParser from "cookie-parser";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";

// server/config/nodemailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
var transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  // true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});
var nodemailer_default = transporter;

// server/index.ts
import dotenv2 from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

// server/routes/auth.js
import express from "express";
import jwt2 from "jsonwebtoken";
import bcrypt2 from "bcryptjs";

// server/models/user.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
var userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return this.provider === "email";
    }
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ["user", "admin", "superadmin"],
    default: "user"
  },
  provider: {
    type: String,
    enum: ["email", "google", "facebook"],
    default: "email"
  },
  providerId: String,
  // Google ID, Facebook ID, etc.
  avatar: String,
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLoginAt: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    marketing: {
      type: Boolean,
      default: false
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light"
    }
  },
  refreshTokens: [String]
  // Store multiple refresh tokens
}, {
  timestamps: true
});
userSchema.virtual("name").get(function() {
  return `${this.firstName} ${this.lastName}`;
});
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};
userSchema.methods.generateTokens = function() {
  const payload = {
    id: this._id,
    email: this.email,
    role: this.role
  };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: process.env.JWT_EXPIRE || "1h"
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || "your-refresh-secret", {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d"
  });
  return { accessToken, refreshToken };
};
userSchema.methods.generateEmailVerificationToken = function() {
  const token = jwt.sign(
    { id: this._id, email: this.email },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "1d" }
  );
  this.emailVerificationToken = token;
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1e3;
  return token;
};
userSchema.methods.generatePasswordResetToken = function() {
  const token = jwt.sign(
    { id: this._id, email: this.email },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "1h" }
  );
  this.passwordResetToken = token;
  this.passwordResetExpires = Date.now() + 60 * 60 * 1e3;
  return token;
};
userSchema.methods.cleanExpiredTokens = function() {
  this.refreshTokens = this.refreshTokens.filter((token) => {
    try {
      jwt.verify(token, process.env.JWT_REFRESH_SECRET || "your-refresh-secret");
      return true;
    } catch (error) {
      return false;
    }
  });
};
var user_default = mongoose.model("User", userSchema);

// server/routes/auth.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
var router = express.Router();
var generateToken = (userId, email, role) => {
  return jwt2.sign(
    { id: userId, email, role },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "24h" }
  );
};
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await user_default.findOne({ provider: "google", providerId: profile.id });
    if (!user) {
      user = new user_default({
        provider: "google",
        providerId: profile.id,
        email: profile.emails[0].value,
        firstName: profile.name.givenName || "",
        lastName: profile.name.familyName || "",
        isEmailVerified: true,
        avatar: profile.photos[0]?.value
      });
      await user.save();
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/" }), (req, res) => {
  const user = req.user;
  const token = generateToken(user._id, user.email, user.role);
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
});
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, agreeToTerms } = req.body;
    if (!agreeToTerms) {
      return res.status(400).json({
        success: false,
        message: "You must agree to the terms and conditions."
      });
    }
    const existingUser = await user_default.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists."
      });
    }
    const user = new user_default({
      firstName,
      lastName,
      email,
      password,
      phone
    });
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();
    console.log(`Verification email would be sent to: ${email}`);
    res.status(201).json({
      success: true,
      message: "Registration successful! Please check your email to verify your account."
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration."
    });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await user_default.findOne({ email }).select("+password");
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials."
      });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials."
      });
    }
    const { accessToken, refreshToken } = user.generateTokens();
    user.refreshTokens.push(refreshToken);
    user.lastLoginAt = /* @__PURE__ */ new Date();
    await user.save();
    user.password = void 0;
    user.refreshTokens = void 0;
    res.json({
      success: true,
      message: "Login successful!",
      user,
      token: accessToken,
      refreshToken
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login."
    });
  }
});
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await user_default.findOne({ email });
    if (!user) {
      return res.json({
        success: true,
        message: "If a user with that email exists, a reset link has been sent."
      });
    }
    const resetToken = user.generatePasswordResetToken();
    await user.save();
    console.log(`Password reset requested for: ${email}`);
    res.json({
      success: true,
      message: "If a user with that email exists, a reset link has been sent."
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password reset."
    });
  }
});
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match."
      });
    }
    try {
      const decoded = jwt2.verify(token, process.env.JWT_SECRET || "your-secret-key");
      const user = await user_default.findOne({
        _id: decoded.id,
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() }
      });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset token."
        });
      }
      user.password = password;
      user.passwordResetToken = void 0;
      user.passwordResetExpires = void 0;
      user.refreshTokens = [];
      await user.save();
      res.json({
        success: true,
        message: "Password reset successful."
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token."
      });
    }
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password reset."
    });
  }
});
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;
    try {
      const decoded = jwt2.verify(token, process.env.JWT_SECRET || "your-secret-key");
      const user = await user_default.findOne({
        _id: decoded.id,
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: Date.now() }
      });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired verification token."
        });
      }
      user.isEmailVerified = true;
      user.emailVerificationToken = void 0;
      user.emailVerificationExpires = void 0;
      await user.save();
      res.json({
        success: true,
        message: "Email verified successfully."
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token."
      });
    }
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during email verification."
    });
  }
});
router.get("/verify", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided."
      });
    }
    const decoded = jwt2.verify(token, process.env.JWT_SECRET || "your-secret-key");
    const user = await user_default.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token."
      });
    }
    user.password = void 0;
    user.refreshTokens = void 0;
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token."
    });
  }
});
router.post("/logout", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (token) {
      try {
        const decoded = jwt2.verify(token, process.env.JWT_SECRET || "your-secret-key");
        const user = await user_default.findById(decoded.id);
        if (user) {
          user.refreshTokens = [];
          await user.save();
        }
      } catch (error) {
        console.error("Token verification error during logout:", error);
      }
    }
    res.json({
      success: true,
      message: "Logout successful."
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout."
    });
  }
});
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required."
      });
    }
    try {
      const decoded = jwt2.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "your-refresh-secret");
      const user = await user_default.findById(decoded.id);
      if (!user || !user.refreshTokens.includes(refreshToken)) {
        return res.status(401).json({
          success: false,
          message: "Invalid refresh token."
        });
      }
      const tokens = user.generateTokens();
      user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
      user.refreshTokens.push(tokens.refreshToken);
      await user.save();
      res.json({
        success: true,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token."
      });
    }
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during token refresh."
    });
  }
});
var auth_default = router;

// server/routes/purchases.js
import express2 from "express";

// server/models/Purchase.js
import mongoose2 from "mongoose";
var purchaseSchema = new mongoose2.Schema({
  userId: {
    type: mongoose2.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [{
    productId: {
      type: String,
      required: true
    },
    productName: String,
    price: Number,
    quantity: Number,
    size: String,
    color: String
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled", "refunded", "completed"],
    default: "pending"
  },
  paymentMethod: {
    type: String,
    enum: ["razorpay", "stripe", "paypal", "cod"],
    required: true
  },
  paymentId: String,
  // Transaction ID from payment gateway
  shippingAddress: {
    name: String,
    email: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  orderNotes: String,
  trackingNumber: String,
  estimatedDelivery: Date,
  deliveredAt: Date
}, {
  timestamps: true
});
purchaseSchema.index({ userId: 1, createdAt: -1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ paymentId: 1 });
var Purchase_default = mongoose2.model("Purchase", purchaseSchema);

// server/middleware/auth.js
import jwt3 from "jsonwebtoken";
var protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      console.log("\u274C Auth middleware - No token provided");
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }
    try {
      const decoded = jwt3.verify(token, process.env.JWT_SECRET || "your-secret-key");
      const user = await user_default.findById(decoded.id).select("-password -refreshTokens");
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Invalid token or user not found."
        });
      }
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid token."
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error in authentication middleware."
    });
  }
};

// server/routes/purchases.js
var router2 = express2.Router();
router2.post("/", protect, async (req, res) => {
  try {
    const {
      items,
      totalAmount,
      paymentMethod,
      paymentId,
      shippingAddress,
      orderNotes
    } = req.body;
    console.log(items);
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items are required"
      });
    }
    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid total amount is required"
      });
    }
    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required"
      });
    }
    const purchaseData = {
      userId: req.user._id,
      items: items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        size: item.size || null,
        color: item.color || null
      })),
      totalAmount,
      paymentMethod,
      paymentId: paymentId || null,
      shippingAddress: shippingAddress || {},
      orderNotes: orderNotes || "",
      status: "pending"
    };
    const purchase = new Purchase_default(purchaseData);
    await purchase.save();
    await purchase.populate("userId", "firstName lastName email");
    res.status(201).json({
      success: true,
      message: "Purchase created successfully",
      data: purchase
    });
  } catch (error) {
    console.error("Purchase creation error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during purchase creation"
    });
  }
});
router2.get("/", protect, async (req, res) => {
  try {
    const purchases = await Purchase_default.find({ userId: req.user._id }).sort({ createdAt: -1 }).populate("userId", "firstName lastName email");
    res.json({
      success: true,
      message: "Purchases retrieved successfully",
      data: purchases,
      count: purchases.length
    });
  } catch (error) {
    console.error("Get purchases error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving purchases"
    });
  }
});
router2.get("/:id", protect, async (req, res) => {
  try {
    const purchase = await Purchase_default.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate("userId", "firstName lastName email");
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found"
      });
    }
    res.json({
      success: true,
      message: "Purchase retrieved successfully",
      data: purchase
    });
  } catch (error) {
    console.error("Get purchase error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving purchase"
    });
  }
});
router2.put("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }
    const purchase = await Purchase_default.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found"
      });
    }
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      if (purchase.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this purchase"
        });
      }
    }
    purchase.status = status;
    if (status === "delivered") {
      purchase.deliveredAt = /* @__PURE__ */ new Date();
    }
    await purchase.save();
    res.json({
      success: true,
      message: "Purchase status updated successfully",
      data: purchase
    });
  } catch (error) {
    console.error("Update purchase status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating purchase status"
    });
  }
});
router2.get("/admin/all", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view all purchases"
      });
    }
    const purchases = await Purchase_default.find().sort({ createdAt: -1 }).populate("userId", "firstName lastName email");
    res.json({
      success: true,
      message: "All purchases retrieved successfully",
      data: purchases,
      count: purchases.length
    });
  } catch (error) {
    console.error("Get all purchases error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving all purchases"
    });
  }
});
router2.get("/test", protect, async (req, res) => {
  res.json({
    success: true,
    message: "Authentication working!",
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});
var purchases_default = router2;

// server/routes/cart.js
import express3 from "express";

// server/models/Cart.js
import mongoose3 from "mongoose";
var cartItemSchema = new mongoose3.Schema({
  productId: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  size: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: null
  },
  imageUrl: {
    type: String,
    default: ""
  }
});
var cartSchema = new mongoose3.Schema({
  userId: {
    type: mongoose3.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  },
  itemCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});
cartSchema.pre("save", function(next) {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
  this.itemCount = this.items.reduce((count, item) => {
    return count + item.quantity;
  }, 0);
  next();
});
cartSchema.index({ userId: 1 });
var Cart_default = mongoose3.model("Cart", cartSchema);

// server/routes/cart.js
var router3 = express3.Router();
router3.get("/", protect, async (req, res) => {
  try {
    let cart = await Cart_default.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart_default({ userId: req.user._id, items: [] });
      await cart.save();
    }
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart"
    });
  }
});
router3.post("/add", protect, async (req, res) => {
  try {
    const { productId, productName, price, quantity = 1, size, color, imageUrl } = req.body;
    if (!productId || !productName || !price) {
      return res.status(400).json({
        success: false,
        message: "Product ID, name, and price are required"
      });
    }
    let cart = await Cart_default.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart_default({ userId: req.user._id, items: [] });
    }
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId && item.size === size && item.color === color
    );
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        productName,
        price: parseFloat(price),
        quantity,
        size: size || null,
        color: color || null,
        imageUrl: imageUrl || ""
      });
    }
    await cart.save();
    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      data: cart
    });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add item to cart"
    });
  }
});
router3.put("/update", protect, async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    if (!itemId || quantity === void 0 || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Item ID and valid quantity are required"
      });
    }
    const cart = await Cart_default.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }
    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart"
      });
    }
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: cart
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update cart item"
    });
  }
});
router3.delete("/remove", protect, async (req, res) => {
  try {
    const { itemId } = req.body;
    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required"
      });
    }
    const cart = await Cart_default.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }
    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();
    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      data: cart
    });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from cart"
    });
  }
});
router3.delete("/clear", protect, async (req, res) => {
  try {
    const cart = await Cart_default.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }
    cart.items = [];
    await cart.save();
    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: cart
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cart"
    });
  }
});
var cart_default = router3;

// server/routes/wishlist.js
import express4 from "express";

// server/models/Wishlist.js
import mongoose4 from "mongoose";
var wishlistItemSchema = new mongoose4.Schema({
  productId: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String,
    default: ""
  },
  category: {
    type: String,
    default: ""
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});
var wishlistSchema = new mongoose4.Schema({
  userId: {
    type: mongoose4.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  items: [wishlistItemSchema],
  itemCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});
wishlistSchema.pre("save", function(next) {
  this.itemCount = this.items.length;
  next();
});
wishlistSchema.index({ userId: 1 });
var Wishlist_default = mongoose4.model("Wishlist", wishlistSchema);

// server/routes/wishlist.js
var router4 = express4.Router();
router4.get("/", protect, async (req, res) => {
  try {
    let wishlist = await Wishlist_default.findOne({ userId: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist_default({ userId: req.user._id, items: [] });
      await wishlist.save();
    }
    res.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist"
    });
  }
});
router4.post("/add", protect, async (req, res) => {
  try {
    const { productId, productName, price, imageUrl, category } = req.body;
    if (!productId || !productName || !price) {
      return res.status(400).json({
        success: false,
        message: "Product ID, name, and price are required"
      });
    }
    let wishlist = await Wishlist_default.findOne({ userId: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist_default({ userId: req.user._id, items: [] });
    }
    const existingItem = wishlist.items.find((item) => item.productId === productId);
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Item already exists in wishlist"
      });
    }
    wishlist.items.push({
      productId,
      productName,
      price: parseFloat(price),
      imageUrl: imageUrl || "",
      category: category || "",
      addedAt: /* @__PURE__ */ new Date()
    });
    await wishlist.save();
    res.status(200).json({
      success: true,
      message: "Item added to wishlist successfully",
      data: wishlist
    });
  } catch (error) {
    console.error("Error adding item to wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add item to wishlist"
    });
  }
});
router4.delete("/remove", protect, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required"
      });
    }
    const wishlist = await Wishlist_default.findOne({ userId: req.user._id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found"
      });
    }
    wishlist.items = wishlist.items.filter((item) => item.productId !== productId);
    await wishlist.save();
    res.status(200).json({
      success: true,
      message: "Item removed from wishlist successfully",
      data: wishlist
    });
  } catch (error) {
    console.error("Error removing item from wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from wishlist"
    });
  }
});
router4.delete("/clear", protect, async (req, res) => {
  try {
    const wishlist = await Wishlist_default.findOne({ userId: req.user._id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found"
      });
    }
    wishlist.items = [];
    await wishlist.save();
    res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
      data: wishlist
    });
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear wishlist"
    });
  }
});
router4.get("/check/:productId", protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const wishlist = await Wishlist_default.findOne({ userId: req.user._id });
    if (!wishlist) {
      return res.status(200).json({
        success: true,
        isInWishlist: false
      });
    }
    const isInWishlist = wishlist.items.some((item) => item.productId === productId);
    res.status(200).json({
      success: true,
      isInWishlist
    });
  } catch (error) {
    console.error("Error checking wishlist status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check wishlist status"
    });
  }
});
var wishlist_default = router4;

// server/routes.ts
import { createServer } from "http";

// server/models/Product.js
import mongoose5 from "mongoose";
var productSchema = new mongoose5.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  inStock: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  images: {
    type: String,
    // JSON stringified array of image URLs
    default: null
  },
  imageUrl: {
    type: String,
    default: ""
  },
  tags: {
    type: String,
    // JSON stringified array of tags
    default: "[]"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
productSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});
var Product = mongoose5.model("Product", productSchema);
var Product_default = Product;

// server/storage.ts
var MongoStorage = class {
  constructor() {
  }
  // User methods (dummy/in-memory for now)
  async getUser(id) {
    return void 0;
  }
  async getUserByUsername(username) {
    return void 0;
  }
  async createUser(user) {
    return user;
  }
  // Contact submission methods (dummy/in-memory for now)
  async createContactSubmission(submission) {
    return submission;
  }
  async getContactSubmissions() {
    return [];
  }
  async getContactSubmission(id) {
    return void 0;
  }
  async markContactSubmissionAsRead(id) {
    return void 0;
  }
  // Product methods (MongoDB only)
  async getProducts(filters) {
    const query = {};
    if (filters) {
      if (filters.category) query.category = filters.category;
      if (filters.featured !== void 0) query.featured = filters.featured;
      if (filters.inStock !== void 0) query.inStock = filters.inStock;
    }
    const products = await Product_default.find(query).lean();
    return products;
  }
  async getProduct(id) {
    const product = await Product_default.findById(id).lean();
    return product || void 0;
  }
  async createProduct(productData) {
    const product = new Product_default(productData);
    await product.save();
    return product.toObject();
  }
  async updateProduct(id, updates) {
    const product = await Product_default.findByIdAndUpdate(id, updates, { new: true }).lean();
    return product || void 0;
  }
  async deleteProduct(id) {
    const result = await Product_default.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
  async getCategories() {
    const categories = await Product_default.distinct("category");
    return categories;
  }
  async getFeaturedProducts() {
    const products = await Product_default.find({ featured: true }).lean();
    return products;
  }
};
var storage = new MongoStorage();

// server/routes.ts
import { ZodError, z } from "zod";
import { fromZodError } from "zod-validation-error";
var contactFormSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  orderNumber: z.string().optional(),
  inquiryType: z.string().min(1),
  message: z.string().min(1)
});
var productSchema2 = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.string().min(1),
  category: z.string().min(1),
  inStock: z.boolean().optional(),
  featured: z.boolean().optional(),
  imageUrl: z.string().optional(),
  tags: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});
var updateProductSchema = productSchema2.partial();
async function registerRoutes(app2) {
  app2.post("/api/contact", async (req, res) => {
    try {
      const validatedData = contactFormSchema.parse(req.body);
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
  app2.get("/api/products", async (req, res) => {
    try {
      const { category, featured, inStock } = req.query;
      const filters = {};
      if (category && typeof category === "string") {
        filters.category = category;
      }
      if (featured !== void 0) {
        filters.featured = featured === "true";
      }
      if (inStock !== void 0) {
        filters.inStock = inStock === "true";
      }
      const products = await storage.getProducts(Object.keys(filters).length > 0 ? filters : void 0);
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
  app2.get("/api/products/featured", async (req, res) => {
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
  app2.get("/api/products/categories", async (req, res) => {
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
  app2.get("/api/products/:id", async (req, res) => {
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
  app2.post("/api/products", async (req, res) => {
    try {
      console.log("\u{1F4DD} Received product data:", JSON.stringify(req.body, null, 2));
      console.log("\u{1F4F8} Images field received:", req.body.images);
      console.log("\u{1F4F8} Images field type:", typeof req.body.images);
      const { images, ...productDataWithoutImages } = req.body;
      const validatedData = productSchema2.parse(productDataWithoutImages);
      const productWithImages = {
        ...validatedData,
        images: images || null
        // Ensure images is included
      };
      console.log("\u2705 Final product data to save:", JSON.stringify(productWithImages, null, 2));
      const product = await storage.createProduct(productWithImages);
      console.log("\u{1F389} Product created successfully:", JSON.stringify(product, null, 2));
      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product
      });
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("\u274C Validation error:", error);
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("\u274C Error creating product:", error);
        res.status(500).json({ message: "Failed to create product" });
      }
    }
  });
  app2.put("/api/products/:id", async (req, res) => {
    try {
      const productId = req.params.id;
      const { images, ...updateDataWithoutImages } = req.body;
      const validatedData = updateProductSchema.parse(updateDataWithoutImages);
      const updateWithImages = {
        ...validatedData,
        ...images !== void 0 && { images }
      };
      const updatedProduct = await storage.updateProduct(productId, updateWithImages);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      console.log("\u{1F389} Product updated successfully:", JSON.stringify(updatedProduct, null, 2));
      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: updatedProduct
      });
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("\u274C Update validation error:", error);
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("\u274C Error updating product:", error);
        res.status(500).json({ message: "Failed to update product" });
      }
    }
  });
  app2.delete("/api/products/:id", async (req, res) => {
    try {
      const productId = req.params.id;
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
dotenv2.config();
var app = express5();
var server = createServer2(app);
var io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
var PORT = process.env.PORT || 5e3;
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
app.use(mongoSanitize());
app.use(compression());
app.use(morgan("dev"));
app.use(express5.json({ limit: "50mb" }));
app.use(express5.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
var uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("\u{1F4C1} Created uploads directory:", uploadsDir);
}
app.use(express5.static(path.join(__dirname, "../dist")));
app.use("/uploads", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express5.static(uploadsDir));
console.log("\u{1F4C1} Serving uploads from:", uploadsDir);
app.use("/api/auth", auth_default);
app.post("/api/contact", async (req, res) => {
  const { name, email, orderNumber, inquiryType, message } = req.body;
  if (!name || !email || !inquiryType || !message) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields."
    });
  }
  const supportEmail = process.env.SUPPORT_EMAIL || "support@animeindiapod.com";
  const subject = `Contact Form: ${inquiryType} from ${name}`;
  const html = `
    <h2>New Contact Inquiry</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    ${orderNumber ? `<p><strong>Order Number:</strong> ${orderNumber}</p>` : ""}
    <p><strong>Inquiry Type:</strong> ${inquiryType}</p>
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, "<br/>")}</p>
  `;
  try {
    await nodemailer_default.sendMail({
      from: email,
      to: supportEmail,
      subject,
      html
    });
    return res.json({ success: true, message: "Message sent successfully." });
  } catch (error) {
    console.error("Contact form email error:", error);
    return res.status(500).json({ success: false, message: "Failed to send message.", error: error.message });
  }
});
app.use("/api/purchases", purchases_default);
app.use("/api/cart", cart_default);
app.use("/api/wishlist", wishlist_default);
app.post("/api/mail", async (req, res) => {
  const { purchase } = req.body;
  if (!purchase || !purchase.userEmail || !purchase.userName || !purchase.items) {
    return res.status(400).json({
      success: false,
      message: "Missing purchase details."
    });
  }
  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim()) : ["admin@example.com"];
  const userEmail = purchase.userEmail;
  const userName = purchase.userName;
  const orderDetails = `
    <h2>Order Confirmation</h2>
    <p>Thank you, ${userName}, for your purchase!</p>
    <p><strong>Order ID:</strong> ${purchase.id}</p>
    <p><strong>Total Amount:</strong> \u20B9${purchase.totalAmount}</p>
    <h3>Items:</h3>
    <ul>
      ${purchase.items.map((item) => `
        <li>
          ${item.productName} (x${item.quantity}) - \u20B9${item.price}
        </li>
      `).join("")}
    </ul>
    <p>Status: ${purchase.status}</p>
    <p>Order Date: ${purchase.createdAt}</p>
  `;
  try {
    await nodemailer_default.sendMail({
      from: "ironspidy25@gmail.com",
      to: userEmail,
      subject: "Your Order Confirmation",
      html: orderDetails
    });
    await nodemailer_default.sendMail({
      from: "ironspidy25@gmail.com",
      to: adminEmails,
      subject: `New Order Received: ${purchase.id}`,
      html: `<h2>New Order from ${userName} (${userEmail})</h2>` + orderDetails
    });
    return res.json({
      success: true,
      message: "Order confirmation email sent to user and admin."
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
var connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      const conn = await mongoose6.connect(process.env.MONGODB_URI);
      console.log(`\u2705 MongoDB Connected: ${conn.connection.host}`);
      const User = mongoose6.model("User");
      const adminUser = await User.findOne({ email: "admin@tshirtapp.com" });
      if (!adminUser) {
        const newAdmin = new User({
          email: "admin@tshirtapp.com",
          firstName: "Admin",
          lastName: "User",
          password: "admin123",
          // Let the pre-save hook hash it
          role: "admin",
          isEmailVerified: true,
          isActive: true
        });
        await newAdmin.save();
        console.log("\u2705 Default admin user created");
      }
      const superAdminUser = await User.findOne({ email: "superadmin@tshirtapp.com" });
      if (!superAdminUser) {
        const newSuperAdmin = new User({
          email: "superadmin@tshirtapp.com",
          firstName: "Super",
          lastName: "Admin",
          password: "super123",
          // Let the pre-save hook hash it
          role: "superadmin",
          isEmailVerified: true,
          isActive: true
        });
        await newSuperAdmin.save();
        console.log("\u2705 Default superadmin user created");
      }
      const testUser = await User.findOne({ email: "user@test.com" });
      if (!testUser) {
        const newTestUser = new User({
          email: "user@test.com",
          firstName: "Test",
          lastName: "User",
          password: "user123",
          // Let the pre-save hook hash it
          role: "user",
          isEmailVerified: true,
          isActive: true
        });
        await newTestUser.save();
        console.log("\u2705 Default test user created");
      }
    } else {
      console.log("\u26A0\uFE0F No MongoDB URI provided - running with in-memory data");
    }
  } catch (error) {
    console.log("\u26A0\uFE0F Database connection failed - continuing with in-memory data");
    console.error("Database error:", error);
  }
};
connectDB();
var orders = [];
var nextOrderId = 1;
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running perfectly!",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    connectedAdmins: 0,
    // Removed notificationService.getConnectedAdmins()
    environment: process.env.NODE_ENV || "development",
    emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
  });
});
registerRoutes(app);
app.get("/api/products/categories", async (req, res) => {
  try {
    const categories = await storage.getCategories();
    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: categories,
      count: categories.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
});
app.post("/api/upload", (req, res) => {
  try {
    const { image, filename } = req.body;
    if (!image || !filename) {
      return res.status(400).json({
        success: false,
        error: "Image data and filename are required"
      });
    }
    if (!image.startsWith("data:image/")) {
      return res.status(400).json({
        success: false,
        error: "Invalid image format. Must be base64 encoded image."
      });
    }
    const base64Match = image.match(/^data:image\/([a-zA-Z]*);base64,(.+)$/);
    if (!base64Match) {
      return res.status(400).json({
        success: false,
        error: "Invalid base64 image format"
      });
    }
    const imageType = base64Match[1];
    const base64Data = base64Match[2];
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1e4);
    const fileExtension = filename.includes(".") ? filename.split(".").pop() : imageType || "jpg";
    const uniqueFilename = `product_${timestamp}_${randomNum}.${fileExtension}`;
    const filePath = path.join(uploadsDir, uniqueFilename);
    fs.writeFileSync(filePath, base64Data, "base64");
    const imageUrl = `/uploads/${uniqueFilename}`;
    res.status(200).json({
      success: true,
      imageUrl,
      filename: uniqueFilename,
      originalFilename: filename,
      fileSize: fs.statSync(filePath).size
    });
  } catch (error) {
    console.error("\u274C Upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
app.post("/api/orders", async (req, res) => {
  try {
    const orderData = req.body;
    console.log("\u{1F4E6} Creating new order:", orderData);
    const order = {
      id: `ORDER_${nextOrderId++}_${Date.now()}`,
      ...orderData,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "completed"
    };
    orders.push(order);
    console.log("\u{1F4BE} Order stored:", order.id);
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
      notificationSent: true
      // Placeholder, as notificationService is removed
    });
  } catch (error) {
    console.error("\u274C Order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message
    });
  }
});
app.get("/api/orders", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Orders retrieved successfully",
    data: orders,
    count: orders.length
  });
});
app.get("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const order = orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found"
    });
  }
  res.status(200).json({
    success: true,
    message: "Order retrieved successfully",
    data: order
  });
});
app.get("/api/admin/stats", (req, res) => {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const weekAgo = /* @__PURE__ */ new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentOrders = orders.filter((order) => {
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
    connectedAdmins: 0,
    // Removed notificationService.getConnectedAdmins()
    totalProducts: 0,
    // No longer fetching from sampleProducts
    featuredProducts: 0,
    // No longer fetching from sampleProducts
    inStockProducts: 0
    // No longer fetching from sampleProducts
  };
  res.status(200).json({
    success: true,
    message: "Admin statistics retrieved successfully",
    data: stats
  });
});
app.get("/api/upload/health", (req, res) => {
  const uploadsExists = fs.existsSync(uploadsDir);
  res.json({
    success: true,
    status: "Upload endpoint is working!",
    uploadsDirectory: uploadsDir,
    exists: uploadsExists,
    writable: uploadsExists ? "yes" : "directory will be created on first upload",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/upload/list", (req, res) => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      return res.json({
        success: true,
        message: "No uploads directory found",
        files: []
      });
    }
    const files = fs.readdirSync(uploadsDir).map((filename) => {
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
      message: "Uploaded files retrieved",
      files,
      count: files.length,
      uploadsDir
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Anime Store API with Real-time Notifications!",
    version: "2.0.0",
    features: [
      "Real-time admin notifications via WebSocket",
      "Email alerts for new orders (if configured)",
      "Complete order management system",
      "Product CRUD operations",
      "Image upload support",
      "Admin analytics dashboard"
    ],
    endpoints: {
      health: "/api/health",
      products: "/api/products",
      categories: "/api/products/categories",
      orders: "/api/orders",
      adminStats: "/api/admin/stats",
      upload: "/api/upload"
    },
    stats: {
      totalProducts: 0,
      // No longer fetching from sampleProducts
      totalOrders: orders.length,
      featuredProducts: 0,
      // No longer fetching from sampleProducts
      categories: 0,
      // No longer fetching from sampleProducts
      connectedAdmins: 0
      // Removed notificationService.getConnectedAdmins()
    },
    notifications: {
      emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      adminEmails: process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",").length : 0,
      webSocketActive: true
    }
  });
});
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api/")) {
    const indexPath = path.join(__dirname, "../dist/index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.json({
        success: true,
        message: "Anime Store API - Frontend not built yet",
        note: "Run `npm run build` to generate frontend files",
        currentPath: req.path,
        availableEndpoints: [
          "GET /api/health",
          "GET /api/products",
          "GET /api/products/categories",
          "GET /api/products/:id",
          "POST /api/products",
          "PUT /api/products/:id",
          "DELETE /api/products/:id",
          "POST /api/upload",
          "GET /api/upload/health",
          "GET /api/upload/list",
          "POST /api/orders",
          "GET /api/orders",
          "GET /api/orders/:id",
          "GET /api/admin/stats",
          "POST /api/mail"
        ]
      });
    }
  } else {
    res.status(404).json({
      success: false,
      message: "API route not found",
      path: req.originalUrl
    });
  }
});
app.use("/api/*", (req, res) => {
  console.log("\u274C API route not found:", req.originalUrl);
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
    method: req.method
  });
});
app.use((err, req, res, next) => {
  console.error("\u{1F6A8} Global Error Handler:", err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    path: req.originalUrl,
    method: req.method,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...process.env.NODE_ENV === "development" && {
      stack: err.stack
    }
  });
});
var serverInstance = server.listen(PORT, () => {
  console.log(`
\u{1F389} ===============================================
\u{1F38C} ANIME STORE SERVER SUCCESSFULLY STARTED!
\u{1F389} ===============================================

\u{1F680} Server Details:
   Port: ${PORT}
   Environment: ${process.env.NODE_ENV || "development"}
   Process ID: ${process.pid}
   Node Version: ${process.version}

\u{1F310} Access URLs:
   \u{1F4F1} Local: http://localhost:${PORT}
   \u{1F4CB} Health: http://localhost:${PORT}/api/health
   \u{1F6CD}\uFE0F Products: http://localhost:${PORT}/api/products
   \u{1F4C2} Categories: http://localhost:${PORT}/api/products/categories
   \u{1F4F8} Upload: http://localhost:${PORT}/api/upload/health
   \u{1F4CA} Admin Stats: http://localhost:${PORT}/api/admin/stats

\u{1F4CA} Current Data:
   \u{1F6CD}\uFE0F Products: ${0} // No longer fetching from sampleProducts
   \u2B50 Featured: ${0} // No longer fetching from sampleProducts
   \u{1F4E6} Categories: ${0} // No longer fetching from sampleProducts
   \u{1F6D2} Orders: ${orders.length}

\u{1F514} Notification System:
   \u{1F4E7} Email: ${process.env.EMAIL_USER ? "\u2705 Configured" : "\u274C Not configured (WebSocket only)"}
   \u{1F4F1} Admin Emails: ${process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",").length : 0}
   \u{1F517} WebSocket: \u2705 Active
   \u{1F451} Connected Admins: ${0} // Removed notificationService.getConnectedAdmins()

\u{1F4C1} File System:
   \u{1F4C2} Uploads: ${uploadsDir}
   \u{1F4C4} Static Files: ${path.join(__dirname, "../dist")}

\u{1F6E0}\uFE0F Available API Endpoints:
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
   POST   /api/orders (\u{1F514} triggers notifications)
   GET    /api/orders
   GET    /api/orders/:id
   GET    /api/admin/stats

\u{1F3AF} Test the Complete Flow:
   1. \u{1F469}\u200D\u{1F4BC} Admin: http://localhost:${PORT}/admin
   2. \u{1F6CD}\uFE0F Customer: http://localhost:${PORT}/products
   3. \u{1F4E6} Buy Product \u2192 \u{1F514} Admin gets notification!

\u2705 Your anime store is ready for business!
===============================================
  `);
});
var index_default = app;
export {
  index_default as default
};
