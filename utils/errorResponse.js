//Custom error response class
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;
//now in middleware error handling there is no need to hard code the status code, we will use this class to show error
