const expect = require('chai').expect

const factories = require('./factories')

var Helpers = module.exports = {}

Helpers.createUserEndpoint = '/api/users'

Helpers.createUser = function (requester) {
  return new Promise(function (resolve, reject) {
    requester.post(Helpers.createUserEndpoint)
      .send(factories.validRegistrationParams())
      .then(function (res) { resolve(res) }).catch(err => reject(err))
  })
}

Helpers.expectFailedValidationResponse = function (res) {
  expect(res).to.be.json
  expect(res).to.have.status(422)
  expect(res.body).to.have.property('errors')
}
