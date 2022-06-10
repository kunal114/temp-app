//schema
const mongoose = require('mongoose');

//slugify(Middleware (also called pre and post hooks) are functions which are passed control during execution of asynchronous functions. Middleware is specified on the schema level and is useful for writing plugins.)
// Slugify is a small yet prevalent library, and it is mainly used to create slugs in node-based apps. It offers some handy options to clean your ugly titles and convert them to slugs. To use the slugify in the node app, you first have to install it, then call the slugify object by importing it.
const slugify = require('slugify');

//Bringing in geocoder
const geocoder = require('../utils/geocoder');

//Fields needed in a bootcamp
const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please Add a Name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 chracters'],
    },
    slug: String, //Devcentral Bootcamp === devcentral-bootcamp
    description: {
      type: String,
      required: [true, 'Please Add a Description'],
      maxlength: [500, 'Description cannot be more than 500 chracters'],
    },
    website: {
      type: String,
      /*match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)]/,
      'Please use a valid URL with HTTP and HTTPS',
    ],*/
    },
    phone: {
      type: String,
      maxlength: [20, 'Phone no cannot be longer than 20 chracters'],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please use a valid Email',
      ],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },

    //type==GEOJSON
    location: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ['Point'], // 'location.type' must be 'Point'
        required: false,
      },
      coordinates: {
        type: [Number],
        required: false,
        index: '2dsphere',
      },

      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    careers: {
      //Array of strings
      type: [String],
      required: true,
      enum: [
        'Web Development',
        'Mobile Development',
        'UI/UX',
        'Data Science',
        'Business',
        'Other',
      ],
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating must be atleast 1'],
      max: [10, 'Rating must cannot be more than 10'],
    },
    averageCost: Number,
    photo: {
      type: String,
      default: 'no-photo.jpg',
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  }, //Now to Reverse populate courses into bootcamps we will use virtuals in mongoose
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Create Bootcamp slug from the name
BootcampSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next(); //move to next piece of middleware
});

//Geocode & create location field(geocoder method is synchronous method)
BootcampSchema.pre('save', async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    tpye: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcpde: loc[0].zipCode,
    country: loc[0].countryCode,
  };
  //Do not save address into db
  this.address = undefined;
  next();
});

//If a bootcamp got deleted, its courses should get deleted(using mongoose middleware)
//cascade delete courses
BootcampSchema.pre('remove', async function (next) {
  console.log(`Courses being removed from bootcamp ${this._id}`);
  await this.model('Course').deleteMany({ bootcamp: this._id }); //delete courses for bootcamp with particular id
  next();
});

//Reverse populate with virtuals
BootcampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false,
});

module.exports = mongoose.model('Bootcamp', BootcampSchema);
