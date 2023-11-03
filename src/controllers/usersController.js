const Users = require('../models/Users')
const Product = require('../models/Product');
const bcrypt = require('bcrypt')
const fs = require('fs');
const path = require('path');
const { error } = require('console');
const mongoose = require('mongoose');



class UsersController {
  // get api/users
  show(req, res, next) {
    Users.find({}).select('-password').lean()
      .then(users => {
        if (users.length) {
          console.log(req.cookies)
          res.status(200).json(users)
        } else {
          res.status(400).json({ message: "users not found" })
        }

      })
      .catch(next)
  }
  // get api/users/:id
  getUser(req, res, next) {
    Users.findById(req.params.id).select('-password').lean()
      .then(user => {
        if (user) {
          res.status(200).json(user)
        } else {
          res.status(400).json({ message: "users not found" })
        }

      })
      .catch(next)
  }
  // get api/user/show/delete
  showDeleted(req, res, next) {
    Users.findDeleted({}).select('-password').lean()
      .then(users => {
        if (users.length) {
          res.status(200).json(users)
        } else {
          res.status(401).json({ message: "user not found" })
        }
      })
      .catch(next)
  }
  //post api/user/create
  async create(req, res) {
    const { user_name, password, roles } = req.body;
    //confirm data;
    if (!user_name || !password || !roles) {
      return res.status(400).json({ message: "All field are required" });
    };
    //check for duplicate user_name and password
    const duplicate = await Users.findOne({ user_name: user_name }).collation({ locale: 'en', strength: 2 }).lean().exec();
    if (duplicate) {
      return res.status(401).json({ message: 'Duplicate username' });
    };
    //Hash password;
    const hashedPwd = await bcrypt.hash(password, 10)//salt rounds;


    //create and store new user

    const user = await Users.create({
      isVerified: true,
      user_name,
      roles: (!Array.isArray(roles) || !roles.length) ? ["USER"] : roles,
      name_shop: `auto_gen_${require('crypto').randomBytes(10).toString('hex')}`,
      password: hashedPwd,
    })

    if (user) {
      res.status(201).json({ message: `New user ${user_name} created` })
    } else {
      res.status(400).json({ message: 'Invalid user data received' })
    }

  }
  //patch user/update
  async updateManager(req, res, next) {
    const { id, avatar, user_name, email, phone_number, birthday, gender, full_name, name_shop } = req.body;
    if (!id || !user_name) {
      return res.status(400).json({ message: "All fields are require" });
    };
    //duplicate 


    const dup_email = email ? await Users.findOne({ email }).collation({ locale: 'en', strength: 2 }).lean().exec() : null;
    const dup_phone = phone_number ? await Users.findOne({ phone_number: phone_number }).collation({ locale: 'en', strength: 2 }).lean().exec() : null;

    const dup_username = user_name ? await Users.findOne({ user_name }).collation({ locale: 'en', strength: 2 }).lean().exec() : null;

    const dup_nameshop = name_shop ? await Users.findOne({ name_shop }).collation({ locale: 'en', strength: 2 }).lean().exec() : null;

    const user = await Users.findById(id).select('-password');
    if (!user) {
      res.status(404).json({ message: "Unauthorized" });
    };

    if (dup_phone && dup_phone._id.toString() !== id) {
      return res.status(401).json({ message: "Duplicate phone" });
    };
    if (dup_email && dup_email._id.toString() !== user._id) {

      return res.status(401).json({ message: "Duplicate email" });
    };
    if (dup_username && dup_username._id.toString() != user._id) {
      return res.status(401).json({ message: "Duplicate user name" });
    };
    if (dup_nameshop && dup_nameshop._id.toString() != user._id) {
      return res.status(401).json({ message: "Duplicate name shop" });
    };



    await user.updateOne(req.body);
    const result = await user.save()
    if (result) {
      res.status(200).json({ message: "user updated successfully" });
    } else {
      res.status(404).json({ message: "Error updating" });
    }

  }
  //check phone_number
  async updatePhoneNumber(req, res) {
    const { id, phone_number } = req.body;
    if (!id || !phone_number) {
      res.status(400).json({ message: "All fields are required" })
    }

    const dup_phone = await Users.findOne({ phone_number });

    const user = await Users.findById(id).select('-password');

    if (!user) {
      res.status(401).json({ message: "Unauthorized" })
    };

    if (dup_phone && dup_phone._id !== user._id) {
      return res.status(403).json({ message: "Duplicate phone" })
    };
    await user.updateOne(req.body);
    const result = await user.save()
    if (result) {
      res.status(200).json({ message: "user updated successfully" })
    } else {
      res.status(404).json({ message: "Error updating" })
    }
  }
  //update email
  async updateEmail(req, res) {
    const { id, email } = req.body;
    if (!id || !email) {
      res.status(400).json({ message: "All fields are required" })
    }

    const dup_mail = await Users.findOne({ email });

    const user = await Users.findById(id).select('-password');

    if (!user) {
      res.status(401).json({ message: "Unauthorized" })
    };

    if (dup_mail && dup_mail._id !== user._id) {
      return res.status(403).json({ message: "Duplicate email" })
    };
    await user.updateOne(req.body);
    const result = await user.save()
    if (result) {
      res.status(200).json({ message: "user updated successfully" })
    } else {
      res.status(404).json({ message: "Error updating" })
    }
  }
  //remove address
  async removeAddress(req, res) {
    const { id, addressId } = req.body;

    if (!id || !addressId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await Users.findById(id).select('-password');

    if (!user) {
      res.status(401).json({ message: "Unauthorized" })
    }


    user.address.pull(addressId);
    await user.save();
    res.status(200).json({ message: "deleted Address successfully" })
  }
  //create address
  async addAddress(req, res) {
    const { id, address } = req.body;

    if (!id || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await Users.findById(id).select('-password');

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
    }
    user.address.push({ ...address })


    await user.save(async err => {
      if (err) {
        res.status(404).json({ message: err.message })
      }
      if (user.address[user.address.length - 1].deFault = true) {
        let term = user.address[user.address.length - 1]._id
        user.address.map(item => {
          if (item._id === term) {
            return item;
          }
          item.deFault = false;
          return item
        })
      }
      await user.save()
      res.status(200).json({ message: "Added Address successfully" });

    });

  }
  //update address 
  async updateAddress(req, res) {
    const { id, addressId, address } = req.body;
    if (!id && !addressId) {
      return res.status(400).json({ message: 'All fields are required' })
    };
    console.log(id, addressId);
    const user = await Users.findById(id).select('-password');

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
    };

    let result = user.address.map(item => {
      if (item._id.toString() === addressId) {
        item = { ...item, ...address }
        return item
      }
      item.deFault = false
      return item
    })
    user.address = result;
    user.save(async (err) => {
      if (err) {
        res.status(404).json({ message: error })
      }
      await user.save();
      res.status(200).json({ success: true });
    });
  }

