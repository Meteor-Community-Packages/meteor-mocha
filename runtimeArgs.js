var runtimeArgs = {}

var grepInvert = !!process.env.MOCHA_INVERT


var runClient = true
if (process.env.TEST_CLIENT === 'false' || process.env.TEST_CLIENT === "0"){
  runClient = false
}

var runServer = true
if (process.env.TEST_SERVER === 'false' || process.env.TEST_SERVER === "0"){
  runServer = false
}

runtimeArgs.runnerOptions = {
  runClient: runClient,
  runServer: runServer,
  browserDriver: process.env.TEST_BROWSER_DRIVER,
  testWatch: process.env.TEST_WATCH,
  runParallel:  !!process.env.TEST_PARALLEL
}

runtimeArgs.mochaOptions = {
  grep : process.env.MOCHA_GREP || false,
  grepInvert: grepInvert,
  reporter: process.env.MOCHA_REPORTER || 'tap',
  serverReporter: process.env.SERVER_TEST_REPORTER,
  clientReporter: process.env.CLIENT_TEST_REPORTER
}

export { runtimeArgs };
