const App_error = require('./../Utils/app_error');
const catch_async = require('./../Utils/catch_async')
const API_Features = require('./../Utils/api_features')

//TODO Model as an input to create a generic function.

exports.getAll = Model=>catch_async(async (req, res,next) => {
    //! For Nested GET reviews on tour.
    let filter = {};
    if(req.params.tourId){
        filter.tour = req.params.tourId;
    }
    if(req.params.userId){
        filter.user = req.params.userId;
    } 
    //* Making use of Class
    //! Tour.find() is the whole collection.
    const features = new API_Features(Model.find(filter), req.query).filter().sort().limitFields().paginate();
    // ! Executing the query.
    const doc = await features.query;
    //! other metod
    // const tours  = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');
    res.status(200).json({
        //! JSend
        status: 'success',
        reults: doc.length,
        request_time: req.Time,
        data: {
            doc //? In ES6 we do not have to specify name and value if they have same name
        }
    });
})



exports.deleteOne = Model => catch_async(async (req, res,next) => {
        const id = req.params.id
        console.log(Model);
        const doc = await Model.findByIdAndDelete(id);
        if(!doc){
            return next(new App_error("No document found with the given ID",404)) // NOt found
        }
        res.status(204).json({ // 204 - No Content
            status: 'success',
            data: doc
        })
})

exports.updateOne = Model => catch_async(async(req,res,next)=>{
        const id = req.params.id;
        console.log(id);
        //await Tour.updateOne({_id:id},{$set : req.body});
        //! This is much better than above method. As it returns the updated document and runs all validotors again.
        const doc = await Model.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        })
        if(!doc){
            return next(new App_error("No document found with the given ID",404)) // NOt found
        }
        res.status(200).json({
            status: 'success',
            data : {
                doc
            }
        })
})

exports.createOne = Model=> catch_async(async (req, res,next) => {
    //! Previous method of creating a document in mongodb
    // const newTour = new Tour({});
    // newTour.save(); //* It returns the promise.

    const newdoc = await Model.create(req.body) // ! Calling methods right on the model.
    res.status(201).json({
        status: 'success',
        data: {
            doc: newdoc
        }
    });
})

exports.getOne = (Model,pop_options)=>catch_async(async (req, res,next) => {

    const id = req.params.id;
    let query = Model.findById(id)
    if(pop_options) query.populate(pop_options);
    const doc = await query; // Tour.findOne({_id : req.params.id})
    if(!doc){
        return next(new App_error("No document found with the given ID",404)) // NOt found
    }
    res.status(200).json({
        status: "success",
        data: {
            data : doc
        }
    });
})