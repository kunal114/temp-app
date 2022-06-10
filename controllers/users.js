//Bringing the errorResponse class
const ErrorResponse = require('../utils/errorResponse');
//Bringing the async handlers(avoid try and catch statements)//yaad rakhna implement nhi kiya
const asyncHandler = require('../middleware/async');
//Bringing in the User model
const User = require('../models/User');
//Bringing the Email facility(for forgot password)
const sendEmail = require('../utils/sendEmail');
//Bringing in crypto
const crypto = require('crypto');

//@Desc get all users
//@route GET /api/v1/auth/users
//@access Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

//@Desc get Single user
//@route GET /api/v1/auth/users/:id
//@access Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.status(200).json({ succes: true, data: user });
});

//@Desc Create Single user
//@route POST /api/v1/auth/users
//@access Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(200).json({ succes: true, data: user });
});

//@Desc Update Single user
//@route PUT /api/v1/auth/users/:id
//@access Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ succes: true, data: user });
});

//@Desc Delete Single user
//@route DELETE /api/v1/auth/users/:id
//@access Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ succes: true, data: {} });
});
