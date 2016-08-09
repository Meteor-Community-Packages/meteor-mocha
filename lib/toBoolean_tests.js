import { toBoolean } from './toBoolean';

Tinytest.add('toBoolean', function (test) {
  test.isTrue(toBoolean('TRUE'));
  test.isTrue(toBoolean('true'));
  test.isTrue(toBoolean('1'));

  test.isFalse(toBoolean('FALSE'));
  test.isFalse(toBoolean('false'));
  test.isFalse(toBoolean('0'));
  test.isFalse(toBoolean());
  test.isFalse(toBoolean('ABC'));
});
