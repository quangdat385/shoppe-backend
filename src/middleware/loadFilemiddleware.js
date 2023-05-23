const Fs = require('fs')  
const Path = require('path')  
const axios = require('axios');




const loadfile= async (file,fileName)=>{
    
        
        const path = Path.resolve(__dirname, "..",'public/img', fileName);
        const writer = Fs.createWriteStream(path);
    
        const response=await axios({
            url:file,
            method: 'GET',
            responseType: 'stream'
            
        })
        
        response.data.pipe(writer);
    
        return new Promise((resolve, reject) => {
        response.data.on('finish', resolve(fileName)
        
        );
        response.data.on('error', reject(err));
    })
}

module.exports =loadfile;
