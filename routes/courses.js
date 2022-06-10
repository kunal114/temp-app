const express = require('express');
const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses');

const { protect, authorize } = require('../middleware/auth');

const Course = require('../models/Course');
const advancedResults = require('../middleware/advancedResult');

const router = express.Router({ mergeParams: true });
router
  .route('/')
  .get(
    advancedResults(Course, {
      path: 'bootcamp',
      select: ' name description',
    }),
    getCourses
  )
  .post(protect, authorize('publisher', 'admin'), addCourse); // / is replaced by address in bootcamps in same folder line44
router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('publisher', 'admin'), updateCourse)
  .delete(protect, authorize('publisher', 'admin'), deleteCourse); // / is replaced by address in bootcamps in same folder line44
module.exports = router;
