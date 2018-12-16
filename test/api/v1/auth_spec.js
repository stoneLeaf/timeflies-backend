const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect
const jwt = require('jsonwebtoken')

const { app, readyCallback, resetDatabase } = require('./server_interface')
const factories = require('./factories')
const { basePath,
  userProfileEndpoint,
  createUserAlpha,
  setAuthHeader,
  expectFailedValidationResponse } = require('./helpers')

chai.use(chaiHttp)

describe('API v1 integration testing: authentication', function () {
  let requester = chai.request(app).keepOpen()
  let userAlphaToken

  before('Waiting for app to be ready', function () {
    return readyCallback()
  })

  after('Closing server', function () {
    return requester.close()
  })

  describe('POST /auth/login (Authenticate)', function () {
    let endpoint = `${basePath}/auth/login`

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
      let params = factories.alphaLoginParams()
      delete params.email
      return expectRejectedParams(params)
    })

    it('Should require a password', function () {
      let params = factories.alphaLoginParams()
      delete params.password
      return expectRejectedParams(params)
    })

    it('Should reject invalid credentials', function () {
      let params = factories.alphaLoginParams()
      params.email = 'not@registered'
      return requester.post(endpoint).send(params)
        .then(function (res) {
          expect(res).to.have.status(401)
          expect(res).to.be.json
          expect(res.body).to.have.property('errors')
        })
    })

    it('Should return the user profile and a token', function () {
      return createUserAlpha(requester).then(function () {
        return requester.post(endpoint).send(factories.alphaLoginParams())
          .then(function (res) {
            expect(res).to.have.status(200)
            expect(res).to.be.json
            expect(res.body).to.have.property('profile')
            expect(res.body).to.have.property('token')
            userAlphaToken = res.body.token
          })
      })
    })

    it('Should return a valid token', function () {
      // TODO: not so great to rely on a random endpoint?
      return setAuthHeader(requester.get(userProfileEndpoint), userAlphaToken)
        .send().then(function (res) {
          expect(res).to.have.status(200)
        })
    })

    it('Should return a token which expires', function () {
      let payload = jwt.decode(userAlphaToken, { complete: true }).payload
      expect(payload).to.have.property('exp')
    })
  })
})
