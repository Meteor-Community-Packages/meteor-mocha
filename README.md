# dispatch:mocha

A Mocha test driver package for Meteor 1.3. This package reports server test results in the server console and can be used for running tests on a CI server.

THIS PACKAGE DOES NOT RUN CLIENT TESTS. IF YOUR APP HAS TESTS IN CLIENT CODE, USE https://github.com/DispatchMe/meteor-mocha-phantomjs INSTEAD.

## Installation

In a Meteor 1.3+ app directory:

```bash
meteor add dispatch:mocha
```

## Run app unit tests

```bash
meteor test --once --driver-package dispatch:mocha
```

## Run app unit tests in watch mode

```bash
TEST_WATCH=1 meteor test --driver-package dispatch:mocha
```

### Run with a different reporter

The default Mocha reporter for server tests is the "spec" reporter. You can set the `SERVER_TEST_REPORTER` environment variable to change it.

```bash
SERVER_TEST_REPORTER="dot" meteor test --once --driver-package dispatch:mocha
```

### Colors

You can set the `MOCHA_USE_COLORS` environment variable to enable colors.
```bash
MOCHA_USE_COLORS=1 meteor test --once --driver-package dispatch:mocha
```


## NPM Scripts

A good best practice is to define these commands as run scripts in your app's `package.json` file. For example:

```json
"scripts": {
  "test": "meteor test --once --driver-package dispatch:mocha",
  "test:watch": "TEST_WATCH=1 meteor test --driver-package dispatch:mocha",
  "start": "meteor run"
}
```

And then run `npm test` for one-time/CI mode or `npm run test:watch` to rerun the tests whenever you change a file.
