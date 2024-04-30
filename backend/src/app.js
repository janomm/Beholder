const express = require("express");
require('express-async-errors');
const cors = require("cors");
const helmet = require("helmet");
const authController = require('./controllers/authController.js');
const authMiddleware = require('./middlewares/authMiddleware.js')
const morgan = require('morgan');
const settingsRouter = require('./routers/settingsRouter.js');
const symbolsRouter = require('./routers/symbolsRouter.js');
const exchangeRouter = require('./routers/exchangeRouter.js');

const app = express();

app.use(cors({ origin : process.env.CORS_ORIGIN }));
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

app.post('/login', authController.doLogin);

app.post('/logout',authController.doLogout);

app.use('/settings',authMiddleware,settingsRouter);

app.use('/symbols',authMiddleware,symbolsRouter);

app.use('/exchange',authMiddleware,exchangeRouter);

app.use(require("./middlewares/errorMiddleware"));

module.exports = app;