/*
 * grunt-sauce-screenshots
 * https://github.com/cvrebert/grunt-sauce-screenshots
 *
 * Copyright (c) 2014 Chris Rebert
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');

var colors = require('colors');
var SauceTunnel = require('sauce-tunnel');
var wd = require('wd');

function filenameForBrowser(browserSpec) {
  var cleanVersion = (browserSpec.version === undefined ? '' : browserSpec.version);
  var filename = (browserSpec.browserName + '-' + browserSpec.platform + '-' + cleanVersion).replace(/ /g, '_') + '.png';
  return filename;
}

function takeScreenshots(grunt, tunnelIdentifier, browser, options) {
  var screenshotsPromise = options.browsers.reduce(function (browserWisePromise, browserSpec) {
    var browserFilename = filenameForBrowser(browserSpec);
    browserSpec['tunnel-identifier'] = tunnelIdentifier;
    browserWisePromise = browserWisePromise.init(browserSpec, function (err, sessionInfo) {
      if (err) {
        throw err;
      }
      var sessionId = sessionInfo[0];
      grunt.log.writeln();
      grunt.log.writeflags(browserSpec, 'Initialized session ' + sessionId.yellow + ' for browser');
    });
    browserWisePromise = Object.keys(options.urls).reduce(function (urlWisePromise, url) {
      var destDir = options.urls[url];
      var filepath = path.join(destDir, browserFilename);

      return (urlWisePromise
        .then(function () {
          grunt.log.writeln('Screenshotting ' + url.underline + ' ...');
        })
        .get(url, function (err) {
          if (err) {
            throw err;
          }
        })
        .takeScreenshot(function (err, base64png) {
          if (err) {
            throw err;
          }
          var pngBuf = new Buffer(base64png, 'base64');
          grunt.file.write(filepath, pngBuf);
          grunt.log.writeln('Screenshot ' + filepath.bold.cyan + ' snapped.');
        })
      );
    }, browserWisePromise);
    return browserWisePromise.fin(function() {
      return browser.quit(function (err) {
        throw err;
      });
    });
  }, browser);
  return screenshotsPromise;
}

var DEFAULTS = {
  timeout: 5 * 60 * 1000 // 5 minutes
};

module.exports = function(grunt) {
  grunt.registerMultiTask('sauce_screenshots', 'Takes screenshots of webpages in various browsers using Sauce', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = grunt.util._.extend.apply(null, [{}, DEFAULTS, this.data]);
    // options.browsers
    if (options.browsers === undefined) {
      grunt.fail.warn('Required option "browsers" not specified!');
    }
    else if ((typeof options.browsers) === 'string') {
      options.browsers = grunt.file.readYAML(options.browsers);
      if (!(options.browsers instanceof Array)) {
        grunt.fail.warn('YAML file specified in "browsers" option did not contain an array!');
      }
    }
    else if ((typeof options.browsers) === 'function') {
      options.browsers = options.browsers();
      if (!(options.browsers instanceof Array)) {
        grunt.fail.warn('"browsers" option function did not return an array!');
      }
    }
    else if (!(options.browsers instanceof Array)) {
      grunt.fail.warn('"browsers" option was of invalid type! Must be a string (path to YAML file) or function (returning an array).');
    }
    // options.urls
    if (options.urls === undefined) {
      grunt.fail.warn('Required option "urls" not specified!');
    }
    else if ((typeof options.urls) === 'function') {
      options.urls = options.urls();
      if ((typeof options.urls) !== 'object') {
        grunt.fail.warn('"urls" option function did not return a plain object!');
      }
    }
    else if ((typeof options.urls) !== 'object') {
      grunt.fail.warn('"urls" option was of invalid type! Must be a (function returning a) plain object.');
    }
    // options.timeout
    if ((typeof options.timeout) === 'function') {
      options.timeout = options.timeout({
        urls: options.urls.length,
        browsers: options.browsers.length
      });
      if ((typeof options.timeout) !== 'number') {
        grunt.fail.warn('"timeout" option function did not return a number!');
      }
    }
    else if ((typeof options.timeout) !== 'number') {
      grunt.fail.warn('"timeout" option was of invalid type! Must be a (function returning a) number.');
    }

    if (!process.env.SAUCE_USERNAME) {
      grunt.fail.warn('Required environment variable $SAUCE_USERNAME not set!');
    }
    if (!process.env.SAUCE_ACCESS_KEY) {
      grunt.fail.warn('Required environment variable $SAUCE_ACCESS_KEY not set!');
    }

    var done = this.async();
    grunt.log.writeln('Connecting to Sauce Labs...');
    var tunnel = new SauceTunnel(process.env.SAUCE_USERNAME, process.env.SAUCE_ACCESS_KEY, null, true);
    grunt.log.writeln('Tunnel identifier: ' + tunnel.identifier);
    /////
     var configureLogEvents = function (tunnel) {
      var methods = ['write', 'writeln', 'error', 'ok', 'debug'];
      methods.forEach(function (method) {
        tunnel.on('log:'+method, function (text) {
          grunt.log[method](text);
        });
        tunnel.on('verbose:'+method, function (text) {
          grunt.log[method](text);
        });
      });
    };
    configureLogEvents(tunnel);
    /////
    tunnel.start(function (tunnelConnected) {
      if (!tunnelConnected) {
        grunt.warn.fail('Problem establishing tunnel to Sauce Labs!');
      }

      var browser = wd.promiseChainRemote('ondemand.saucelabs.com', 80, process.env.SAUCE_USERNAME, process.env.SAUCE_ACCESS_KEY);

      var screenshotsPromise = takeScreenshots(grunt, tunnel.identifier, browser, options);
      (screenshotsPromise
        .fin(function () {
          tunnel.stop(function (err) {
            if (err) {
              throw err;
            }
          });
        })
        .timeout(options.timeout, 'Sauce screenshotting process exceeded ' + options.timeout + 'ms timeout!')
        .fail(function (err) {
          grunt.fail.warn(err);
        })
        .then(function () {
          done(true);
        })
      );
    });
  });
};
