const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

const {User} = require('./models');
 
const router = express.Router();

const jsonParser = bodyParser.json();

//router.post('/', jsonParser, (req, res) =>)