const purchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
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
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
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

module.exports = mongoose.model('Purchase', purchaseSchema);
