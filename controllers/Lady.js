const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
// const sendEmail = require('../utils/sendEmail');
const Lady = require('../models/Lady');

// @desc      Register user
// @route     POST /api/v1/Lady/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, adhaar, phone, password } = req.body;

  // Create user
  const user = await Lady.create({
    name,
    adhaar,
    phone,
    password,
  });

  user.save({ validateBeforeSave: false });
  //   sendTokenResponse(user, 200, res);
  res.status(200).json({ success: true, data: user });
});

// @desc      Login user
// @route     POST /api/v1/Lady/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { phone, password } = req.body;

  // Validate emil & password
  if (!phone || !password) {
    return next(
      new ErrorResponse('Please provide a phone number and password', 400)
    );
  }

  // Check for user
  const user = await Lady.findOne({ phone }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  //   sendTokenResponse(user, 200, res);
  res.status(200).json({ success: true, data: user });
});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/Lady/logout
// @access    Public
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc      Update user details
// @route     PUT /api/v1/Lady/updatedetails
// @access    Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    phone: req.body.phone,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});
