const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sessionHandler = require('./handlers/sessionHandler');
const loginHandler = require('./handlers/loginHandler');
const { UserModel } = require('./models/userModel');


const { sendDataToClient } = require('./lib/fcm');

const app = express();
app.use(bodyParser.json())

app.use(cors({
    methods: ['GET', 'POST']
}));

app.get('/is-alive', (req, res) => { res.send(`OK`); });

app.post('/login', async function (req, res) {
    try {
        await loginHandler.login(req, res);
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
})

app.post('/session/check-in', async function (req, res) {
    try {
        await sessionHandler.checkInSession(req, res);
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
})

app.post('/notification', async function (req, res) {
    await sendDataToClient({ tokens: req.body.tokens, data: req.body.data });
})

async function initDB() {
    console.log('creating db tables if not exist...');
    await UserModel.sync();
    console.log('db tables created');
}

initDB();

exports.server = app;