

const countRating= (rates)=>{
    let one=0,two=0,three=0,four=0,five=0;
    for (let i=0; i<rates.length; i++) {
        if (Number(rates[i].rate)===5){
        
            five+=1
        }else if (Number(rates[i].rate)===4){
            
            four+=1
        }else if (Number(rates[i].rate)===3){
            
            three+=1
        }else if (Number(rates[i].rate)===2){
            
            two+=1
        }else if (Number(rates[i].rate)===1){
            
            one+=1
        }
    }


    return {one,two,three,four,five}
}

module.exports=countRating;