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

describe('API integration tests for the \'project\' resource', function () {
  let requester = chai.request(app).keepOpen()
  let commonEndpoint = '/api/projects'

  let userAlphaToken
  let userBetaToken
  let ceresProjectId
  let nonExistentProjectId = '1773'

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

  after('Closing server', function () {
    return requester.close()
  })

  describe('POST /projects (Create project)', function () {
    let endpoint = createProjectEndpoint

    function expectRejectedParams (params) {
      return setAuthHeader(requester.post(endpoint), userAlphaToken)
        .send(params).then(function (res) {
          expectFailedValidationResponse(res)
        })
    }

    it('Should require a name', function () {
      let params = factories.ceresProjectParams()
      delete params.name
      return expectRejectedParams(params)
    })

    it('Should require a name of min 2 characters', function () {
      let params = factories.ceresProjectParams()
      params.name = 'a'
      return expectRejectedParams(params)
    })

    it('Should require a name of max 100 characters', function () {
      let params = factories.ceresProjectParams()
      params.name = 'a'.repeat(101)
      return expectRejectedParams(params)
    })

    it('Should accept valid params and return project', function () {
      return setAuthHeader(requester.post(endpoint), userAlphaToken)
        .send(factories.ceresProjectParams()).then(function (res) {
          expect(res).to.be.json
          expect(res).to.have.status(201)
          expect(res.body).to.have.property('project')
          expect(res.body.project).to.have.property('id')
          ceresProjectId = res.body.project.id
          // As per HTTP code 201 RFC spec
          expect(res.header).to.have.property('location')
        })
    })

    it('Should enforce name uniqueness in user\'s scope', function () {
      return expectRejectedParams(factories.ceresProjectParams())
    })
  })

  describe('GET /projects (List current user projects)', function () {
    let endpoint = commonEndpoint
    let venusProjectId

    before('Creating a second project', function () {
      return setAuthHeader(requester.post(endpoint), userAlphaToken)
        .send(factories.venusProjectParams()).then(function (res) {
          venusProjectId = res.body.project.id
        })
    })

    it('Should output a array of the current user\'s projects', function () {
      return setAuthHeader(requester.get(endpoint), userAlphaToken)
        .send().then(function (res) {
          expect(res).to.be.json
          expect(res).to.have.status(200)
          expect(res.body).to.have.property('projects')
          expect(res.body.projects).to.be.an('array')
            .which.nested.include({ id: ceresProjectId })
            .and.which.nested.include({ id: venusProjectId })
        })
    })
  })

  describe('GET /projects/:id (Get project by id)', function () {
    let endpoint = `${commonEndpoint}/${ceresProjectId}`

    it('Should only be accessible to the project owner', function () {
      return setAuthHeader(requester.get(endpoint), userBetaToken)
        .send().then(function (res) {
          expectForbiddenResponse(res)
        })
    })

    it('Should return the project', function () {
      let paramsAtCreation = factories.ceresProjectParams()
      return setAuthHeader(requester.get(endpoint), userAlphaToken)
        .send().then(function (res) {
          expect(res).to.be.json
          expect(res).to.have.status(200)
          expect(res.body).to.have.property('project')
          expect(res.body.project).to.have.property('name')
          expect(res.body.project.name).to.be.equal(paramsAtCreation.name)
        })
    })

    it('Should properly handle non existent resources', function () {
      let specificEndpoint = `${commonEndpoint}/${nonExistentProjectId}`
      return setAuthHeader(requester.get(specificEndpoint), userAlphaToken)
        .send().then(function (res) {
          expectNotFoundResponse(res)
        })
    })
  })

  describe('PATCH /projects/:id (Update project by id)', function () {
    let endpoint = `${commonEndpoint}/${ceresProjectId}`

    /**
     * Note: Validation is only tested in resource creation as usually the same
     * inner logics are called when updating.
     * // TODO: should probably be tested everywhere, but must find a DRY way
     */

    it('Should be denied to all users other than the owner', function () {
      let params = {}
      params.name = 'New name'
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

    it('Should accept valid params and return updated project', function () {
      let params = {}
      params.name = 'New name again'
      return setAuthHeader(requester.patch(endpoint), userAlphaToken)
        .send(params).then(function (res) {
          expect(res).to.be.json
          expect(res).to.have.status(200)
          expect(res.body).to.have.property('project')
          expect(res.body.project).to.have.property('name')
          expect(res.body.project.name).to.be.equal(params.name)
        })
    })

    it('Should properly handle non existent resources', function () {
      let specificURI = `${commonEndpoint}/${nonExistentProjectId}`
      return setAuthHeader(requester.patch(specificURI), userAlphaToken)
        .send({ name: 'New name' }).then(function (res) {
          expectNotFoundResponse(res)
        })
    })
  })

  describe('DELETE /projects/:id (Delete project by id)', function () {
    let endpoint = `${commonEndpoint}/${ceresProjectId}`

    it('Should be denied to all users other than the owner', function () {
      return setAuthHeader(requester.delete(endpoint), userBetaToken).send()
        .then(function (res) {
          expectForbiddenResponse(res)
        })
    })

    it('Should be allowed to the owner', function () {
      return setAuthHeader(requester.delete(endpoint), userAlphaToken).send()
        .then(function (res) {
          expect(res).to.be.json
          expect(res).to.have.status(200)
        })
    })

    it('Should properly handle non existent resources', function () {
      let specificURI = `${commonEndpoint}/${nonExistentProjectId}`
      return setAuthHeader(requester.delete(specificURI), userAlphaToken)
        .send().then(function (res) {
          expectNotFoundResponse(res)
        })
    })
  })
})
