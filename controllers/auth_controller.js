const User = require('./../models/userModel');
const catch_async = require('./../Utils/catch_async');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const App_error = require('./../Utils/app_error');
const {promisify} = require('util');
const Email = require('./../Utils/email')


const sign_token = id=>{
   return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn : process.env.JWT_EXPIRES_IN
    })
}

const create_send_token = (user,code,res)=>{
   const token = sign_token(user._id);
   const cookie_options = 
    {
        expires : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN*24*3600*1000),
        httpOnly : true,
        sameSite : 'none',
        secure : true,
    }
   if(process.env.NODE_ENV === 'production')cookie_options.secure = true;
   res.cookie('jwt',token,cookie_options)
   user.password = undefined; //! As the password show up when we create a document.
    res.status(code).json({
        status : 'success',
        token,
        data :{
            user : user,
        }
    })
}


exports.signup  = catch_async(async(req,res,next)=>{
    const new_user = await User.create({ // To not specify as admin.
        name : req.body.name,
        email : req.body.email,
        password : req.body.password,
        passwordConfirm : req.body.passwordConfirm,
        passwordChangedAt : req.body.passwordChangedAt,
        role : req.body.role
    });
    const url =`${req.protocol}://${req.get('host')}/me`;
    // console.log(url);
    await new Email(new_user,url).send_welcome();
    create_send_token(new_user,201,res);
});

exports.login =catch_async( async(req,res,next) =>{
    let {email,password} = req.body;
    // Check if email and password exist 
    if(!email || !password){
      return  next(new App_error("Please provide email and password !!",400));
    }
    // Check if user exist and password is correct
    const user = await User.findOne({email : email}).select('+password');

    if(!user || ! await user.correctPassword(password,user.password)){
        return  next(new App_error("Incorrect email or password",401)); // 401 :- unauthorized.
      }

    create_send_token(user,200,res);
})

exports.logout = (req,res,next)=>{
    res.cookie('jwt','loggedout',{
        expires : new Date(Date.now() + 10*1000),
        httpOnly :true,
        sameSite : 'none',
    })
    res.status(200).json({status : 'success'})
}

exports.protect =catch_async( async (req,res,next)=>{

    //! Getting token and check if it's there.
    let token
    //console.log(req.headers.authorization.slice(7));
    if(req.headers.authorization && req.headers.authorization.slice(0,6) === "Bearer"){
         token = req.headers.authorization.slice(7);
    }else if(req.cookies.jwt){
        token = req.cookies.jwt;
    }
    //console.log(token);
    if(!token){
        return next(new App_error("You are not logged in! Please log in to get access.",401))
    }

    //! Verification of token.
    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET) // promisifying the verify function.
   // console.log(decoded);
    
    //! Check if user still exists.
    const fresh_user = await User.findById(decoded.id);
    if(!fresh_user) return next(new App_error(`The user account does not exist.`,401))


    //! Check if user changed password after the token was issued.
    if(await fresh_user.changedPasswordAfter(decoded.iat)){ // This is a promise.
        return next(new App_error(`The user has changed the password. Please log-in again`,401));
    }
    
    //! Grant access to protected Route.
    req.user = fresh_user;
    res.locals.user = fresh_user;

    next();
})

//* Only for rendered pages.
exports.isLoggedIn = async (req,res,next)=>{

    //! Getting token and check if it's there.
    if(req.cookies.jwt){
        try {
            //! Verification of token.
            const decoded = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET) // promisifying the verify function.
            // console.log(decoded);
            
            //! Check if user still exists. 
            const fresh_user = await User.findById(decoded.id);
            if(!fresh_user) return next()
    
    
            //! Check if user changed password after the token was issued.
            if(await fresh_user.changedPasswordAfter(decoded.iat)){ // This is a promise.
               return next();
            }
            
            //! There is a logged in user
            res.locals.user=fresh_user;
            return next();
            
        } catch (err) {
            return next()
        }
    }
    next();
}


exports.restrict_to = (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new App_error("You do not have permission to perform this action",403)) // 403 - Forbidden.
        }
        next();
    }
}

exports.forgot_password =catch_async( async (req,res,next)=>{
    // ! Get user based on POSted email

    const user = await User.findOne({email:req.body.email});
    if(!user){
       return next(new App_error("Invalid e-mail address try-again !!",404));
    }
    //console.log(user);
    //! Generate the random reset token.
    const reset_token = user.passwordReset_token();
    await user.save({validateBeforeSave:false});

    //! Send it to user via email.
    
    //const message = ` Forgot your password !! Submit a PATCH request with your new password and passswordConfirm to :${reset_url}.\nIf you did not forget your password, please ignore this emaill!`
    
    try {
        const reset_url = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${reset_token}`;
        // await send_email({
        //     email : user.email,
        //     subject : 'Your password reset token (valid for 10 min )',
        //     message
        // })
        await new Email(user,reset_url).send_password_rest();
        res.status(200).json({
            status : "success",
            message : "Token sent to email"
        })
        
    } catch (err) {
       // console.log(err);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave : false});

        return next(new App_error("There was an error sending the email. Try again later!",500));
    }
});


exports.reset_password = catch_async(async (req,res,next)=>{
    //! Get user based on the token
    const hashed_token = crypto.createHash('sha256').update(req.params.token).digest('hex');
   // console.log(hashed_token);
    const user = await User.findOne({passwordResetToken : hashed_token , passwordResetExpiers: {$gt : Date.now()}}); //* Finding user by the hashed token.
    //console.log(user.passwordResetExpiers>Date.now());

    //! If token has not expired, and there is user, set the new password
    if(!user){
        return next(new App_error('Token is invalid or has expired',400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpiers = undefined;
    await user.save();
    //! Update chanderPasswordAt property for the current user
    //? Did it in pre 'save' middleware in userModel.
    // user.passwordChangedAt = Date.now();
    // await user.save();
    //! Log the user in , send JWT
    create_send_token(user,200,res);
});

// ! Checking if the user knows the current password before updating it.

exports.update_password = catch_async(async (req,res,next)=>{
    //! Getting user from the collection
    // We will get previous password from the user
    const user = await User.findOne({email : req.user.email}).select('+password');
    if(!user || ! await user.correctPassword(req.body.password,user.password)){
        return next(new App_error('Incorrect email-address or password! Please try again.',401));
    }

    //! Check if the POSTed crrent password is correct
    // if(){
    //     return next(new App_error('Incorrect password ! Please try again', 400));
    // }


    //! If so, update password
    user.password = req.body.new_password;
    user.passwordConfirm = req.body.new_password_confirm;
    await user.save();


    //! Log user in, send JWT
    create_send_token(user,200,res);
})