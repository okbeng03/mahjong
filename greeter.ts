type Proxy<T> = {
  get(): T;
  set(value: T): void;
}
type Proxify<T> = {
  [P in keyof T]: Proxy<T[P]>;
}
function proxify<T>(o: T): Proxify<T> {
  const map = {} as Proxify<T>;

  for (const i in o) {
    map[i] = {
      get: function() {
        return o[i];
      },
      set: function(value) {
        o[i] = value;
      }
    }
  }

  return map;
}

const o = {
  a: 1,
  b: '2'
};

const proxy = proxify(o);

proxy.a.get();
proxy.a.set(3);   // ok
// proxy.a.set('b');   // error: Argument of type '"b"' is not assignable to parameter of type 'number'.
