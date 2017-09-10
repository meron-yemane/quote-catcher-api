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
  beforeEach(function() {
    const user = {
      username: "Steve",
      firstName: "Steve",
      lastName: "Mark",
      password: "password"
    }
    return chai.request(app)
      .post('/api/users')
      .send(user)
  });
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

    it('should login existing user and respond with authToken', function() {
      return chai.request(app)
        .post('/api/auth/login')
        .auth('Steve', 'password')
        .then(function(res) {
          res.should.have.status(200);
          res.body.should.include.key('authToken');
        });
    });
  });

  describe('GET endpoin', function() {
    let authToken;
    before(function(done) {
      chai.request(app)
        .post('/api/auth/login')
        .auth('Steve', 'password')
        .end(function(err, res) {
          authToken = res.body.authToken;
          done();
        });
    });
    it('should allow user to access protected endpoint with JWT', function() {
      chai.request(app)
        .get('/api/protected')
        .set('authorization', 'Bearer ' + authToken)
        .then(function(res) {
          res.should.have.status(200);
        });
    });
  });
});












