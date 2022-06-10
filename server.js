/*Typically, a server in a development environment allows unrestricted access to and control by a user or group of users. A production server, on the other hand, is configured to restrict access to authorized users and to limit control to system administrators.*/
//To install dotenv: npm i express dotenv
//Nodemon: npm i -D nodemon
//npm start: To run in production mode
//npm run dev: To run server in development mode

const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const colors = require('colors'); //console colors
const errorHandler = require('./middleware/error');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const RateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

//Loading config.env file
dotenv.config({ path: './config/config.env' });

//Connect to Database
connectDB();

//app object of express class
const app = express();

//Body Parser for models
app.use(express.json());

//process.env is used to read variables of env file imported in .js file
const PORT = process.env.PORT || 5000; //if .env file does not have PORT variable, consider it 5000
const server = app.listen(
  PORT,
  console.log(
    `Server runnnig in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

//Handle Unhandled promise rejections
process.on('UnhandledRejection', (err, Promise) => {
  console.log(`UnhandledRejection: ${err.message}`.red);
  server.close(() => process.exit(1));
});
//if we run the above file, we would be unable to proceed a GET request because there are no routes

//routes
// / means index, It is easier to create route using express than in HTTP
/*app.get('/', (req,res)=>{

    // res.send('<h1>Hello from express</h1>')//Content-Type==html/text

    // res.send({
    //     Msg:'Hello from express'
    // })//Content-Type==application/json,,,,,res.json() will give the same thing 

    // res.sendStatus(400)//it will give bad request

    //In order to send some status along with data or json object
    // res.status(400).json({success: false}) //.json is similar to .send with json object
    res.status(200).json({success: true, data: {id : 1}})

    //

}) */

//Middleware functions are functions that have access to the request object ( req ), the response object ( res ), and the next middleware function in the application's request-response cycle. The next middleware function is commonly denoted by a variable named next .
/*const logger = (req, res, next) => {
  req.hello = 'Hello World'; //hello is a variable under req
  //////All the routes have access to variables written in middleware
  console.log('MiddleWare ran');
  console.log(
    `${req.method} ${req.protocol} ${req.get('host')} ${req.originalUrl}`
  );
  next(); //used to point to next middleware cycle
};*/
//Lets make it cleaner by making a separate file for logger
const logger = require('./middleware/logger');
//We can use middleware in order to set authentication for a user, if valid user, login otherwise not
//To use it we have to use app.use()
app.use(logger);
/*We have created a middleware but we will use a third party middleware for req-res cylce
 npm i morgan*/
//Now instead of using our custom logger we will import morgan
morgan = require('morgan');
//Dev mode logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const users = require('./routes/users');
app.use('/api/v1/users', users);

const auth = require('./routes/auth');
//File Upload
app.use(fileupload());
//Set static folder for uploads
app.use(express.static(path.join(__dirname, 'public')));

//Creating all the routes possible
//we will do this in seperate file so that the file wont be too long
//Route file
const bootcamps = require('./routes/bootcamps.js');
//Connect /api/v1/bootcamps to bootcamps file i.e. Mount router
app.use('/api/v1/bootcamps', bootcamps);

const courses = require('./routes/courses.js');
app.use('/api/v1/courses', courses);

app.use('/api/v1/auth', auth);

//Sanitize data
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
const limiter = RateLimit.rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100, //requests per 10 min
});
app.use(limiter);
app.use(hpp());
app.use(cors());

app.use(cookieParser());

app.use(errorHandler);
//We have to use error handler methods in bootcamps, so , we have to define app.use error handler after app.use bootcamps
