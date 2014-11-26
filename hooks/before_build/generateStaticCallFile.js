var colors = require('colors');
var esprima = require('esprima');
var estraverse = require('estraverse');
var path = require('path');
var exec = require('child_process').exec;
var fs = require('fs');

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
      if(error) {
        display.error('Failed to find files to generate Mixpanel a/b test code for.')
      }
      else {
        var files = stdout.split('\n');
        console.log(files);
        var abTests = {};
        for(var i = 0; i < files.length; i++) {
          var file = files[i];
          estraverse(esprima.parse(fs.readFile(file, 'utf8')), {
            enter: function(node, parent) {
              if(node.type == 'CallExpression' &&
                 node.callee.type == 'MemberExpression' &&
                 node.callee.object.name == 'Mixpanel' &&
                 node.callee.property.name == 'getTweakValue' &&
                 node.arguments.length == 2) {
                abTests[node.arguments[0].value] = node.arguments[1].value;
              }
            }
          });
          display.success('parsed file ' + file);
        }
        display.header('a/b test findings');
        console.info(abTests);
      }
      deferral.resolve();
    });

    return deferral.promise;
};