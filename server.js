const mongoose = require('mongoose');
process.on('uncaughtException',function(err){
    console.log('Uncaught Exception.................')
    console.log(err.name,err.message);
    process.exit(1);
})
const dotenv = require('dotenv');
dotenv.config({path:'./config.env'})
const app = require('./app');
const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
mongoose.connect(DB,{
    useNewUrlParser : true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology: true
}).then(con=>{
    console.log('DB connection successful')
})

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`)
})

process.on('unhandledRejection',err=>{ // ? It's for asynchronous code.
    console.log(err.name,err.message);
    console.log('Unhandled Rejection..............')
    server.close(()=>{
        process.exit(1); //! Gracefully shuting down. Server handle the pending request or being handled.
    })
   // process.exit(1); // ! abruptly shutdown every process.
})

//console.log(x); // synchronous code error.