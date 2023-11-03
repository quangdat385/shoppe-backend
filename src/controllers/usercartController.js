const UserCart = require('../models/Usercart');
const Users = require('../models/Users');
const Product = require('../models/Product');


// @desc Get all product purchased by user
// @route GET /usercart
// @access Private
const show = async (req, res) => {
  const usercart = await UserCart.find({}).lean().exec();
  if (!usercart) {
    res.status(404).json({ message: "Cart is empty" });
  }
  const productWithUser = await Promise.all(usercart.map(async (cart) => {
    const user = await Users.findById(cart.user).lean().exec();
    const product = await Product.findById(cart.product).lean().exec();
    return {
      ...cart,
      user_name: user.user_name,
      product_title: product.title,
    }

  }))
  res.status(200).json(productWithUser)

};
// @desc Get all product purchased by one user
// @route GET /usercart/user
// @access Private
const getUserCart = async (req, res) => {
  const userId = Number(req.user)
  const status = Number(req.query.status)
  const match = status === 0 ? { userId: userId } : {
    userId: userId,
    status: Number(status)
  }

  const usercart = await UserCart
    .aggregate([
      {
        $match: match
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: {
          path: '$product'
        }
      },
      {
        $addFields: {
          product_title: '$product.title',
          img: '$product.img_product',
          price: '$product.price',
          sale_off: '$product.sale_off',
          productId: '$product._id',
          quality: '$product.quality',
        }
      },
      {
        $project: {
          product: 0
        }
      }
    ])
    .exec();
  if (!usercart) {
    res.status(404).json({ message: "Cart is empty" });
  }

  res.status(200).json(usercart);

};

// @desc Get all product purchased by user with status waiting
// @route GET /usercart/soft
// @access Private
const softShow = async (req, res) => {
  const usercart = await UserCart.findDeleted({}).lean().exec();
  if (!usercart) {
    res.status(404).json({ message: "Cart is empty" });
  }
  const productWithUser = await Promise.all(usercart.map(async (cart) => {
    const user = await Users.findById(cart.user).lean().exec();
    const product = await Product.findById(cart.product).lean().exec();
    return {
      ...cart,
      user_name: user.user_name,
      product_title: product.title,
    }

  }))
  res.status(200).json(productWithUser)

};
// @desc post purchase product
// @route POST /purchase
// @access Private
const purchase = async (req, res) => {
  const { productId, userId, quantity, status } = req.body;


  if (!productId || !userId || !quantity || !status) {
    return res.status(400).json({ message: "All fields are required" });
  };

  const dup_user = await Users.findById(userId).exec();
  const dup_product = await Product.findById(productId).exec();

  if (!dup_user || !dup_product) {
    return res.status(404).json({ message: "Data Resources Not Found" });

  };
  if (dup_product && dup_product?.quality < 0) {
    return res.status(409).json({ message: "Product sold out" });
  };

  const usercart = await UserCart.create({ ...req.body });

  await usercart.save(err => {
    if (err) {
      return res.status(404).json({ message: "Invalid Product data received" });
    }
    return res.status(200).json({ message: "Product added into cart successfully" })
  })


};
// @desc update usercart
// @route POST /:id/update
// @access Private
const updateCart = async (req, res) => {
  const { id, product, user, quantity } = req.body;

  if (!id || !product || !user || !quantity) {
    return res.status(400).json({ message: "All fields are required" })
  };

  const dup_user = await Users.findById(user).lean().exec();
  const dup_product = await Product.findById(product).lean().exec();

  const usercart = await UserCart.findById(id).exec();

  if (!usercart) {
    return res.status(400).json({ message: "Cart Not Found" })
  };
  if (!dup_user || !dup_product) {
    return res.status(404).json({ message: "Data Resources Not Found" });
  };

  if (dup_product && dup_product?.quality < 0) {
    return res.status(409).json({ message: "Product sold out" })
  };
  await usercart.updateOne({ quantity: quantity });
  await usercart.save(err => {
    if (err) {
      return res.status(404).json({ message: err })
    }
    res.status(200).json({ message: "Cart Updated Successfully" });
  })


};

// @desc update usercart
// @route POST /:id/update
// @access Private
const updateManiCart = async (req, res) => {
  const { listOfOrder, status } = req.body;
  console.log(Boolean(listOfOrder));

  if (!listOfOrder || !status) {
    return res.status(400).json({ message: "All fields are required" })
  }

  if (listOfOrder.length < 0) {
    return res.status(200).json({ message: "Nothing Update" })
  }
  const ids = listOfOrder.map(item => item.id);
  const result = await UserCart.updateMany({ _id: { $in: ids } }, { status: status });
  await result.save(err => {
    if (err) {
      return res.status(404).json({ message: err })
    }
    res.status(200).json({ message: "Cart Updated Successfully" });
  })


};



// @desc restore usercart
// @route delete /:id/restore
// @access Private
const restore = async (req, res) => {
  const { id, product, user } = req.body;

  if (!id || product || user) {
    return res.status(400).json({ message: "All fields are required" })
  };

  const dup_user = await Users.findById({ user }).lean().exec();
  const dup_product = await Users.findById({ user }).lean().exec();

  const usercart = await UserCart.findById(id).exec();

  if (!usercart) {
    return res.status(400).json({ message: "Cart Not Found" })
  };
  if (!dup_user || !dup_product) {
    return res.status(404).json({ message: "Data Resources Not Found" });
  };
  await usercart.restore();

  res.status(200).json({ message: "Oder Product is Confirm" })
}

// @desc delete usercart
// @route delete /:id/delete
// @access Private

const deleteOne = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.status(400).json({ message: "All fields are required" });
  };
  const usercart = await UserCart.findById(id).exec();

  const result = await usercart.deleteOne();

  if (result) {
    res.status(200).json({ message: "Oder deleted" })
  }

};
// @desc delete Many usercart
// @route delete /delete
// @access Private
const deleteMany = async (req, res) => {
  const { ids } = req.body;
  console.log(ids);
  if (!ids) {
    res.status(404).json({ message: "All fields are required" })
  };
  const result = await UserCart.deleteMany({ _id: { $in: [...ids] } }).exec();

  if (!result) {
    res.status(400).json({ message: "deleted not success" })
  }
  res.status(200).json({ message: "Oders deleted" })
}
module.exports = {
  show,
  getUserCart,
  softShow,
  purchase,
  updateCart,
  updateManiCart,
  deleteOne,
  restore,
  deleteMany,
}