const App_error = require('../Utils/app_error');
const catch_async = require('../Utils/catch_async');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const factory = require('./handlerFactory');


exports.get_checkout_session = catch_async( async(req,res,next)=>{
    // ! Get currently booked tour
    const tour = await Tour.findById(req.params.tour_id);
    // ! Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url : `${req.protocol}://${req.get('host')}/?tour=${req.params.tour_id}&user=${req.user.id}&price=${tour.price}`,
        cancel_url : `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email : req.user.email,
        mode : 'payment',
        client_reference_id : req.params.tour_id,
        line_items : [
            {
                price_data:{
                    currency : 'usd',
                    unit_amount : tour.price * 100,
                    product_data : {
                        name : `${tour.name} Tour`,
                        description : tour.summary,
                        images : [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                    },
                },
                quantity : 1,
            }
        ]
    })


    //! Create session as response
    res.status(200).json({
        status : 'success', 
        session
    })
})


exports.create_booking_checkout = catch_async( async(req,res,next)=>{

    //! This is only temporary
    const {tour,user,price} = req.query;
    // console.log(tour,user,price);
    if(!tour && !user && !price) return next();
    await Booking.create({tour,user,price});

    res.redirect(req.originalUrl.split('?')[0])
})

exports.create_booking = factory.createOne(Booking);
exports.get_booking = factory.getOne(Booking);
exports.get_all_booking = factory.getAll(Booking);
exports.update_booking = factory.updateOne(Booking);
exports.delete_booking = factory.deleteOne(Booking);