const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
//We use the regular functions so that we have access to the 'this' variable.

//Create a schema to be used in a model
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, "A tour name can't be more than 40 characters"],
        minlength: [10, 'A tour name must have more or equal to 10 characters'],
        // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size'],
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        //enum is what is used to define possible entries into a field
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Diffuclty must be either easy, medium or difficult',
        },
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'rating must be above 1.0'],
        max: [5, 'rating must be below 5.0'],
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
        type: Number,
        //creating custom validators
        validate: {
            validator: function(val) {
                //this only points to current doc on new document creation
                return val < this.price;
            },
            message: 'Discount price should be below regular price',
        },
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description'],
    },
    description: {
        type: String,
        trim: true,
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false,
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false,
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

///////////////////////////////////////////////////////////
//Virtual properties
tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});
/////////////////////////////////////////////////////////
//DOCUMENT MIDDLEWARE: functions that occur before a event (.save() and .create() )is fired of.
tourSchema.pre('save', function(next) {
    //this is the currently proccesed document
    this.slug = slugify(this.name, { lower: true });

    next();
});

//POST DOCUMENT MIDDLEWARE
//doc is the document that has just been saved to the db
//this only runs after all the pre document middlewares have executed
// tourSchema.post('save', function(doc, next) {
//     console.log(doc);

//     next();
// });
//////////////////////////////////////////////////////////
//Query Middleware
//the regex helps us to target any event that begins with the word 'find'
tourSchema.pre(/^find/, function(next) {
    // tourSchema.pre('find', function(next) {
    //here the 'this' is a query object
    this.find({ secretTour: { $ne: true } });

    this.start = Date.now();
    next();
});

//the post query middleware gives us access to the documents (docs) returned after the query has been executed
tourSchema.post(/^find/, function(docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds`);
    next();
});
///////////////////////////////////////////////////////////
//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next) {
    //here the this points to the current aggreagation  object
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    console.log(this.pipeline());

    next();
});
//Mongoose models are created from schemas
//Use uppercase on model names and variables
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;