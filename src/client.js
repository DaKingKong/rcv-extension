import axios from 'axios';
import apiConfig from './config.json';

async function login({ rcAccessToken, firebaseToken }) {
    const postBody = {
        rcAccessToken,
        firebaseToken
    }
    const loginResponse = await axios.post(`${apiConfig.server}/login`, postBody);
    localStorage.setItem('rc-huddle-jwt', loginResponse.data);
    await checkIn();
}

async function checkIn(){
    const jwt = localStorage.getItem('rc-huddle-jwt');
    if(jwt)
    {
        const postBody = {
            platform : 'Figma',
            docId : window.location.pathname.split('/file/')[1].split('/')[0]
        }
        const checkInResponse = await axios.post(`${apiConfig.server}/session/check-in?jwtToken=${jwt}`, postBody);
        console.log('checked in: ', checkInResponse.data)
    }
}
async function checkOut(){
    const jwt = localStorage.getItem('rc-huddle-jwt');
    if(jwt)
    {
        const postBody = {
            platform : 'Figma',
            docId : window.location.pathname.split('/file/')[1].split('/')[0]
        }
        const checkOutResponse = await axios.post(`${apiConfig.server}/session/check-out?jwtToken=${jwt}`, postBody);
        console.log('checked out: ', checkOutResponse.data)
    }
}

exports.login = login;
exports.checkIn = checkIn;
exports.checkOut = checkOut;