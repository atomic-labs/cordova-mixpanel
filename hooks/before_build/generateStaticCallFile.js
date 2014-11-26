var colors = require('colors');
var esprima = require('esprima');
var estraverse = require('estraverse');

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

display.header('Generating Mixpanel A/B Test Statics');
display.success(require('path').dirname(require.main.filename));
display.success(__dirname);