const Vourcher=require('../models/Vourcher');

async function countProduct (vourcher) {
    const results = [];
    await Vourcher.find({})
    .then(data => {
        vourcher?.forEach(item => {
            if (item==="Voucher Xtra"){
                const term = data.filter(item=>{
                    return item.type_of_vourcher==="Extra FreeShip";
                })
                
                results.push(...term[0].list_products);
            }
            if (item==="Gì Cũng Rẻ"){
                const term = data.filter(item=>{
                    return item.type_of_vourcher==="Anything Cheap";
                })
                results.push(...term[0].list_products);
            }
        })
        
        
    })
    
    
    return Array.from(results.map(item=>{
        return item.toString();
    }))
}   

module.exports= countProduct;