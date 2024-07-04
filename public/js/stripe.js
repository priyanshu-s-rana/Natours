const stripe = Stripe('pk_test_51PY1bCKBz4nHdy7cS6nXLwde0b9ODrPaJI2YfqjZWbPYaYV6eb8qcXaiAUs0Z7I4l5QA6kQHtFDhJy22M2VdOw3u00vr9qIDPG');
import axios from "axios"
import { show_alert } from "./alert";
export const book_tour = async tour_id =>{
    try{//! Get checkout session from API
    const session = await axios(`http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tour_id}`);
    //console.log(session);

    //! Create checkout form + charge the  credit card
    await stripe.redirectToCheckout({
        sessionId: session.data.session.id
    })
    }catch(err){
        console.log(err)
        show_alert('error',err);
    }
}