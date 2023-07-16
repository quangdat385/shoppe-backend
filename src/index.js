const express =require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const mongoose = require('mongoose');
const morgan = require('morgan');


const route = require('./routes/index');
const connectDB = require('./config/dbConn');
const { logger, logEvents } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler')



require('dotenv').config();
require('express-async-errors');


const app= express();
const PORT=process.env.PORT ||3500;
connectDB()
app.use(logger)


app.use(morgan('combined'))

app.use(express.urlencoded({ 
    extended: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

route(app)

app.use(errorHandler)

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
mongoose.connection.on('error', err => {
    console.log(err);
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log');
})


