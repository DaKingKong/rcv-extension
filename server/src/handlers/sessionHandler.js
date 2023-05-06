const { UserModel } = require('../models/userModel');
const { SessionModel } = require('../models/sessionModel');
const { sendDataToClient } = require('../lib/fcm');

async function checkInSession({ extensionId, platform, docId }) {
    const user = await UserModel.findByPk(extensionId);
    let responseBody = {};
    if (!!user) {
        const sessionId = platform + '-' + docId;
        await user.update({
            sessionId
        })
        // create a new session for this doc (Note: only active session == meeting)
        const session = await SessionModel.findByPk(platform + '-' + docId);
        if (!session) {
            await SessionModel.create({
                id: sessionId,
                active: false
            })
        }
        else {
            // if active, get session
            if (session.active) {
                responseBody = {
                    active: true,
                    meetingId: session.meetingId
                }
            }
            // if not active, get members
            else {
                const allUserInSession = await UserModel.findAll({
                    where: {
                        sessionId
                    }
                });
                const members = allUserInSession.map(u => { return u.name; });
                responseBody = {
                    active: false,
                    members
                }
                await syncSession({ allUserInSession });
            }
        }
    }
    return responseBody;
}

async function checkOutSession({ extensionId, platform, docId }) {
    const user = await UserModel.findByPk(extensionId);
    if (!!user) {
        await user.update({
            sessionId: ''
        })
        const sessionId = platform + '-' + docId;
        const allUserInSession = await UserModel.findAll({
            where: {
                sessionId
            }
        });
        await syncSession({ allUserInSession });
    }
}

async function fetchSession({ platform, docId }) {
    const session = await SessionModel.findByPk(platform + '-' + docId);
    if (session) {
        return session.active;
    }
    return false;
}

async function syncSession({ allUserInSession }) {
    const names = allUserInSession.map(u => {
        return u.name
    });
    const tokens = allUserInSession.map(u => {
        return u.firebaseToken
    })
    if (names.length > 0) {
        await sendDataToClient({ tokens, data: { names: names.toString() }, type: 'asyncSession' });
    }
}

exports.checkInSession = checkInSession;
exports.checkOutSession = checkOutSession;
exports.fetchSession = fetchSession;