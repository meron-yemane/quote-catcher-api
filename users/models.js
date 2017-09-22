const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {type: String, default: ""},
  lastName: {type: String, default: ""},
  _quotes: [{type: Schema.ObjectId, ref: 'Quotes'}],
  themes: {type: Array, default: []}
});

UserSchema.methods.apiRepr = function() {
  return {
    username: this.username || '',
    firstName: this.firstName || '',
    lastName: this.lastName || ''
  };
}

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
}

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
}

const User = mongoose.model('User', UserSchema);

module.exports = {User};