import { start } from '../server.js'
import { Tinytest } from 'meteor/tinytest'
import { Meteor } from 'meteor/meteor'

Tinytest.add('server package loaded - should have start defined', function (test) {
    test.equal(typeof start, 'function', 'start typeof');
});