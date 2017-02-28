import { mochaInstance } from 'meteor/practicalmeteor:mocha-core';
import { startBrowser } from 'meteor/aldeed:browser-tests';
import { setArgs } from './runtimeArgs'

setArgs();
const { mochaOptions, runnerOptions } = Meteor.settings.public.runtimeArgs || {};
const { clientReporter, grep, invert, reporter } = mochaOptions || {};

// Since intermingling client and server log lines would be confusing,
// the idea here is to buffer all client logs until server tests have
// finished running and then dump the buffer to the screen and continue
// logging in real time after that if client tests are still running.

let serverTestsDone = false;
const clientLines = [];
function clientLogBuffer(line) {
  if (serverTestsDone) {
    // printing and removing the extra new-line character. The first was added by the client log, the second here.
    console.log(line.replace(/\n$/, ''));
  } else {
    clientLines.push(line);
  }
}

function printHeader(type) {
  const lines = [
    '\n--------------------------------',
    `----- RUNNING ${type} TESTS -----`,
    '--------------------------------\n',
  ];
  lines.forEach(line => {
    if (type === 'CLIENT') {
      clientLogBuffer(line);
    } else {
      console.log(line);
    }
  });
}

let callCount = 0;
let clientFailures = 0;
let serverFailures = 0;
function exitIfDone(type, failures) {
  callCount++;
  if (type === 'client') {
    clientFailures = failures;
  } else {
    serverFailures = failures;
    serverTestsDone = true;
    if (runnerOptions.runClient) {
      clientLines.forEach((line) => {
        // printing and removing the extra new-line character. The first was added by the client log, the second here.
        console.log(line.replace(/\n$/, ''));
      });
    }
  }

  if (callCount === 2) {
    if (runnerOptions.runClient) {
      console.log('All client and server tests finished!\n');
      console.log('--------------------------------');
      console.log(`SERVER FAILURES: ${serverFailures}`);
      console.log(`CLIENT FAILURES: ${clientFailures}`);
      console.log('--------------------------------');
    }

    // if no env for TEST_WATCH, tests should exit when done
    if (!runnerOptions.testWatch) {
      if (clientFailures + serverFailures > 0) {
        process.exit(1); // exit with non-zero status if there were failures
      } else {
        process.exit(0);
      }
    }
  }
}

function serverTests(cb) {
  if (runnerOptions.runServer){
    printHeader('SERVER');

    // We need to set the reporter when the tests actually run to ensure no conflicts with
    // other test driver packages that may be added to the app but are not actually being
    // used on this run.
    mochaInstance.reporter(reporter);

    mochaInstance.run((failureCount) => {
      exitIfDone('server', failureCount);
      if (cb) cb();
    });
  }
}

function clientTests() {
  if (runnerOptions.runClient){
    if(!runnerOptions.browserDriver) {
      console.log('SKIPPING CLIENT TESTS BECAUSE TEST_BROWSER_DRIVER ENVIRONMENT VARIABLE IS NOT SET');
      exitIfDone('client', 0);
      return;
    }

    printHeader('CLIENT');

    startBrowser({
      stdout(data) {
        clientLogBuffer(data.toString());
      },
      stderr(data) {
        clientLogBuffer(data.toString());
      },
      done(failureCount) {
        exitIfDone('client', failureCount);
      },
    });
  }
}

// Before Meteor calls the `start` function, app tests will be parsed and loaded by Mocha
function start() {
  // Run in PARALLEL or SERIES
  // Running in series is a better default since it avoids db and state conflicts for newbs.
  // If you want parallel you will know these risks.
  if (runnerOptions.runParallel) {
    console.log('Warning: Running in parallel can cause side-effects from state/db sharing');

    serverTests();
    clientTests();
  } else {
    serverTests(() => {
      clientTests();
    });
  }
}

export { start };
