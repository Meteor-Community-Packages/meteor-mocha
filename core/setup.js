// Mocha it's evaluating if 'process.browser' to add some 'paths' to module using 'module.paths', the problem its that meteor's modules don't have the property 'paths' and its failing to start. See  https://goo.gl/aNO5IM and https://goo.gl/YiNBmL for more details
process.browser = true;
