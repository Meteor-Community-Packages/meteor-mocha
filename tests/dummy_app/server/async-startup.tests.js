/* eslint-env mocha */
import { Meteor } from 'meteor/meteor';
import assert from 'assert';

// Simulate async startup work (e.g. ensuring MongoDB indices, initializing
// collections). Without the fix in server.js, mocha.run() can fire before
// this callback completes, causing the test below to fail.
let startupCompleted = false;

Meteor.startup(async () => {
  await new Promise(resolve => setTimeout(resolve, 50));
  startupCompleted = true;
});

describe('async Meteor.startup()', function () {
  it('should complete before tests run', function () {
    assert.strictEqual(startupCompleted, true,
      'Async Meteor.startup() callback did not complete before tests ran. ' +
      'See https://github.com/Meteor-Community-Packages/meteor-mocha/issues/176');
  });
});
