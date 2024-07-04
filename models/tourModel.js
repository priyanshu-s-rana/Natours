const mongoose = require('mongoose');
const slugify = require('slugify');
const validator  = require('validator');
//const User  = require('./userModel');
//! It's like a class in c++.
const tourSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "A name is required and it should be unique"],
        unique: true,
        trim: true,
        maxlength : [40,"A tour name should have less than 40 characters"],
        minlength : [10,"A tour name should have greater than 10 characters"],
       // validate : [validator.isAlpha, "Tour name should have only alphabets"] // We do not call the function, we just specify the function to be used when needed.
    },
    slug : String,
    duration: {
        type: Number,
        required: [true, "A tour must have a duration"]
    },
    maxGroupSize: {
        type: Number,
        required: [true, "A tour must have a group size"]
    },
    difficulty: {
        type: String,
        required: [true, "A tour must have a difficulty"],
        // Validator
        enum :{
            values : ['easy','medium','difficult'],
            message : "Difficulty is either: easy, medium or difficult"
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.6,
        min : [1, "A tour should have minimum rating as 1"],
        max : [5, "A tour should have minimum rating as 5"],
        set : val=> Math.round(val*10)/10 // 4.66667 46.66667 47 4.7
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, "A tour must have a price"]
    },
    priceDiscount:{ 
       type: Number,
       validate :{ 
       message : `Discout price ({VALUE}) should be less than actual price`,
        validator :function(val){
        //    console.log(this.price);
           return val < this.price; // not gonna work on update. only points to current doc on NEW document creation.
       },}
    },
    summary: {
        type: String,
        trim: true, // Only works for string, removes white space in the begining and end of the string.
        required: [true, "A tour must have a summary"]
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String, // Name of the image. ( reference for the image not the whole image)
        required: [true, "A tour must have a cover image"]
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false // To not show the property
    },
    startDates: [Date],
    secretTour :{
        type : Boolean,
        default : false
    },
    startLocation :{
        // Geo Location
        type : {
            type : String,
            default : 'Point',
            enum : ['Point']
        },
        coordinates : [Number],
        address : String,
        description : String,
    },
    locations : [
        {
            type : {
                type : String,
                default : 'Point',
                enum : ['Point'],
            },
            coordinates : [Number],
            address : String,
            description : String,
            day : Number,
        }
    ],
    guides : [
       { 
         type : mongoose.Schema.ObjectId,
         ref : 'User',
       }
    ],
},// different dates for same tour.
    {
        toJSON: { virtuals: true }, // When data is printed as json.
        toObject: { virtuals: true } // when data is printed as object
    }
);

//! Making an index in ascending order.
//tourSchema.index({price : 1});
tourSchema.index({price : 1,ratingsAverage : -1}); //! compound index.
tourSchema.index({slug : 1});
tourSchema.index({startLocation : '2dsphere'})

tourSchema.virtual('durationWeeks').get(function () { //! This will not presist in the database.
    return this.duration / 7;
})

//? Virtual populate
tourSchema.virtual('reviews',{
    ref : 'Review',
    foreignField : 'tour',
    localField : '_id',
})
// Document Middleware. 
//! Pre-save-hook

tourSchema.pre('save',async function(next){ // will be executed before .save() and .create()
    //console.log(this); // this is pointing to document.
    this.slug = slugify(this.name,{lower : true}); // Something to do with string.
    //* Embeding code.
   // const guidesPromises =  this.guides.map(async id => await User.findById(id));
   // this.guides  = await Promise.all(guidesPromises);
    next(); // Have access to go to next middleware function 
})

// tourSchema.post('save',function(doc,next){
//     console.log(this)
//     console.log(doc);
//     next();

// })

//! Querry Middleware
tourSchema.pre(/^find/,function (next) {  // all the strings that starts with find.
//tourSchema.pre('find',function (next) { // It will not execute for findOne querry . eg. findByID
    this.start = Date.now();
    this.find({secretTour : {$ne : true}})
    this.populate('guides');
    next();
})


// Aggregation Middleware
// tourSchema.pre('aggregate',function(next){
//     this.pipeline().unshift({$match : {secretTour : {$ne : true} }}) // unshift is javascript array function to add element at first.
//     next();
// })



tourSchema.post(/^find/,function(docs,next){
    console.log(`${Date.now() - this.start} ms`);
    next();
})
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;