import express from 'express';
import Purchase from '../models/Purchase.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Create a new purchase
// @route   POST /api/purchases
// @access  Private
router.post('/', protect, async (req, res) => {

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
                message: 'Items are required'
            });
        }

        if (!totalAmount || totalAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid total amount is required'
            });
        }

        if (!paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Payment method is required'
            });
        }

        // Create purchase object
        const purchaseData = {
            userId: req.user._id,
            items: items.map(item => ({
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
            orderNotes: orderNotes || '',
            status: 'pending'
        };

        const purchase = new Purchase(purchaseData);
        await purchase.save();

        // Populate user details for response
        await purchase.populate('userId', 'firstName lastName email');

        res.status(201).json({
            success: true,
            message: 'Purchase created successfully',
            data: purchase
        });

    } catch (error) {
        console.error('Purchase creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during purchase creation'
        });
    }
});

// @desc    Get all purchases for a user
// @route   GET /api/purchases
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const purchases = await Purchase.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .populate('userId', 'firstName lastName email');

        res.json({
            success: true,
            message: 'Purchases retrieved successfully',
            data: purchases,
            count: purchases.length
        });

    } catch (error) {
        console.error('Get purchases error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving purchases'
        });
    }
});

// @desc    Get a specific purchase
// @route   GET /api/purchases/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const purchase = await Purchase.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).populate('userId', 'firstName lastName email');

        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: 'Purchase not found'
            });
        }

        res.json({
            success: true,
            message: 'Purchase retrieved successfully',
            data: purchase
        });

    } catch (error) {
        console.error('Get purchase error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving purchase'
        });
    }
});

// @desc    Update purchase status (admin only)
// @route   PUT /api/purchases/:id/status
// @access  Private (Admin)
router.put('/:id/status', protect, async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const purchase = await Purchase.findById(req.params.id);

        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: 'Purchase not found'
            });
        }

        // Check if user is admin or the purchase owner
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            if (purchase.userId.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to update this purchase'
                });
            }
        }

        purchase.status = status;

        // Update delivery date if status is delivered
        if (status === 'delivered') {
            purchase.deliveredAt = new Date();
        }

        await purchase.save();

        res.json({
            success: true,
            message: 'Purchase status updated successfully',
            data: purchase
        });

    } catch (error) {
        console.error('Update purchase status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating purchase status'
        });
    }
});

// @desc    Get all purchases (admin only)
// @route   GET /api/purchases/admin/all
// @access  Private (Admin)
router.get('/admin/all', protect, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view all purchases'
            });
        }

        const purchases = await Purchase.find()
            .sort({ createdAt: -1 })
            .populate('userId', 'firstName lastName email');

        res.json({
            success: true,
            message: 'All purchases retrieved successfully',
            data: purchases,
            count: purchases.length
        });

    } catch (error) {
        console.error('Get all purchases error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving all purchases'
        });
    }
});

// @desc    Test route to check authentication
// @route   GET /api/purchases/test
// @access  Private
router.get('/test', protect, async (req, res) => {
  res.json({
    success: true,
    message: 'Authentication working!',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

export default router; 