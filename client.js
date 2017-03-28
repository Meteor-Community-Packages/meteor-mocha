import './browser-shim.js';
import { mocha } from 'meteor/practicalmeteor:mocha-core';


// Run the client tests. Meteor calls the `runTests` function exported by
// the driver package on the client.
function runTests() {
  // We need to set the reporter when the tests actually run. This ensures that the
  // correct reporter is used in the case where `dispatch:mocha-browser` is also
  // added to the app. Since both are testOnly packages, top-level client code in both
  // will run, potentially changing the reporter.
  const { mochaOptions } = Meteor.settings.public.runtimeArgs || {};
  const { clientReporter, grep, invert, reporter } = mochaOptions || {};
  if (grep) mocha.grep(grep);
  if (invert) mocha.options.invert = invert;
  mocha.reporter(clientReporter || reporter);

  // These `window` properties are all used by the client testing script in the
  // browser-tests package to know what is happening.
  window.testsAreRunning = true;
  mocha.run(failures => {
    window.testsAreRunning = false;
    window.testFailures = failures;
    window.testsDone = true;
  });

}

export { runTests };
