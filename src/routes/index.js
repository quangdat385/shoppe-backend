const path = require('path')
const cors = require('cors');
const corsOptions = require('../config/corsOptions');


function route(app){
    app.use(cors(corsOptions));
    app.use('/api/usercart',require('./usercartsRoute'))
    app.use('/api/product',require('./productsRoute'))
    app.use('/api/user',require('./usersRoute'))
    app.use('/api/auth',require('./authRoute'))
    app.use('/api/catalo',require('./cataloProductRoute'))
    app.use('/api/rating',require('./ratingRoute'))

    app.use('/', require('./root'));

    app.all('*', (req, res) => {
        
        res.status(404)
        if (req.accepts('html')) {
            res.sendFile(path.join(__dirname,"..", 'views', '404.html'));
        } else if (req.accepts('json')) {
            res.json({ message: '404 Not Found' });
        } else {
            res.type('txt').send('404 Not Found');
        }
    });

    
    
}


module.exports =route;
