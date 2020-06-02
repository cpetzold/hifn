import { curry2, curry3 } from "@typed/curry";

type Object<V> = { [k: string]: V };
type Collection<V> = V[] | Object<V>;

export const identity = <V>(v: V): V => v;

export const isTrue = <V>(v: V): boolean => !!v;

export const not = <V>(v: V): boolean => !v;

export const isArray = <V>(x: V): boolean => Array.isArray(x);

export const hasKey = <V>(obj: Object<V>, k: string): boolean =>
  obj.hasOwnProperty(k);

export const eachObject = <V>(obj: Object<V>, fn: (x: [string, V]) => void) => {
  for (const k in obj) {
    if (hasKey(obj, k)) {
      fn([k, obj[k]]);
    }
  }
};

export const eachArray = <V>(arr: V[], fn: (x: V) => void) => {
  arr.forEach(fn);
};

export const push = curry2(<V>(arr: V[], item: V): number => {
  return arr.push(item);
});

export const intoArray = <V>(obj: Object<V>): [string, V][] => {
  const result: [string, V][] = [];
  eachObject(obj, push(result));
  return result;
};

export const assoc = <V>(obj: Object<V>, k: string, v: V): Object<V> => ({
  ...obj,
  [k]: v,
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
  <V, R>(fn: (x: [string, V]) => R, obj: Object<V>): R[] => {
    const result: R[] = [];
    eachObject(obj, (kv) => push(result, fn(kv)));
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
      : mapObject(fn as (x: [string, V]) => R, coll as Object<V>);
  }
);

const reduceArray = curry3(
  <V, R>(fn: (acc: R, x: V) => R, acc: R, arr: V[]): R => arr.reduce(fn, acc)
);

const reduceObject = curry3(
  <V, R>(fn: (acc: R, x: [string, V]) => R, acc: R, obj: Object<V>): R => {
    eachObject<V>(obj, (kv) => {
      acc = fn(acc, kv);
    });
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
      : reduceObject(
          fn as (acc: R, x: [string, V]) => R,
          acc,
          coll as Object<V>
        );
  }
);

const someArray = curry2(<V>(fn: (x: V) => boolean, arr: V[]): boolean =>
  arr.some(fn)
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

export const includes = curry2(<V>(coll: Collection<V>, x: V): boolean =>
  some((v: V) => x === v, coll)
);

export const thread = <V, R>(x: V, ...fns: Function[]) => {
  return reduceArray((result: R, fn: Function) => fn(result), x, fns);
};

export const add = curry2((a: number, b: number): number => a + b);

export const sum = (...xs: number[]): number => reduceArray(add, 0, xs);

export const flatten = <V>(arr: V[][] | V[] | V): V | V[] => {
  if (!isArray(arr)) {
    return arr as V;
  } else {
    return reduceArray(
      (result: V[][] | V[], x: V[] | V): any => {
        return [...result, ...flatten(x)];
      },
      [],
      arr
    );
  }
};

export const apply = curry2((fn: (...args: any[]) => any, ...args: any[]) =>
  fn.apply(null, flatten(args))
);
