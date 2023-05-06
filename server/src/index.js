const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sessionHandler = require('./handlers/sessionHandler');
const loginHandler = require('./handlers/loginHandler');
const { UserModel } = require('./models/userModel');
const { SessionModel } = require('./models/sessionModel');
const jwt = require('./lib/jwt');

const app = express();
app.use(bodyParser.json())

app.use(cors({
    methods: ['GET', 'POST']
}));

app.get('/is-alive', (req, res) => { res.send(`OK`); });

app.post('/login', async function (req, res) {
    try {
        const jwtToken = await loginHandler.login({
            rcAccessToken: req.body.rcAccessToken,
            firebaseToken: req.body.firebaseToken
        });
        if (jwtToken) {
            res.status(200).send(jwtToken);
        }
        else {
            res.status(400).send('not authorized');
        }
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
})

app.get('/session', async function (req, res) {
    try {
        const jwtToken = req.query.jwtToken;
        if (!!jwtToken) {
            const userData = jwt.decodeJwt(jwtToken);
            const hasSession = await sessionHandler.fetchSession({
                platform: req.body.platform,
                docId: req.body.docId
            });
            res.status(200).send(hasSession);
        }
        else {
            res.status(400).send('not authorized');
        }
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
})

app.post('/session/check-in', async function (req, res) {
    try {
        const jwtToken = req.query.jwtToken;
        if (!!jwtToken) {
            const userData = jwt.decodeJwt(jwtToken);
            const responseBody = await sessionHandler.checkInSession({
                extensionId: userData.extensionId,
                platform: req.body.platform,
                docId: req.body.docId
            });
            res.status(200).send(responseBody);
        }
        else {
            res.status(400).send('not authorized');
        }
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
})

app.post('/session/check-out', async function (req, res) {
    try {
        const jwtToken = req.query.jwtToken;
        if (!!jwtToken) {
            const userData = jwt.decodeJwt(jwtToken);
            await sessionHandler.checkOutSession({
                extensionId: userData.extensionId,
                platform: req.body.platform,
                docId: req.body.docId
            });
            res.status(200).send('OK');
        }
        else {
            res.status(400).send('not authorized');
        }
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
})

async function initDB() {
    console.log('creating db tables if not exist...');
    await UserModel.sync();
    await SessionModel.sync();
    console.log('db tables created');
}

initDB();

exports.server = app;