/**
 * Created by Ralph Varjabedian on 11/14/14.
 */

'use strict';

var should = require('should');
var hcb = require("../");

function f2(data, cb) { cb(null, data);}
function doSomethingInDb(data, cb) { cb(null, data);}
function processData(data, cb) { cb(null, data);}
function processDataWithError(data, cb) { cb("data error");}

describe('testing hcb', function() {
  this.timeout(0);

  it('testing hcb simple case', function(done) {
    function f1(data, cb) {
      f2(data, hcb(cb, function(data) { // Wrap your cb with hcb, handle the success state only
        doSomethingInDb(data, hcb(cb, function(data) { // Any error state along the way will bubble up automatically
          processData(data, hcb(cb));
        }));
      }));
    }

    f1("success", function(err, data) {
      should.not.exist(err);
      should.equal(data, "success");
      done();
    });
  });

  it('testing hcb simple case with success handler', function(done) {
    function f1(data, cb) {
      f2(data, hcb(cb, function(data) { // Wrap your cb with hcb, handle the success state only
        doSomethingInDb(data, hcb(cb, function(data) { // Any error state along the way will bubble up automatically
          processData(data, hcb(cb, function(finalData) {
            cb(null, finalData + ": more"); // Simpler code, more readable, less bugs from error handling
          }));
        }));
      }));
    }

    f1("success", function(err, data) {
      should.not.exist(err);
      should.equal(data, "success: more");
      done();
    });
  });

  it('testing hcb with error from processData bubbling up', function(done) {
    function f1(data, cb) {
      f2(data, hcb(cb, function(data) { // Wrap your cb with hcb, handle the success state only
        doSomethingInDb(data, hcb(cb, function(data) { // Any error state along the way will bubble up automatically
          processDataWithError(data, hcb(cb, function(finalData) {
            cb(null, finalData); // Simpler code, more readable, less bugs from error handling
          }));
        }));
      }));
    }

    f1(null, function(err, data) {
      should.equal(err, "data error");
      should.not.exist(data);
      done();
    });
  });

  it('testing hcb with error from processData handling', function(done) {
    function f1(data, cb) {
      f2(data, hcb(cb, function(data) { // Wrap your cb with hcb, handle the success state only
        doSomethingInDb(data, hcb(cb, function(data) { // Any error state along the way will bubble up automatically
          processDataWithError(data, hcb(cb, function(finalData) {
            cb(null, finalData); // Simpler code, more readable, less bugs from error handling
          }, function(err) {
            cb(err + ": more error");
          }));
        }));
      }));
    }

    f1(null, function(err, data) {
      should.equal(err, "data error: more error");
      should.not.exist(data);
      done();
    });
  });

});

