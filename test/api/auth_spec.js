const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect

const factories = require('./factories')
const { expectFailedValidationResponse } = require('./helpers')
const { app, readyCallback, resetDatabase } = require('./server_interface')

chai.use(chaiHttp)

describe('API integration tests for authentication', function () {
  // Keeping the connection open for multiple requests
  let requester = chai.request(app).keepOpen()

  before('Waiting for app to be ready', function (done) {
    readyCallback(done)
  })

  after('Closing server', function (done) {
    requester.close()
    done()
  })

  describe('POST /auth (Authenticate)', function () {
    let endpoint = '/api/auth'

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
      let params = factories.validLoginParams()
      delete params.email
      expectRejectedParams(params, done)
    })

    it('Should require a password', function (done) {
      let params = factories.validLoginParams()
      delete params.password
      expectRejectedParams(params, done)
    })

    it('Should reject invalid credentials', function (done) {
      let params = factories.validLoginParams()
      params.email = 'not@registered'
      requester.post(endpoint).send(params)
        .then(function (res) {
          expect(res).to.be.json
          expect(res).to.have.status(401)
          expect(res.body).to.have.property('errors')
          done()
        }).catch(function (err) { done(err) })
    })

    it('Should return the user profile and a token', function (done) {
      let params = factories.validLoginParams()
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
