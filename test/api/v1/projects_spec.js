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

describe(`API v1 integration tests: 'project' resource`, function () {
  let requester = chai.request(app).keepOpen()
  let commonEndpoint = `${basePath}/projects`

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

    it('Should return the new project on validation success', function () {
      return setAuthHeader(requester.post(endpoint), userAlphaToken)
        .send(factories.ceresProjectParams()).then(function (res) {
          expect(res).to.have.status(201)
          expect(res).to.be.json
          expect(res.body).to.have.property('project')
          expect(res.body.project).to.have.property('id')
          ceresProjectId = res.body.project.id
          // As per HTTP code 201 RFC spec
          expect(res.header).to.have.property('location')
        })
    })

    it('Should not allow a project with the same name in the user\'s scope', function () {
      return expectRejectedParams(factories.ceresProjectParams())
    })

    it('Should allow another user to create a project with the same name', function () {
      return setAuthHeader(requester.post(endpoint), userBetaToken)
        .send(factories.ceresProjectParams()).then(function (res) {
          expect(res).to.have.status(201)
        })
    })
  })

  describe('GET /projects (List current user projects)', function () {
    let endpoint = commonEndpoint
    let venusProjectId
    let aldebaranProjectId

    before('Creating other projects', function () {
      return setAuthHeader(requester.post(endpoint), userAlphaToken)
        .send(factories.venusProjectParams()).then(function (res) {
          venusProjectId = res.body.project.id
        }).then(function () {
          return setAuthHeader(requester.post(endpoint), userAlphaToken)
            .send(factories.aldebaranProjectParams())
        }).then(function (res) {
          aldebaranProjectId = res.body.project.id
        })
    })

    it('Should output a array in alphabetical order', function () {
      return setAuthHeader(requester.get(endpoint), userAlphaToken)
        .send().then(function (res) {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.have.property('projects')
          expect(res.body.projects).to.be.an('array').and.have.lengthOf(3)
          expect(res.body.projects[0]).to.nested.include({ id: aldebaranProjectId.toString() })
          expect(res.body.projects[1]).to.nested.include({ id: ceresProjectId.toString() })
          expect(res.body.projects[2]).to.nested.include({ id: venusProjectId.toString() })
        })
    })

    it('Should have pagination', function () {
      let params = {}
      params.limit = 1
      params.offset = 1
      return setAuthHeader(requester.get(endpoint), userAlphaToken)
        .query(params).then(function (res) {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.have.property('projects')
          expect(res.body.projects).to.be.an('array').and.have.lengthOf(1)
          expect(res.body.projects[0]).to.nested.include({ id: ceresProjectId.toString() })
          expect(res.body).to.have.property('total')
          expect(res.body.total).to.be.equal(3)
        })
    })
  })

  describe('GET /projects/:id (Get project by id)', function () {
    let endpoint

    before('Setting endpoint', function () {
      endpoint = `${commonEndpoint}/${ceresProjectId}`
    })

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
          expect(res).to.have.status(200)
          expect(res).to.be.json
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
    let endpoint

    before('Setting endpoint', function () {
      endpoint = `${commonEndpoint}/${ceresProjectId}`
    })

    it('Should be denied to all users other than the owner', function () {
      let params = {}
      params.name = 'New name'
      return setAuthHeader(requester.patch(endpoint), userBetaToken)
        .send(params).then(function (res) {
          expectForbiddenResponse(res)
        })
    })

    it('Should allow patch without changes', function () {
      let params = factories.ceresProjectParams()
      return setAuthHeader(requester.patch(endpoint), userAlphaToken)
        .send(params).then(function (res) {
          expect(res).to.have.status(200)
          expect(res).to.be.json
        })
    })

    it('Should return updated project on success', function () {
      let params = {}
      params.name = 'New name again'
      return setAuthHeader(requester.patch(endpoint), userAlphaToken)
        .send(params).then(function (res) {
          expect(res).to.have.status(200)
          expect(res).to.be.json
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
    let endpoint

    before('Setting endpoint', function () {
      endpoint = `${commonEndpoint}/${ceresProjectId}`
    })

    it('Should be denied to all users other than the owner', function () {
      return setAuthHeader(requester.delete(endpoint), userBetaToken).send()
        .then(function (res) {
          expectForbiddenResponse(res)
        })
    })

    it('Should be allowed to the owner', function () {
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
