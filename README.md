# linguahouse:mocha-phantomjs-junit

A Mocha test driver package for Meteor 1.3. This package reports server and client results in the server console and can be used for running tests on a CI server. This achieves what `spacejam` does but without the need for a separate Node package.

This package runs your client tests within a PhantomJS page. If you prefer a different solution, it should be possible to fork this package to make a variation that runs in Chrome or any other headless browser. If you do so, we can add a link to your package here.

Includes a JUnit XML format reporter. Run with "junit" reporter to enable junit output

```bash
SERVER_TEST_REPORTER="junit" MOCHA_FILE=./test-reports.xml
```

Additionally, if you wish to route client test reports to junit too, set the reporter to "json".

```bash
SERVER_TEST_REPORTER=junit CLIENT_TEST_REPORTER=json meteor test --once --driver-package linguahouse:mocha-phantomjs-junit
```

## Installation

In a Meteor 1.3+ app directory:

```bash
meteor add linguahouse:mocha-phantomjs-junit
```

## Run app unit tests

```bash
meteor test --once --driver-package linguahouse:mocha-phantomjs-junit
```

## Run app unit tests in watch mode

```bash
TEST_WATCH=1 meteor test --driver-package linguahouse:mocha-phantomjs-junit
```

### Run with a different server reporter

The default Mocha reporter for server tests is the "spec" reporter. You can set the `SERVER_TEST_REPORTER` environment variable to change it.

```bash
SERVER_TEST_REPORTER="dot" meteor test --once --driver-package linguahouse:mocha-phantomjs-junit
```

### Run with a different client reporter

The default Mocha reporter for client tests is the "spec" reporter. You can set the `CLIENT_TEST_REPORTER` environment variable to change it.

```bash
CLIENT_TEST_REPORTER="tap" meteor test --once --driver-package linguahouse:mocha-phantomjs-junit
```

Because of the differences between client and server code, not all reporters will work as client reporters. "spec" and "tap" are confirmed to work.

## Output file

To specify the output file for server tests, use option `MOCHA_FILE`

```bash
SERVER_TEST_REPORTER=junit MOCHA_FILE=test-reports/server.xml meteor test --once  --driver-package linguahouse:mocha-phantomjs-junit
```

To specify the output file for client tests, use option `MOCHA_FILE_CLIENT`

```bash
SERVER_TEST_REPORTER=junit CLIENT_TEST_REPORTER=json MOCHA_FILE=test-reports/server.xml MOCHA_FILE_CLIENT=test-reports/client.xml meteor test --once  --driver-package linguahouse:mocha-phantomjs-junit
```

## NPM Scripts

A good best practice is to define these commands as run scripts in your app's `package.json` file. For example:

```json
"scripts": {
  "test": "SERVER_TEST_REPORTER=junit CLIENT_TEST_REPORTER=json meteor test --once --driver-package linguahouse:mocha-phantomjs-junit",
  "test:watch": "TEST_WATCH=1 SERVER_TEST_REPORTER=junit CLIENT_TEST_REPORTER=json meteor test --driver-package linguahouse:mocha-phantomjs-junit",
  "test:fullapp": "SERVER_TEST_REPORTER=junit CLIENT_TEST_REPORTER=json meteor test --once --driver-package linguahouse:mocha-phantomjs-junit",
  "start": "meteor run"
}
```

And then run `npm test` for one-time/CI mode or `npm run test:watch` to rerun the tests whenever you change a file.
