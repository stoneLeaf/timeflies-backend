const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect

const { app, readyCallback, resetDatabase } = require('./server_interface')
const factories = require('./factories')
const { basePath,
  createUserAlpha,
  createProjectEndpoint,
  setAuthHeader } = require('./helpers')

chai.use(chaiHttp)

describe(`API v1 integration tests: stats`, function () {
  let requester = chai.request(app).keepOpen()
  let commonEndpoint = `${basePath}/stats`

  let alphaGlobalTimeCount
  let ceresProjectTimeCount

  let userAlphaToken

  let ceresProjectId
  let venusProjectId

  before('Waiting for app to be ready', function () {
    return readyCallback()
  })

  before('Resetting database', function () {
    return resetDatabase()
  })

  before('Registering user and storing its authentication token', function () {
    return createUserAlpha(requester).then(function (res) {
      userAlphaToken = res.body.token
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

  before('Creating activities', function () {
    /**
     *       | 3 days before | 2 days before | yesterday | today |
     * ------|---------------|---------------|-----------|-------|
     * Ceres |       2h      |       1h      |     2h    |       |
     * ------|---------------|---------------|-----------|-------|
     * Venus |               |               |     4h    |       |
     * ------|---------------|---------------|-----------|-------|
     */

    alphaGlobalTimeCount = 9 * 3600
    ceresProjectTimeCount = 5 * 3600

    const createCeresActivityEndpoint = `${basePath}/projects/${ceresProjectId}/activities`
    const createVenusActivityEndpoint = `${basePath}/projects/${venusProjectId}/activities`

    const yesterdayMidnight = new Date()
    yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1)
    yesterdayMidnight.setHours(0, 0, 0, 0)

    // Yesterday, Ceres, 1 hour
    return setAuthHeader(requester.post(createCeresActivityEndpoint), userAlphaToken)
      .send({ startDate: yesterdayMidnight, endDate: new Date(yesterdayMidnight).setHours(1, 0, 0, 0) })
      .then(function (res) {
        expect(res).to.have.status(201)
        // Yesterday, Ceres, 1 hour
        return setAuthHeader(requester.post(createCeresActivityEndpoint), userAlphaToken)
          .send({ startDate: new Date(yesterdayMidnight).setHours(2, 0, 0, 0), endDate: new Date(yesterdayMidnight).setHours(3, 0, 0, 0) })
      }).then(function (res) {
        expect(res).to.have.status(201)
        // Two days before, Ceres, 1 hour
        const twoDaysBeforeAtMidnight = new Date(yesterdayMidnight).setDate(yesterdayMidnight.getDate() - 1)
        return setAuthHeader(requester.post(createCeresActivityEndpoint), userAlphaToken)
          .send({ startDate: twoDaysBeforeAtMidnight, endDate: new Date(twoDaysBeforeAtMidnight).setHours(1, 0, 0, 0) })
      }).then(function (res) {
        expect(res).to.have.status(201)
        // Three days before, Ceres, 2 hour
        const threeDaysBeforeAtMidnight = new Date(yesterdayMidnight).setDate(yesterdayMidnight.getDate() - 2)
        return setAuthHeader(requester.post(createCeresActivityEndpoint), userAlphaToken)
          .send({ startDate: threeDaysBeforeAtMidnight, endDate: new Date(threeDaysBeforeAtMidnight).setHours(2, 0, 0, 0) })
      }).then(function (res) {
        expect(res).to.have.status(201)
        // Yesterday, Venus, 4 hour
        return setAuthHeader(requester.post(createVenusActivityEndpoint), userAlphaToken)
          .send({ startDate: new Date(yesterdayMidnight).setHours(12, 0, 0, 0), endDate: new Date(yesterdayMidnight).setHours(16, 0, 0, 0) })
      }).then(function (res) {
        expect(res).to.have.status(201)
      })
  })

  after('Closing server', function () {
    return requester.close()
  })

  describe('GET /stats/projects (Global project stats)', function () {
    let endpoint

    before('Setting endpoint', function () {
      endpoint = `${commonEndpoint}/projects`
    })

    it('Should return a global time count', function () {
      return setAuthHeader(requester.get(endpoint), userAlphaToken)
        .then(function (res) {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.have.property('globalTimeCount')
          expect(res.body.globalTimeCount).to.be.equal(alphaGlobalTimeCount)
        })
    })

    it('Should return global daily stats of days within specified interval', function () {
      const today = new Date()
      const yesterday = new Date(new Date(today).setDate(today.getDate() - 1))
      const params = { firstDay: yesterday, lastDay: today }
      return setAuthHeader(requester.get(endpoint), userAlphaToken)
        .query(params).then(function (res) {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.have.property('globalTimeCount')
          expect(res.body.globalTimeCount).to.be.equal(alphaGlobalTimeCount)
          expect(res.body).to.have.property('intervalTimeCount')
          expect(res.body.intervalTimeCount).to.be.equal(6 * 3600)
          expect(res.body).to.have.property('days')
          expect(res.body.days).to.be.an('array').and.have.lengthOf(2)
          expect(res.body.days[0]).to.nested.include({ timeCount: 6 * 3600 })
          expect(res.body.days[1]).to.nested.include({ timeCount: 0 })
        })
    })
  })

  describe('GET /stats/projects/:id (Specific project stats)', function () {
    let endpoint

    before('Setting endpoint', function () {
      endpoint = `${commonEndpoint}/projects/${ceresProjectId}`
    })

    it('Should return the project specific time count', function () {
      return setAuthHeader(requester.get(endpoint), userAlphaToken)
        .then(function (res) {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.have.property('globalTimeCount')
          expect(res.body.globalTimeCount).to.be.equal(ceresProjectTimeCount)
        })
    })

    it('Should return project daily stats of days within specified interval', function () {
      const today = new Date()
      const twoDaysBefore = new Date(new Date(today).setDate(today.getDate() - 2))
      const params = { firstDay: twoDaysBefore, lastDay: today }
      return setAuthHeader(requester.get(endpoint), userAlphaToken)
        .query(params).then(function (res) {
          expect(res).to.have.status(200)
          expect(res).to.be.json
          expect(res.body).to.have.property('globalTimeCount')
          expect(res.body.globalTimeCount).to.be.equal(ceresProjectTimeCount)
          expect(res.body).to.have.property('intervalTimeCount')
          expect(res.body.intervalTimeCount).to.be.equal(3 * 3600)
          expect(res.body).to.have.property('days')
          expect(res.body.days).to.be.an('array').and.have.lengthOf(3)
          expect(res.body.days[0]).to.nested.include({ timeCount: 1 * 3600 })
          expect(res.body.days[1]).to.nested.include({ timeCount: 2 * 3600 })
          expect(res.body.days[2]).to.nested.include({ timeCount: 0 })
        })
    })
  })
})
