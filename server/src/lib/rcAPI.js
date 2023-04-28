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