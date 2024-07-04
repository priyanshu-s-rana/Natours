class Apperror extends Error {
    constructor(message,statusCode){
        super(message);
        this.statusCode = statusCode;
        this.status = ((~~(statusCode/100)) == 4) ? "fail" : "error"; // If starts with 4 then fail.
        this.isOperational = true; // For only Operational errors
        Error.captureStackTrace(this,this.constructor); // Will not polute the stack space of the error when this class is called.
    }
}

module.exports = Apperror;