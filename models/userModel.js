const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { setDefaultAutoSelectFamily } = require('net');

const userSchema = mongoose.Schema({
    name :{
        type : String,
        required :[true, "Please tell us your name"],
        // minlength : [5, "A user can only have name of character length 20."],
        // maxlength : [ 20, "A user must have a name of length 5."]
    },
    email :{
        type : String,
        required : [true, "Please provide your email."],
        unique:true,
        lowercase : true,
        validate : [validator.isEmail,"Please provide a valid email."]
    },
    photo:{
        type : String,
        default : 'default.jpg'
    },
    password :{
        type : String,
        required :[true, "A user must have a password"],
        mainlength : [8,"A password must consist of 8 characters"],
        select : false,
    },
    passwordConfirm :{
        type : String,
        reqiured : [true, "Please confirm the password"],
        validate :{
            // This only works on create and Save.
            validator : function(el){
                return el === this.password;// not gonna work on update. only points to current doc on NEW document creation.
            },
            message : "Passwrods are not the same"
        }
    },
    passwordChangedAt : {
        type : Date,
        default : new Date(),
        select : false
    },
    role:{
        type :String,
        enum :['user','guide','lead-guide','admin'],
        default :'user'
    },
    passwordResetToken : String,
    passwordResetExpiers : Date,
    active :{
        type : Boolean,
        default : true,
        select : false,
    }
})

// ! Only run when password is modified.
userSchema.pre('save',async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,12) // Auto generating the salt and hash.
        this.passwordConfirm = undefined; // Only needed for confirmation, should not be persisted in the database
        if(!this.isNew){
            this.passwordChangedAt = Date.now() -1000; // 1 sec in the past.
        }
    }
    next();
})

userSchema.pre(/^find/,function(next){
    // this points to current querry
    this.find({active : {$ne : false}});
    next();
})

userSchema.methods.correctPassword  = async function(candidate_password,user_password){
    return await bcrypt.compare(candidate_password,user_password);
}

userSchema.methods.changedPasswordAfter = async function(jwt_timestamp){
    if(this.passwordChangedAt){
        const time_in_seconds = parseInt(this.passwordChangedAt.getTime()/1000);
        return jwt_timestamp<time_in_seconds;
    }
    return false;
}

userSchema.methods.passwordReset_token = function(){
    const reset_token = crypto.randomBytes(32).toString("hex");

   this.passwordResetToken = crypto.createHash('sha256').update(reset_token).digest('hex');
   this.passwordResetExpiers = Date.now() + 10*60*1000; // 10 minutes heads up.
   return reset_token;
}
const User = mongoose.model('User',userSchema);
module.exports = User;