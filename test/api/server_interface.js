const { app, db } = require('../../app')

module.exports = {
  /**
   * A reference to the express/connect app or node.js http(s) server
   * to which chai-http will make the requests to.
   */
  app: app,

  /**
   * Callback used before any test to unsure the app is ready.
   *
   * @param {function} done Callback to invoke when the app is ready.
   */
  readyCallback: function (done) {
    if (app.isReady) {
      done()
    } else {
      app.on('ready', function () { done() })
    }
  },

  /**
   * Must reset the database for further tests.
   *
   * @param {function} done Callback to invoke when the operation is complete.
   */
  resetDatabase: function (done) {
    db.dropDatabase(done)
  }
}
