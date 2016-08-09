Package.describe({
  name: "dispatch:mocha",
  summary: "Run server-only package or app tests with Mocha",
  git: "https://github.com/DispatchMe/meteor-mocha.git",
  version: '0.0.9',
  testOnly: true,
});

Package.onUse(function (api) {
  api.versionsFrom('1.3');

  api.use([
    'practicalmeteor:mocha-core@1.0.0',
    'ecmascript',
  ], 'server');

  api.mainModule('server.js', 'server');
});

Package.onTest(function (api) {
  api.use([
    'tinytest',
    'ecmascript'
  ], 'server');
  api.addFiles('lib/toBoolean_tests.js', 'server');
});
