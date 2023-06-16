import axios from 'axios';
import apiConfig from './config.json';
import { io } from 'socket.io-client';

let socket = null;

function getDocInfo() {
    const url = window.location.href;
    const googleRegex = new RegExp("https://docs.google.com/.+/d/(.+)/.+");
    const figmaRegex = new RegExp("https://www.figma.com/file/(.+)/.+");
    if (url.match(googleRegex)) {
        return {
            platform: 'Google',
            docId: url.match(googleRegex)[1]
        }
    }
    if (url.match(figmaRegex)) {
        return {
            platform: 'Figma',
            docId: url.match(figmaRegex)[1]
        }
    }
    return null;
}

async function login({ rcAccessToken, firebaseToken }) {
    const postBody = {
        rcAccessToken,
        firebaseToken
    }
    const loginResponse = await axios.post(`${apiConfig.server}/login`, postBody);
    localStorage.setItem('rc-huddle-jwt', loginResponse.data);
    const docInfo = getDocInfo();
    registerWebSocket({ jwt: loginResponse.data, docInfo });
}

function checkIn() {
    const jwt = localStorage.getItem('rc-huddle-jwt');
    if (jwt) {
        const docInfo = getDocInfo();
        if (docInfo) {
            registerWebSocket({ jwt, docInfo });
            return true;
        }
        return false;
    }
    return false;
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

function leaveHuddle() {
    if (socket) {
        socket.emit('action', {
            type: 'leftHuddle'
        })
    }
}

function registerWebSocket({ jwt, docInfo }) {
    socket = io(`${apiConfig.server}`, {
        transports: ['websocket'],
        auth: {
            jwt,
            platform: docInfo.platform,
            docId: docInfo.docId
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
exports.leaveHuddle = leaveHuddle;
exports.getDocInfo = getDocInfo;