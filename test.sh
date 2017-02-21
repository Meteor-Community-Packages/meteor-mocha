#!/bin/sh
echo "Placing root files into dummy_app for testing"
rsync -av --relative --exclude='tests/' --exclude='.git/' --exclude='setup-tests.sh'  ./ tests/dummy_app/packages/meteor-mocha
cd tests/dummy_app/
meteor add dispatch:mocha
meteor npm install

# test only intentionally passing tests.
# find tests/dummy_app -name "*pass*.app-test.ignore" -exec bash -c 'mv "$1" "${1%.ignore}".js' - '{}' \;
# find tests/dummy_app -name "*fail*.app-test.js" -exec bash -c 'mv "$1" "${1%.js}".ignore' - '{}' \;

npm run test
