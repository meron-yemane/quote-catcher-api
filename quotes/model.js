const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const QuoteSchema = new mongoose.Schema({
  quoteString: {type: String, required: true},
  author: {type: String, required: false},
  theme: {type: String, required: false}
});

const Quotes = mongoose.model('Quotes', QuoteSchema);

module.exports = {Quotes}