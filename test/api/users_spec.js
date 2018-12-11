const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect

const factories = require('./factories')
const { createUserEndpoint, createUser,
  userProfileEndpoint,
  setAuthHeader,
  expectFailedValidationResponse } = require('./helpers')
// Accessing the app through an implementation-agnostic interface
const { app, readyCallback, resetDatabase } = require('./server_interface')

chai.use(chaiHttp)

describe('API integration tests for the user resource', function () {
  // Keeping the connection open for multiple requests
  let requester = chai.request(app).keepOpen()
  let token

  before('Waiting for app to be ready', function () {
    return readyCallback()
  })

  after('Closing server', function () {
    return requester.close()
  })

  describe('POST /users (User registration)', function () {
    let endpoint = createUserEndpoint

    describe('Validation', function () {
      function expectRejectedParams (params) {
        return requester.post(endpoint).send(params)
          .then(function (res) {
            expectFailedValidationResponse(res)
          })
      }

      before('Resetting database', function () {
        return resetDatabase()
      })

      it('Should require an email', function () {
        let params = factories.validRegistrationParams()
        delete params.email
        return expectRejectedParams(params)
      })

      it('Should require a valid email', function () {
        let params = factories.validRegistrationParams()
        params.email = 'invalid'
        return expectRejectedParams(params)
      })

      it('Should require a password', function () {
        let params = factories.validRegistrationParams()
        delete params.password
        return expectRejectedParams(params)
      })

      it('Should require a password of minimum 10 characters', function () {
        let params = factories.validRegistrationParams()
        params.password = 'failing'
        return expectRejectedParams(params)
      })

      it('Should require a password of maximum 128 characters', function () {
        let params = factories.validRegistrationParams()
        params.password = 'f'.repeat(129)
        return expectRejectedParams(params)
      })

      it('Should reject passwords containing spaces', function () {
        let params = factories.validRegistrationParams()
        params.password = 'not valid'
        return expectRejectedParams(params)
      })

      it('Should enforce email uniqueness', function () {
        // Registering a valid user
        return createUser(requester).then(function (res) {
          expect(res).to.be.json
          expect(res).to.have.status(200)
        }).then(function () {
          // Trying to register again with the same email
          return expectRejectedParams(factories.validRegistrationParams())
        })
      })
    })

    describe('Output', function () {
      before('Resetting database', function () {
        return resetDatabase()
      })

      it('Should return the user profile and a token', function () {
        return createUser(requester).then(function (res) {
          expect(res).to.be.json
          expect(res).to.have.status(200)
          expect(res.body).to.have.property('profile')
          expect(res.body).to.have.property('token')
          token = res.body.token
        })
      })
    })
  })

  describe('GET /profile (Get current user profile)', function () {
    let endpoint = userProfileEndpoint

    it('Should return the current user profile', function () {
      return setAuthHeader(requester.get(endpoint), token)
        .send().then(function (res) {
          expect(res).to.be.json
          expect(res).to.have.status(200)
          expect(res.body).to.have.property('profile')
        })
    })
  })
})
