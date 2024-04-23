const express = require("express");
require('express-async-errors');
const cors = require("cors");
const helmet = require("helmet");
const authController = require('./controllers/AuthController.js');
const settingsController = require('./controllers/SettingsController.js');

const authMiddleware = require('./middlewares/AuthMiddleware.js')


const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());



app.post('/login', authController.doLogin);

app.get('/settings',authMiddleware , settingsController.getSettings);

app.post('/logout',authController.doLogout);


app.use(require("./middlewares/errorMiddleware"));

module.exports = app;