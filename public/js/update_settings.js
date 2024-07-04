import axios from "axios";
import { show_alert } from "./alert";


//! type is either 'password' or 'data
export const update_settings = async (data,type)=>{
    try {
        const url = type === 'password' ?'http://127.0.0.1:8000/api/v1/users/updatePassword': 'http://127.0.0.1:8000/api/v1/users/updateMe'
        const res = await  axios({
            method : 'PATCH',
            url ,
            data
        })

        if(res.data.status === 'success'){
            show_alert('success',`${type.toUpperCase()} updated successfuly! 🥳`);
        }
        
    } catch (err) {
        show_alert('error',err.response.data.message);
    }

}