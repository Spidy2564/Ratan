import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
    productId: {
      type: String,
      required: true,
    },
    productName: String,
    price: Number,
    quantity: Number,
    size: String,
    color: String,
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'completed'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'stripe', 'paypal', 'cod'],
    required: true,
  },
  paymentId: String, // Transaction ID from payment gateway
  shippingAddress: {
    name: String,
    email: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  orderNotes: String,
  trackingNumber: String,
  estimatedDelivery: Date,
  deliveredAt: Date,
}, {
  timestamps: true,
});

// Add indexes for better query performance
purchaseSchema.index({ userId: 1, createdAt: -1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ paymentId: 1 });

export default mongoose.model('Purchase', purchaseSchema);
