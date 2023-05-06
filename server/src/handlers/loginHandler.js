const jwt = require('../lib/jwt');
const rcAPI = require('../lib/rcAPI');
const { UserModel } = require('../models/userModel');

async function login({ rcAccessToken, firebaseToken }) {
    const rcExtensionData = await rcAPI.validateAuth({ accessToken: rcAccessToken });
    if (!!rcExtensionData && !!firebaseToken) {
        const extensionId = rcExtensionData.id;
        const accountId = rcExtensionData.account.id;
        const jwtToken = jwt.generateJwt({
            accountId,
            extensionId
        });
        await UserModel.create({
            id: extensionId,
            accountId,
            firebaseToken,
            name: rcExtensionData.name
        });
        return jwtToken;
    }
    else {
        return null;
    }
}

exports.login = login;