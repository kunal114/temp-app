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

//@Desc Register User
//@route GET /api/v1/auth/register
//@access Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  //Create a user
  const user = await User.create({
    name,
    email,
    password, //we will encrypt the password at middleware lvl
    role,
  });

  //Create token(contains the id of the user)
  //   const token = user.getSignedJwtToken();

  //   res.status(200).json({ success: true, token });
  sendTokenResponse(user, 200, res);
});

//@Desc Login User
//@route POST /api/v1/auth/login
//@access Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //Validate email and password
  if (!email || !password) {
    return next(new ErrorResponse(`Please provide an email and password`, 400));
  }
  //Check for User
  const user = await User.findOne({ email: email }).select('+password');
  if (!user) {
    return next(new ErrorResponse(`Invalid Credentials`, 401));
  }
  //Check for password(We hve to take the plain text password in body and match it to encrypted password in db)
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse(`Invalid Credentials`, 401));
  }

  //Create token(contains the id of the user)
  //   const token = user.getSignedJwtToken();

  //   res.status(200).json({ success: true, token });
  sendTokenResponse(user, 200, res);
});

//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, //cookie to be accessed through client side script
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true; //in order to send cookie via https instead of http
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token });
};

//@Desc Get current Logged in User
//@route POST /api/v1/auth/me
//@access Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
});

//@Desc Forgot Password
//@route POST /api/v1/auth/forgotpassword
//@access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that Email', 404));
  }

  //Get Reset password token
  const resettoken = user.getResetPasswordToken();
  // console.log(resetToken);
  await user.save({ ValiditeBeforeSave: false });

  //create reset url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetPassword/${resettoken}`;
  const message = `You are recieving this email because you has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token',
      message,
    });
    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ ValiditeBeforeSave: false });
    return next(new ErrorResponse(`Email could not be sent`, 500));
  }

  res.status(200).json({ success: true, data: user });
});

//@Desc Reset Password
//@route PUT /api/v1/auth/resetPassword/:resetToken
//@access Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  //Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorResponse(`Invalid token`, 400));
  }
  //Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

//@Desc Update user details
//@route PUT /api/v1/auth/updatedetails
//@access Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: user });
});

//@Desc Update user password
//@route PUT /api/v1/auth/updatepassword
//@access Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('+password');
  //check current password
  const { pass } = req.body.currentPassword;
  if (!(await user.matchPassword(pass))) {
    return next(new ErrorResponse(`Password is Incorrect`, 401));
  }
  user.password = req.body.newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});

//@Desc Log User out/clear cookie
//@route GET /api/v1/auth/logout
//@access Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), //10sec
    httpOnly: true,
  });
  res.status(200).json({ success: true, data: {} });
});
