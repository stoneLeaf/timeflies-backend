const { app, db } = require('../../app')

module.exports = {
  /**
   * A reference to the express/connect app or node.js http(s) server
   * to which chai-http will make the requests to.
   */
  app: app,

  /**
   * Promise called before any test to unsure the app is ready.
   */
  readyCallback: function () {
    return new Promise(function (resolve) {
      if (app.isReady) {
        resolve()
      } else {
        app.on('ready', function () { resolve() })
      }
    })
  },

  /**
   * Promise-based database reset.
   */
  resetDatabase: function () {
    return db.dropDatabase()
  }
}
