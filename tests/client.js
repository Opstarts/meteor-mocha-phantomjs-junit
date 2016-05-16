import { runTests } from '../client.js'
import { Tinytest } from 'meteor/tinytest'
import { Meteor } from 'meteor/meteor'

Tinytest.add('client package loaded - should have runTests defined', function (test) {
    test.equal(typeof runTests, 'function', 'runTests typeof');
});