const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect

const factories = require('./factories')
const { expectFailedValidationResponse } = require('./helpers')

chai.use(chaiHttp)

// Accessing the app through an implementation-agnostic interface
const { app, readyCallback, resetDatabase } = require('./server_interface')

describe('API integration tests for the user resource', function () {
  // Keeping the connection open for multiple requests
  let requester = chai.request(app).keepOpen()

  before('Waiting for app to be ready', function (done) {
    readyCallback(done)
  })

  after('Closing server', function (done) {
    requester.close()
    done()
  })

  describe('POST /users (User registration)', function () {
    let endpoint = '/api/users'

    describe('Validation', function () {
      function expectRejectedParams (params, done) {
        requester.post(endpoint).send(params)
          .then(function (res) {
            expectFailedValidationResponse(res)
            done()
          }).catch(function (err) { done(err) })
      }

      before('Resetting database', function (done) {
        resetDatabase(done)
      })

      it('Should require an email', function (done) {
        let params = factories.validRegistrationParams()
        delete params.email
        expectRejectedParams(params, done)
      })

      it('Should require a valid email', function (done) {
        let params = factories.validRegistrationParams()
        params.email = 'invalid'
        expectRejectedParams(params, done)
      })

      it('Should require a password', function (done) {
        let params = factories.validRegistrationParams()
        delete params.password
        expectRejectedParams(params, done)
      })

      it('Should require a password of minimum 10 characters', function (done) {
        let params = factories.validRegistrationParams()
        params.password = 'failing'
        expectRejectedParams(params, done)
      })

      it('Should require a password of maximum 128 characters', function (done) {
        let params = factories.validRegistrationParams()
        params.password = 'f'.repeat(129)
        expectRejectedParams(params, done)
      })

      it('Should reject passwords containing spaces', function (done) {
        let params = factories.validRegistrationParams()
        params.password = 'not valid'
        expectRejectedParams(params, done)
      })

      it('Should enforce email uniqueness', function (done) {
        let params = factories.validRegistrationParams()
        // Registering a user
        requester.post(endpoint).send(params)
          .then(function (res) {
            expect(res).to.be.json
            expect(res).to.have.status(200)
          })
          .then(function () {
            // Trying to register again with the same email
            expectRejectedParams(params, done)
          })
          .catch(function (err) { done(err) })
      })
    })

    describe('Output', function () {
      before('Resetting database', function (done) {
        resetDatabase(done)
      })

      it('Should return the user profile and a token', function (done) {
        let params = factories.validRegistrationParams()
        requester.post(endpoint).send(params)
          .then(function (res) {
            expect(res).to.be.json
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('profile')
            expect(res.body).to.have.property('token')
            done()
          }).catch(function (err) { done(err) })
      })
    })
  })
})
