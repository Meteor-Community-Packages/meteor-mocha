Package.describe({
  name: 'grubba:mocha',
  summary: 'Run Meteor package or app tests with Mocha',
  git: 'https://github.com/meteortesting/meteor-mocha.git',
  documentation: '../README.md',
  version: '3.0.2-alpha300.9',
  testOnly: true,
});

Package.onUse(function onUse(api) {
  api.use([
    'denyhs:mocha-core@8.2.2-alpha300.9',
    'ecmascript@1.0.0-alpha300.9',
  ]);

  api.use(['grubba:browser-tests@1.5.2-alpha300.9', 'http@1.0.0 || 2.0.0'], 'server');
  api.use('browser-policy@1.0.0', 'server', { weak: true });
  api.use('lmieulet:meteor-coverage@1.1.4 || 2.0.1 || 3.0.0 || 4.1.0', 'client', { weak: true });

  api.mainModule('client.js', 'client');
  api.mainModule('server.js', 'server');
});
