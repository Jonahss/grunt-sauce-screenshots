/*
 * grunt-sauce-screenshots
 * https://github.com/cvrebert/grunt-sauce-screenshots
 *
 * Copyright (c) 2014 Chris Rebert
 * Licensed under the MIT license.
 */

/* jshint camelcase: false */
'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc',
      },
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ]
    },

    jscs: {
      options: {
        config: '.jscs.json'
      },
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ]
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    // Configuration to be run (and then tested).
    sauce_screenshots: {
      shouldWorkFine: {
        urls: {
          'http://reddit.com': './screenshots/reddit/',
          'http://yahoo.com': './screenshots/yahoo/'
        },
        browsers: [
          {
            browserName: "firefox",
            platform: "Linux"
          },
          {
            browserName: "chrome",
            platform: "Linux"
          }
        ]
      },
      shouldTimeout: {
        timeout: 5000,
        urls: {
          'http://reddit.com': './screenshots/should_timeout/'
        },
        browsers: [
          {
            browserName: "firefox",
            platform: "Linux"
          }
        ]
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-jscs-checker');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', [/*'clean', 'sauce_screenshots', 'nodeunit'*/]);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'jscs', 'test']);

};
