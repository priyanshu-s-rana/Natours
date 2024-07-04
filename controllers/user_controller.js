//const fs = require('fs');
const catch_async = require('../Utils/catch_async');
const User = require('./../models/userModel');
const App_error = require('./../Utils/app_error');
const multer = require('multer');
const sharp = require('sharp');
const factory = require('./handlerFactory.js');
//const users = JSON.parse(fs.readFileSync(`./dev-data/data/users.json`));  // users array of object

//! For storing in the disk
// const multer_storage = multer.diskStorage({
//     destination : (req,file,c_b)=>{
//         c_b(null, 'public/img/users'); //! c_b => callback
//     },
//     filename : (req,file,c_b)=>{
//         //! Unique File names
//         // user-32232kdfj2-2232324223.jpeg
//         const ext = file.mimetype.split('/')[1];
//         c_b(null,`user-${req.user._id}-${Date.now()}.${ext}`);
//     }
// })

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

exports.upload_user_photo = upload.single('photo');

//! Photo resize()
exports.resize_user_photo = catch_async( async(req,res,next)=>{
    if(!req.file) return next();
    req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`
    await sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality : 90 }) //* quality in percent
                          .toFile(`public/img/users/${req.file.filename}`);
    next();
})


const filterObj = (obj,...fields)=>{
   const new_obj ={};
    Object.keys(obj).forEach(el=>{
    if(fields.includes(el))new_obj[el] = obj[el];
   });
   return new_obj;
}


// Router Handlers.

exports.get_all_users = factory.getAll(User);
exports.get_user = factory.getOne(User); // Information occurs when we click on other user.
exports.create_user = (req,res)=>{}
//! for administrator to update the user data.
//! Not update PASSWORD using this.
exports.update_user = factory.updateOne(User);
exports.delete_user = factory.deleteOne(User);


// To get the information about the current logged in user. When we click on profile.
//* This will act as a middleware for the getOne.
exports.getMe = (req,res,next)=>{
    req.params.id = req.user._id;
    next();
}

//! For user to update themselves.
exports.update_me = catch_async( async (req,res,next)=>{

        // console.log(req.file);
        // console.log(req.body);
        //! Create error if user POSTs password data
        if(req.body.password || req.body.passwordConfirm){
            return next(new App_error ("This route is not for password updates. Please use /updatePassword.",400))
        }
        //! Update 
        //x is the filter
        const filteredBody = filterObj(req.body,'name','email');
        if(req.file) filteredBody.photo = req.file.filename;
        const updated_user = await User.findByIdAndUpdate(req.user.id,filteredBody,{
            new : true,
            runValidators :true,
        })
        res.status(200).json({
            status :'success',
            data : {
                user :updated_user,
            },
        });
})

//! Deleting the account

exports.delete_me = catch_async ( async (req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id,{active : false});

    res.status(204).json({
        status : 'success',
    })
})