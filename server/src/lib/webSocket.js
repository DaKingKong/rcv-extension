const SocketIO = require('socket.io');
const jwt = require('./jwt');
const { UserModel } = require('../models/userModel')
const sockets = [];
const sessions = [];
const initializeSocket = function ({ server }) {
    const io = SocketIO(server, {
        cors: {
            origin: '*',
        },
    });

    io.on('connection', async (socket) => {
        try {
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
            const onAction = (action) => {

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
            console.log(e);
        }
    });

    console.log('websocket server initialized');
}

async function onClientCheckIn({ platform, docId }) {
    const sessionId = platform + '-' + docId;
    const existingSession = sessions.find(s => s.id == sessionId);
    if (existingSession) {
        await syncSession({ active: existingSession.active, platform, docId });
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
    await syncSession({ active: existingSession.active, platform, docId });
}

async function syncSession({ active, platform, docId }) {
    // get all in-session users
    const inSessionSockets = sockets.filter(s => s.platform === platform && s.docId === docId);
    const inSessionExtensionIds = inSessionSockets.map(s => { return s.extensionId; });
    const inSessionUsers = await UserModel.findAll({
        where: {
            id: inSessionExtensionIds
        }
    });
    const inSessionUserNames = inSessionUsers.map(u => { return u.name; });
    for (const inSessionSocket of inSessionSockets) {
        // broadcast member info
        inSessionSocket.socket.emit('action', {
            type: 'syncSession',
            data: {
                active,
                participants: inSessionUserNames
            }
        })
    }
}

exports.initializeSocket = initializeSocket;