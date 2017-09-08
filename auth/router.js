const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

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


module.exports = {authRouter};