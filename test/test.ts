import {
  apply,
  flatten,
  identity,
  intoArray,
  intoObject,
  isArray,
  isTrue,
  map,
  some,
  sum,
  thread,
} from "../src/index";

import test from "ava";

test("identity", (t) => {
  t.is(identity(undefined), undefined);
  t.is(identity(null), null);
  t.is(identity(true), true);
  t.is(identity(false), false);
  t.is(identity(1), 1);
  t.deepEqual(identity([1, 2, 3]), [1, 2, 3]);
});

test("isTrue", (t) => {
  t.true(isTrue(true));
  t.true(isTrue(1));
  t.true(isTrue("a"));

  t.false(isTrue(false));
  t.false(isTrue(null));
  t.false(isTrue(undefined));
  t.false(isTrue(""));
  t.false(isTrue(0));
});

test("isArray", (t) => {
  t.true(isArray([]));
  t.true(isArray([1, 2, 3]));
  t.true(isArray([1, "hi"]));

  t.false(isArray(null));
  t.false(isArray(undefined));
  t.false(isArray(1337));
  t.false(isArray("hi"));
});

test("intoArray", (t) => {
  t.deepEqual(intoArray({}), []);
  t.deepEqual(intoArray({ foo: "bar" }), [["foo", "bar"]]);
  t.deepEqual(intoArray({ foo: "bar", hello: "world" }), [
    ["foo", "bar"],
    ["hello", "world"],
  ]);
});

test("intoObject", (t) => {
  t.deepEqual(intoObject([]), {});
  t.deepEqual(
    intoObject([
      ["foo", "bar"],
      ["hello", "world"],
    ]),
    {
      foo: "bar",
      hello: "world",
    }
  );
  t.deepEqual(
    intoObject([
      ["foo", "bar"],
      ["number", 1],
    ] as [string, any][]),
    {
      foo: "bar",
      number: 1,
    }
  );
});

test("some", (t) => {
  t.false(some(isTrue, []));
  t.false(some(isTrue, [false, false, false]));
  t.true(some(isTrue, [false, false, true]));
});

test("map", (t) => {
  t.deepEqual(map(identity, [1, 2, 3]), [1, 2, 3]);
  t.deepEqual(
    map((x: number) => x + 1, [1, 2, 3]),
    [2, 3, 4]
  );
  t.deepEqual(map(identity, { foo: 1 }), [["foo", 1]]);
});

test("flatten", (t) => {
  t.deepEqual(flatten([1, [2], 3, [4]]), [1, 2, 3, 4]);
  t.deepEqual(flatten([1, [2], [[3, [4]]]]), [1, 2, 3, 4]);
});

test("sum", (t) => {
  t.is(sum(2, 2), 4);
});

test("apply", (t) => {
  t.is(apply(sum, [2, 2]), 4);
});

test("thread", (t) => {
  t.deepEqual(
    thread(
      [1, 2, 3],
      map((x: number) => x + 1)
    ),
    [2, 3, 4]
  );
});
