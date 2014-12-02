var colors = require('colors');
var esprima = require('esprima');
var estraverse = require('estraverse');
var path = require('path');
var exec = require('child_process').exec;
var fs = require('fs');
var _ = require('lodash');

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

    var rootSource = path.resolve(context.opts.projectRoot, 'www');
    var dirs = context.opts.projectRoot.split('/');
    var projectName = dirs[dirs.length - 1];
    var pluginClassPath = path.resolve(context.opts.projectRoot,
                                       'platforms', 'ios', 'derpme',
                                       'Plugins', 'org.poetic.mixpanel');
    
    display.header('Generating Mixpanel A/B Test Statics');

    var command = 'grep -Zlr "\\<Mixpanel\\>" ' + rootSource + ' | grep ".js"\'$\'';

    console.info('running command: '.green + command)

    exec(command, function (error, stdout, stderr) {
      if(error) {
        display.error('Failed to find files to generate Mixpanel a/b test code for.')
      }
      else {
        var files = stdout.trim().split('\n');
        var abTests = {};
        for(var i = 0; i < files.length; i++) {
          var file = files[i];
          estraverse.traverse(esprima.parse(fs.readFileSync(file, 'utf8')), {
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
      }
      var keys = _.keys(abTests);
      if(keys.length > 0){
        var staticFilePath = path.resolve(pluginClassPath, 'CDVMixpanelTweaks.m');
        var fileData = ['#import "CDVMixpanelTweaks.h"',
                        '#import <Foundation/NSException.h>',
                        '',
                        '@implementation CDVMixpanelTweaks',
                        '',
                        '-(void)init:(CDVInvokedUrlCommand *)command;',
                        '{',
                        '    // BEGIN GENERATED'];


        for(var i = 0; i < keys.length; i++) {
          var key = keys[i];
          var value = abTests[key];
          if(_.isString(value)) {
            value = '@"' + value + '"';
          }
          else if(value === true) {
            value = 'YES';
          }
          else if(value === false) {
            value = 'NO';
          }
          fileData.push('    MPTweakValue(@"' + key + '", ' + value + ');');
          display.success('found tweak for "' + key + '": ' + value);
        }
        fileData.push('    // END GENERATED');
        fileData.push('}');
        fileData.push('@end');

        fileData = fileData.join('\n') + '\n';

        fs.writeFileSync(staticFilePath, fileData);
      }
      else {
        display.success('found no tweaks');
      }
      deferral.resolve();
    });

    return deferral.promise;
};