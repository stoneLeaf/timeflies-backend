const expect = require('chai').expect

const factories = require('./factories')

var Helpers = module.exports = {}

Helpers.basePath = '/api/v1'

Helpers.createUserEndpoint = `${Helpers.basePath}/users`

Helpers.createUserAlpha = function (requester) {
  return requester.post(Helpers.createUserEndpoint)
    .send(factories.alphaRegistrationParams())
}

Helpers.createUserBeta = function (requester) {
  return requester.post(Helpers.createUserEndpoint)
    .send(factories.betaRegistrationParams())
}

Helpers.createProjectEndpoint = `${Helpers.basePath}/projects`

Helpers.userProfileEndpoint = `${Helpers.basePath}/profile`

Helpers.setAuthHeader = function (requester, token) {
  return requester.set('Authorization', `Bearer ${token}`)
}

Helpers.expectFailedValidationResponse = function (res) {
  expect(res).to.have.status(422)
  expect(res).to.be.json
  expect(res.body).to.have.property('errors')
}

Helpers.expectForbiddenResponse = function (res) {
  // Could send a 404 instead to hide the existence of the resource
  expect(res).to.have.status(403)
  expect(res).to.be.json
  expect(res.body).to.have.property('errors')
}

Helpers.expectNotFoundResponse = function (res) {
  expect(res).to.have.status(404)
  expect(res).to.be.json
  expect(res.body).to.have.property('errors')
}
