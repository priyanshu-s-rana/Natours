const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path:`./config.env`})
const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
const Tour = require(`${__dirname}/../../models/tourModel`)
const User = require(`${__dirname}/../../models/userModel`)
const Review = require(`${__dirname}/../../models/reviewModel`)


mongoose.connect(DB,{
    useFindAndModify:false,
    useNewUrlParser : true,
    useCreateIndex : true,
    useUnifiedTopology:true,
}).then(con=>console.log("Connection Successful"))

// Reading file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));
const user = JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'));


// Importing data to Database.
const import_data = async ()=>{
    try{
        await Tour.create(tours);
        await User.create(user);
        await Review.create(reviews);

        console.log("IMPORTED successfuly")
    }catch(err){
        console.log(err);
    }
    process.exit();
}

const delete_data = async ()=>{
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();

        console.log("Deleted successfuly")
    } catch (error) {
        console.log(error);
    }
    process.exit();
}

if(process.argv[2]==='--import')import_data();
if(process.argv[2]==='--delete')delete_data();

