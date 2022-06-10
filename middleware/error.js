const ErrorResponse = require('../utils/errorResponse');

//Error handling using middleware
const errorHandler = (err, req, res, next) => {
  //Log to console for
  console.log(err.stack.red);
  console.log(err);

  //Mongoose bad ObjectId(Mongoose error handling)
  let error = { ...err }; //... spread operator allows to copy all the properties of err to error
  if (err.name === 'CastError') {
    const message = `Resource not found`;
    error = new ErrorResponse(message, 404);
  }

  //Mongoose Duplicate Key
  if (err.code === 11000) {
    const message = `Duplicate field value Entered`;
    error = new ErrorResponse(message, 404);
  }

  //Mongoose validation fields error(true fields)
  if (err.name === 'ValidatorError') {
    const message = Object.values(err, errors).map((val) => val.message); //for each value extract a message
    error = new ErrorResponse(message, 404);
  }
  //

  res.status(error.statusCode || 500).json({
    success: false,
    error: err.message || 500,
  });
};

module.exports = errorHandler;
