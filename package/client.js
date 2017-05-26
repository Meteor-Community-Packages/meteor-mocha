import { mocha } from 'meteor/practicalmeteor:mocha-core';
import prepForHTMLReporter from './prepForHTMLReporter';
import './browser-shim';

// Run the client tests. Meteor calls the `runTests` function exported by
// the driver package on the client.
function runTests() {
  // We need to set the reporter when the tests actually run. This ensures that the
  // correct reporter is used in the case where another Mocha test driver package is also
  // added to the app. Since both are testOnly packages, top-level client code in both
  // will run, potentially changing the reporter.
  const { mochaOptions, runnerOptions } = Meteor.settings.public.mochaRuntimeArgs || {};

  if (!runnerOptions.runClient) return;

  const { clientReporter, grep, invert, timeout, reporter } = mochaOptions || {};
  if (grep) mocha.grep(grep);
  if (invert) mocha.options.invert = invert;
  if (timeout) mocha.options.timeout = timeout;

  if (runnerOptions.browserDriver) {
    mocha.reporter(clientReporter || reporter);

    // These `window` properties are all used by the client testing script in the
    // browser-tests package to know what is happening.
    window.testsAreRunning = true;
    mocha.run((failures) => {
      window.testsAreRunning = false;
      window.testFailures = failures;
      window.testsDone = true;
    });
  } else {
    // If we're not running client tests automatically in a headless browser, then we
    // probably are going to want to see an HTML reporter when we load the page.
    prepForHTMLReporter(mocha);
    mocha.reporter('html');
    mocha.run();
  }
}

export { runTests };
