const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect

const { app, readyCallback, resetDatabase } = require('./server_interface')
const factories = require('./factories')
const { basePath,
  createUserAlpha, createUserBeta,
  createProjectEndpoint,
  setAuthHeader,
  expectFailedValidationResponse,
  expectForbiddenResponse,
  expectNotFoundResponse } = require('./helpers')

chai.use(chaiHttp)

describe(`API v1 integration tests: 'activity' resource`, function () {
  let requester = chai.request(app).keepOpen()
  let commonEndpoint = `${basePath}/activities`

  let userAlphaToken
  let userBetaToken
  let ceresProjectId
  let venusProjectId
  let firstActivityId
  let firstActivityEndDate
  let secondActivityId
  let thirdActivityId
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

  before('Creating projects', function () {
    return setAuthHeader(requester.post(createProjectEndpoint), userAlphaToken)
      .send(factories.ceresProjectParams()).then(function (res) {
        ceresProjectId = res.body.project.id
      }).then(function () {
        return setAuthHeader(requester.post(createProjectEndpoint), userAlphaToken)
          .send(factories.venusProjectParams())
      }).then(function (res) {
        venusProjectId = res.body.project.id
      })
  })

  after('Closing server', function () {
    return requester.close()
  })

  describe('POST /projects/:id/activities (Create activity)', function () {
    let endpoint

    function expectRejectedParams (params) {
      return setAuthHeader(requester.post(endpoint), userAlphaToken)
        .send(params).then(function (res) {
          expectFailedValidationResponse(res)
        })
    }

    before('Setting endpoint', function () {
      endpoint = `${basePath}/projects/${ceresProjectId}/activities`
    })

    it('Should require a start date', function () {
      let params = {}
      return expectRejectedParams(params)
    })

    it('Should reject non ISO 8601 dates', function () {
      // TODO: add other test cases
      let params = {}
      params.startDate = 'aaa'
      return expectRejectedParams(params)
    })

    it('Should reject future start dates', function () {
      let params = {}
      let futureDate = new Date()
      futureDate.setHours(futureDate.getHours() + 1)
      params.startDate = futureDate
      return expectRejectedParams(params)
    })

    it('Should reject future end dates', function () {
      let params = {}
      params.startDate = new Date()
      let futureDate = new Date(params.startDate)
      futureDate.setHours(futureDate.getHours() + 1)
      params.endDate = futureDate
      return expectRejectedParams(params)
    })

    it('Should not allow the end date to be before the start date', function () {
      let params = {}
      params.startDate = new Date()
      let pastDate = new Date()
      pastDate.setHours(pastDate.getHours() - 1)
      params.endDate = pastDate
      return expectRejectedParams(params)
    })

    it('Should return an activity on success', function () {
      let params = factories.firstActivityParams()
      firstActivityEndDate = params.endDate
      return setAuthHeader(requester.post(endpoint), userAlphaToken)
        .send(params).then(function (res) {
          expect(res).to.have.status(201)
          expect(res).to.be.json
          expect(res.body).to.have.property('activity')
          expect(res.body.activity).to.have.property('description')
          expect(res.body.activity.description).to.equal(params.description)
          expect(res.body.activity).to.have.property('project')
          expect(res.body.activity.project).to.equal(ceresProjectId)
          expect(res.body.activity).to.have.property('id')
          firstActivityId = res.body.activity.id
          // As per HTTP code 201 RFC spec
          expect(res.header).to.have.property('location')
        })
    })

    it('Should not allow an activity which starts in the same time frame as another', function () {
      let params = {}
      let { startDate, endDate } = factories.firstActivityParams()
      let firstActivityDuration = endDate.getTime() - startDate.getTime()
      params.startDate = new Date(endDate.getTime() - (firstActivityDuration / 2))
      params.endDate = new Date()
      return expectRejectedParams(params)
    })

    it('Should not allow a running activity which starts in the same time frame as another', function () {
      let params = {}
      let { startDate, endDate } = factories.firstActivityParams()
      let firstActivityDuration = endDate.getTime() - startDate.getTime()
      params.startDate = new Date(endDate.getTime() - (firstActivityDuration / 2))
      return expectRejectedParams(params)
    })

    it('Should not allow a running activity which starts before an other activity', function () {
      let params = {}
      params.startDate = factories.firstActivityParams().startDate
      params.startDate.setHours(params.startDate.getHours() - 1)
      return expectRejectedParams(params)
    })

    it('Should not allow an activity which ends in the same time frame as another', function () {
      let params = {}
      let { startDate, endDate } = factories.firstActivityParams()
      params.startDate = new Date(startDate)
      params.startDate.setHours(startDate.getHours() - 1)
      let firstActivityDuration = endDate.getTime() - startDate.getTime()
      params.endDate = new Date(startDate.getTime() + (firstActivityDuration / 2))
      return expectRejectedParams(params)
    })

    it('Should allow creation outside the time frame of another activity', function () {
      let params = factories.secondActivityParams()
      return setAuthHeader(requester.post(endpoint), userAlphaToken)
        .send(params).then(function (res) {
          expect(res).to.have.status(201)
          expect(res).to.be.json
          secondActivityId = res.body.activity.id
        })
    })

    it('Should not allow creation of a running activity while one is already running', function () {
      let params = {}
      params.startDate = new Date()
      return expectRejectedParams(params)
    })
  })

  describe('PATCH /activities/:id (Update activity by id)', function () {
    let endpoint

    before('Setting endpoint', function () {
      endpoint = `${commonEndpoint}/${secondActivityId}`
    })

    it('Should be denied to all users other than the owner', function () {
      let params = {}
      params.endDate = (new Date())
      return setAuthHeader(requester.patch(endpoint), userBetaToken)
        .send(params).then(function (res) {
          expectForbiddenResponse(res)
        })
    })

    it('Should allow patch without changes', function () {
      let params = factories.secondActivityParams()
      return setAuthHeader(requester.patch(endpoint), userAlphaToken)
        .send(params).then(function (res) {
          expect(res).to.have.status(200)
          expect(res).to.be.json
        })
    })

    it('Should return the updated activity on success', function () {
      let params = {}
      params.endDate = (new Date())
      return setAuthHeader(requester.patch(endpoint), userAlphaToken)
        .send(params).then(function (res) {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.have.property('activity')
          expect(res.body.activity).to.have.property('endDate')
          expect(res.body.activity.endDate).to.be.equal(params.endDate.toJSON())
        })
    })

    it('Should properly handle non existent resources', function () {
      let specificEndpoint = `${commonEndpoint}/${nonExistentActivityId}`
      return setAuthHeader(requester.patch(specificEndpoint), userAlphaToken)
        .send({ endDate: (new Date()) }).then(function (res) {
          expectNotFoundResponse(res)
        })
    })
  })

  describe('GET /projects/:id/activities (List project activities)', function () {
    let ceresEndpoint

    before('Creating an activity for the second project', function () {
      // To make sure this endpoint filters per project
      let endpoint = `${basePath}/projects/${venusProjectId}/activities`
      let params = {}
      params.startDate = new Date()
      return setAuthHeader(requester.post(endpoint), userAlphaToken)
        .send(params).then(function (res) {
          expect(res).to.have.status(201)
          thirdActivityId = res.body.activity.id
        })
    })

    before('Setting endpoint', function () {
      ceresEndpoint = `${basePath}/projects/${ceresProjectId}/activities`
    })

    it('Should output a array in reverse chronological order', function () {
      return setAuthHeader(requester.get(ceresEndpoint), userAlphaToken)
        .send().then(function (res) {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.have.property('activities')
          expect(res.body.activities).to.be.an('array').and.have.lengthOf(2)
          expect(res.body.activities[0]).to.nested.include({ id: secondActivityId })
          expect(res.body.activities[1]).to.nested.include({ id: firstActivityId })
        })
    })

    it('Should have pagination', function () {
      let params = {}
      params.limit = 1
      // TODO: offset not really tested because only two activities
      params.offset = 1
      return setAuthHeader(requester.get(ceresEndpoint), userAlphaToken)
        .query(params).then(function (res) {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.have.property('activities')
          expect(res.body.activities).to.be.an('array').and.have.lengthOf(1)
          expect(res.body.activities[0]).to.nested.include({ id: firstActivityId })
          expect(res.body).to.have.property('total')
          expect(res.body.total).to.be.equal(2)
        })
    })

    it('Should have a before filter', function () {
      let params = {}
      params.before = firstActivityEndDate
      return setAuthHeader(requester.get(ceresEndpoint), userAlphaToken)
        .send(params).then(function (res) {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.have.property('activities')
          expect(res.body.activities).to.be.an('array').and.have.lengthOf(1)
          expect(res.body.activities[0]).to.nested.include({ id: firstActivityId })
        })
    })

    it('Should have an after filter', function () {
      let params = {}
      params.after = firstActivityEndDate
      return setAuthHeader(requester.get(ceresEndpoint), userAlphaToken)
        .send(params).then(function (res) {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.have.property('activities')
          expect(res.body.activities).to.be.an('array').and.have.lengthOf(1)
          expect(res.body.activities[0]).to.nested.include({ id: secondActivityId })
        })
    })
  })

  describe('GET /activities (List current user last activities)', function () {
    let endpoint = commonEndpoint

    it('Should output a array with all the user activities', function () {
      return setAuthHeader(requester.get(endpoint), userAlphaToken)
        .send().then(function (res) {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.have.property('activities')
          expect(res.body.activities).to.be.an('array').and.have.lengthOf(3)
          expect(res.body.activities[0]).to.nested.include({ id: thirdActivityId })
          expect(res.body.activities[1]).to.nested.include({ id: secondActivityId })
          expect(res.body.activities[2]).to.nested.include({ id: firstActivityId })
        })
    })
  })

  describe('GET /activities/:id (Get activity by id)', function () {
    let endpoint

    before('Setting endpoint', function () {
      endpoint = `${commonEndpoint}/${firstActivityId}`
    })

    it('Should only be accessible to the parent user', function () {
      return setAuthHeader(requester.get(endpoint), userBetaToken)
        .send().then(function (res) {
          expectForbiddenResponse(res)
        })
    })

    it('Should return the activity', function () {
      return setAuthHeader(requester.get(endpoint), userAlphaToken)
        .send().then(function (res) {
          expect(res).to.have.status(200)
          expect(res).to.be.json
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
    let endpoint

    before('Setting endpoint', function () {
      endpoint = `${commonEndpoint}/${firstActivityId}`
    })

    it('Should be denied to all users other than the parent user', function () {
      return setAuthHeader(requester.delete(endpoint), userBetaToken).send()
        .then(function (res) {
          expectForbiddenResponse(res)
        })
    })

    it('Should be allowed to the parent user', function () {
      return setAuthHeader(requester.delete(endpoint), userAlphaToken).send()
        .then(function (res) {
          expect(res).to.have.status(200)
          expect(res).to.be.json
        })
    })

    it('Should make the resource non existent', function () {
      return setAuthHeader(requester.delete(endpoint), userAlphaToken)
        .send().then(function (res) {
          expectNotFoundResponse(res)
        })
    })
  })
})
