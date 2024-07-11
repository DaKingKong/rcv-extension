
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const loginHandler = require('./handlers/loginHandler');
const { UserModel } = require('./models/userModel');
const { initializeSocket } = require('./lib/webSocket');


const app = express();
const server = require('http').createServer(app);
app.use(bodyParser.json())

app.use(cors({
    methods: ['GET', 'POST']
}));

app.get('/is-alive', (req, res) => { res.send(`OK`); });

app.post('/login', async function (req, res) {
    try {
        const jwtToken = await loginHandler.login({
            rcAccessToken: req.body.rcAccessToken
        });
        if (jwtToken) {
            res.status(200).send(jwtToken);
        }
        else {
            res.status(400).send('not authorized');
        }
    }
    catch (e) {
        console.log(e?.status);
        console.log(e?.message);
        res.status(400).send(e);
    }
})

async function initDB() {
    console.log('creating db tables if not exist...');
    await UserModel.sync();
    console.log('db tables created');
}

initDB();
initializeSocket({ server });

exports.app = app;
exports.server = server;