const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

//@Desc Get courses
//@route GET /api/v1/courses
//@route GET /api/v1/bootcamps/:BootcampId/courses
//@access Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  // let query;

  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
    return res
      .status(200)
      .json({ success: true, count: courses.length, data: courses });
  } else {
    // query = Course.find();
    //How can we populate data of boocamp into courses other than data==id
    // query = Course.find().populate('bootcamp');//this will populate all the data from bootcamp into the courses

    // query = Course.find().populate({
    //   path: 'bootcamp',
    //   select: 'name description',
    // }); //This will populate only selected fields

    res.status(200).json(res.advancedResults);
  }

  const courses = await query;
  res.status(200).json({ success: true, count: courses.length, data: courses });
});

//@Desc Get Single course
//@route GET /api/v1/courses/:id
//@access Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: ' name description',
  });

  if (!course) {
    return next(new ErrorResponse(`No course with id ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: course });
});

//@Desc Add Single course
//@route POST /api/v1/bootcamps/:bootcampId/courses
//@access Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;

  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with id ${req.params.bootcampId}`, 404)
    );
  }
  //Make sure user is bootcamp owner or admin
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `user ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`,
        401
      )
    );
  }

  const course = await Course.create(req.body);

  res.status(200).json({ success: true, data: course });
});

//@Desc Update Single course
//@route PUT /api/v1/courses/:id
//@access Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`No course with id ${req.params.id}`, 404));
  }

  //Make sure user is course owner or admin
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `user ${req.user.id} is not authorized to update course to bootcamp ${course._id}`,
        401
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    data: course,
  });
  res.status(200).json({ success: true, data: course });
});

//@Desc Delete Single course
//@route DELETE /api/v1/courses/:id
//@access Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`No course with id ${req.params.id}`, 404));
  }

  //Make sure user is course owner or admin
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `user ${req.user.id} is not authorized to delete course to bootcamp ${course._id}`,
        401
      )
    );
  }
  await Course.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, data: {} });
});
