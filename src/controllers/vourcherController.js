const Proucts = require('../models/Product');
const Users = require('../models/Users');
const Vourchers = require('../models/Vourcher')

class VoucherConTroller {
  async getVoucher(req, res) {
    const { type } = req.query;

    const result = await Vourchers.find({ type_of_vourcher: type }).lean().exec()
    if (!result) {
      return res.status(404).json({ message: "Not Found Any Vourcher" })
    }

    res.status(200).json(result)
  }
  async createVoucher(req, res) {
    const { user, type_of_vourcher, day_from, day_to, type_of_save, sale_off, minimum_order } = req.body;

    console.log(req.body)

    if (!user || !type_of_vourcher || !day_from || !day_to || !type_of_save || !sale_off || !minimum_order) {
      res.status(400).send({ message: "All Field Are Required'" })
    }
    const find_user = await Users.findById(user).lean().exec();

    if (!find_user) {
      res.status(404).send({ message: "User Not Found" })
    }

    const result = await Vourchers.create({ ...req.body });
    await result.save(err => {
      if (err) {
        res.status(400).send({ message: "Not Created" })
      }
      res.status(200).json({ message: "Create Successfully" })
    })



  }
}



module.exports = new VoucherConTroller();