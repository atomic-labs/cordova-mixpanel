/**
 * @var {Object} console utils
 */
var display = {};
var colors = require('colors');

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
display.success(require('path').dirname(require.main.filename))
