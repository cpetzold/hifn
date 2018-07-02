import { curry2, curry3 } from "@typed/curry";

type Object<V> = { [k: string]: V };
type Collection<V> = V[] | Object<V>;

export const identity = <V>(x: V): V => x;

export const isTrue = (x: any): boolean => !!x;

export const not = (x: any): boolean => !x;

export const isArray = (x: any): boolean => Array.isArray(x);

export const intoArray = <V>(obj: Object<V>): [string, V][] => {
  let result: [string, V][] = [];
  for (const k in obj) {
    result.push([k, obj[k]]);
  }
  return result;
};

export const assoc = <V>(obj: Object<V>, k: string, v: V): Object<V> => ({
  ...obj,
  [k]: v
});

export const intoObject = <V>(pairs: [string, V][]) => {
  return reduce(
    (obj: Object<V>, [k, v]: [string, V]) => assoc(obj, k, v),
    {},
    pairs
  );
};

const mapArray = curry2(<V, R>(fn: (x: V) => R, arr: V[]) => arr.map(fn));

const mapObject = curry2(
  <V, R>(fn: ((x: [string, V]) => R), obj: Object<V>): R[] => {
    let result: R[] = [];
    for (const k in obj) {
      result.push((fn as (x: [string, V]) => R)([k, obj[k]]));
    }
    return result;
  }
);

export const map = curry2(
  <V, R>(
    fn: ((x: V) => R) | ((x: [string, V]) => R),
    coll: Collection<V>
  ): R[] => {
    return isArray(coll)
      ? mapArray(fn as (x: V) => R, coll as V[])
      : mapObject(fn as ((x: [string, V]) => R), coll as Object<V>);
  }
);

const reduceArray = curry3(
  <V, R>(fn: (acc: R, x: V) => R, acc: R, arr: V[]): R => arr.reduce(fn, acc)
);

const reduceObject = curry3(
  <V, R>(fn: ((acc: R, x: [string, V]) => R), acc: R, obj: Object<V>): R => {
    for (const k in obj) {
      acc = fn(acc, [k, obj[k]]);
    }
    return acc;
  }
);

export const reduce = curry3(
  <V, R>(
    fn: ((acc: R, x: V) => R) | ((acc: R, x: [string, V]) => R),
    acc: R,
    coll: Collection<V>
  ) => {
    return isArray(coll)
      ? reduceArray(fn as (acc: R, x: V) => R, acc, coll as V[])
      : reduceObject(fn as (acc: R, x: [string, V]) => R, acc, coll as Object<
          V
        >);
  }
);

const someArray = curry2(
  <V>(fn: (x: V) => boolean, arr: V[]): boolean => arr.some(fn)
);

const someObject = curry2(
  <V>(fn: (x: [string, V]) => boolean, obj: Object<V>): boolean => {
    for (const k in obj) {
      if (fn([k, obj[k]])) return true;
    }
    return false;
  }
);

export const some = curry2(
  <V>(
    fn: ((x: V) => boolean) | ((x: [string, V]) => boolean),
    coll: Collection<V>
  ): boolean => {
    return isArray(coll)
      ? someArray(fn as (x: V) => boolean, coll as V[])
      : someObject(fn as (x: [string, V]) => boolean, coll as Object<V>);
  }
);

export const includes = curry2(
  <V>(coll: Collection<V>, x: V): boolean => some((v: any) => x === v, coll)
);

export const thread = (x: any, ...fns: Function[]) => {
  return reduceArray((result: any, fn: Function) => fn(result), x, fns);
};

export const add = curry2((a: number, b: number): number => a + b);

export const sum = (...xs: number[]): number => reduceArray(add, 0, xs);

export const flatten = (arr: any): any => {
  if (!isArray(arr)) {
    return arr;
  } else {
    return reduceArray(
      (result: any[], x: any): any => {
        return [...result, ...flatten(x)];
      },
      [],
      arr
    );
  }
};

export const apply = curry2((fn: Function, ...args: any[]) =>
  fn.apply(null, flatten(args))
);
