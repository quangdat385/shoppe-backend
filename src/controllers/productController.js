const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path');

const Delivery = require('../models/deliveryAgency')
const Product = require('../models/Product');
const Users = require('../models/Users');
const Rating = require('../models/RatingModel');
const loadfile = require('../middleware/loadFilemiddleware');
const DetailProducts = require('../models/ProductDetails');
const Catalory = require('../models/CataLoProduct');
const Vourcher = require('../models/Vourcher');
const countProduct = require("../middleware/vourcherCounting")


const collectionProduct = require('../middleware/colectionProduct');
const { Console } = require('console');
const omit = require('lodash/omit');


// @desc Get all product 
// @route GET /product/hot/search
// @access Private
const searchProduct = async (req, res) => {
  const { keyword, details } = req.query;


  const { more, menu, place, deliver, rangePrice, voucher, rate } = req.body;

  const { popular, price } = more;
  let sort
  if (popular !== "Liên Quan") {
    if (popular == "Mới Nhất") {
      sort = "numberical"
    } else {
      sort = "sold"
    }
  }


  const rgx = (pattern) => new RegExp(`.*${pattern}.*`);

  const findProperties = {};
  if (keyword && details === "false") {
    findProperties.title = { $regex: rgx(keyword), $options: 'si' }
  }

  const products = await Product
    .aggregate([
      {
        $match: { ...findProperties }
      }, {
        $lookup: {
          from: 'catalories',
          localField: 'cataloryId',
          foreignField: '_id',
          as: 'cata'
        }
      }, {
        $unwind: {
          path: '$cata'
        }
      }, {
        $lookup: {
          from: 'ratings',
          localField: 'rateId',
          foreignField: '_id',
          as: 'ratings'
        }
      }, {
        $unwind: {
          path: '$ratings'
        }
      }, {
        $lookup: {
          from: 'productdetails',
          localField: '_id',
          foreignField: 'productId',
          as: 'details'
        }
      }, {
        $unwind: {
          path: '$details'
        }
      }, {
        $lookup: {
          from: 'delivers',
          localField: 'details._id',
          foreignField: 'details_productId',
          as: 'delivery'
        }
      }, {
        $unwind: {
          path: '$delivery'
        }
      }, {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      }, {
        $unwind: {
          path: '$userInfo'
        }
      }, {
        $addFields: {
          type_of_product: '$cata.type_of_product',
          detail: '$cata.details',
          comefrom: '$details.comefrom',
          user_name: '$userInfo.user_name'
        }
      }, {
        $project: {
          cata: 0,
          details: 0,
          delivery: 0,
          userInfo: 0
        }
      }

    ])
    .sort({ [sort]: -1 })
    .exec();

  if (!products.length) {
    res.status(400).json({ message: 'Product not found' });

  }

  const listProductId = await countProduct(voucher);

  const productWithUser = products.map(product => {
    const term = {
      ...product,
      details: product.detail,
      rating: product.ratings.rating ? product.ratings.rating : 1,
      rate_details: [product.ratings.oneStar, product.ratings.twoStar, product.ratings.threeStar, product.ratings.fourStar, product.ratings.fiveStar],
      total_rate: product.ratings.totalStar,
    };
    term.ratings = {}
    return term
  })

  if (price !== "none") {
    if (price === "increase") {
      productWithUser.sort((a, b) => a.price * (1 - a.sale_off) - b.price * (1 - b.sale_off))
    } else {
      productWithUser.sort((a, b) => b.price * (1 - b.sale_off) - a.price * (1 - a.sale_off))
    }
  }


  if (details === "false") {
    let result;

    let term = productWithUser;
    if (menu && menu.length > 0) {
      console.log(menu)
      term.push(...productWithUser.filter(product => {
        return menu.includes(product.details)
      }))
    }
    result = term;
    if (place && place.length > 0) {
      result = term.filter(item => {
        return place.includes(item.comefrom)
      })

    }
    if (deliver && deliver.length > 0) {
      result = result.filter(item => {
        return deliver.includes(item.delivery)
      })
    }
    if (rangePrice) {
      result = result.filter(item => {
        return (item.price * (1 - item.sale_off) >= rangePrice.to &&
          item.price * (1 - item.sale_off) <= rangePrice.from
        )
      })
    }
    console.log("result :", result.length)
    if (rate) {
      result = result.filter(item => {
        return item.rating >= rate
      })
    }
    if (voucher && voucher.length > 0) {
      voucher.forEach(item => {
        if (item === "Hàng Có Sẵn") {
          result = result.filter(item => {
            return item.quality > 0
          })
        };
        if (item === "Đang Giảm Giá") {
          result = result.filter(item => {
            return item.sale_off > 0;
          })
        };
        if (item === "Mua giá bán buôn/ bán sỉ") {
          result = result.filter(item => {
            return item.whole_sale === true;
          })
        };

      })
    }
    if (listProductId.length > 0) {
      result = result.filter(item => {
        return listProductId.includes(item._id)
      })
    }
    res.status(200).json({
      products: Array.from(new Set(result)),
      history: { keyword, details, more, menu, place, rangePrice, deliver, voucher, rate }
    })

  } else {
    let result;

    let term = productWithUser.filter(product => {
      return product.details === keyword;
    })

    if (menu && menu.length > 0) {
      console.log(menu)
      term.push(...productWithUser.filter(product => {
        return menu.includes(product.details)
      }))
    }
    result = term;
    if (place && place.length > 0) {
      result = term.filter(item => {
        return place.includes(item.comefrom)
      })

    }
    if (deliver && deliver.length > 0) {
      result = result.filter(item => {
        return deliver.includes(item.delivery)
      })
    }
    if (rangePrice) {
      result = result.filter(item => {
        return (item.price * (1 - item.sale_off) >= rangePrice.to &&
          item.price * (1 - item.sale_off) <= rangePrice.from
        )
      })
    }
    if (rate) {
      result = result.filter(item => {
        return item.rating >= rate
      })
    }
    console.log("result :", result.length)
    if (voucher && voucher.length > 0) {
      voucher.forEach(item => {
        if (item === "Hàng Có Sẵn") {
          result = result.filter(item => {
            return item.quality > 0
          })
        };
        if (item === "Đang Giảm Giá") {
          result = result.filter(item => {
            return item.sale_off > 0;
          })
        };
        if (item === "Mua giá bán buôn/ bán sỉ") {
          result = result.filter(item => {
            return item.whole_sale === true;
          })
        };

      })
    }
    if (listProductId.length > 0) {

      result = result.filter(item => {

        return listProductId.includes(item._id.toString())
      })
    }
    res.status(200).json({
      products: Array.from(new Set(result)),
      history: { keyword, details, more, menu, place, rangePrice, deliver, voucher, rate }
    });
  }

}
const getSearchProducts = async (req, res) => {
  const { page, collection, price, order } = req.query;
  console.log(req.query)
  let sort;
  const listSort = {};
  if (order !== "Phổ Biến") {
    if (order == "Mới Nhất") {
      sort = "numberical"
    } else {
      sort = "sold"
    }
  }

  const products = await Product
    .aggregate([
      {
        $match: {}
      }, {
        $lookup: {
          from: 'catalories',
          localField: 'cataloryId',
          foreignField: '_id',
          as: 'cata'
        }
      }, {
        $unwind: {
          path: '$cata'
        }
      }, {
        $lookup: {
          from: 'ratings',
          localField: 'rateId',
          foreignField: '_id',
          as: 'ratings'
        }
      }, {
        $unwind: {
          path: '$ratings'
        }
      }, {
        $lookup: {
          from: 'productdetails',
          localField: '_id',
          foreignField: 'productId',
          as: 'details'
        }
      }, {
        $unwind: {
          path: '$details'
        }
      }, {
        $lookup: {
          from: 'delivers',
          localField: 'details._id',
          foreignField: 'details_productId',
          as: 'delivery'
        }
      }, {
        $unwind: {
          path: '$delivery'
        }
      }, {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      }, {
        $unwind: {
          path: '$userInfo'
        }
      }, {
        $addFields: {
          type_of_product: '$cata.type_of_product',
          detail: '$cata.details',
          comefrom: '$details.comefrom',
          user_name: '$userInfo.user_name'
        }
      }, {
        $project: {
          cata: 0,
          details: 0,
          delivery: 0,
          userInfo: 0
        }
      }

    ])
    .sort({ [sort]: -1 })
    .exec();
  if (!products.length) {
    return res.status(404).json({ message: "Product not found" })
  };
  if (price !== "none") {
    if (price === "increase") {
      products.sort((a, b) => a.price * (1 - a.sale_off) - b.price * (1 - b.sale_off));
    } else {
      products.sort((a, b) => b.price * (1 - b.sale_off) - a.price * (1 - a.sale_off));
    }
  };

  const results = products.map((product) => {
    const term = { ...product, details: product.detail, rating: product.ratings.rating ? product.ratings.rating : 1 };
    term.ratings = {}
    return term
  });
  const productWithUser = collectionProduct(collection, results);
  const perPage = 10;
  const productPage = productWithUser.slice(perPage * page, (perPage * page + perPage));
  let totalPages = Math.ceil(productWithUser.length / perPage);

  res.status(200).json({ data: productPage, totalPages });
}
const getAllProducts = async (req, res, next) => {
  const products = await Product
    .aggregate([
      {
        $match: {}
      }, {
        $lookup: {
          from: 'catalories',
          localField: 'cataloryId',
          foreignField: '_id',
          as: 'cata'
        }
      }, {
        $unwind: {
          path: '$cata'
        }
      }, {
        $lookup: {
          from: 'ratings',
          localField: 'rateId',
          foreignField: '_id',
          as: 'ratings'
        }
      }, {
        $unwind: {
          path: '$ratings'
        }
      }, {
        $lookup: {
          from: 'productdetails',
          localField: '_id',
          foreignField: 'productId',
          as: 'details'
        }
      }, {
        $unwind: {
          path: '$details'
        }
      }, {
        $lookup: {
          from: 'delivers',
          localField: 'details._id',
          foreignField: 'details_productId',
          as: 'delivery'
        }
      }, {
        $unwind: {
          path: '$delivery'
        }
      }, {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      }, {
        $unwind: {
          path: '$userInfo'
        }
      }, {
        $addFields: {
          type_of_product: '$cata.type_of_product',
          detail: '$cata.details',
          comefrom: '$details.comefrom',
          user_name: '$userInfo.user_name'
        }
      }, {
        $project: {
          cata: 0,
          details: 0,
          delivery: 0,
          userInfo: 0
        }
      }

    ])
    .exec();

  if (!products.length) {
    return res.status(404).json({ message: "Product not found" });
  };
  const productWithUser = products.map(product => {
    const term = {
      ...product,
      details: product.detail,
      rating: product.ratings.rating ? product.ratings.rating : 1,
      rate_details: [product.ratings.oneStar, product.ratings.twoStar, product.ratings.threeStar, product.ratings.fourStar, product.ratings.fiveStar],
      total_rate: product.ratings.totalStar,
    };
    term.ratings = {}
    return term
  })

  res.status(200).json(productWithUser)


}
// @desc Get soft deleted product
// @route GET /product
// @access Private

