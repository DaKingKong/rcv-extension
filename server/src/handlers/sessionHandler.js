const { UserModel } = require('../models/userModel');
const { SessionModel } = require('../models/sessionModel');

async function checkInSession(req, res) {
    const jwtToken = req.query.jwtToken;
    if (!!jwtToken) {
        const { id: extensionId, accountId } = jwt.decodeJwt(jwtToken);
        const user = await UserModel.findByPk(extensionId);
        if (!!user) {
            const sessionId = req.body.platform + req.body.docId;
            await user.update({
                sessionId
            })
            res.status(200).send('OK');
            return;
        }
    }
    res.status(400).send('not authorized');
}

//WIP
async function fetchSession(){}

exports.checkInSession = checkInSession;