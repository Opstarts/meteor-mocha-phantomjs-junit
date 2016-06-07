import { mochaInstance } from 'meteor/dispatch:mocha-core';
import { startPhantom } from 'meteor/dispatch:phantomjs-tests';
import MochaJUnitReporter from 'mocha-junit-reporter';

const reporter = process.env.SERVER_TEST_REPORTER || 'spec';

// pass the current env settings to the client.
Meteor.startup(function() {
  Meteor.settings.public = Meteor.settings.public || {};
  Meteor.settings.public.CLIENT_TEST_REPORTER = process.env.CLIENT_TEST_REPORTER;
});

// Since intermingling client and server log lines would be confusing,
// the idea here is to buffer all client logs until server tests have
// finished running and then dump the buffer to the screen and continue
// logging in real time after that if client tests are still running.
let serverTestsDone = false;
let clientLines = [];
function clientLogBuffer(line) {
  if (serverTestsDone) {
    // printing and removing the extra new-line character. The first was added by the client log, the second here.
    console.log(line.replace(/\n$/, ''));
  }

  clientLines.push(line);
}

function printHeader(type) {
  console.log('\n--------------------------------');
  console.log(`----- RUNNING ${type} TESTS -----`);
  console.log('--------------------------------\n');
}

let callCount = 0;
let clientFailures = 0;
let serverFailures = 0;
function exitIfDone(type, failures) {
  callCount++;
  if (type === 'client') {
    clientFailures = failures;
  } else {
    serverFailures = failures;
    serverTestsDone = true;
    printHeader('CLIENT');
    clientLines.forEach((line) => {
      // printing and removing the extra new-line character. The first was added by the client log, the second here.
      console.log(line.replace(/\n$/, ''));
    });
  }

  if (callCount === 2) {
    console.log('All client and server tests finished!\n');
    console.log('--------------------------------');
    console.log(`SERVER FAILURES: ${serverFailures}`);
    console.log(`CLIENT FAILURES: ${clientFailures}`);
    console.log('--------------------------------');

    if (reporter == 'junit') {
      // write client results to .xml too
      // client reporter should be 'json'
      try {
        var json = JSON.parse(clientLines.join('').replace(/^stdout\:\s/, '').replace(/^stderr\:\s/, ''));

        ///////////
        // reformat for JUnit reporter

        var rep = new MochaJUnitReporter({
          stats: {},
          on: function() {}
        });
        rep._options.mochaFile = process.env.MOCHA_FILE_CLIENT || 'client-test-results.xml';

        var testsuites = [];
        var durationoffset = 0;
        var totalfailures = 0;
        var totalskipped = 0;
        var teststart = new Date(json.stats.start).getTime();
        var last_suite_title = null;
        // make a root suite first
        testsuites.push({
          testsuite: [{
            _attr: {
              name: "Root Suite",
              timestamp: json.stats.start.slice(0, -5),
              tests: 0
            }
          }]
        });

        json.tests.forEach(function(test) {
          var suite_title = test.fullTitle.split(' ' + test.title);
          //
          if (last_suite_title != suite_title[0]) {
            testsuites.push({
              testsuite: [{
                _attr: {
                  name: suite_title[0],
                  timestamp: new Date(teststart + durationoffset).toISOString(),
                  tests: 0
                }
              }]
            });
          }
          var attr = {
            name: test.fullTitle,
            time: test.duration ? test.duration / 1000 : 0,
            classname: test.title
          };
          var testcase = [{
            _attr: attr
          }];
          if (test.err && test.err.hasOwnProperty('message')) {
            testcase.push({
              failure: {
                _cdata: rep.removeInvalidCharacters(test.err.message + "\n" + test.err.sourceURL + "\n" + "Line: " + test.err.line + "\n" + test.err.stack)
              }
            });
            totalfailures++;
          } else if (!test.hasOwnProperty('duration')) {
            testcase.push({
              skipped: { }
            });
            totalskipped++;
          }
          testsuites[testsuites.length-1].testsuite.push({
            testcase: testcase
          });
          if (test.duration) {
            durationoffset += test.duration;
          }
          testsuites[testsuites.length-1].testsuite[0]._attr.tests++;
          last_suite_title = suite_title[0];
        });

        rep._runner.stats.pending = totalskipped;
        rep._runner.stats.failures = totalfailures;

        //// Flush XML
        rep.flush(testsuites);
      } catch(e) {
        console.error('ERROR: Unexpected error while outputting client test results to JUnit');
        console.error(e.message);
        console.error(e.stack);
      }
    } else {
      console.log('To save client test results to JUnit format, set client reporter to "json".');
    }

    if (!process.env.TEST_WATCH) {
      if (clientFailures + serverFailures > 0) {
        process.exit(2); // exit with non-zero status if there were failures
      } else {
        process.exit(0);
      }
    }
  }
}

// Before Meteor calls the `start` function, app tests will be parsed and loaded by Mocha
function start() {
  // Run the server tests
  printHeader('SERVER');

  // We need to set the reporter when the tests actually run to ensure no conflicts with
  // other test driver packages that may be added to the app but are not actually being
  // used on this run.
  if (reporter == 'junit') {
    console.log('Mocha: Using JUnit reporter');
    mochaInstance.reporter(MochaJUnitReporter, { toConsole: !!process.env.MOCHA_FILE_TOCONSOLE });
  } else {
    mochaInstance.reporter(reporter);
  }

  mochaInstance.run((failureCount) => {
    exitIfDone('server', failureCount);
  });

  // Simultaneously start phantom to run the client tests
  startPhantom({
    stdout(data) {
      clientLogBuffer(data.toString());
    },
    stderr(data) {
      clientLogBuffer(data.toString());
    },
    done(failureCount) {
      exitIfDone('client', failureCount);
    },
  });
}

export { start };
