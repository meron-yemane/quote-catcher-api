const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config');

const {Quotes} = require('./model');
const {User} = require('../users/models');

const quotesRouter = express.Router();

quotesRouter.post('/create', passport.authenticate('jwt', {session: false}), (req, res) => {
  if (!('quoteString' in req.body)) {
    const message = 'Missing quote in request body';
    return res.status(400).send(message);
  }
  console.log(jwt.verify(req.headers.authorization.split(' ')[1], config.JWT_SECRET).sub);
  Quotes.create({quoteString: req.body.quoteString}, (err, quote) => {
     if (err) {
       return res.status(400);
     }
     User
      .findOne({username: jwt.verify(req.headers.authorization.split(' ')[1], config.JWT_SECRET).sub})
      .exec(function (err, user) {
        if (err) {
          res.status(400);
        };
        console.log("user: " + user)
        user._quotes.push(quote);
        user.save(err => {
          if (err) {
            return res.status(400);
          }
          user.populate('Quotes', (err) => {
            if (err) {
              return res.status(400);
            }
          })
          res.status(201).json(quote);
        })
      })
  });
});





module.exports = {quotesRouter};