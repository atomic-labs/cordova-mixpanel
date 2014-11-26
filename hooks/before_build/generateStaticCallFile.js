var colors = require('colors');
var esprima = require('esprima');
var estraverse = require('estraverse');
var path = require('path');
var exec = require('child_process').exec;

/**
 * @var {Object} console utils
 */
var display = {};

display.success = function (str) {
    str = '✓  '.green + str;
    console.log('  ' + str);
};
display.error = function (str) {
    str = '✗  '.red + str;
    console.log('  ' + str);
};
display.header = function (str) {
    console.log('');
    console.log(' ' + str.cyan.underline);
    console.log('');
};


module.exports = function(context) {
    var Q = context.requireCordovaModule('q');
    var deferral = new Q.defer();

    var rootSource = path.resolve(context.opts.projectRoot, 'www')
    
    display.header('Generating Mixpanel A/B Test Statics');

    var command = 'grep -Zlr "\\<Mixpanel\\>" ' + rootSource + ' | grep ".js"\'$\'';

    console.info('running command: '.green + command)

    exec(command, function (error, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        console.log(error);
        deferral.resolve();
    });

    return deferral.promise;
};