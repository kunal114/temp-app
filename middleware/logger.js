const logger = (req, res, next) => {
  req.hello = 'Hello World'; //hello is a variable under req
  //////All the routes have access to variables written in middleware
  console.log('MiddleWare ran');
  console.log(
    `${req.method} ${req.protocol} ${req.get('host')} ${req.originalUrl}`
  );
  next(); //used to point to next middleware cycle
};

//now we need to export it
module.exports = logger;
