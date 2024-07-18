# CHANGELOG

## 3.0.3

- Official publish for support Meteor 3
 
## 3.0.0

- Meteor 3.0 compatibility; drop Fibers

## 2.1.0

- Re-run tests on browser refresh [PR #106](https://github.com/Meteor-Community-Packages/meteor-mocha/pull/106) and [PR #120](https://github.com/Meteor-Community-Packages/meteor-mocha/pull/120)
- Updated dev dependencies

## 2.0.4

- Bump `meteortesting:browser-tests` to v1.4.2
- Bump `lmieulet:meteor-coverage` to be able to use v4.1.0

## 2.0.3

- Allow compatibility with `lmieulet:meteor-coverage@4.0.0` for compatibility with Meteor 2.3+

## 2.0.2

- Support either 1.x or 2.x version of `http` package
- Update NPM dependencies

## 2.0.1

- Allow loading mocha options from .mocharc file
- Raised compatibility to meteortesting:mocha-core@8

## 2.0.0

- Package for code coverage (serut:meteor-coverage) is now optional. This ensures you install the latest compatible version.

## 1.1.5

- Updated dev-dependencies
- Raised compatibility to meteortesting:browser-tests@1.3.2

## 1.1.4

- Updated dev-dependencies
- Raised compatibility to meteortesting:mocha-core@7

## 1.1.3

- Updated dev-dependencies
- Make use of env variable METEOR_AUTO_RESTART, added in Meteor 1.8.1

## 1.1.2

- Confirm compatibility with meteortesting:mocha-core@6

## 1.1.1

- Confirm compatibility with serut:meteor-coverage@3

## 1.1.0

- Report all buffer write operations out to the output (file or console). Previous versions ignored them because of something in `phantomJS` which is discontinued.
- Allow saving both client and server tests to a file (available via `SERVER_MOCHA_OUTPUT` and `CLIENT_MOCHA_OUTPUT`)

## 1.0.1

- Only allow inline and style origins if browser-policy-content exists
- Allow usage of MochaJS 5.2.0

## 1.0.0

- Minimum `meteortesting:browser-tests` version is now `1.0.0`, which runs Chrome with `--headless` by default. If you don't use the Chrome driver, this will not be a breaking change.

## 0.6.0

- Optional code coverage support. Refer to "Run with code coverage" in the README
- Client tests will now properly fail when there are uncaught exceptions
- The `MOCHA_REPORTER` and `CLIENT_TEST_REPORTER` environment variables are no respected even when you do not specify a browser driver.
- The `browser-policy` package is now a weak dependency

## 0.5.1

- Fail with a message when mocha or a browser tests package does not properly pass the number of test failures
- Add browser policy to ensure that proper styling is always applied to test results shown in a browser

## 0.5.0

- Add colors for Nightmare
- Bump meteortesting:browser-tests dependency

## 0.4.4

Fix broken dependency reference

## 0.4.3

Fix client tests not running when TEST_SERVER=0 (thanks @hexsprite)

## 0.4.2

Changed name to `meteortesting:mocha` and updated dependency name to `meteortesting:browser-tests`

## 0.4.1

Fix grep/invert options

## 0.4.0

Merged `dispatch:mocha-browser` into this package. To replicate that package, run in watch mode without setting the `TEST_BROWSER_DRIVER` environment variable.

## 0.3.0

* To run all tests with names that match a pattern, add the environment variable `MOCHA_GREP=your_string`. This will apply to both client and server tests. To run all tests EXCEPT those that match the pattern, additionally set `MOCHA_INVERT=1`.
* You can now skip running client tests with `TEST_CLIENT=0` or skip running server tests with `TEST_SERVER=0`
* Support for XUnit output to file

## 0.2.0

* Bump aldeed:browser-tests to fix PhantomJS testing and add support for showing Electron window
* Run tests in series by default with TEST_PARALLEL=1 option to start running client tests while server tests are still running (previous behavior). This is kind of a breaking change, but we decided that a minor version bump was sufficient since it does not break anything.

## 0.1.0

* Added support for running client tests in various browsers
