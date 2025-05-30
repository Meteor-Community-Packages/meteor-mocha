/* eslint-env mocha */

describe('server suite', function () {
  it('failing test', function () {
    throw new Error('expected error');
  });
  it('failing async test', async function () {
    throw new Error('expected error');
  });
  it('failing callback test', function (done) {
    done(new Error('expected error'));
  });
});
