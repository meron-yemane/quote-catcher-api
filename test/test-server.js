const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();
const {TEST_DATABASE_URL} = require('../config');


chai.use(chaiHttp);

function tearDownDb() {
  console.log('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('Quote Catcher API resources', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });
  //beforeEach(function() {
  //  return 
  //});
  afterEach(function() {
    return tearDownDb();
  });
  after(function() {
    return closeServer();
  });

  describe('POST endpoint', function() {
    it('should add a user', function() {
      const newUser= {
        username: "Marshawn",
        firstName: "Marshawn",
        lastName: "Lynch",
        password: "password"
      };

      return chai.request(app)
        .post('/api/users/')
        .send(newUser)
        .then(function(res) {
          res.should.have.status(201);
          res.should.be.json;
          res.should.be.a('object');
          res.body.should.include.keys(
            'username', 'firstName', 'lastName');
          res.body.username.should.equal(newUser.username);
          res.body.firstName.should.equal(newUser.firstName);
          res.body.lastName.should.equal(newUser.lastName);
        });
    });
  });
});