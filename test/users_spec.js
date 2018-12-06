const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect
const factories = require('./factories')

chai.use(chaiHttp)

const app = require('../app')

// Keeping the connection open for multiple requests
var requester = chai.request(app).keepOpen()

describe('User registration', function () {
  let endpoint = '/api/users'
  describe('Validation', function () {
    it('Should require an email', function (done) {
      let params = factories.validLoginParams()
      delete params.email
      requester.post(endpoint)
        .send(params).then(function (res) {
          // expect(req).to.have.param('email')
          expect(res).to.be.json
          expect(res).to.have.status(422)
          expect(res.body).to.have.property('errors')
          done()
        }).catch(function (err) { done(err) })
    })
    it('Should require a valid email', function (done) {
      let params = factories.validLoginParams()
      params.email = 'invalid'
      requester.post(endpoint)
        .send(params).then(function (res) {
          // expect(req).to.have.param('email')
          expect(res).to.be.json
          expect(res).to.have.status(422)
          expect(res.body).to.have.property('errors')
          done()
        }).catch(function (err) { done(err) })
    })
    it('Should require a password', function (done) {
      let params = factories.validLoginParams()
      delete params.password
      requester.post(endpoint)
        .send(params).then(function (res) {
          // expect(req).to.have.param('email')
          expect(res).to.be.json
          expect(res).to.have.status(422)
          expect(res.body).to.have.property('errors')
          done()
        }).catch(function (err) { done(err) })
    })
    it('Should require a password', function (done) {
      let params = factories.validLoginParams()
      delete params.password
      requester.post(endpoint)
        .send(params).then(function (res) {
          // expect(req).to.have.param('email')
          expect(res).to.be.json
          expect(res).to.have.status(422)
          expect(res.body).to.have.property('errors')
          done()
        }).catch(function (err) { done(err) })
    })
  })
})
