const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const {Quotes} = require('../quotes/model');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();
const {TEST_DATABASE_URL} = require('../config');


chai.use(chaiHttp);

function generateQuoteData() {
  return {
    quoteString: "Example quote Example Quote",
    author: "Benjamin Franklin",
    theme: "Business"
  }
}

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
    let authorizationToken;
    beforeEach(function(done) {
      chai.request(app)
        .post('/api/auth/login')
        .auth('Steve', 'password')
        .end(function(err, res) {
          authorizationToken = res.body.authToken;
          done();
        });
    });

    beforeEach(function() {
      const quoteInfo = generateQuoteData();
      let req = chai.request(app).post('/api/quotes/create');
      req.set('authorization', 'Bearer ' + authorizationToken)
      req.send(quoteInfo)
      return req;
    });

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

    it('should request a new JWT with a later expiry date', function() {
      return chai.request(app)
        .post('/api/auth/refresh')
        .set('authorization', 'Bearer ' + authorizationToken)
        .then(function(res) {
          res.should.have.status(200);
          res.body.should.include.key('authToken');
          //res.body.authToken.should.not.equal(authorizationToken);
        });
    });

    it('should add a quote', function() {
      const quoteInfo = generateQuoteData();
      let req = chai.request(app).post('/api/quotes/create');
      req.set('authorization', 'Bearer ' + authorizationToken)
      req.send(quoteInfo)
      return req.then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.should.be.a('object');
        res.body.quoteString.should.equal(quoteInfo.quoteString);
        res.body.should.include.key('quoteString');
        res.body._id.should.not.be.null;
      });
    });

    it('should add a theme to the theme field', function() {
      const updateQuoteData = {
        theme: 'Career'
      };
      req = chai.request(app).get('/api/quotes/all');
      req.set('authorization', 'Bearer ' + authorizationToken);
      return req.then(function(quotes) {
        updateQuoteData._id = quotes.body[0]._id;
        alterReq = chai.request(app).post(`/api/quotes/addtheme/${updateQuoteData._id}`);
        alterReq.set('authorization', 'Bearer ' + authorizationToken);
        alterReq.send(updateQuoteData);
        return alterReq
      })
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.should.be.an('object');
        res.body.theme.should.include(updateQuoteData.theme);
      });
    }); 

    it('should not add duplicate themes to theme field', function() {
      const updateQuoteData = {
        theme: 'Business'
      };
      req = chai.request(app).get('/api/quotes/all');
      req.set('authorization', 'Bearer ' + authorizationToken)
      return req.then(function(quotes) {
        updateQuoteData._id = quotes.body[0]._id;
        alterReq = chai.request(app).post(`/api/quotes/addtheme/${updateQuoteData._id}`);
        alterReq.set('authorization', 'Bearer ' + authorizationToken);
        alterReq.send(updateQuoteData);
        return alterReq
      })
      .then(function(res) {
        res.body.should.equal("The theme you want to add alreadt exists for this quote");
        res.should.have.status(200);
      });
    });
  });

  describe('GET endpoint', function() {
    let authorizationToken;
    before(function(done) {
      chai.request(app)
        .post('/api/auth/login')
        .auth('Steve', 'password')
        .end(function(err, res) {
          authorizationToken = res.body.authToken;
          done();
        });
    });

    it('should allow user to access protected endpoint with JWT', function() {
      chai.request(app)
        .get('/api/protected')
        .set('authorization', 'Bearer ' + authorizationToken)
        .then(function(res) {
          res.should.have.status(200);
          res.body.should.include.key('data');
        });
    });
  });

  describe('PUT endpoint', function() {
    let authorizationToken;
    beforeEach(function(done) {
      chai.request(app)
        .post('/api/auth/login')
        .auth('Steve', 'password')
        .end(function(err, res) {
          authorizationToken = res.body.authToken;
          done();
        });
    });

    beforeEach(function() {
      const quoteInfo = generateQuoteData();
      let req = chai.request(app).post('/api/quotes/create');
      req.set('authorization', 'Bearer ' + authorizationToken)
      req.send(quoteInfo)
      return req;
    });

    it('should update quoteString field', function() {
      const updateQuoteData = {
        quoteString: 'Example quote has been altered successfully'
      };
      req = chai.request(app).get('/api/quotes/all');
      req.set('authorization', 'Bearer ' + authorizationToken)
      return req.then(function(quotes) {
        updateQuoteData._id = quotes.body[0]._id;
        alterReq = chai.request(app).put(`/api/quotes/quotealter/${updateQuoteData._id}`);
        alterReq.set('authorization', 'Bearer ' + authorizationToken);
        alterReq.send(updateQuoteData);
        return alterReq
        })
        .then(function(res) {
          res.should.have.status(200);
          res.body.quoteString.should.equal(updateQuoteData.quoteString);
          res.should.be.json;
          res.should.be.a('object');
          res.body.should.include.key('quoteString');
          res.body._id.should.not.be.null;
        });
    });

    it('should update author field', function() {
      const updateQuoteData = {
        author: 'Albert Camus'
      };
      req = chai.request(app).get('/api/quotes/all');
      req.set('authorization', 'Bearer ' + authorizationToken)
      return req.then(function(quotes) {
        updateQuoteData._id = quotes.body[0]._id;
        alterReq = chai.request(app).put(`/api/quotes/authoralter/${updateQuoteData._id}`);
        alterReq.set('authorization', 'Bearer ' + authorizationToken);
        alterReq.send(updateQuoteData);
        return alterReq
        })
        .then(function(res) {
          res.should.have.status(200);
          res.body.author.should.equal(updateQuoteData.author);
          res.should.be.json;
          res.should.be.a('object');
          res.body.should.include.keys('author', 'quoteString', 'theme');
          res.body._id.should.not.be.null;
        });
    });
  });
});

