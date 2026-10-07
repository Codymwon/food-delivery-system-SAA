const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    deliveryId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    partnerName: {
      type: String,
      default: 'Ramesh Kumar',
      trim: true,
    },
    partnerPhone: {
      type: String,
      default: '+91 98765 43210',
      trim: true,
    },
    status: {
      type: String,
      enum: ['ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'],
      default: 'ASSIGNED',
    },
    etaMinutes: {
      type: Number,
      default: 25,
    },
    currentLocation: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ text: 'Assigned partner heading to restaurant' }),
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Delivery', deliverySchema);
