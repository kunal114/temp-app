const express = require('express');
const {
  register,
  login,
  logout,
  updateDetails,
} = require('../controllers/Lady');

const router = express.Router();

// const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
// router.get('/me', protect, getMe);
// router.get('/confirmemail', confirmEmail);
router.put('/updatedetails', updateDetails);
// router.put('/updatepassword', protect, updatePassword);
// router.post('/forgotpassword', forgotPassword);
// router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
