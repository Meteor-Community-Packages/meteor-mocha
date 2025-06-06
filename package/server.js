/* global Package */
import { mochaInstance } from 'meteor/meteortesting:mocha-core';
import { startBrowser } from 'meteor/meteortesting:browser-tests';
import { onMessage } from 'meteor/inter-process-messaging';

import fs from 'node:fs';

import setArgs from './runtimeArgs';
import handleCoverage from './server.handleCoverage';

let mochaOptions;
let runnerOptions;
let coverageOptions;
let grep;
let invert;
let clientReporter;
let serverReporter;
let serverOutput;
let clientOutput;

if (Package['browser-policy-common'] && Package['browser-policy-content']) {
  const { BrowserPolicy } = Package['browser-policy-common'];

  // Allow the remote mocha.css file to be inserted, in case any CSP stuff
  // exists for the domain.
  BrowserPolicy.content.allowInlineStyles();
  BrowserPolicy.content.allowStyleOrigin('https://cdn.rawgit.com');
}

// Since intermingling client and server log lines would be confusing,
// the idea here is to buffer all client logs until server tests have
// finished running and then dump the buffer to the screen and continue
// logging in real time after that if client tests are still running.

let serverTestsDone = false;
let clientTestsRunning = false;
const clientLines = [];

function clientLogBuffer(line) {
  if (serverTestsDone) {
    // printing and removing the extra new-line character. The first was added by the client log, the second here.
    console.log(line);
  } else {
    clientLines.push(line);
  }
}

function printHeader(type) {
  const lines = [
    '\n--------------------------------',
    Meteor.isAppTest
      ? `--- RUNNING APP ${type} TESTS ---`
      : `----- RUNNING ${type} TESTS -----`,
    '--------------------------------\n',
  ];
  for (const line of lines) {
    if (type === 'CLIENT') {
      clientLogBuffer(line);
    } else {
      console.log(line);
    }
  }
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
    clientLines.forEach(console.log);
  }

  if (callCount === 2) {
    // We only need to show this final summary if we ran both kinds of tests in the same console
    if (
      runnerOptions.runServer &&
      runnerOptions.runClient &&
      runnerOptions.browserDriver
    ) {
      console.log('All tests finished!\n');
      console.log('--------------------------------');
      console.log(
        `${Meteor.isAppTest ? 'APP ' : ''}SERVER FAILURES: ${serverFailures}`,
      );
      console.log(
        `${Meteor.isAppTest ? 'APP ' : ''}CLIENT FAILURES: ${clientFailures}`,
      );
      console.log('--------------------------------');
    }

    handleCoverage(coverageOptions).then(() => {
      // if no env for TEST_WATCH, tests should exit when done
      if (!runnerOptions.testWatch) {
        if (clientFailures + serverFailures > 0) {
          process.exit(1); // exit with non-zero status if there were failures
        } else {
          process.exit(0);
        }
      }
    });
  }
}

function serverTests(cb) {
  if (!runnerOptions.runServer) {
    console.log('SKIPPING SERVER TESTS BECAUSE TEST_SERVER=0');
    exitIfDone('server', 0);
    if (cb) cb();
    return;
  }

  printHeader('SERVER');

  if (grep) mochaInstance.grep(grep);
  if (invert) mochaInstance.invert(invert);
  mochaInstance.color(true);

  // We need to set the reporter when the tests actually run to ensure no conflicts with
  // other test driver packages that may be added to the app but are not actually being
  // used on this run.
  mochaInstance.reporter(serverReporter || 'spec', {
    output: serverOutput,
  });

  mochaInstance.run((failureCount) => {
    if (typeof failureCount !== 'number') {
      console.log(
        'Mocha did not return a failure count for server tests as expected',
      );
      exitIfDone('server', 1);
    } else {
      exitIfDone('server', failureCount);
    }
    if (cb) cb();
  });
}

function isXunitLine(line) {
  return line.trimLeft().startsWith('<');
}

function browserOutput(data) {
  // Take full control over line breaks to prevent duplication
  const line = data.toString().replace(/\n$/, '');
  if (clientOutput) {
    // Edge case: with XUNIT reporter write only XML to the output file
    if (clientReporter !== 'xunit' || isXunitLine(line)) {
      fs.appendFileSync(clientOutput, `${line}\n`);
    } else {
      // Output non-XML lines to console (XUNIT reporter only)
      clientLogBuffer(line);
    }
  } else {
    clientLogBuffer(line);
  }
}

function clientTests() {
  if (clientTestsRunning) {
    console.log('CLIENT TESTS ALREADY RUNNING');
    return;
  }

  if (!runnerOptions.runClient) {
    console.log('SKIPPING CLIENT TESTS BECAUSE TEST_CLIENT=0');
    exitIfDone('client', 0);
    return;
  }

  if (!runnerOptions.browserDriver) {
    console.log(
      'Load the app in a browser to run client tests, or set the TEST_BROWSER_DRIVER environment variable. ' +
        'See https://github.com/meteortesting/meteor-mocha/blob/master/README.md#run-app-tests',
    );
    exitIfDone('client', 0);
    return;
  }

  printHeader('CLIENT');
  clientTestsRunning = true;

  startBrowser({
    stdout: browserOutput,
    writebuffer: browserOutput,
    stderr: browserOutput,
    done(failureCount) {
      clientTestsRunning = false;
      if (typeof failureCount !== 'number') {
        console.log(
          'The browser driver package did not return a failure count for server tests as expected',
        );
        exitIfDone('client', 1);
      } else {
        exitIfDone('client', failureCount);
      }
    },
  });
}

// Before Meteor calls the `start` function, app tests will be parsed and loaded by Mocha
function start() {
  const args = setArgs();
  runnerOptions = args.runnerOptions;
  coverageOptions = args.coverageOptions;
  mochaOptions = args.mochaOptions;
  grep = mochaOptions.grep;
  invert = mochaOptions.invert;
  clientReporter = mochaOptions.clientReporter;
  serverReporter = mochaOptions.serverReporter;
  serverOutput = mochaOptions.serverOutput;
  clientOutput = mochaOptions.clientOutput;

  // Run in PARALLEL or SERIES
  // Running in series is a better default since it avoids db and state conflicts for newbs.
  // If you want parallel you will know these risks.
  if (runnerOptions.runParallel) {
    console.log(
      'Warning: Running in parallel can cause side-effects from state/db sharing',
    );

    serverTests();
    clientTests();
  } else {
    serverTests(() => {
      clientTests();
    });
  }
}

export { start };

onMessage('client-refresh', (options) => {
  console.log(
    'CLIENT TESTS RESTARTING (client-refresh)',
    options === undefined ? '' : options,
  );
  clientTests();
});

onMessage('webapp-reload-client', (options) => {
  console.log(
    'CLIENT TESTS RESTARTING (webapp-reload-client)',
    options === undefined ? '' : options,
  );
  clientTests();
});
