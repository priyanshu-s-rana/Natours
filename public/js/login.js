import axios from 'axios';
import { show_alert } from './alert';

export const login = async (email,password)=>{
    try{
        const res = await axios({
        method : 'POST',
        url : 'http://127.0.0.1:8000/api/v1/users/login', 
        data :{
            email,
            password
        }});
        if(res.data.status === 'success'){
            show_alert('success', 'Logged in successfully!');
            
            window.setTimeout(()=>{
                location.assign('/'); 
            },1500)
        }
    }catch(err){
        show_alert('error', err.response.data.message);
    }
}

export const logout = async()=>{
    try{
        const res = await axios({
            method :'GET',
            url : 'http://127.0.0.1:8000/api/v1/users/logout',
        });
        if(res.data.status === 'success'){
            location.reload(true);
        }
    }catch(err){
        console.log(err.response);
        show_alert('error','Error logging out! Try again.')
    }
}

