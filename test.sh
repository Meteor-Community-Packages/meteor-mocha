#!/bin/sh
echo "Setup package link"
cd tests/dummy_app/
meteor npm run setup

# We expect all unit tests to pass
meteor npm run test:unit:puppeteer 2> /dev/null
UNIT_TEST_EXIT=$?
echo "npm run test:unit:puppeteer exited with code $UNIT_TEST_EXIT"

if [ $UNIT_TEST_EXIT -ne 0 ]; then
  echo "expected exit code 0, got $UNIT_TEST_EXIT; exit 1"
  exit 1 # Our suite fails because tests that should have passed failed
fi

# We expect all app tests to fail
meteor npm run test:app:puppeteer 2> /dev/null
APP_TEST_EXIT=$?
echo "npm run test:app:puppeteer exited with code $APP_TEST_EXIT"

if [ $APP_TEST_EXIT -ne 1 ]; then
  echo "expected exit code 1, got $APP_TEST_EXIT; exit 1"
  exit 1 # Our suite fails because tests that should have failed passed
fi

echo "all tests passed; exit 0"
exit 0
