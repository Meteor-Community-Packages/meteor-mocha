export default function setArgs() {
  const {
    CLIENT_TEST_REPORTER,
    MOCHA_GREP,
    MOCHA_GLOBAL_TIMEOUT,
    MOCHA_INVERT,
    MOCHA_REPORTER,
    SERVER_TEST_REPORTER,
    TEST_BROWSER_DRIVER,
    TEST_CLIENT,
    TEST_PARALLEL,
    TEST_SERVER,
    TEST_WATCH,
    XUNIT_FILE,
  } = process.env;

  const runtimeArgs = {
    mochaOptions: {
      grep: MOCHA_GREP || false,
      invert: !!MOCHA_INVERT,
      timeout: MOCHA_GLOBAL_TIMEOUT || 2000,
      reporter: MOCHA_REPORTER || 'spec',
      serverReporter: SERVER_TEST_REPORTER,
      clientReporter: CLIENT_TEST_REPORTER,
      xUnitOutput: XUNIT_FILE,
    },
    runnerOptions: {
      runClient: (TEST_CLIENT !== 'false' && TEST_CLIENT !== '0'),
      runServer: (TEST_SERVER !== 'false' && TEST_SERVER !== '0'),
      browserDriver: TEST_BROWSER_DRIVER,
      testWatch: TEST_WATCH,
      runParallel: !!TEST_PARALLEL,
    },
  };

  // Set the variables for the client to access as well.
  Meteor.settings.public = Meteor.settings.public || {};
  Meteor.settings.public.mochaRuntimeArgs = runtimeArgs;

  return runtimeArgs;
}
