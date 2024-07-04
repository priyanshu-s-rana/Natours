const App_error = require('../Utils/app_error')


// ! Development errors
const dev_error = (err,req,res)=>{
    //console.log(err.isOperational);
    //* API
    if(req.originalUrl.startsWith('/api')){
        return res.status(err.statusCode).json({
          status: err.status,
          error: err,
          message: err.message,
          stack: err.stack,
        });

    }
    
    //* Rendered Website
    console.error('Error 💀',err)
    res.status(err.statusCode).render('error',{
        title:'Something went wrong!',
        msg:err.message,
    });
}


//! Production error.
const prod_error = (err,req,res)=>{

    //* API
    if(req.originalUrl.startsWith('/api')){
        // Operational errors and trusted errors : send it to the client
        if(err.isOperational){
            return res.status(err.statusCode).json({
                status : err.status,
                message : err.message
            })
        }else{ // Programming or other unknown error : don't leak error details
            console.error('Error 💀 !! ',err) //! Logging the error
    
            // Sending the generic message.
            return res.status(500).json({
                status:"error",
                message : "Something went wront",
            })
        }
    }
    
    //* Rendered Website
    // Operational errors and trusted errors : send it to the client
    if(err.isOperational){
        res.status(err.statusCode).render('error',{
            title:'Something went wrong!',
            msg:err.message,
        });
    }else{ // Programming or other unknown error : don't leak error details
        console.error('Error 💀 !! ',err) //! Logging the error

        // Sending the generic message.
        res.status(err.statusCode).render('error',{
            title:'Something went wrong!',
            msg: 'Please try again later'
        });
    }
}

//! Cast Error
const handle_castError = err =>{
    const message = `Invalid ${err.path} : ${err.value}.`
    return new App_error(message,400); // 400 - Bad Request.
}

//! Duplicate Fields
const handle_duplicateFields = err=>{
    const message = `The field name ${err.keyValue.name} already exist. Use another value`;
    return new App_error(message,400);
}

//! Validation Error
const handle_validationError = ()=>{
    const errors = Object.values(err.errors).map(el => el.message)
    const message = `Invalid input consist of errors in ${errors.join('. ')}.`
    return new App_error(message,400);
}

//! Json Web Token Error
const handle_jwtError = ()=>{
    return new App_error(`Token is invalid! Log-in with correct e-mail or Signup.`,401) // 401 - unauthorize.
}

const handle_tokenExpiredError = err=> new App_error(`Session is expired! Please log-in again`,401)

module.exports = (err,req,res,next)=>{
    //console.log(err.statusCode);
    err.statusCode = err.statusCode || 500; // 500 Internal server error
    err.status  = err.status || 'error';
    if(process.env.NODE_ENV === 'development'){
        dev_error(err,req,res);
    } else if(process.env.NODE_ENV === 'production'){
        let error = err;
        if(error.name === "CastError") error = handle_castError(error); // Handling Cast Error for incorect ID field or url.
        if(error.code === 11000) error = handle_duplicateFields(error);// Handling duplicate fields error for create request.
        if(error.name === "ValidationError")error = handle_validationError(error); // For validation error that occur in update request.
        if(error.name === "JsonWebTokenError")error = handle_jwtError(); // To verify the user is signed in or not.
        if(error.name === "TokenExpiredError")error = handle_tokenExpiredError();
        prod_error(error,req,res);
    }
    next();
}