import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  productType: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  sellerContact: {
    type: String,
    required: true,
  },
  sellerName: {
    type: String,
    required: true,
  },
  sellerEmail: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model('Product', productSchema);

export default Product;