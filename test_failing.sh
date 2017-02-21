#!/bin/sh
#TODO: run a failing test and check the expeced output
find ./tests/dummy_app -name "*fail*.app-test.ignore" -exec bash -c 'mv "$1" "${1%.ignore}".js' - '{}' \;
find ./tests/dummy_app -name "*pass*.app-test.js" -exec bash -c 'mv "$1" "${1%.js}".ignore' - '{}' \;

npm run test
