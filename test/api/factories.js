
// TODO: these are not really 'factories', could find a more fitted name

module.exports.alphaRegistrationParams = function () {
  return {
    email: 'alpha@email',
    password: 'alpha_password'
  }
}

module.exports.alphaLoginParams = function () {
  return {
    email: 'alpha@email',
    password: 'alpha_password'
  }
}

module.exports.betaRegistrationParams = function () {
  return {
    email: 'beta@email',
    password: 'beta_password'
  }
}

module.exports.betaLoginParams = function () {
  return {
    email: 'beta@email',
    password: 'beta_password'
  }
}

module.exports.ceresProjectParams = function () {
  return {
    name: 'Ceres',
    description: 'Human resources'
  }
}

module.exports.venusProjectParams = function () {
  return {
    name: 'Venus',
    description: 'Planet resources'
  }
}

module.exports.firstActivityParams = function () {
  return {
    startDate: (new Date()).toJSON(),
    description: 'Getting started'
  }
}

module.exports.secondActivityParams = function () {
  return {
    startDate: (new Date()).toJSON(),
    description: 'Keeping up'
  }
}
