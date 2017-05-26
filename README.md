# meteortesting:mocha

_Formerly published as dispatch:mocha. Originally created by [Dispatch](http://www.dispatch.me/) but now community maintained._

A Mocha test driver package for Meteor 1.3. This package reports server AND client test results in the server console and can be used for running tests on a CI server or locally. This achieves what `spacejam` does but without the need for a separate Node package.

## Installation

In a Meteor 1.3+ app directory:

```bash
meteor add meteortesting:mocha
```

## Run app tests

To run unit tests one time and exit:

```bash
meteor test --once --driver-package meteortesting:mocha
```

To run full-app tests one time and exit:

```bash
meteor test --once --full-app --driver-package meteortesting:mocha
```

To run in watch mode, restarting as you change files, add `TEST_WATCH=1` before your test command and remove the `--once` flag. For example:

```bash
TEST_WATCH=1 meteor test --driver-package meteortesting:mocha
```

> NOTE: Watch mode does not properly rerun client tests if you change only client code. To work around this, you can add or remove whitespace from a server file, and that will trigger both server and client tests to rerun.

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

You'll need to specify which headless browser to use and install the necessary NPM packages. To do this, set the `TEST_BROWSER_DRIVER` environment variable. There are currently 3 supported browsers:

**Chrome**

```bash
$ meteor npm i -E --save-dev selenium-webdriver@3.0.0-beta-2
$ meteor npm i --save-dev chromedriver
$ TEST_BROWSER_DRIVER=chrome meteor test --once --driver-package meteortesting:mocha
```

NOTE: Currently you must pin to exactly version 3.0.0-beta-2 of selenium-webdriver because the latest only works on Node 6.x. The `-E` in the command above is important!

**Nightmare/Electron**

```bash
$ meteor npm i --save-dev nightmare
$ TEST_BROWSER_DRIVER=nightmare meteor test --once --driver-package meteortesting:mocha
```

You can export TEST_BROWSER_VISIBLE=1 to show the Electron window while tests run.

**PhantomJS**

```bash
$ meteor npm i --save-dev phantomjs-prebuilt
$ TEST_BROWSER_DRIVER=phantomjs meteor test --once --driver-package meteortesting:mocha
```

### Run only server or only client tests

By default both server and client tests run. To disable server tests: `TEST_SERVER=0`. Likewise for client: `TEST_CLIENT=0`

### Run tests inclusively (grep) or exclusively (invert)

To run all tests with names that match a pattern, add the environment variable `MOCHA_GREP=your_string`. This will apply to both client and server tests.

To exclude any tests, you must use the grep option above plus `MOCHA_INVERT=1`. For example, to exclude tests named 'TODO:' (which you may want to exclude from your continuous integration workflow) you would pass at runtime `MOCHA_GREP=your_string MOCHA_INVERT=1`

### Specify global timeout

To override Mocha's default timeout for all tests, add the environment variable `MOCHA_GLOBAL_TIMEOUT=your_timeout_in_ms`

### Run in parallel

By default meteortesting:mocha will run in series. This is a safety mechanism since running a client test and server test which depend on DB state may have side effects.

If you design your client and server tests to not share state, then you can run tests faster. Run in parallel by exporting the environment variable `TEST_PARALLEL=1` before running.

### Run with a different server reporter

The default Mocha reporter for server tests is the "spec" reporter. You can set the `SERVER_TEST_REPORTER` environment variable to change it.

```bash
$ SERVER_TEST_REPORTER="dot" meteor test --once --driver-package meteortesting:mocha
```

#### Generate an XUnit file for server tests

To generate an XUnit file, set `SERVER_TEST_REPORTER` to `xunit` and set `XUNIT_FILE` to the full path + filename, e.g., `$PWD/unit.xml`.

```bash
$ SERVER_TEST_REPORTER=xunit XUNIT_FILE=$PWD/unit.xml meteor test --once --driver-package meteortesting:mocha
```

### Run with a different client reporter

The default Mocha reporter for client tests is the "spec" reporter. You can set the `CLIENT_TEST_REPORTER` environment variable to change it.

```bash
$ CLIENT_TEST_REPORTER="tap" meteor test --once --driver-package meteortesting:mocha
```

Because of the differences between client and server code, not all reporters will work as client reporters. "spec" and "tap" are confirmed to work.

## NPM Scripts

A good best practice is to define these commands as run scripts in your app's `package.json` file. For example:

```json
"scripts": {
  "pretest": "npm run lint --silent",
  "test-chrome": "TEST_BROWSER_DRIVER=chrome meteor test --once --driver-package meteortesting:mocha",
  "test-app-chrome": "TEST_BROWSER_DRIVER=chrome meteor test --full-app --once --driver-package meteortesting:mocha",
  "test-phantom": "TEST_BROWSER_DRIVER=phantomjs meteor test --once --driver-package meteortesting:mocha",
  "test-app-phantom": "TEST_BROWSER_DRIVER=phantomjs meteor test --full-app --once --driver-package meteortesting:mocha",
  "test-watch": "TEST_BROWSER_DRIVER=chrome TEST_WATCH=1 meteor test --driver-package meteortesting:mocha",
  "test-app-watch": "TEST_BROWSER_DRIVER=chrome TEST_WATCH=1 meteor test --full-app --driver-package meteortesting:mocha",
  "test-watch-browser": "TEST_WATCH=1 meteor test --driver-package meteortesting:mocha",
  "test-app-watch-browser": "TEST_WATCH=1 meteor test --full-app --driver-package meteortesting:mocha",
  "lint": "eslint .",
  "start": "meteor run"
}
```

And then run `npm run test-chrome`, etc.
