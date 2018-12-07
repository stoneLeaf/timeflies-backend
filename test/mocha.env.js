/**
 * Workaround ensuring mocha will always run with the proper environment set,
 * preventing any damage to a database. Must be required in the mocha.opts.
 * See https://github.com/mochajs/mocha/issues/185#issuecomment-321566188
 */
process.env.NODE_ENV = 'test'
