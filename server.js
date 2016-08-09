import { mochaInstance } from 'meteor/practicalmeteor:mocha-core';
import { toBoolean } from './lib/toBoolean';

const reporter = process.env.SERVER_TEST_REPORTER || 'spec';
const shouldUseColors = toBoolean(process.env.MOCHA_USE_COLORS);

// Before Meteor calls the `start` function, app tests will be parsed and loaded by Mocha
function start() {
  // We need to set the reporter when the tests actually run to ensure no conflicts with
  // other test driver packages that may be added to the app but are not actually being
  // used on this run.
  mochaInstance.reporter(reporter);
  mochaInstance.useColors(shouldUseColors);

  mochaInstance.run((failureCount) => {
    if (!process.env.TEST_WATCH) {
      if (failureCount > 0) {
        process.exit(1); // exit with non-zero status if there were failures
      } else {
        process.exit(0);
      }
    }
  });
}

export { start };
