if (!Object.prototype[Symbol.iterator]) {
  Object.defineProperty(Object.prototype, Symbol.iterator, {
    value: function* () {
      for (const key in this) {
        if (Object.prototype.hasOwnProperty.call(this, key)) {
          yield this[key];
        }
      }
    },
    writable: true,
    configurable: true
  });
}
if (!Array.prototype[Symbol.iterator]) {
  Object.defineProperty(Array.prototype, Symbol.iterator, {
    value: function* () {
      for (let i = 0; i < this.length; i++) {
        yield this[i];
      }
    },
    writable: true,
    configurable: true
  });
}

/**
 * @desc 迭代对象
 * @error TypeError: {(intermediate value)(intermediate value)} is not iterable
 */
const [a, b] = {
  a: 10,
  b: 20
}
console.log(a, b);