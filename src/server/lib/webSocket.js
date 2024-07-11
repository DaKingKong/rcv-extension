const SocketIO = require('socket.io');
const jwt = require('./jwt');
const { UserModel } = require('../models/userModel')
const sockets = [];
const sessions = [];

// session = sessionId, active
// socket = extensionId, platform, docId, socket


const initializeSocket = function ({ server }) {
    const io = SocketIO(server, {
        cors: {
            origins: "*:*",
            methods: ["GET", "POST"]
        },
    });

    io.on('connection', async (socket) => {
        try {
            console.log('new ws client connecting...')
            const jwtToken = socket.handshake.auth.jwt;
            const userInfo = jwt.decodeJwt(jwtToken);
            const platform = socket.handshake.auth.platform;
            const docId = socket.handshake.auth.docId;
            sockets.push({
                extensionId: userInfo.extensionId,
                platform,
                docId,
                socket,
            });

            const onMessage = (message) => {
                if (message === 'ping') {
                    socket.send('pong');
                }
            }
            const onAction = async (action) => {
                switch (action.type) {
                    case 'startHuddle':
                        const activatedSession = sessions.find(s => s.id === `${platform}-${docId}`);
                        const activatedSessionIndex = sessions.indexOf(activatedSession);
                        sessions[activatedSessionIndex].active = true;
                        sessions[activatedSessionIndex].meetingId = action.data.meetingId;
                        sessions[activatedSessionIndex].hostname = action.data.hostname;
                        sessions[activatedSessionIndex].participantCount = 1;
                        await syncSession({ session: activatedSession, platform, docId });
                        break;
                    case 'joinHuddle':
                        const ongoingSession = sessions.find(s => s.id === `${platform}-${docId}`);
                        const ongoingSessionIndex = sessions.indexOf(ongoingSession);
                        sessions[ongoingSessionIndex].participantCount++;
                        break;
                    case 'getHuddle':
                        const getSession = sessions.find(s => s.id === `${platform}-${docId}`);
                        await syncSession({ session: getSession, platform, docId });
                        break;
                    case 'leftHuddle':
                        const leftSession = sessions.find(s => s.id === `${platform}-${docId}`);
                        const leftSessionIndex = sessions.indexOf(leftSession);
                        sessions[leftSessionIndex].participantCount--;
                        if (sessions[leftSessionIndex].participantCount === 0) {
                            sessions[leftSessionIndex].active = false;
                            sessions[leftSessionIndex].meetingId = '';
                            sessions[leftSessionIndex].hostname = '';
                        }
                        await syncSession({ session: leftSession, platform, docId });
                        break;
                }
            }
            const onDisconnect = async (reason) => {
                console.log('socket disconnected: ', reason);
                const dcSocket = sockets.find(s => s.extensionId === userInfo.extensionId);
                const index = sockets.indexOf(dcSocket);
                sockets.splice(index, 1);
                socket.off('message', onMessage);
                socket.off('action', onAction);
                delete socket;
                await onClientCheckOut({ platform, docId });
            };
            socket.on('message', onMessage);
            socket.on('action', onAction);
            socket.once('disconnect', onDisconnect);
            await onClientCheckIn({ platform, docId });
        }
        catch (e) {
            console.log(e?.status);
            console.log(e?.message);
        }
    });

    console.log(`websocket server initialized on path ${io._path}`);
}

async function onClientCheckIn({ platform, docId }) {
    const sessionId = platform + '-' + docId;
    const existingSession = sessions.find(s => s.id == sessionId);
    if (existingSession) {
        await syncSession({ session: existingSession, platform, docId });
    }
    else {
        // create a new session for this doc
        sessions.push({
            id: sessionId,
            active: false
        })
    }
}

async function onClientCheckOut({ platform, docId }) {
    const sessionId = platform + '-' + docId;
    const existingSession = sessions.find(s => s.id == sessionId);
    await syncSession({ session: existingSession, platform, docId });
}

async function syncSession({ session, platform, docId }) {
    // get all in-session users
    const inSessionSockets = sockets.filter(s => s.platform === platform && s.docId === docId);
    const inSessionExtensionIds = inSessionSockets.map(s => { return s.extensionId; });
    const inSessionUsers = await UserModel.findAll({
        where: {
            id: inSessionExtensionIds
        }
    });
    const inSessionUserData = inSessionUsers.map(u => { return { name: u.name, image: u.profileImageUrl ?? '' }; });
    for (const inSessionSocket of inSessionSockets) {
        // broadcast member info
        inSessionSocket.socket.emit('action', {
            type: 'syncSession',
            data: {
                active: session.active,
                meetingId: session.meetingId ?? '',
                hostname: session.hostname ?? '',
                participants: inSessionUserData
            }
        })
    }
}

exports.initializeSocket = initializeSocket;