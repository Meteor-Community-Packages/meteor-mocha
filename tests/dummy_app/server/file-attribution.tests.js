/* eslint-env mocha */
import assert from 'node:assert';
import { declareSuite } from '../imports/declareSuite';

const FILE = 'server/file-attribution.tests.js';

const suite = describe('file attribution', function () {
  const test = it('attributes a test to the file it was declared in', function () {
    assert.strictEqual(test.file, FILE);
  });

  it('attributes a suite to the file it was declared in', function () {
    assert.strictEqual(suite.file, FILE);
  });

  it('attributes the hooks of a suite', function () {
    assert.strictEqual(suite._beforeAll[0].file, FILE);
  });

  before(function () {});

  describe('nested suite', function () {
    const nested = it('attributes a nested test', function () {
      assert.strictEqual(nested.file, FILE);
    });
  });
});

const viaHelper = declareSuite('file attribution via a helper', function () {
  it('attributes the suite to the file that called the helper', function () {
    assert.strictEqual(viaHelper.file, FILE);
  });
});
