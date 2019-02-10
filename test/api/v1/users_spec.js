const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect

const { app, readyCallback, resetDatabase } = require('./server_interface')
const factories = require('./factories')
const { createUserEndpoint,
  userProfileEndpoint,
  createUserAlpha,
  setAuthHeader,
  expectFailedValidationResponse } = require('./helpers')

chai.use(chaiHttp)

describe('API v1 integration tests: user resource', function () {
  let requester = chai.request(app).keepOpen()
  let userAlphaToken

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
        let params = factories.alphaRegistrationParams()
        delete params.profile.email
        return expectRejectedParams(params)
      })

      it('Should require a name', function () {
        let params = factories.alphaRegistrationParams()
        delete params.profile.name
        return expectRejectedParams(params)
      })

      it('Should require a valid email', function () {
        let params = factories.alphaRegistrationParams()
        params.profile.email = 'invalid'
        return expectRejectedParams(params)
      })

      it('Should require a password', function () {
        let params = factories.alphaRegistrationParams()
        delete params.password
        return expectRejectedParams(params)
      })

      it('Should require a password of minimum 10 characters', function () {
        let params = factories.alphaRegistrationParams()
        params.password = 'failing'
        return expectRejectedParams(params)
      })

      it('Should require a password of maximum 128 characters', function () {
        let params = factories.alphaRegistrationParams()
        params.password = 'f'.repeat(129)
        return expectRejectedParams(params)
      })

      it('Should reject passwords containing spaces', function () {
        let params = factories.alphaRegistrationParams()
        params.password = 'not valid'
        return expectRejectedParams(params)
      })

      it('Should enforce email uniqueness', function () {
        // Registering a valid user
        return createUserAlpha(requester).then(function (res) {
          expect(res).to.have.status(200)
          expect(res).to.be.json
        }).then(function () {
          // Trying to register again with the same email
          return expectRejectedParams(factories.alphaRegistrationParams())
        })
      })
    })

    describe('Output', function () {
      before('Resetting database', function () {
        return resetDatabase()
      })

      it('Should return the user profile and a token', function () {
        return createUserAlpha(requester).then(function (res) {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.have.property('profile')
          expect(res.body).to.have.property('token')
          userAlphaToken = res.body.token
        })
      })
    })
  })

  describe('GET /profile (Get current user profile)', function () {
    let endpoint = userProfileEndpoint

    it('Should return the current user profile', function () {
      return setAuthHeader(requester.get(endpoint), userAlphaToken)
        .send().then(function (res) {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.have.property('profile')
          expect(res.body.profile).to.have.property('name')
        })
    })

    it('Should return a profile containing a md5 hashed email for Gravatar', function () {
      return setAuthHeader(requester.get(endpoint), userAlphaToken)
        .send().then(function (res) {
          expect(res.body).to.have.property('profile')
          expect(res.body.profile).to.have.property('hashedEmail')
          expect(res.body.profile.hashedEmail).to.equal(factories.alphaRegistrationParams().hashedEmail)
        })
    })
  })
})
