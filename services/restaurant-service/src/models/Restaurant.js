const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    cuisine: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    deliveryTimeMinutes: {
      type: Number,
      default: 30,
    },
    minOrder: {
      type: Number,
      default: 100,
    },
    bannerImage: {
      type: String,
      default: '',
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);
