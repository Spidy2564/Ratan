import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const router = express.Router();

// Helper function to generate JWT token
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { id: userId, email, role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// Google OAuth setup
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ provider: 'google', providerId: profile.id });
    if (!user) {
      // Create new user
      user = new User({
        provider: 'google',
        providerId: profile.id,
        email: profile.emails[0].value,
        firstName: profile.name.givenName || '',
        lastName: profile.name.familyName || '',
        isEmailVerified: true,
        avatar: profile.photos[0]?.value,
      });
      await user.save();
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// Google OAuth login route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback route
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/' }), (req, res) => {
  // Issue JWT and redirect to frontend with token
  const user = req.user;
  const token = generateToken(user._id, user.email, user.role);
  // You can also send refreshToken if needed
  // Redirect to frontend with token (e.g. /auth/callback?token=...)
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, agreeToTerms } = req.body;

    if (!agreeToTerms) {
      return res.status(400).json({
        success: false,
        message: 'You must agree to the terms and conditions.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.',
      });
    }

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // In a real app, you would send verification email here
    console.log(`Verification email would be sent to: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration.',
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = user.generateTokens();
    
    // Save refresh token
    user.refreshTokens.push(refreshToken);
    user.lastLoginAt = new Date();
    await user.save();

    // Remove sensitive data
    user.password = undefined;
    user.refreshTokens = undefined;

    res.json({
      success: true,
      message: 'Login successful!',
      user,
      token: accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login.',
    });
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message: 'If a user with that email exists, a reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // In a real app, you would send reset email here
    console.log(`Password reset requested for: ${email}`);

    res.json({
      success: true,
      message: 'If a user with that email exists, a reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset.',
    });
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findOne({
        _id: decoded.id,
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token.',
        });
      }

      // Update password
      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.refreshTokens = []; // Logout from all devices
      await user.save();

      res.json({
        success: true,
        message: 'Password reset successful.',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token.',
      });
    }
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset.',
    });
  }
});

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findOne({
        _id: decoded.id,
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token.',
        });
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      res.json({
        success: true,
        message: 'Email verified successfully.',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token.',
      });
    }
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification.',
    });
  }
});

// @desc    Verify token
// @route   GET /api/auth/verify
// @access  Private
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }

    // Remove sensitive data
    user.password = undefined;
    user.refreshTokens = undefined;

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
  }
});

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.id);
        
        if (user) {
          // Remove all refresh tokens for this user (logout from all devices)
          user.refreshTokens = [];
          await user.save();
        }
      } catch (error) {
        console.error('Token verification error during logout:', error);
      }
    }

    res.json({
      success: true,
      message: 'Logout successful.',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout.',
    });
  }
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required.',
      });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret');
      const user = await User.findById(decoded.id);

      if (!user || !user.refreshTokens.includes(refreshToken)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token.',
        });
      }

      // Generate new tokens
      const tokens = user.generateTokens();
      
      // Replace old refresh token with new one
      user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
      user.refreshTokens.push(tokens.refreshToken);
      await user.save();

      res.json({
        success: true,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token.',
      });
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token refresh.',
    });
  }
});

export default router;