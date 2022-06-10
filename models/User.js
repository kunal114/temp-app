const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); //for encrypting the passwords
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); //for reset password token generation

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an Email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please use a valid Email',
    ],
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please add a password '],
    minlength: 6,
    select: false, //not gonna return the password
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  CreatedAt: {
    type: Date,
    default: Date.now,
  },
});

//Encrypt Password using bcrypt
UserSchema.pre('save', async function (next) {
  //If forgot password
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10); //higher the rounds, more protected is the password
  this.password = await bcrypt.hash(this.password, salt); //this will fetch plain password from user and hash it using salt
});

//Sign JsonWebToken and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

//Match user entered password to hashed password in db
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password); //matches entered pass with encrypted pass in db
};

//Generate and Hash password token
UserSchema.methods.getResetPasswordToken = function () {
  //Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');
  //Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  //Reset password Expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
