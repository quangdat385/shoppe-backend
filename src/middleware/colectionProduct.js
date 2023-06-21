
function collectionProduct(colect,products) {
    let result
    if(Number(colect)===0){
        result=products
        return result
    }else if(Number(colect)===1){
        result=products.sort((a,b)=>{
            return a.sold-b.sold;
        })
        return result
    }else if(Number(colect)===2){
        result=products.sort((a,b)=>{
            return b.numberical-a.numberical;
        })
        return result.slice(0,10)
    }else if(Number(colect)===3){
        result=products.filter(product=>{
        return product.details==="Áo Croptop Ba Lỗ"
        })
        return result
    }else if(Number(colect)===4){
        result=products.filter(product=>{
        return product.details==="Áo Croptop Có Tay"
        })
        return result
    }else if(Number(colect)===5){
        result=products.filter(product=>{
        return product.type_of_product==="Đầm/Váy"
        })
        return result
    }else if(Number(colect)===6){
        result=products.filter(product=>{
            return product.type_of_product==="Sét Bộ"
        })
        return result
    }else if(Number(colect)===7){
        result=products.filter(product=>{
            return product?.details==="Quần Short"
        })
        return result
    }else if(Number(colect)===8){
        result=products.filter(product=>{
            return product?.details==="Quần Dài"
        })
        return result
    }else if(Number(colect)===9){
        result=products.filter(product=>{
            return product?.type_of_product==="Đồ Lót"
        })
        return result
    }else if(Number(colect)===10){
        result=products.filter(product=>{
            return product?.type_of_product==="Quần"
        })
        return result
    }
    return result;
};


module.exports= collectionProduct;