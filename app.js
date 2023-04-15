const express = require('express');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { sendResponse } = require("./helpers/utils");

const indexRouter = require('./routes/index');


const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

const mongoose = require('mongoose');
const { error } = require('console');
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
.then(console.log("DB connected"))
.catch((error) => console.log(error));

app.use((req, res, next) => {
    const error = new Error("Not found")
    error.statusCode = 404;
    next(error)
});

app.use((error, req, res, next) => {
    console.log("ERROR", error)
    if(error.isOperational) {
        return sendResponse(
            res, error.statusCode ? error.statusCode : 500,
            false,
            null,
            { message: error.message },
            error.errorType
        );
    } else {
        return sendResponse(
            res, 
            error.statusCode ? error.statusCode : 500,
            false,
            null,
            { message: error.message },
            "Internal Server Error"
        );
    }
});


module.exports = app;
