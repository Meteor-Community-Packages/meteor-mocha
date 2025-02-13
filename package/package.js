Package.describe({
  name: 'meteortesting:mocha',
  summary: 'Run Meteor package or app tests with Mocha',
  git: 'https://github.com/meteortesting/meteor-mocha.git',
  documentation: '../README.md',
  version: '3.3.0-rc.0',
  testOnly: true,
});

Package.onUse(function onUse(api) {
  api.versionsFrom(['2.8.0', '3.0']);
  api.use(['meteortesting:mocha-core@8.2.0', 'ecmascript']);

  api.use(['meteortesting:browser-tests@1.7.0', 'fetch'], 'server');
  api.use('browser-policy', 'server', { weak: true });
  api.use(
    'lmieulet:meteor-coverage@1.1.4 || 2.0.1 || 3.0.0 || 4.0.0 || 5.0.0',
    'client',
    { weak: true },
  );

  api.mainModule('client.js', 'client');
  api.mainModule('server.js', 'server');
});
