//we have to initialize express again
const express = require('express');
const router = express.Router();
// now we have no longer excess to res var of server.js file, so we will use router

//Used to protect requests
const { protect, authorize } = require('../middleware/auth');
/*
After mounting api address there is no need to attach full address here only / will work
router.get('/api/v1/bootcamps',(req,res) =>{
    res.status(200).json({success:true, msg:"Show all bootcamps"})
})//taking from server*/

/*
router.get('/',(req,res) =>{
    res.status(200).json({success:true, msg:"Show all bootcamps"})
})//taking from server
//we have to pass id in postman request
router.get('/:id',(req,res) =>{
    res.status(200).json({success:true, msg:`Show Bootcamp ${req.params.id}`})
})//get single bootcamp id
router.post('/',(req,res) =>{
    res.status(200).json({success:true, msg:"create new bootcamp"})
})//writing on server bootcamp 
router.put('/:id',(req,res) =>{
    res.status(200).json({success:true, msg:`Update Bootcamp ${req.params.id}`})
})//changing bootcamp with specific id
router.delete('/:id',(req,res) =>{
    res.status(200).json({success:true, msg:`Delete Dootcamp ${req.params.id}`})
})
*/

//In order to make this route procedure more easier we will use control methods
//Bringing controller methods
const {
  getBootcamp,
  getBootcamps,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  BootcampPhotoUpload,
} = require('../controllers/bootcamps'); //.. is used to switch to one directory back

const courseRouter = require('./courses');
//Reroute into other resource routers
router.use('/:bootcampId/courses', courseRouter);

//advanced results
const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResult');

//GetBootcampin radius
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);
//Now to attach all methods
router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('publisher', 'admin'), createBootcamp); //post&getallbootcamps request need url and rest need id
router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), BootcampPhotoUpload);

//For Router to Work we have to export it
module.exports = router;
