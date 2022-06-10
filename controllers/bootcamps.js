//Bringing the model
const Bootcamp = require('../models/Bootcamp');
//Bringing the errorResponse class
const ErrorResponse = require('../utils/errorResponse');
//Bringing the async handlers(avoid try and catch statements)//yaad rakhna implement nhi kiya
const asyncHandler = require('../middleware/async');
//Bringing the geocoder for radius API
const geocoder = require('../utils/geocoder');
//Bringing path for file uploading
const path = require('path');

//@Desc Get all bootcamps
//@route GET /api/v1/bootcamps
//@access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
  // } catch (error) {
  //   // res.status(400).json({ success: false });
  //   next(error);
  // }
});

//@Desc Get single bootcamp
//@route GET /api/v1/bootcamps
//@access Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  // try {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    // res.status(400).json({ success: falses });
    return next(
      new ErrorResponse(`Bootcamp not found with ID ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
  // } catch (error) {
  // res.status(400).json({ success: false });
  // next(error);
  // next(new ErrorResponse(`Bootcamp not found with ID ${req.params.id}`, 404));
  // next(error);
  // }
});

//@Desc Create new bootcamp
//@route POST /api/v1/bootcamps
//@access Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // Add user to req,body
  req.body.user = req.user.id;

  // Check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // If the user is not an admin, then they can add only 1 bootcamp
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} has already published a bootcamp`
      )
    );
  }
  const bootcamp = await Bootcamp.create(req.body);
  res.status(200).json({ success: true, data: bootcamp });
  // } catch (error) {
  //   res.status(400).json({ success: false });
  //   // next(error);
  // }
  // console.log(req.body);
});

//@Desc Update single bootcamp
//@route PUT /api/v1/bootcamps/:id
//@access Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  /*const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });*/
  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return res.status(400).json({ success: false });
  }
  //Make sure user is bootcamp owner or admin
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `user ${req.params.id} is not authorized to update the bootcamp`,
        401
      )
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: bootcamp });
});

//@Desc Delete single bootcamp
//@route DELETE /api/v1/bootcamps/:id
//@access Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  // const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);//This not gonna work with cascade delete
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return res.status(400).json({ success: false });
  }
  //This will work
  //Make sure user is bootcamp owner or admin
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `user ${req.params.id} is not authorized to delete the bootcamp`,
        401
      )
    );
  }
  bootcamp.remove();
  res.status(200).json({ success: true, data: bootcamp });
});

//@Desc Get bootcamps within a radius/:zipcode/:distance
//@route GET /api/v1/bootcamp/radius
//@access Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  //Get Longitude, Latitude from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;
  //Calculate radius using Radians
  //Divide distance by radius of earth
  //Earth radius: 3963 mi/6378 km
  const radius = distance / 3963;
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

//@Desc Upload photo for bootcamp
//@route PUT /api/v1/bootcamps/:id/photo
//@access Private
exports.BootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  // const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);//This not gonna work with cascade delete
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return res.status(400).json({ success: false });
  }
  //Make sure user is bootcamp owner or admin
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `user ${req.params.id} is not authorized to update the bootcamp`,
        401
      )
    );
  }
  if (!req.files) {
    return next(new ErrorResponse(`Please Upload a file`, 400));
  }

  //file upload
  const file = req.files.file;
  //Image file or not
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please Upload an Image file', 400));
  }
  //File size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please Upload an Image file less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }
  //Customized name for uploaded file such that it will not overwrite
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`; //path used to get extension of the file
  console.log(file.name);
  //Uploading the file
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({ success: true, data: file.name });
  });
});
