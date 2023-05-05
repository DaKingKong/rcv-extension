import axios from 'axios';
import apiConfig from './config.json';

async function login({ rcAccessToken }) {
    const firebaseToken = localStorage.getItem('firebaseToken');
    const postBody = {
        rcAccessToken,
        firebaseToken
    }

    const jwt = await axios.post(`${apiConfig.server}/login`, postBody);
    localStorage.setItem('rc-huddle-jwt', jwt);
}

exports.login = login;