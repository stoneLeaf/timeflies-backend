const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect

const factories = require('./factories')
const { createUserAlpha, createUserBeta, createProjectEndpoint, setAuthHeader,
  expectFailedValidationResponse,
  expectForbiddenResponse,
  expectNotFoundResponse } = require('./helpers')
const { app, readyCallback, resetDatabase } = require('./server_interface')

chai.use(chaiHttp)

describe('API integration tests for the \'activity\' resource', function () {
  let requester = chai.request(app).keepOpen()
  let commonEndpoint = '/api/activities'

  let userAlphaToken
  let userBetaToken
  let ceresProjectId
  let firstActivityId
  let secondActivityId
  let nonExistentActivityId = '1773'

  before('Waiting for app to be ready', function () {
    return readyCallback()
  })

  before('Resetting database', function () {
    return resetDatabase()
  })

  before('Registering users and storing authentication tokens', function () {
    return createUserAlpha(requester).then(function (res) {
      userAlphaToken = res.body.token
    }).then(function () {
      return createUserBeta(requester)
    }).then(function (res) {
      userBetaToken = res.body.token
    })
  })

  before('Creating a project', function () {
    return setAuthHeader(requester.post(createProjectEndpoint), userAlphaToken)
      .send(factories.ceresProjectParams()).then(function (res) {
        ceresProjectId = res.body.project.id
      })
  })

  after('Closing server', function () {
    return requester.close()
  })

  describe('POST /projects/:id/activities (Create activity)', function () {
    let endpoint = `/api/projects/${ceresProjectId}/activities`

    function expectRejectedParams (params) {
      return setAuthHeader(requester.post(endpoint), userAlphaToken)
        .send(params).then(function (res) {
          expectFailedValidationResponse(res)
        })
    }

    it('Should require a start date', function () {
      let params = factories.firstActivityParams()
      delete params.startDate
      return expectRejectedParams(params)
    })

    it('Should reject non ISO 8601 dates', function () {
      // TODO: add other test cases
      let params = factories.firstActivityParams()
      params.startDate = 'aaa'
      return expectRejectedParams(params)
    })

    it('Should reject future start dates', function () {
      let params = factories.firstActivityParams()
      let futureDate = new Date()
      futureDate = futureDate.setUTCFullYear(futureDate.getUTCFullYear() + 1)
      params.startDate = futureDate.toJSON()
      return expectRejectedParams(params)
    })

    it('Should not allow the end date to be before the start date', function () {
      let params = factories.firstActivityParams()
      let pastDate = new Date()
      pastDate = pastDate.setUTCFullYear(pastDate.getUTCFullYear() - 1)
      params.endDate = pastDate.toJSON()
      return expectRejectedParams(params)
    })

    it('Should return an activity belonging to the project', function () {
      return setAuthHeader(requester.post(endpoint), userAlphaToken)
        .send(factories.firstActivityParams()).then(function (res) {
          expect(res).to.be.json
          expect(res).to.have.status(201)
          expect(res.body).to.have.property('activity')
          expect(res.body.activity).to.have.property('id')
          expect(res.body.activity).to.have.property('project')
          expect(res.body.activity.project).to.equal(ceresProjectId)
          firstActivityId = res.body.activity.id
          // As per HTTP code 201 RFC spec
          expect(res.header).to.have.property('location')
        })
    })

    it('Should not be able to create an activity in the same time frame as another', function () {
      return expectRejectedParams(factories.secondActivityParams())
    })
  })

  describe('PATCH /activities/:id (Update activity by id)', function () {
    let endpoint = `${commonEndpoint}/${firstActivityId}`

    it('Should be denied to all users other than the owner', function () {
      let params = {}
      params.endDate = (new Date()).toJSON()
      return setAuthHeader(requester.patch(endpoint), userBetaToken)
        .send(params).then(function (res) {
          expectForbiddenResponse(res)
        })
    })

    it('Should require at least one param', function () {
      return setAuthHeader(requester.patch(endpoint), userAlphaToken)
        .send({}).then(function (res) {
          expectFailedValidationResponse(res)
        })
    })

    it('Should return the updated activity on success', function () {
      let params = {}
      params.endDate = (new Date()).toJSON()
      return setAuthHeader(requester.patch(endpoint), userAlphaToken)
        .send(params).then(function (res) {
          expect(res).to.be.json
          expect(res).to.have.status(200)
          expect(res.body).to.have.property('activity')
          expect(res.body.activity).to.have.property('endDate')
          expect(res.body.activity.endDate).to.be.equal(params.endDate.toJSON())
        })
    })

    it('Should properly handle non existent resources', function () {
      let specificEndpoint = `${commonEndpoint}/${nonExistentActivityId}`
      return setAuthHeader(requester.patch(specificEndpoint), userAlphaToken)
        .send({ endDate: (new Date()).toJSON() }).then(function (res) {
          expectNotFoundResponse(res)
        })
    })
  })

  describe('GET /activities (List current user last activities)', function () {
    let endpoint = commonEndpoint

    before('Creating a second activity', function () {
      let createEndpoint = `/api/projects/${ceresProjectId}/activities`
      return setAuthHeader(requester.post(createEndpoint), userAlphaToken)
        .send(factories.secondActivityParams()).then(function (res) {
          secondActivityId = res.body.activity.id
        })
    })

    it('Should output a array of the projects\' activities', function () {
      return setAuthHeader(requester.get(endpoint), userAlphaToken)
        .send().then(function (res) {
          expect(res).to.be.json
          expect(res).to.have.status(200)
          expect(res.body).to.have.property('activities')
          expect(res.body.activities).to.be.an('array')
            .which.nested.include({ id: firstActivityId })
            .and.which.nested.include({ id: secondActivityId })
        })
    })
  })

  describe('GET /activities/:id (Get activity by id)', function () {
    let endpoint = `${commonEndpoint}/${firstActivityId}`

    it('Should only be accessible to the parent user', function () {
      return setAuthHeader(requester.get(endpoint), userBetaToken)
        .send().then(function (res) {
          expectForbiddenResponse(res)
        })
    })

    it('Should return the activity', function () {
      return setAuthHeader(requester.get(endpoint), userAlphaToken)
        .send().then(function (res) {
          expect(res).to.be.json
          expect(res).to.have.status(200)
          expect(res.body).to.have.property('activity')
        })
    })

    it('Should properly handle non existent resources', function () {
      let specificURI = `${commonEndpoint}/${nonExistentActivityId}`
      return setAuthHeader(requester.get(specificURI), userAlphaToken)
        .send().then(function (res) {
          expectNotFoundResponse(res)
        })
    })
  })

  describe('DELETE /activities/:id (Delete activity by id)', function () {
    let endpoint = `${commonEndpoint}/${firstActivityId}`

    it('Should be denied to all users other than the parent user', function () {
      return setAuthHeader(requester.delete(endpoint), userBetaToken).send()
        .then(function (res) {
          expectForbiddenResponse(res)
        })
    })

    it('Should be allowed to the parent user', function () {
      return setAuthHeader(requester.delete(endpoint), userAlphaToken).send()
        .then(function (res) {
          expect(res).to.be.json
          expect(res).to.have.status(200)
        })
    })

    it('Should properly handle non existent resources', function () {
      let specificURI = `${commonEndpoint}/${nonExistentActivityId}`
      return setAuthHeader(requester.delete(specificURI), userAlphaToken)
        .send().then(function (res) {
          expectNotFoundResponse(res)
        })
    })
  })
})
