## hybrid-callback - A very simple node.js hybrid callback pattern library

[![NPM](https://nodei.co/npm/hybrid-callback.png?mini=true)](https://nodei.co/npm/hybrid-callback/)
[![Build Status](https://travis-ci.org/ralphv/hybrid-callback.svg?branch=master)](https://travis-ci.org/ralphv/hybrid-callback)
[![Coverage Status](https://coveralls.io/repos/github/ralphv/hybrid-callback/badge.svg?branch=master)](https://coveralls.io/github/ralphv/hybrid-callback?branch=master)
        
* [What is it?](#what-is-it)
* [Getting started](#getting-started)
* [Usage](#usage)
* [License](#License)
* [Changelog](#Changelog)

## What is it

Node.js has the async programming model. Most of the function calls have the last parameter as a callback parameter, which is a function reference.
Usually you have to deal with each callback's error/success state, this duplicates code a lot and creates the callback hell.

There are different options to deal with callbacks including promises. hybrid-callback is a very simple pattern where you wrap the callback with a function call. Wraping the callback will allow you to write your code for success states only and error states will bubble up as needed.

## Getting started

    $ npm install --save hybrid-callback

## Usage

Instead of writing

```javascript
function f1(data, cb) {
  f2(data, function(err, data) {
    if(err) {
      return cb(err); // Each Async function/block needs to check for errors
    }
    else {
      doSomethingInDb(data, function(err, data) {
        if(err) { // Deal with error
          return cb(err);
        }
        else {
          processData(data, function(err, finalData) {
            if(err) {  // Deal with errors in every step, a lot of repeated code, chance to introduce bugs.
              return cb(err);
            }
            else {
              cb(null, finalData);
            }
          });
        }
      });
    }
  });
}
```

Write

```javascript
const hcb = require("hybrid-callback");

function f1(data, cb) {
  f2(data, hcb(cb, function(data) { // Wrap your cb with hcb, handle the success state only
    doSomethingInDb(data, hcb(cb, function(data) { // Any error state along the way will bubble up automatically 
      processData(data, hcb(cb, function(finalData) {
        cb(null, finalData); // Simpler code, more readable, less bugs from error handling
      }));
    }));
  }));
}
```

### License

hybrid-callback is licensed under the [MIT](https://github.com/ralphv/hybrid-callback/raw/master/LICENSE).

### Changelog

* 1.0.0: Initial version (simplified from cb-result library)
