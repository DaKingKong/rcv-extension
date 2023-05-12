import axios from 'axios';
import apiConfig from './config.json';
import { io } from 'socket.io-client';

let socket = null;

async function login({ rcAccessToken, firebaseToken }) {
    const postBody = {
        rcAccessToken,
        firebaseToken
    }
    const loginResponse = await axios.post(`${apiConfig.server}/login`, postBody);
    localStorage.setItem('rc-huddle-jwt', loginResponse.data);
    registerWebSocket({ jwt: loginResponse.data });
}

function checkIn() {
    const jwt = localStorage.getItem('rc-huddle-jwt');
    if (jwt) {
        registerWebSocket({ jwt });
    }
}

function startHuddle({ meetingId, hostname }) {
    if (socket) {
        socket.emit('action', {
            type: 'startHuddle',
            data: {
                meetingId,
                hostname
            }
        });
    }
}

function joinHuddle() {
    if (socket) {
        socket.emit('action', {
            type: 'joinHuddle'
        })
    }
}

function getHuddle() {
    if (socket) {
        socket.emit('action', {
            type: 'getHuddle'
        });
    }
}

function leftHuddle() {
    if (socket) {
        socket.emit('action', {
            type: 'leftHuddle'
        })
    }
}

function registerWebSocket({ jwt }) {
    socket = io(`${apiConfig.server}`, {
        transports: ['websocket'],
        auth: {
            jwt,
            platform: 'Figma',
            docId: window.location.pathname.split('/file/')[1].split('/')[0]
        },
    });

    socket.on('connect', () => {
        if (socket.connected) {
            console.log('client connect to server successfully');
        }
    });

    socket.on('connect_error', (e) => {
        console.log('connect error', e.message);
    });

    socket.on('disconnect', () => {
        console.log('client disconnected');
    });

    socket.on('message', (message) => {
        console.log('message', message);
    });

    socket.on('action', (action) => {
        switch (action.type) {
            case 'syncSession':
                const sessionActive = action.data.active;
                const sessionMeetingId = action.data.meetingId;
                const sessionHostname = action.data.hostname;
                const participants = action.data.participants;
                window.dispatchEvent(new CustomEvent('message', {
                    detail: {
                        type: 'rc-huddle-page-view-change',
                        participants,
                        meetingId: sessionMeetingId,
                        hostname: sessionHostname
                    }
                }));
                console.log('participants', participants);
                break;
            case 'startHuddleNotification':
                const meetingId = action.data.meetingId;
                const hostname = action.data.hostname;
                window.dispatchEvent(new CustomEvent('message', {
                    detail: {
                        type: 'rc-huddle-update-huddle',
                        meetingId,
                        hostname
                    }
                }));
                break;
        }
    });

    function keepAlive() {
        setTimeout(() => {
            if (socket && socket.connected) {
                socket.send('ping');
            }
            keepAlive();
        }, 5000);
    }

    keepAlive();
    return socket;
}

exports.login = login;
exports.checkIn = checkIn;
exports.startHuddle = startHuddle;
exports.joinHuddle = joinHuddle;
exports.getHuddle = getHuddle;
exports.leftHuddle = leftHuddle;