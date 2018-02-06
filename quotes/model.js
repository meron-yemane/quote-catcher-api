const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const QuoteSchema = new mongoose.Schema({
  quoteString: {type: String, text: true, required: true},
  author: {type: String, required: false},
  theme: {type: Array, required: false}
});

// QuoteSchema.mongoose.createIndex({author: "text"});

const Quotes = mongoose.model('Quotes', QuoteSchema);

module.exports = {Quotes}