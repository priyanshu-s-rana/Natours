import {login,logout} from './login';
import '@babel/polyfill';
import { update_settings } from './update_settings';
import { book_tour } from './stripe';
const map_func = require('./webmap');

// Dom Eelements
const login_form = document.querySelector('.form--login')
const logout_button = document.querySelector('.nav__el--logout');
const map_box = document.getElementById('map');
const user_data_form = document.querySelector('.form-user-data');
const user_password_form = document.querySelector('.form-user-password');
const book_btn = document.getElementById('book-tour');

// Delegation
if(login_form){   
    login_form.addEventListener('submit',e=>{
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email,password);})
} 

if(logout_button) logout_button.addEventListener('click',logout);

if(map_box){
    const locations = JSON.parse(map_box.dataset.locations);
    map_func(locations)
}

if(user_data_form){
    user_data_form.addEventListener('submit', e=>{
        e.preventDefault();
        const form = new FormData();
        form.append('name',document.getElementById('name').value)
        form.append('email',document.getElementById('email').value)
        form.append('photo',document.getElementById('photo').files[0]);
        // console.log(form);
        update_settings(form,'data');
    })
}

if(user_password_form){
    user_password_form.addEventListener('submit',async e=>{
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent = 'Updating..';
        const password = document.getElementById('password-current').value;
        const new_password = document.getElementById('password').value;
        const new_password_confirm = document.getElementById('password-confirm').value;
        await update_settings({password,new_password,new_password_confirm},'password');

        document.querySelector('.btn--save-password').textContent = 'Save password';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value='';
        document.getElementById('password-current').value='';
    })
}

if(book_btn){
    book_btn.addEventListener('click', e=>{
        e.target.textContent = 'Processing.....';
        const {tourId} = e.target.dataset;
        book_tour(tourId);

    })
}