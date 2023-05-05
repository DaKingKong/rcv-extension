const admin = require("firebase-admin");
const serviceAccount =
{
    type: process.env.FSA_TYPE,
    project_id: process.env.FSA_PROJECT_ID,
    private_key_id: process.env.FSA_PRIVATE_KEY_ID,
    private_key: process.env.FSA_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FSA_CLIENT_EMAIL,
    client_id: process.env.FSA_CLIENT_ID,
    auth_uri: process.env.FSA_AUTH_URI,
    token_uri: process.env.FSA_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FSA_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FSA_CLIENT_X509_CERT_URL
}
const { getMessaging } = require("firebase-admin/messaging");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

async function sendDataToClient({ tokens, data }) {
    const reqBody = tokens.map(t => {return {
        data,
        token: t
    }});
    await getMessaging().sendEach(reqBody);
}

exports.sendDataToClient = sendDataToClient;