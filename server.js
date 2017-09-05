'use strict';
const {Users} = require('./models');

const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const {CLIENT_ORIGIN} = require('./config');

mongoose.Promise = global.Promise;
const PORT = process.env.PORT || 3000;

app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

app.get('/api/*', (req, res) => {
 res.json({ok: true});
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

module.exports = {app};