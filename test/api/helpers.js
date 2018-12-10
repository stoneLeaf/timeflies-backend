const expect = require('chai').expect

module.exports = {
  expectFailedValidationResponse: function (res) {
    expect(res).to.be.json
    expect(res).to.have.status(422)
    expect(res.body).to.have.property('errors')
  }
}
