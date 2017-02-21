// We need to import the "mocha.js" file specifically because that is the browser entry point.
import 'mocha/mocha.js';

// This defines "describe", "it", etc.
mocha.setup({
  ui: 'bdd',
});

export { mocha };
