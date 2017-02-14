/**
 * Created by Ralph Varjabedian on 12/18/14.
 * hybrid-callback is licensed under the [MIT]
 * do not remove this notice.
 */
'use strict';

/**
 * Wrap callbacks with this call to get rid of error checking on each async block
 * @param {Function} cb the callback to wrap
 * @param {Function} [successFn] optional success function to handle the success case only
 * @param {Function} [failureFn] optional error function to handle the error case only, note that the error is passed in the first parameters in this case
 * @returns {Function} the new callback
 */
const hcb = function(cb, successFn, failureFn) {
  return function(err, data) {
    if(err && failureFn) {
      return failureFn(err);
    } else if(successFn && !err) {
      return successFn(data);
    } else {
      return cb(err, data);
    }
  }
};

module.exports = hcb;