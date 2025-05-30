# Meteor Mocha - meteortesting:mocha

[![Project Status: Active – The project has reached a stable, usable state and is being actively developed.](https://www.repostatus.org/badges/latest/active.svg)](https://www.repostatus.org/#active)
[![Test suite](https://github.com/Meteor-Community-Packages/meteor-mocha/actions/workflows/tests.yml/badge.svg)](https://github.com/Meteor-Community-Packages/meteor-mocha/actions/workflows/tests.yml)
[![Formatted with Biome](https://img.shields.io/badge/Formatted_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev/)
![GitHub License](https://img.shields.io/github/license/Meteor-Community-Packages/meteor-mocha)

> _Formerly published as dispatch:mocha. Originally created by [Dispatch](http://www.dispatch.me/) but now community maintained._

A Mocha test driver package for Meteor. This package reports server AND client test results in the server console and can be used for running tests on a CI server or locally.

## Installation

In a Meteor 1.3+ app directory:

```bash
meteor add meteortesting:mocha
```

Not installing the package is possible but not advisable when creating a CI pipeline because the system will always download the latest version available, which might break your CI pipeline in a future major release of this package.

Since version 2.0.0 the package [lmieulet:meteor-coverage](https://github.com/serut/meteor-coverage) 
is no longer bundled with this package. 

If you permanently want code coverage please run:

```bash
meteor add lmieulet:meteor-coverage
```

If you rather want the package to be included only for a single run, add the parameter `--extra-packages lmieulet:meteor-coverage` as shown to your `meteor test` command:

```bash
meteor test --driver-package meteortesting:mocha --extra-packages lmieulet:meteor-coverage
```

For the full documentation of meteor coverage, please consult [the docs in its repo](https://github.com/serut/meteor-coverage/).

## Run app tests

To watch your tests in Meteor 1.8.1+:

```bash
meteor test --driver-package meteortesting:mocha
meteor test --driver-package meteortesting:mocha --full-app
```

> NOTE: Watch mode does not properly rerun client tests if you run a headless browser and change only client code. To work around this, you can add or remove whitespace from a server file, and that will trigger both server and client tests to rerun.

If you want the process to exit after all tests are done, add the flag `--once`:

```bash
meteor test --driver-package meteortesting:mocha --once
meteor test --driver-package meteortesting:mocha --once --full-app
```

In Meteor <1.8.1, you must add `TEST_WATCH=1` if you do not add the `--once` flag. For example:

```bash
TEST_WATCH=1 meteor test --driver-package meteortesting:mocha
TEST_WATCH=1 meteor test --driver-package meteortesting:mocha --full-app
```

If you have client tests, you can either open any browser to run them, or install a browser driver to run them headless.

### Run client tests in any browser manually

Load `http://localhost:3000` in a browser to run your client tests and see the results. This only works well in watch mode because otherwise the server will likely shut down before you finish running the client tests.

The test results are reported in a div with ID `mocha`. If you run with the `--full-app` flag, this will likely be overlaid weirdly on top of your app, so you should add CSS to your app in order to be able to see both. For example, this will put the test results in a sidebar with resizeable width:

```css
div#mocha {
  background: white;
  border-right: 2px solid black;
  height: 100%;
  left: 0;
  margin: 0;
  overflow: auto;
  padding: 1rem;
  position: fixed;
  resize: horizontal;
  top: 0;
  width: 20px;
  z-index: 1000;
}
```

### Run client tests headless

Support for running browser in headless mode is made possible by the package `` which this plugin depends on. Please refer to their documentation for further information: https://github.com/meteortesting/meteor-browser-tests#dependencies

### Run only server or only client tests

By default both server and client tests run. To disable server tests: `TEST_SERVER=0`. Likewise for client: `TEST_CLIENT=0`

### Run tests inclusively (grep) or exclusively (invert)

To run all tests with names that match a pattern, add the environment variable `MOCHA_GREP=your_string`. This will apply to both client and server tests.

To exclude any tests, you must use the grep option above plus `MOCHA_INVERT=1`. For example, to exclude tests named 'TODO:' (which you may want to exclude from your continuous integration workflow) you would pass at runtime `MOCHA_GREP=your_string MOCHA_INVERT=1`

### Specify global timeout

To override Mocha's default timeout of 2 seconds for all tests, add the environment variable `MOCHA_TIMEOUT=your_timeout_in_ms`.

### Specify mocha configuration with .mocharc file

You can configure the mocha runner with a `.mocharc.js` or a `.mocharc.json` file at the root of your Meteor app. This package uses mocha programmatically, so it supports a constrained list of options.

If both files are defined, `.mocharc.js` will overwrite the settings in `.mocharc.json`.

The setting `timeout` will be overwritten if the environment variable `MOCHA_TIMEOUT` is set.

* Read more about using mocha and supported options [here](https://github.com/mochajs/mocha/wiki/Using-Mocha-programmatically).
* You can find examples of config files [here](https://github.com/mochajs/mocha/tree/master/example/config).

### Run in parallel

By default meteortesting:mocha will run in series. This is a safety mechanism since running a client test and server test which depend on DB state may have side effects.

If you design your client and server tests to not share state, then you can run tests faster. Run in parallel by exporting the environment variable `TEST_PARALLEL=1` before running.

### Write tests to a file

To write the tests to a file, set `SERVER_MOCHA_OUTPUT` and `CLIENT_MOCHA_OUTPUT` to the full path + filename, e.g., `$PWD/unit_server.txt` and `$PWD/unit_client.txt`. This is specially important when using a format like `xunit`. The use of `XUNIT_FILE` is deprecated because it has the same functionality as `SERVER_MOCHA_OUTPUT`, which is a better fit for what it actually does.

```bash
$ MOCHA_REPORTER=xunit SERVER_MOCHA_OUTPUT=$PWD/unit_server.xml CLIENT_MOCHA_OUTPUT=$PWD/unit_client.xml meteor test --once --driver-package meteortesting:mocha
```

### Run with a different server reporter

The default Mocha reporter for server tests is the "spec" reporter. You can set the `SERVER_TEST_REPORTER` environment variable to change it.

```bash
$ SERVER_TEST_REPORTER="dot" meteor test --once --driver-package meteortesting:mocha
```

### Run with a different client reporter

The default Mocha reporter for client tests is the "spec" reporter when running headless and "html" otherwise. You can set the `CLIENT_TEST_REPORTER` environment variable to change it.

```bash
$ CLIENT_TEST_REPORTER="tap" meteor test --once --driver-package meteortesting:mocha
```

### Run with code coverage

Since version 2.0.0 the package [lmieulet:meteor-coverage](https://github.com/serut/meteor-coverage) is no longer bundled with this package. If you permanently want code coverage please run:

```bash
meteor add lmieulet:meteor-coverage
```

If you rather want the package to be included only for a single run, add the parameter `--extra-packages lmieulet:meteor-coverage` as shown to your `meteor test` command:

```bash
meteor test --driver-package meteortesting:mocha --extra-packages lmieulet:meteor-coverage
```

To enable code coverage you have to set `COVERAGE` to `1` and `COVERAGE_APP_FOLDER` to the path of your project. On POSIX systems you can just use `COVERAGE_APP_FOLDER=$PWD/` whereby `COVERAGE_APP_FOLDER=%cd%\` gives the expected result on Windows.

In addition there are quite some additional options you can set:

* `COVERAGE_VERBOSE` to see the files included in the coverage and other data that might help if something doesn't work as expected
* `COVERAGE_IN_COVERAGE` imports a coverage dump (previously create with `COVERAGE_OUT_COVERAGE`)
* `COVERAGE_OUT_COVERAGE` creates a dump of the coverage - used when you want to merge several coverage
* `COVERAGE_OUT_LCOVONLY` creates a lcov report
* `COVERAGE_OUT_HTML` creates a html report
* `COVERAGE_OUT_JSON` creates a json report
* `COVERAGE_OUT_JSON_SUMMARY` creates a json_summary report
* `COVERAGE_OUT_TEXT_SUMMARY` creates a text_summary report
* `COVERAGE_OUT_REMAP` remaps the coverage to all the available report formats

Additional information can be found here: https://github.com/serut/meteor-coverage

## NPM Scripts

A good best practice is to define these commands as run scripts in your app's `package.json` file. For example:

```json
"scripts": {
  "pretest": "npm run lint --silent",
  "test-chrome": "TEST_BROWSER_DRIVER=chrome meteor test --once --driver-package meteortesting:mocha",
  "test-app-chrome": "TEST_BROWSER_DRIVER=chrome meteor test --full-app --once --driver-package meteortesting:mocha",
  "test-phantom": "TEST_BROWSER_DRIVER=phantomjs meteor test --once --driver-package meteortesting:mocha",
  "test-app-phantom": "TEST_BROWSER_DRIVER=phantomjs meteor test --full-app --once --driver-package meteortesting:mocha",
  "test-watch": "TEST_BROWSER_DRIVER=chrome meteor test --driver-package meteortesting:mocha",
  "test-app-watch": "TEST_BROWSER_DRIVER=chrome meteor test --full-app --driver-package meteortesting:mocha",
  "test-watch-browser": "meteor test --driver-package meteortesting:mocha",
  "test-app-watch-browser": "meteor test --full-app --driver-package meteortesting:mocha",
  "lint": "eslint .",
  "start": "meteor run"
}
```

And then run `npm run test-chrome`, etc.
