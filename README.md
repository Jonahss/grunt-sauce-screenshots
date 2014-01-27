# grunt-sauce-screenshots
[![Dependency Status](https://david-dm.org/cvrebert/grunt-sauce-screenshots.png)](https://david-dm.org/cvrebert/grunt-sauce-screenshots)
[![devDependency Status](https://david-dm.org/cvrebert/grunt-sauce-screenshots/dev-status.png)](https://david-dm.org/cvrebert/grunt-sauce-screenshots#info=devDependencies)

> Takes screenshots of webpages in various browsers using [Sauce](http://saucelabs.com)

## Getting Started
This plugin requires Grunt `~0.4.2`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-sauce-screenshots --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-sauce-screenshots');
```

## The "sauce_screenshots" task

### Overview
In your project's Gruntfile, add a section named `sauce_screenshots` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  sauce_screenshots: {
    your_target: {
      // Target-specific options go here.
    },
  },
});
```

### Environment variables

This task requires the following environment variables to be set:
* `$SAUCE_USERNAME` - Sauce account username
* `$SAUCE_ACCESS_KEY` - secret access key for the Sauce account

### Screenshot naming scheme

Within each per-URL directory, screenshot image files are named according to the browser used:
`{{ browserName }}-{{ platform }}-{{ version }}.png` (all screenshots are [PNGs](http://en.wikipedia.org/wiki/Portable_Network_Graphics))
* All spaces in the filename components are replaced with underscores.
* If no `version` is specified in the Sauce config for the browser, the empty string will be used for the `version` portion of the filename.

Examples:
* `chrome-OS_X_10.9-31.png`
* `internet_explorer-Windows_8.1-.png`

### Options

#### options.browsers
Type: `Array` or `String` or function returning `Array`

**Required**

An array of Sauce browser specifications. All the URLs will be screenshotted in all of these browsers.
If a string is given, it is used as the path to a YAML file containing such an array.
If a function is given, it is called (with no arguments) and must return such an array.

Example value:
```json
[
  {
    "browserName": "chrome",
    "platform": "OS X 10.9",
    "version": "31"
  },
  ...
]
```

Relevant Sauce docs: https://saucelabs.com/docs/platforms/webdriver

#### options.urls
Type: `Object` (key-value mapping) or function returning `Object`; keys are `String`s representing URLs; values are `String` paths to directories

**Required**

A mapping of webpage URLs (to take screenshots of) to directory paths (to store all the screenshots of the corresponding URL in).

#### options.timeout
Type: `Number` or function returning `Number`

Default value: 5 minutes

The maximum allowed duration of the entire screenshotting process, in milliseconds.
If a function is given, it is called with an object having `urls` and `browsers` as keys, with the values being the length of their respective arrays; it must return a number.

### Usage Examples

```js
grunt.initConfig({
  sauce_screenshots: {
    mySites: {
      timeout: 60000
      browsers: [
        {
          browserName: "chrome",
          platform: "OS X 10.9",
          version: "31"
        },
        {
          browserName: "firefox",
          platform: "Linux"
        }
      ],
      urls: {
        'http://www.reddit.com/r/programming/': './screenshots/proggit/',
        'http://127.0.0.1:8080/my-demo': './screenshots/my-site/'
      }
    }
  }
});
```

## Users

This Grunt task is being created with the intention of being used by [Bootstrap](https://github.com/twbs/bootstrap) for visual CSS regression testing.

## Contributing
Use the `jshint` and `jscs` [Grunt](http://gruntjs.com/) tasks to check your compliance with the project's coding style. Add unit tests for any new or changed functionality.

## Release History
_(Nothing yet)_