const getDeletedProduct = async (req, res) => {
  const products = await Product.findDeleted({}).lean();
  console.log(products)


  if (!products.length) {
    return res.status(404).json({ message: "Product not found" })
  };

  const productWithUser = await Promise.all(products.map(async (product) => {
    const user = await Users.findById(product.user).lean().exec()
    return { ...product, user_name: user.user_name }

  }))
  res.status(200).json(productWithUser)
}
// @desc post product 
// @route post /product/create
// @access Private

const createProduct = async (req, res) => {
  const { user, title, cataloryId } = req.body;
  //confirm data

  if (!user || !title || !cataloryId) {
    return res.status(400).json({ message: "All fields are required" })
  };
  //check for duplicate

  const duplicate = await Product.findOne({ title: title }).collation({ locale: 'en', strength: 2 }).lean().exec();
  const find_user = await Users.findById({ _id: user }).lean().exec();
  const catalory = await Catalory.findById(cataloryId).lean().exec();
  if (duplicate) {
    return res.status(409).json({ message: "Product duplicate" });
  }
  if (!find_user) {
    return res.status(404).json({ message: "Not Found User" })
  }
  if (!catalory) {
    return res.status(404).json({ message: "Catalory Not Found" })
  }
  const product = await Product.create({ ...req.body });
  product.save(async (err) => {
    if (err) return res.status(err.status).json({ message: err })
    console.log(product._id)

    const rating = new Rating({ productId: product._id });

    rating.save(async (err) => {
      if (err) return res.status(err.status).json({ message: err })
      product.rateId = rating._id;
      product.save()
      return res.status(201).json({ message: "Product created" })
    }
    );

  })
}
// @desc update product 
// @route post /product/:id/update
// @access Private
const updateProduct = async (req, res) => {
  const id = req.params.id
  const { user, title, ...rest } = req.body




  //confirm data 

  if (!id || !user || !title) {
    return res.status(400).json({ message: 'All fields are required' });
  };
  //confirm note exists to update product

  const product = await Product.findById(id).exec();
  const find_user = await Users.findById(user).exec();

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  };
  //check for duplicate title
  if (!find_user) {
    return res.status(404).json({ message: 'User not found' })
  }
  const duplicate = await Product.findOne({ title: title }).collation({ locale: 'en', strength: 2 }).lean().exec();

  //Allow renaming of the original title

  if (duplicate && duplicate._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate title" });
  }

  await product.updateOne({ ...rest, user_update: user, title: title });

  const result = await product.save()


  if (result) {
    return res.status(201).json({ message: "Product is updated" })
  } else {
    return res.status(400).json({ message: "Invalid Product data received" })
  }

}
const likesProduct = async (req, res) => {
  const { id, userId, likes } = req.body;


  if (!id || !userId || !likes) {
    return res.status(400).json({ message: 'All fields are required' });
  };

  const product = await Product.findById(id).exec();
  const users = await Users.findById(userId).exec();

  if (!product || !users) {
    return res.status(400).json({ message: 'Not Found Product Or User' });
  };
  console.log(users)

  product.save(async err => {
    if (err) {
      return res.status(500).json({ message: err.message })
    };
    let isUpdateUser = users.like_product.indexOf(product._id)
    if (isUpdateUser === -1) {
      if (likes > 0) {
        users.like_product.push(product._id);
        await users.save();
        product.likes += 1;
        await product.save();

      }

    } else {
      if (likes < 0) {
        let user_like = users.like_product;
        user_like.splice(isUpdateUser, 1);
        console.log(user_like)
        users.like_product = user_like;
        await users.save()
        product.likes -= 1;
        await product.save();

      }
    }
    res.status(200).json("Product Update Successfully")

  })


}
// @desc soft delete product 
// @route post /product/:id/soft/delete
// @access Private
const deleteProduct = async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ message: 'Product ID required' });
  }
  const product = await Product.findById(id).exec();
  if (!product) {
    res.status(400).json({ message: 'Product not found' });
  };

  const result = await product.delete();

  res.status(200).json({ message: ` Product ${result.title} deleted soft successfully` });
}
// @desc  delete product 
// @route post /product/:id/delete


