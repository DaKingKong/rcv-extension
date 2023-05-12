const jwt = require('../lib/jwt');
const rcAPI = require('../lib/rcAPI');
const { UserModel } = require('../models/userModel');

async function login({ rcAccessToken }) {
    const rcExtensionData = await rcAPI.validateAuth({ accessToken: rcAccessToken });
    if (!!rcExtensionData) {
        const extensionId = rcExtensionData.id;
        const accountId = rcExtensionData.account.id;
        const jwtToken = jwt.generateJwt({
            accountId,
            extensionId
        });
        const existingUser = await UserModel.findByPk(extensionId);
        if (!existingUser) {
            const profileImageUrl = await rcAPI.getGlipProfileImage({ accessToken: rcAccessToken });
            await UserModel.create({
                id: extensionId,
                accountId,
                name: rcExtensionData.name,
                profileImageUrl
            });
        }
        return jwtToken;
    }
    else {
        return null;
    }
}

exports.login = login;