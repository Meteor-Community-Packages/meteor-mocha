function setArgs () {

  let runClient = true
  if (process.env.TEST_CLIENT === 'false' || process.env.TEST_CLIENT === "0"){
    runClient = false
  }

  let runServer = true
  if (process.env.TEST_SERVER === 'false' || process.env.TEST_SERVER === "0"){
    runServer = false
  }

  let runtimeArgs = {}
  runtimeArgs.runnerOptions = {
    runClient: runClient,
    runServer: runServer,
    browserDriver: process.env.TEST_BROWSER_DRIVER,
    testWatch: process.env.TEST_WATCH,
    runParallel: !!process.env.TEST_PARALLEL
  }

  runtimeArgs.mochaOptions = {
    grep : process.env.MOCHA_GREP || false,
    grepInvert: !!process.env.MOCHA_INVERT,
    reporter: process.env.MOCHA_REPORTER || 'tap',
    serverReporter: process.env.SERVER_TEST_REPORTER,
    clientReporter: process.env.CLIENT_TEST_REPORTER
  }

  //set the variables for the client to access as well.
  Meteor.settings.public = Meteor.settings.public || {};
  Meteor.settings.public.runtimeArgs = runtimeArgs

  return runtimeArgs
}

export { setArgs };
