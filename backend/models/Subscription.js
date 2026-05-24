const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['artist', 'pro', 'label'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'expired', 'pending'],
    default: 'pending'
  },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  stripeInvoiceId: String,
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  renewalDate: {
    type: Date
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  uploads: {
    used: {
      type: Number,
      default: 0
    },
    limit: {
      type: Number,
      required: true
      // Artist: 5, Pro: unlimited, Label: unlimited
    }
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal'],
    default: 'credit_card'
  },
  features: [String],
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'yearly'
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

// Update the updatedAt field before saving
subscriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