// @access Private
const deleteForever = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ message: 'Product ID required' });
  }
  const product = await Product.findById(id).exec();
  if (!product) {
    res.status(400).json({ message: 'Product not found' });
  };
  const rating = await Rating.findOne({ productId: product.id }).exec();
  const details = await DetailProducts.findOne({ productId: product.id }).exec()
  if (rating) {
    await rating.deleteOne()
  }
  if (details) {
    await details.deleteOne()
  }

  const result = await product.deleteOne();

  res.status(200).json({ message: ` Product ${result.title} deleted  successfully` });



}
// @desc  restore product 
// @route post /product/:id/restore


// @access Private
const productRestore = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ message: 'Product ID required' });
  }
  const product = await Product.restore({ _id: id }).exec();
  if (!product) {
    res.status(400).json({ message: 'Product not found' });
  };

  res.status(200).json({ message: "Product is got back successfully" });
}
const postImg = async (req, res) => {

  const files = req.files;
  if (!files) {
    res.status(400).json({ message: 'All field are required' })
  }

  const result = files.map(file => {
    return [`${file.filename}`,
    `./src/public/img/${file.filename}`]
  })
  console.log(result)
  res.status(200).json({ data: result })
}
const postImgbyUrl = async (req, res) => {

  const { files } = req.body;

  if (!files) {
    res.status(400).json({ message: 'All field are required' })
  }
  const urls = files.map((file) => {
    const filename = file.split('/')
    const fileName = filename[filename.length - 1];
    loadfile(file, `imgProduct${fileName}`)
      .then(res => res).catch((err) => next(err));

    return [`imgProduct${fileName}`,
    `./src/public/img/imgProduct${fileName}`
    ];

  })
  setTimeout(() => {
    return res.status(200).json({ data: urls })
  }, 1000);



}
const testProduct = async (req, res) => {
  const { title } = req.body;
  console.log(title);

  if (!title) {
    res.status(404).json({ message: "All field are required" });
  }
  const duplicate = await Product.findOne({ title: title }).exec();


  if (!duplicate) {
    res.status(200).json({ message: "pass" })
  };
  res.status(404).json({ message: "Don't Pass" })
}
const updateMany = async (req, res) => {
  const { whole_sale } = req.body;

  const results = await Product.updateManyWithDeleted({ whole_sale: whole_sale }).exec();

  console.log(results)
  if (!results) {
    res.status(404).json({ message: "Updated Not Successfully" })
  }
  res.status(200).send({ message: "Updated Successfully" })


}
module.exports = {
  getAllProducts,
  getSearchProducts,
  searchProduct,
  getDeletedProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteForever,
  productRestore,
  postImg,
  postImgbyUrl,
  likesProduct,
  testProduct,
  updateMany
}