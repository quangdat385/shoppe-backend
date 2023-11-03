const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserCart = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "products"
  },
  userId: {
    type: Number,
    required: true,
    ref: "users"
  },
  quantity: {
    type: Number,
    require
  },
  status: {
    type: Number,
    require
  }

}, {
  timestamps: true,
});




module.exports = mongoose.model("usercart", UserCart)