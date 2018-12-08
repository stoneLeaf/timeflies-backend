const { app, db } = require('../../app')

module.exports = {
  /**
   * Should be a reference to the express/connect app or node.js http(s)
   * server to which chai-http will make the requests to.
   */
  app: app,

  /**
   * Should reset the database.
   *
   * @param {function} done Callback to invoke when the operation is complete.
   */
  resetDatabase: function (done) {
    db.dropDatabase(done)
  }
}
