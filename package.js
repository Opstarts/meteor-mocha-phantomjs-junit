Package.describe({
  name: "linguahouse:mocha-phantomjs-junit",
  summary: "Run package or app tests with Mocha+PhantomJS and report all results in the server console or JUnit XML format",
  git: "https://github.com/linguahouse/meteor-mocha-phantomjs-junit.git",
  version: '1.0.0',
  testOnly: true
});

Npm.depends({
  'mocha-junit-reporter': '1.11.1'
});

Package.onUse(function (api) {
  api.versionsFrom('1.3');

  api.use([
    'dispatch:mocha-core@0.0.1',
    'ecmascript'
  ]);

  api.use([
    'dispatch:phantomjs-tests@0.0.5'
  ], 'server');

  api.mainModule('client.js', 'client');
  api.mainModule('server.js', 'server');
});

Package.onTest(function (api) {
  api.versionsFrom('1.3');

  api.use([
    'ecmascript',
    'dispatch:mocha-core@0.0.1'
  ]);

  api.use([
    'dispatch:phantomjs-tests@0.0.5'
  ], 'server');

  api.use(['tinytest', 'test-helpers']);

  api.mainModule('tests/server.js', 'server');
  api.mainModule('tests/client.js', 'client');
});
