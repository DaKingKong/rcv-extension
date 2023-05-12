const axios = require('axios');

async function validateAuth({ accessToken }) {
    try {
        const extensionAPIResp = await axios.get(`${process.env.RC_SERVER}/restapi/v1.0/account/~/extension/~`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (extensionAPIResp.status === 200) {
            return extensionAPIResp.data;
        }
        else {
            return null;
        }
    }
    catch (e) {
        return null;
    }
}

async function getGlipProfileImage({ accessToken }) {
    try {
        const extensionProfileImageResp = await axios.get(`${process.env.RC_SERVER}/team-messaging/v1/persons/~`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (extensionProfileImageResp.status === 200) {
            console.log(extensionProfileImageResp)
            return extensionProfileImageResp.data.avatar;
        }
        else {
            console.log('cannot find rc extension profile image')
            return null;
        }
    }
    catch (e) {
        console.log(e);
        return null;
    }
}

exports.validateAuth = validateAuth;
exports.getGlipProfileImage = getGlipProfileImage;