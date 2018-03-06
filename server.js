'use strict';

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongodDBStore = require('connect-mongodb-session')(session);
const passport = require('passport');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
app.use(morgan('common'));
app.use(bodyParser.json());

const {CLIENT_ORIGIN, DATABASE_URL, PORT, JWT_SECRET, JWT_EXPIRY} = require('./config');
const {basicStrategy} = require('./auth/strategies');
const {jwtStrategy} = require('./auth/strategies');
const {authRouter} = require('./auth/router');
const {usersRouter} = require('./users/router');
const {quotesRouter} = require('./quotes/router');

app.use(
   cors({
       origin: [CLIENT_ORIGIN, 'http://localhost:3000', 'http:localhost:8080']
   })
);

app.use(passport.initialize());
passport.use(basicStrategy);
passport.use(jwtStrategy);


app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);
app.use('/api/quotes/', quotesRouter);
mongoose.Promise = global.Promise;

//Using the jwt strategy to protect endpoints. Instead of passing in basic we pass in jwt in the authentication middleware. 
app.get('/api/protected', 
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    return res.json({
      data: 'rosebud'
    });
  }
);


let server;

function runServer() {
  return new Promise((resolve, reject) => {
    mongoose.connect(DATABASE_URL, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(PORT, () => {
        console.log(`Your app is listening on port ${PORT}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    })    
    .catch(err => { // mongoose connection error will be handled here
      console.error('App starting error:', err.stack);
      process.exit(1);
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  })    
  .catch(err => { // mongoose connection error will be handled here
    console.error('App starting error:', err.stack);
    process.exit(1);
    });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};