/**
 * Records the source file each suite and test was declared in.
 *
 * Mocha takes `Suite.file` and `Test.file` from the file name it passes to the
 * `pre-require` event while loading a spec. Meteor loads test files through its
 * own module system, so `meteortesting:mocha-core` emits that event once with
 * no file name and every suite, test and hook ends up with `file: undefined` —
 * which is what reporters that report the file (xunit, json) then print.
 *
 * The server bundle installs source-map-support and rewrites frames to paths
 * relative to the app root, so the declaring file can be read back out of a
 * stack trace taken while the suite is being defined.
 */

const SUITE_GLOBALS = ['describe', 'context', 'xdescribe', 'xcontext'];
const TEST_GLOBALS = ['it', 'specify', 'xit', 'xspecify'];

const POSITION = /:\d+:\d+$/;
const WINDOWS_ABSOLUTE = /^[A-Za-z]:[\\/]/;
const PACKAGE_PREFIX = 'packages/';
// Package frames that are always a step on the way to a suite, never its
// source: this driver, and the runtimes that load a module in the first place.
const PLUMBING = [
  'packages/meteortesting:mocha',
  'packages/modules',
  'packages/core-runtime',
  'packages/babel-runtime',
  'packages/ecmascript-runtime',
  'packages/dynamic-import',
  'packages/promise',
];
const MAX_FRAMES = 30;
const HOOKS = ['_beforeAll', '_beforeEach', '_afterEach', '_afterAll'];

const APP = 'app';
const PACKAGE = 'package';
const OTHER = 'other';

const wrappers = new WeakMap();

// Only source-mapped Meteor modules appear as paths relative to the app root or
// to "packages/". Mocha and its dependencies are resolved from the isopack's
// node_modules and the bundle itself is read from a build directory, so both
// show up as absolute paths; Node internals have their own prefixes.
function frame(line) {
  const call = line.trim();
  if (!call.startsWith('at ')) {
    return { kind: OTHER };
  }

  // "at name (location)" for a named frame, "at location" for the rest.
  const frameSource = call.slice(3);
  const source = frameSource.endsWith(')')
    ? frameSource.slice(frameSource.lastIndexOf('(') + 1, -1)
    : frameSource;
  const location = source.replace(POSITION, '');
  if (
    !location ||
    location.startsWith('/') ||
    location.startsWith('<') ||
    location.startsWith('node:') ||
    location.startsWith('internal/') ||
    location.includes('node_modules/') ||
    location.includes('://') ||
    WINDOWS_ABSOLUTE.test(location)
  ) {
    return { kind: OTHER };
  }

  return location.startsWith(PACKAGE_PREFIX)
    ? { kind: PACKAGE, location }
    : { kind: APP, location };
}

// Reading the stack runs it through source-map-support. Nothing here is worth
// failing a test run over, so a surprise leaves the suite unattributed instead.
function callerFrames() {
  const limit = Error.stackTraceLimit;
  try {
    Error.stackTraceLimit = MAX_FRAMES;
    const probe = {};
    Error.captureStackTrace(probe, callerFrames);
    const { stack } = probe;

    return stack ? stack.split('\n').slice(1).map(frame) : [];
  } catch {
    return [];
  } finally {
    Error.stackTraceLimit = limit;
  }
}

function declaringFile() {
  const frames = callerFrames();

  // The outermost frame of the first run of app frames is the file Meteor
  // loaded; the frames below it belong to helpers that called `describe` on
  // its behalf.
  let file;
  for (const { kind, location } of frames) {
    if (kind === APP) {
      file = location;
    } else if (file) {
      break;
    }
  }
  if (file) {
    return file;
  }

  // `meteor test-packages` runs suites declared inside a package, where the
  // innermost frame that is not plumbing is the file.
  const declaration = frames.find(
    (candidate) =>
      candidate.kind === PACKAGE &&
      !PLUMBING.some((prefix) => candidate.location.startsWith(prefix)),
  );
  return declaration?.location;
}

function stamp(suite, file) {
  if (!suite.file) {
    suite.file = file;
  }

  for (const key of ['tests', ...HOOKS]) {
    for (const runnable of suite[key] ?? []) {
      if (!runnable.file) {
        runnable.file = file;
      }
    }
  }

  for (const child of suite.suites ?? []) {
    stamp(child, file);
  }
}

// `describe.skip` is the same function as `xdescribe`, so wrappers are cached
// to keep those identities intact.
function wrapSuiteFunction(original) {
  if (wrappers.has(original)) {
    return wrappers.get(original);
  }

  const wrapper = function wrappedSuite(...args) {
    const suite = original.apply(this, args);
    const file = declaringFile();
    if (file && suite && Array.isArray(suite.tests)) {
      stamp(suite, file);
    }
    return suite;
  };
  wrappers.set(original, wrapper);

  for (const key of Object.keys(original)) {
    wrapper[key] =
      typeof original[key] === 'function'
        ? wrapSuiteFunction(original[key])
        : original[key];
  }

  return wrapper;
}

// Tests declared inside a suite are stamped by the wrapper above once the
// suite body has run, which also covers tests added later from a hook. Only
// tests at the root have no suite to inherit from.
function wrapTestFunction(original) {
  if (wrappers.has(original)) {
    return wrappers.get(original);
  }

  const wrapper = function wrappedTest(...args) {
    const test = original.apply(this, args);
    if (test && !test.file && test.parent) {
      if (test.parent.file) {
        test.file = test.parent.file;
      } else if (test.parent.root) {
        test.file = declaringFile();
      }
    }
    return test;
  };
  wrappers.set(original, wrapper);

  for (const key of Object.keys(original)) {
    wrapper[key] =
      typeof original[key] === 'function'
        ? wrapTestFunction(original[key])
        : original[key];
  }

  return wrapper;
}

export default function attributeTestFiles(scope = global) {
  for (const name of SUITE_GLOBALS) {
    if (typeof scope[name] === 'function') {
      scope[name] = wrapSuiteFunction(scope[name]);
    }
  }

  for (const name of TEST_GLOBALS) {
    if (typeof scope[name] === 'function') {
      scope[name] = wrapTestFunction(scope[name]);
    }
  }
}
