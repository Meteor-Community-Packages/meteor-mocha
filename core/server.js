import Fiber from 'fibers';
import "./setup"
import Mocha from 'mocha';
import "./cleanup"

function setupGlobals(mocha) {
  var mochaExports = {};
  mocha.suite.emit('pre-require', mochaExports, undefined, mocha);

  // 1. patch up it and hooks functions so it plays nice w/ fibers
  // 2. trick to allow binding the suite instance as `this` value
  // inside of suites blocks, to allow e.g. to set custom timeouts.
  var wrapRunnable = function (fn) {
    //In Meteor, these blocks will all be invoking Meteor code and must
    //run within a fiber. We must therefore wrap each with something like
    //bindEnvironment. The function passed off to mocha must have length
    //greater than zero if we want mocha to run it asynchronously. That's
    //why it uses the Fibers

    //We're actually having mocha run all tests asynchronously. This
    //is because mocha cannot tell when a synchronous fiber test has
    //finished, because the test runner runs outside a fiber.

    //It is possible that the mocha test runner could be run from within a
    //fiber, but it was unclear to me how that could be done without
    //forking mocha itself.

    const wrappedFunction = function (done) {
      var self = this._runnable;
      var run = function() {
        try {
          // Sync call
          if (fn.length == 0) {
            var result = fn.call(self);
            if (result && typeof result.then === 'function') {
              self.resetTimeout();
              result
                .then(function() {
                    done();
                    // Return null so libraries like bluebird do not warn about
                    // subsequently constructed Promises.
                    return null;
                  },
                  function(reason) {
                    done(reason || new Error('Promise rejected with no or falsy reason'));
                  });
            } else {
              if (self.asyncOnly) {
                return done(new Error('--async-only option in use without declaring `done()` or returning a promise'));
              }

              done();
            }
          }
          else {
            fn.call(self, done);
          }
        } catch (error) {
          done(error);
        }
      };

      if (Fiber.current) return run();
      Fiber(run).run();
    };

    // Show original function source code
    wrappedFunction.toString = function () { return fn.toString() };
    return wrappedFunction;
  };

  mochaExports["__org_it"] = mochaExports["it"];
  mochaExports['it'] = function (name, func) {
    // You can create pending tests without a function
    // http://mochajs.org/#pending-tests
    // i.e pending test
    // it('this is a pending test');
    if (func) {
      func = wrapRunnable(func);
    }
    return mochaExports["__org_it"](name, func);
  };
  mochaExports.it.skip = mochaExports["__org_it"].skip;
  mochaExports.it.only = (name, func) => {
    mochaExports["__org_it"].only(name, wrapRunnable(func));
  };


  let hooks = ["before", "beforeEach", "after", "afterEach"];
  hooks.forEach((hook)=> {
    mochaExports[`__org_${hook}`] = mochaExports[hook];
    mochaExports[hook] = (func)=> {
     return  mochaExports[`__org_${hook}`](wrapRunnable(func));
    }
  });

  Object.keys(mochaExports).forEach((key)=>{
    // We don't want original function to be export to global namespace
    if(key.indexOf("__org_") > -1 || key.indexOf("run") > -1){
      return;
    }
    global[key] = mochaExports[key];
  })

};

// Initialize a new `Mocha` test runner instance that test driver packages
// can use to ensure they work well with other test driver packages.
const mochaInstance = new Mocha({
  ui: 'bdd',
  ignoreLeaks: true
});
setupGlobals(mochaInstance);

export { mochaInstance, setupGlobals, Mocha };
