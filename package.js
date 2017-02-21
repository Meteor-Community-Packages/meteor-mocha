Package.describe({
  name: "dispatch:mocha",
  summary: "Run package or app tests with Mocha, using a headless browser for the client tests",
  git: "https://github.com/DispatchMe/meteor-mocha.git",
  version: '0.1.0',
  testOnly: true,
});

Npm.depends({
  lodash: '4.17.4',
  fclone : '1.0.11',
  mocha: '3.2.0',
});

Package.onUse(function (api) {
  api.use([
    // 'practicalmeteor:mocha-core@1.0.0',
    'ecmascript@0.3.0',
    'numtel:template-from-string@0.1.0',
    'bioduds:uikit3@1.1.6',
    'session'
  ]);

  api.use([
    'aldeed:browser-tests@0.0.1'
  ], 'server');

  api.mainModule('client.js', 'client');
  api.mainModule('server.js', 'server');
});
