const Deliver=require("../models/deliveryAgency");



class DeliverController {
    async getDelivery(req, res){
        Deliver.find({}).then(data => {
            if(data.length<=0){
                return res.status(400).json({message:"Delivery Not Found"});
            } 
            res.status(200).json({data:data});
        })
    }
    async createDelivery(req, res){
        console.log(req.body);
    
    }
    async updateDelivery(req, res){
        console.log(req.body);
    
    }
    async deleteDelivery(req, res){
        console.log(req.body);
    
    }
}


module.exports = new DeliverController;