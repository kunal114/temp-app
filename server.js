/*Typically, a server in a development environment allows unrestricted access to and control by a user or group of users. A production server, on the other hand, is configured to restrict access to authorized users and to limit control to system administrators.*/
//To install dotenv: npm i express dotenv 
//Nodemon: npm i -D nodemon
//npm start: To run in production mode
//npm run dev: To run server in development mode

const express = require('express');
const dotenv = require('dotenv');
 
//Loading config.env file
dotenv.config({path:'./config/config.env'});

//app object of express class 
const app = express();
//process.env is used to read variables of env file imported in .js file 
const PORT = process.env.PORT || 5000; //if .env file does not have PORT variable, consider it 5000 
app.listen(
    PORT,
    console.log(`Server runnnig in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

//if we run the above file, we would be unable to proceed a GET request because there are no routes