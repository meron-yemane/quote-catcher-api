const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

const {User} = require('./models');
 
const usersRouter = express.Router();

const jsonParser = bodyParser.json();

usersRouter.post('/', jsonParser, (req, res) => {
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  const stringFields = ['username', 'password', 'firstName', 'lastName'];
  const nonStringField = stringFields.find(field => 
    (field in req.body) && typeof req.body[field] != 'string'
  );

  if(nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  const explicityTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicityTrimmedFields.find(field => 
    req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 8,
      max: 72
    }
  };

  const tooSmallField = Object.keys(sizedFields).find(field => 
    'min' in sizedFields[field] && req.body[field].trim().length < sizedFields[field].min
  );

  const tooLargeField = Object.keys(sizedFields).find(field => 
    'max' in sizedFields[field] && req.body[field].trim().length > sizedFields[field].max
  );

  if (tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: `Must be at most ${sizedFields[tooLargeField].max} characters long`,
      location: tooLargeField 
    });
  }

  if (tooSmallField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: `Must be at least ${sizedFields[tooSmallField].min} characters long`,
      location: tooSmallField 
    });
  }

  let {username, password, firstName='', lastName=''} = req.body;

  firstName = firstName.trim();
  lastName = lastName.trim();

  return User 
    .find({username})
    .count()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      return User.hashPassword(password)
    })
    .then(hash => {
      return User 
        .create({
          username,
          password: hash,
          firstName,
          lastName
        })
    })
    .then(user => {
      return res.status(201).json(user.apiRepr());
    })
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});

usersRouter.get('/', (req, res) => {
  return User
    .find()
    .then(users => res.json(users.map(user => user.apiRepr())))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = {usersRouter};



