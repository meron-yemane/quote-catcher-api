const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const {User} = require('../users/models');
const config = require('../config');

const createAuthToken = user => {
  return jwt.sign({user}, config.JWT_SECRET, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

const authRouter = express.Router();

authRouter.post('/login',
  passport.authenticate('basic', {session: false}),
  (req, res) => {
    const authToken = createAuthToken(req.user.apiRepr());
    res.json({authToken});
  }
);

authRouter.get('/logout', function(req, res){
  console.log("req logout", req)
  localStorage.removeItem('access_token');
  res.json({});
});

authRouter.put('/logoutdemouser', function(req, res) {
  User
    .findOneAndUpdate(
      { username: 'abc' },
      { $set: { _quotes: [], themes: [] } }
    )
    .then(() => {
      res.json({});
    });
});

authRouter.post('/refresh', 
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    const authToken = createAuthToken(req.user);
    res.json({authToken});
  }
);

module.exports = {authRouter};