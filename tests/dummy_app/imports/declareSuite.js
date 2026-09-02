/* eslint-env mocha */

// Stands in for the `conditionalDescribe`-style helpers apps write: the suite
// is created here, but belongs to the test file that called this.
export function declareSuite(name, fn) {
  return describe(name, fn);
}
