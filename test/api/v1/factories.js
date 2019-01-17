
// TODO: these are not really 'factories', could find a more fitted name

module.exports.alphaRegistrationParams = function () {
  return {
    name: 'Alpha',
    email: 'alpha@email',
    password: 'alpha_password',
    hashedEmail: 'a02a535a1498ec2145ec67c0356e81c9'
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
    name: 'Beta',
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

module.exports.aldebaranProjectParams = function () {
  return {
    name: 'Aldebaran',
    description: ''
  }
}

module.exports.firstActivityParams = function () {
  let startDate = new Date()
  startDate.setHours(startDate.getHours() - 1)
  let endDate = new Date(startDate)
  endDate.setMinutes(endDate.getMinutes() + 10)
  return {
    startDate: startDate,
    endDate: endDate,
    description: 'Getting started'
  }
}

module.exports.secondActivityParams = function () {
  let firstActivityEndDate = module.exports.firstActivityParams().endDate
  let deltaToNow = (new Date()).getTime() - firstActivityEndDate.getTime()
  let startDate = new Date(((new Date()).getTime() - (deltaToNow / 2)))
  return {
    startDate: startDate,
    description: 'Keeping up'
  }
}