  //patch user/:id/update
  async updateUser(req, res) {
    console.log(req.file)
    const { id, user_name } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    let userName = null;
    if (user_name) {
      userName = await Users.findOne({ user_name });
    }



    const user = await Users.findById(id).select('-password');



    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
    };

    if (userName && userName._id !== user._id) {
      return res.status(403).json({ message: "Duplicate user_name" });
    };
    await user.updateOne({ ...req.body });
    user.save(async (err, user) => {
      if (err) {
        res.status(404).json({ message: "Error updating" });
      }
      if (userName !== null) {
        user.isUserName = true
      }
      await user.save();
      res.status(200).json({ message: "user updated successfully" });
    })
  }
  async updateAvatar(req, res, next) {
    if (req.fileValidationError) {

      return res.send(req.fileValidationError);
    } else if (!req.file) {
      return res.send('Please select an image to upload');
    }

    const { id } = req.params;


    if (!id) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const user = await Users.findById(id).select('-password');

    if (!user) {
      res.status(404).json({ message: "Unauthorized" })
    };

    if (user.avatar.length > 0 && fs.existsSync(path.join(__dirname, '..', `public/img/avatar/${user.avatar[0]}`))) {
      fs.unlinkSync(user.avatar[1])
    }

    const avatar = [req.file.filename,
    `./src/public/img/avatar/${req.file.filename}`]
    user.avatar = avatar;
    const result = await user.save()
    if (result) {
      res.status(200).json({ message: "user updated successfully" })
    } else {
      res.status(404).json({ message: "Error updating" })
    }
  }
  //put user/:id/change/password
  async changePassworded(req, res, next) {
    const { password } = req.body
    const hashedPwd = await bcrypt.hash(password, 10)
    Users.findByIdAndUpdate({ _id: req.params.id }, { password: hashedPwd })
      .then(() => { res.status(200).json({ message: "Password changed successfully" }) })
      .catch(() => res.status(500).json({ message: "Error updating" }))
  }
  // delete /:id/soft/delete
  async softDelete(req, res) {
    console.log(req.params.id)
    const user = await Users.findById({ _id: req.params.id }).exec();
    console.log(user)
    if (!user) return res.status(401).json({ message: "User not found" });

    const product = await Product.findOne({ user: req.params.id }).exec();
    console.log(product)


    if (product) {
      product.user = 1;

      await product.save()
      await user.delete()
      res.status(200).json({ message: "User deleted successfully" })
    } else {
      await user.delete()
      res.status(200).json({ message: "User deleted successfully" })
    }
  }
  //delete /:id/delete
  async delete(req, res) {
    const user = await Users.findById({ _id: req.params.id }).exec();
    if (!user) return res.status(401).json({ message: "User not found" });

    const product = await Product.findOne({ user: req.params.id }).exec();
    if (product) {
      product.user = 1;
      await product.save();
      await user.deleteOne();
      res.status(200).json({ message: "User deleted forever successfully" });
    } else {
      await user.deleteOne();
      res.status(200).json({ message: "User deleted forever successfully" });
    };

  }
  //put /:id/restore
  restore(req, res, next) {
    Users.restore({ _id: req.params.id })
      .then(() => res.status(200).json({ message: "User is got back successfully" }))
      .catch(next)
  }
}

module.exports = new UsersController