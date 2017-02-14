/**
 * Created by Ralph Varjabedian on 11/14/14.
 */

'use strict';

var should = require('should');
var path = require('path');
var result = require("../");

function funcSuccess(a, b, cb) {
  cb(result.success(result.success("success msg", "extra")));
}

function funcError(a, b, cb) {
  cb(result.error(result.error("error msg", "extra error details")));
}

function legacyFuncSuccess(a, b, cb) {
  cb(null, "success msg");
}

function legacyFuncError(a, b, cb) {
  cb("error msg");
}

function funcErrorCode(a, b, cb) {
  cb(result.errorCode(result.errorCode(100)));
}


describe('testing cb-hybridCallback', function() {
  this.timeout(0);

  it('testing cb-hybridCallback.errors.add', function(done) {
    result.errors.add({code: 100, enum: "failedAuthentication", desc: "failed authentication"});
    result.errors.add(101, "failedAuthorization", "failed authorization");
    result.errors.add(102, "dbIndexDuplicate", "failed db operation due to index restriction", /E11000/);
    try {
      result.errors.add({});
    } catch(err) {
      should.exist(err);
    }
    done();
  });

  it('testing cb-hybridCallback.cb success', function(done) {
    funcSuccess(1, 2, result.cb(done, function(successMsg) {
      should.equal(successMsg, "success msg");
      done();
    }));
  });

  it('testing cb-hybridCallback.legacycb success', function(done) {
    funcSuccess(1, 2, result.legacycb(done, function(successMsg) {
      should.equal(successMsg, "success msg");
      done();
    }));
  });

  it('testing cb-hybridCallback.cb success raw', function(done) {
    var func = function(a, b, cb) {
      cb(result.successRaw(result.successRaw("success msg", "extra")));
    };
    func(1, 2, result.cb(done, function(successMsg) {
      should.equal(successMsg, "success msg");
      done();
    }));
  });

  it('testing cb-hybridCallback.cb error', function(done) {
    funcError(1, 2, result.cb(done, null, function(errorMsg) {
      should.equal(errorMsg, "error msg");
      done();
    }));
  });

  it('testing cb-hybridCallback.cb legacy error', function(done) {
    funcError(1, 2, result.legacycb(done, null, function(errorMsg) {
      should.equal(errorMsg, "error msg");
      done();
    }));
  });

  it('testing cb-hybridCallback.cb combine errors', function(done) {
    var func = function(a, b, cb) {
      cb(result.combineErrors([result.error("error msg")]));
    };
    func(1, 2, result.cb(done, null, function(errors) {
      should.equal(errors.length, 1);
      should.equal(errors[0].error, "error msg");
      done();
    }));
  });

  it('testing cb-hybridCallback.cb success with boxing', function(done) {
    legacyFuncSuccess(1, 2, result.cb(done, function(successMsg) {
      should.equal(successMsg, "success msg");
      done();
    }));
  });

  it('testing cb-hybridCallback.cb error with boxing', function(done) {
    legacyFuncError(1, 2, result.cb(done, null, function(errorMsg) {
      should.equal(errorMsg, "error msg");
      done();
    }));
  });

  it('testing cb-hybridCallback.cb success with boxing nested', function(done) {
    var func = function(a, b, cb) {
      legacyFuncSuccess(a, b, result.cb(cb));
    };
    func(1, 2, result.cb(done, function(successMsg) {
      should.equal(successMsg, "success msg");
      done();
    }));
  });

  it('testing cb-hybridCallback.cb error with boxing nested', function(done) {
    var func = function(a, b, cb) {
      legacyFuncError(a, b, result.cb(cb));
    };
    func(1, 2, result.cb(done, null, function(errorMsg) {
      should.equal(errorMsg, "error msg");
      done();
    }));
  });

  it('testing cb-hybridCallback.legacycb success', function(done) {
    funcSuccess(1, 2, result.legacycb(done, function(successMsg) {
      should.equal(successMsg, "success msg");
      done();
    }));
  });

  it('testing cb-hybridCallback.legacycb error', function(done) {
    funcError(1, 2, result.legacycb(done, null, function(errorMsg) {
      should.equal(errorMsg, "error msg");
      done();
    }));
  });

  it('testing cb-hybridCallback.legacycb success with boxing', function(done) {
    legacyFuncSuccess(1, 2, result.legacycb(done, function(successMsg) {
      should.equal(successMsg, "success msg");
      done();
    }));
  });

  it('testing cb-hybridCallback.cb error with boxing', function(done) {
    legacyFuncError(1, 2, result.legacycb(done, null, function(errorMsg) {
      should.equal(errorMsg, "error msg");
      done();
    }));
  });

  it('testing cb-hybridCallback.cb error nested', function(done) {
    funcError(1, 2, result.cb(function(res) {
      should.equal(res.success, false);
      done();
    }));
  });

  it('testing cb-hybridCallback.cb errorCode', function(done) {
    result.errorCode(111);
    funcErrorCode(1, 2, result.cb(done, null, function(errorMsg) {
      should.equal(errorMsg, "failed authentication");
      done();
    }));
  });

  it('testing cb-hybridCallback.cb errorCode', function(done) {
    funcErrorCode(1, 2, result.cb(done, null, function(errorMsg) {
      should.equal(errorMsg, "failed authentication");
      done();
    }));
  });

  it('testing cb-hybridCallback.cb error code detection with regex ', function(done) {
    var func = function(a, b, cb) {
      cb("Db error: E11000 duplicate index detection error");
    };
    var func1 = function(a, b, cb) {
      func(a, b, result.cb(cb));
    };
    func1(1, 2, function(res){
      should.equal(res.success, false);
      should.equal(res.error, "failed db operation due to index restriction");
      should.equal(res.errorCode, 102);
      done();
    });
  });

  it('testing cb-hybridCallback.cb error code detection with regex 2', function(done) {
    var func = function(a, b, cb) {
      cb({message:"Db error: E11000 duplicate index detection error", code:11000});
    };
    var func1 = function(a, b, cb) {
      func(a, b, result.cb(cb));
    };
    func1(1, 2, function(res){
      should.equal(res.success, false);
      should.equal(res.error, "failed db operation due to index restriction");
      should.equal(res.errorCode, 102);
      done();
    });
  });

  it('testing cb-hybridCallback.cb error code detection with regex 2, without match', function(done) {
    var func = function(a, b, cb) {
      cb({message:"Db error: E11001 another error", code:11001});
    };
    var func1 = function(a, b, cb) {
      func(a, b, result.cb(cb));
    };
    func1(1, 2, function(res){
      should.equal(res.success, false);
      should.equal(res.error, "Db error: E11001 another error");
      should.equal(res.errorCode, 11001);
      done();
    });
  });

  it('testing cb-hybridCallback.cb error code detection with Error', function(done) {
    var func = function(a, b, cb) {
      cb(new Error("yet another error"));
    };
    var func1 = function(a, b, cb) {
      func(a, b, result.cb(cb));
    };
    func1(1, 2, function(res){
      should.equal(res.success, false);
      should.equal(res.error, "yet another error");
      should.equal(res.errorCode, -1);
      done();
    });
  });

  it('testing cb-hybridCallback.legacycb unboxing error', function(done) {
    var func = function(a, b, cb) {
      cb("error");
    };
    var func1 = function(a, b, cb) {
      func(a, b, result.legacycb(cb));
    };
    func1(1, 2, function(err){
      should.equal(err, "error");
      done();
    });
  });

  it('testing cb-hybridCallback.legacycb unboxing success', function(done) {
    var func = function(a, b, cb) {
      cb(null, "success");
    };
    var func1 = function(a, b, cb) {
      func(a, b, result.legacycb(cb));
    };
    func1(1, 2, function(err, data){
      should.not.exist(err);
      should.equal(data, "success");
      done();
    });
  });
});

