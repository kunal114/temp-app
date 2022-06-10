const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  //Copy of req.query
  const reqQuery = { ...req.query };

  //Fields to exclude such that they dont match(select=name)
  //Select is used to select only selective fields along with queries, sort is used to sort certain fields,page is used for pagination , limit is used for upperbound of enteries
  const removeFields = ['select', 'sort', 'page', 'limit'];
  //Loop over removeFields and delete them from reqQuery
  removeFields.forEach((params) => delete reqQuery[params]);
  console.log(reqQuery);

  //Create Query string
  let queryStr = JSON.stringify(req.query);

  //Create Operators
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g, //regular expression
    (match) => `$${match}`
  );

  //Finding Resource
  // query = Bootcamp.find(JSON.parse(queryStr));
  // console.log(req.query);
  // try {
  // const bootcamps = await Bootcamp.find();
  //To allow reverse population we have to write query in this way
  query = model.find(JSON.parse(queryStr));

  //Select Fields(Now we are excluding select and including other fields for filter)
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    // console.log(fields);
    query = query.select(fields);
  }

  //Sorting fields({{URL}}/api/v1/bootcamps?select=name,description,housing&housing=false&sort=name)
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  } //sort by created date(default)

  //Pagination({{URL}}/api/v1/bootcamps?select=name&page=1&limit=2)
  const page = parseInt(req.query.page, 10);
  const limit = parseInt(req.query.limit, 10); //limit per-page
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();
  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  //Executing Query
  const results = await query;

  //Pagination Result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }
  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;
