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
  Quotes.create({quoteString: req.body.quoteString, author: req.body.author || 'Unknown', theme: req.body.theme || ["None"]}, (err, quote) => {
     if (err) {
       return res.status(400);
     }
     User
      .findOne({username: jwt.verify(req.headers.authorization.split(' ')[1], config.JWT_SECRET).sub}) 
      .exec((err, user) => {
        if (err) {
          res.status(400);
        };
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

quotesRouter.post('/addtheme/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
  if (!('theme' in req.body)) {
    const message = 'Missing theme in request body';
    return res.status(400).send(message);
  };
  if(!(req.params.id === req.body._id)) {
    const message = ('Request path id must match request body id');
    res.status(400).json({message: 'Request path id must match request body id'});
  };
  Quotes 
    .findById(req.params.id, (err, quote) => {
      if (err) {
        res.status(400);
      };
      if (quote.theme.includes(req.body.theme)) {
        const message = ('The theme you want to add alreadt exists for this quote');
        res.json(message);
      };
      quote.theme.push(req.body.theme)
      quote.save(err => {
        if (err) {
          return res.status(400);
        }
        res.status(201).json(quote);
      });
    });
});

quotesRouter.put('/quotealter/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
  if(!(req.params.id === req.body._id)) {
    const message = ('Request path id must match request body id');
    res.status(400).json({message: 'Request path id must match request body id'});
  };
  Quotes
  .findByIdAndUpdate({_id: req.params.id}, {$set: {quoteString: req.body.quoteString}}, {new: true}, (err, quote) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.status(200).json(quote);
  });
});

quotesRouter.put('/authoralter/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
  if(!(req.params.id === req.body._id)) {
    const message = ('Request path id must match request body id');
    res.status(400).json({message: 'Request path id must match request body id'});
  }; 
  Quotes 
  .findByIdAndUpdate({_id: req.params.id}, {$set: {author: req.body.author}}, {new: true}, (err, quote) => {
    if (err) {
      return res.status(500).json(err);
    }
    return res.status(200).json(quote);
  });
});

quotesRouter.get('/all', passport.authenticate('jwt', {session: false}), (req, res) => {
  User
    .findOne({username: jwt.verify(req.headers.authorization.split(' ')[1], config.JWT_SECRET).sub})
    .populate('_quotes')
    .exec((err, user) => {
      if (err) {
        res.status(400);
      }
      return res.status(200).json(user._quotes);
    });
});




module.exports = {quotesRouter};