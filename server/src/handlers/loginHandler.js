const jwt = require('../lib/jwt');
const rcAPI = require('../lib/rcAPI');
const { UserModel } = require('../models/userModel');

async function login(req, res) {
    const rcAccessToken = req.body.rcAccessToken;
    const rcExtensionData = await rcAPI.validateAuth({ rcAccessToken: rcAccessToken });
    if (!!rcExtensionData) {
        const extensionId = rcExtensionData.id;
        const accountId = rcExtensionData.account.id;
        const jwtToken = jwt.generateJwt({
            accountId,
            extensionId
        });
        await UserModel.create({
            id: extensionId,
            accountId
        });
        res.status(200).send(jwtToken);
    }
    else {
        res.status(400).send('not authorized');
    }
}

exports.login = login;