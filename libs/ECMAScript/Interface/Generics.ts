/**
 * TS 泛型编程
 */
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

type MyRequired<T> = {
  [K in keyof T]-?: T[K];
};

type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type MyExclude<T, K> = T extends K ? never : T;

type MyOmit<T, K extends keyof T> = MyPick<T, MyExclude<keyof T, K>>;

type MyReadonlyArray<T> = {
  readonly [index: number]: T;
};
type MyDeepReadonly<T> = {
  readonly [P in keyof T]: keyof T extends ReadonlyArray<infer U>
    ? ReadonlyArray<MyDeepReadonly<U>>
    : [P] extends object
      ? MyDeepReadonly<T[P]>
      : T[P];
};

(function (k: number) {
  switch (k) {
    case 1:
      const obj = {
        a: {
          a1: {
            a11: 1,
            a12: [
              {
                a121: 1,
                a122: 'string',
              },
            ],
          },
        },
        b: {
          b1: 1,
          b2: 'string',
          b3: [1, 2, 3],
        },
      };
      type MyDeepReadonlyObj = MyDeepReadonly<typeof obj>;
      const readonlyObj = obj as MyDeepReadonlyObj;
      const value = 2;
      const person: MyPartialPerson = {
        name: 'string',
        age: 1,
      };
      break;
    case 2:
      interface Person {
        name: string;
        age: number;
      }
      type PartialPerson = {
        name?: string;
        age?: number;
      };

      type MyPartialPerson = MyPartial<Person>;
      type MyReadonlyPerson = MyReadonly<Person>;
      type MyRequiredPerson = MyRequired<PartialPerson>;
      type MyPickPerson = MyPick<Person, 'name'>;
      type MyExcludePerson = MyExclude<keyof Person, 'age'>;
    default:
      break;
  }
})(1);
