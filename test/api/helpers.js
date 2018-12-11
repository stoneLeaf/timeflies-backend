const expect = require('chai').expect

const factories = require('./factories')

var Helpers = module.exports = {}

Helpers.createUserEndpoint = '/api/users'

Helpers.createUser = function (requester) {
  return requester.post(Helpers.createUserEndpoint)
    .send(factories.validRegistrationParams())
}

Helpers.userProfileEndpoint = '/api/profile'

Helpers.setAuthHeader = function (requester, token) {
  return requester.set('Authorization', `Bearer ${token}`)
}

Helpers.expectFailedValidationResponse = function (res) {
  expect(res).to.be.json
  expect(res).to.have.status(422)
  expect(res.body).to.have.property('errors')
}
