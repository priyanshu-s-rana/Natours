const Tour = require('../models/tourModel')
const catch_async = require('../Utils/catch_async');
const App_error = require('../Utils/app_error');
const sharp = require('sharp');
const multer = require('multer');
const factory = require('./handlerFactory');
//const tours = JSON.parse(fs.readFileSync(`./dev-data/data/tours-simple.json`)); //* Only executed one time.
// --------------------------------------------  Route Handlers ----------------------------------------------------


//! Store in the buffer storage
const multer_storage = multer.memoryStorage();
const multer_filter = (req,file,c_b)=>{
    if(file.mimetype.startsWith('image')){
        c_b(null,true);
    }else{
        c_b(new App_error('Not an image! Please upload only images',400),false);
    }
}

const upload = multer({
    storage : multer_storage,
    fileFilter : multer_filter,
});


exports.upload_tour_images = upload.fields([
    {name : 'imageCover' , maxCount:1},
    {name : 'images', maxCount : 3}
])

// upload.array('images',5);  req.files
// upload.single('image')  req.file

exports.resize_tour_images = catch_async( async(req,res,next)=>{

    if(!req.files.imageCover || !req.files.images){
        return next();
    }

    // Cover Image
    req.body.imageCover  = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer).resize(2000,1333).toFormat('jpeg').jpeg({quality : 90 }) //* quality in percent
                            .toFile(`public/img/tours/${req.body.imageCover}`);

    // Images
    req.body.images = [];
    await Promise.all(
        req.files.images.map(async (file,i)=>{
        const filename = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;
        await sharp(file.buffer).resize(2000,1333).toFormat('jpeg').jpeg({quality : 90 }) //* quality in percent
                                .toFile(`public/img/tours/${filename}`);
        req.body.images.push(filename);
        }
        )
    );
    next();
})


exports.alias_top_tours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

exports.get_all_tours = factory.getAll(Tour);
exports.get_tour = factory.getOne(Tour,{path : 'reviews'});
exports.create_tour = factory.createOne(Tour);
exports.update_tour = factory.updateOne(Tour);
exports.delete_tour = factory.deleteOne(Tour);

    // const tour = tours.find(el=>el.id === req.params.id*1); //! just checks wheather the id in the key value pair is there or not.

    // res.status(200).json({
    //     //! JSend
    //     status : 'success',
    //     reults : 1,        
    //     data : {
    //         tours :  tours[id] //? req.params was the key-value pair object. So got id key value in it, it was string so 
    //                                        //? converted it into number, by multiplying it by 1.
    //     }
    // })



// console.log(req.body);
// const newId = tours.length;
// const newTour = Object.assign({id : newId},req.body);
// tours.push(newTour);
// fs.writeFile(`${__dirname}/../dev-data/data/tours-simple.json`,JSON.stringify(tours),err=>{
//     if(err){
//      console.log(err);
//       return  res.status(404).json({
//             status : "failes",
//             message : "Can not write the data in the database"
//         })
//     }
//     res.status(201).json({
//         status : 'success',
//         data : {
//             tour : newTour
//         }
//     })
// })


//* router.route('/tours-within/:distance/center/:latlng/unit/:unit',tour_controller.get_tours_within);
// tours-within/233/center/34.072038,118.336686/unit/mi
// 34.072038,118.336686

exports.get_tours_within = catch_async( async (req,res,next)=>{
        const {distance,latlng,unit} = req.params;
        const [lat,lng] = latlng.split(',');
        if(!lat || !lng){
           return  next ( new App_error('Please provide latitude and longitude in the format lat,lng',400));
        }
        const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
        const tours = await Tour.find({ startLocation : {$geoWithin : {$centerSphere : [[lng,lat],radius]}}})

        res.status(200).json({
            status : 'success',
            results : tours.length,
            data :{
                data : tours,
            }
        })
})

// router.route('/distances/:latlng/unit/:unit').get(tour_controller.get_distances)
exports.get_distances = catch_async(async (req,res,next)=>{
    const {latlng,unit} = req.params;
    const [lat,lng] = latlng.split(',');
    if(!lat || !lng){
        return next(new App_error('Please provide the location in latitude,longitude format!',400));
    }
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

   const distances = await Tour.aggregate([
    {
        $geoNear : {
            near : {
                type : 'Point',
                coordinates : [lng*1,lat*1]
            },
            distanceField : 'distance',  //! Field that will be created and all the distances will be stored;
            distanceMultiplier : multiplier
        }
    },
    {
        $project : {
            distance : 1,
            name : 1
        }
    }
   ]);

   res.status(200).json({
    status : 'success',
    data :{
        data : distances,
    }
})
})


exports.get_tour_stats = catch_async(async (req, res,next) => {
        const stats = await Tour.aggregate([
            {
                $match: {
                    ratingsAverage: { $gte: 4.5 }
                }
            },
            {
                $group: {

                    _id: '$difficulty',
                    total_tours: { $sum: 1 },
                    total_ratings: { $sum: '$ratingsQuantity' },
                    avg_rating: { $avg: '$ratingsAverage' },
                    avg_price: { $avg: '$price' },
                    min_price: { $min: '$price' },
                    max_price: { $max: '$price' }
                }
            },
            {
                $sort: {
                    //! 1 for ascending and -1 for descending
                    avg_price: -1, // Can not use old names as the ones are grouped by the above stages. Now these are our documents.
                }
            },
            // { //! We can repeate the stages.
            //     $match : {
            //         _id : {$ne : 'easy'} // Will not include the easy mentioned difficulty.
            //     }
            // }
        ]);
        res.status(200).json({
            status: 'success',
            data: stats
        })
})

//! Calculating the busiest months.
exports.get_monthly_plan = catch_async(async (req, res,next) => {
        const year = req.params.year * 1;
        // console.log(year);
        const month_stat = await Tour.aggregate([
            {
                $unwind: '$startDates'
            }, {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}`),
                        $lte: new Date(`${year + 1}`)
                    }
                }
            }, {
                $group: {
                    _id: { $month: '$startDates' },
                    total_tours: { $sum: 1 },
                    tours: { $push: '$name' }, // Pushing it in the array.
                }
            },
            {
                $addFields: { month: '$_id' }
            }, {
                $project: {
                    _id: 0 // this will not show id in the respond send.
                }
            },
            {
                $sort: {
                    total_tours: -1
                }
            },
            // {
            //     $limit : 12
            // }
        ]);
        res.status(200).json({
            status: 'success',
            data: month_stat
        })

    
})
