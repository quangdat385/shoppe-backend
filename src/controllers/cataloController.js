const Users = require('../models/Users');
const Catalory = require('../models/CataLoProduct');
const Products = require('../models/Product');

class CataloProduct {
    async getCataloProduct(req, res, next) {

        console.log(req.headers.host, req.protocol);

        Catalory.find({})
            .then((catalory) => {
                if (catalory.length) {
                    catalory.map(async (item) => {
                        const products = await Products.find({ cataloryId: item._id }).exec();
                        if (products.length > 0) {
                            const productIds = products.map(product => product._id)
                            item.listProduct = productIds
                            await item.save()
                        }
                    })

                    res.status(200).json(catalory);

                } else {
                    res.status(400).json({ message: "catalory not found" })
                }
            })
            .catch(next)
    }
    async getSoftCataloProduct(req, res, next) {



        Catalory.findDeleted({}).lean()
            .then(catelory => {
                if (catelory.length) {

                    res.status(200).json(catelory)
                } else {
                    res.status(400).json({ message: "users not found" })
                }

            })
            .catch(next)
    }
    async createCataloProduct(req, res) {
        const { user, type_of_product } = req.body;
        if (!user || !type_of_product) {
            return res.status(400).json({ message: "All field are required" });
        };
        console.log(user, type_of_product);

        const User = await Users.findById(user).exec();
        if (!User) {
            return res.status(404).json({ message: "Data Resources Not Found" });
        }
        const catelory = await Catalory.create({ ...req.body });
        await catelory.save();
        if (catelory) {
            return res.status(201).json({ message: "Create Success" })
        } else {
            return res.status(400).json({ message: "Invalid data received" })
        }
    }
    async updateCataloProduct(req, res) {
        const { user, ...rest } = req.body
        const id = req.params.id;

        if (!id || !user) return res.status(400).json({ message: "All field are required" });
        const find_user = await Users.findById(user).lean().exec()
        const cata = await Catalory.findByIdAndUpdate(id, { ...rest, user_update: user }).exec();
        if (!find_user) return res.status(404).json({ message: "User Not Found" })

        if (!cata) return res.status(404).json({ message: "Don't update catalo product" });
        res.status(201).json({ message: "Update successfully" });
    }
    async deleteCataloProduct(req, res) {

        const id = req.params.id;



        if (!id) return res.status(40).json({ message: "id field are required" });

        const cata = await Catalory.findById(id).exec();
        if (!cata) return res.status(404).json({ message: "Not Found Catalory" })
        const result = await cata.deleteOne();


        if (result) {
            res.status(201).json({ message: "Deleted successfully" });
        }

    }
    async softdeleteCataloProduct(req, res) {

        const id = req.params.id;



        if (!id) return res.status(40).json({ message: "id field are required" });

        const cata = await Catalory.findById(id).exec();
        if (!cata) return res.status(404).json({ message: "Not Found Catalory" })
        const result = await cata.delete();


        if (result) {
            res.status(201).json({ message: "Deleted successfully" });
        }

    }
    async restoreCataloProduct(req, res) {

        const id = req.params.id;



        if (!id) return res.status(40).json({ message: "id field are required" });

        const cata = await Catalory.restore({ _id: id }).exec();
        if (!cata) return res.status(404).json({ message: "Not Found Catalory" });



        if (cata) {
            res.status(201).json({ message: "Catalory Item is got back successfully" });
        }

    }

}

module.exports = new CataloProduct;