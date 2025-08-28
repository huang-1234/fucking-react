class MyPromise {
  static PENDING = "pending";
  static FULFILLED = "fulfilled";
  static REJECTED = "rejected";

  constructor(executor) {
    this.state = MyPromise.PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.state === MyPromise.PENDING) {
        this.state = MyPromise.FULFILLED;
        this.value = value;
        this.onFulfilledCallbacks.forEach((fn) => fn());
      }
    };

    const reject = (reason) => {
      if (this.state === MyPromise.PENDING) {
        this.state = MyPromise.REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach((fn) => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };

    const promise2 = new MyPromise((resolve, reject) => {
      const handleFulfilled = () => {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      };

      const handleRejected = () => {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      };

      if (this.state === MyPromise.FULFILLED) {
        handleFulfilled();
      } else if (this.state === MyPromise.REJECTED) {
        handleRejected();
      } else {
        this.onFulfilledCallbacks.push(handleFulfilled);
        this.onRejectedCallbacks.push(handleRejected);
      }
    });

    return promise2;
  }

  resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
      return reject(new TypeError("Chaining cycle detected"));
    }

    let called = false;
    if ((typeof x === "object" && x !== null) || typeof x === "function") {
      try {
        const then = x.then;
        if (typeof then === "function") {
          then.call(
            x,
            (y) => {
              if (called) return;
              called = true;
              this.resolvePromise(promise2, y, resolve, reject);
            },
            (r) => {
              if (called) return;
              called = true;
              reject(r);
            }
          );
        } else {
          resolve(x);
        }
      } catch (error) {
        if (called) return;
        called = true;
        reject(error);
      }
    } else {
      resolve(x);
    }
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        return reject(new TypeError("Argument must be an array"));
      }

      const results = new Array(promises.length);
      let count = 0;

      if (promises.length === 0) {
        return resolve(results);
      }

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          (value) => {
            results[index] = value;
            if (++count === promises.length) resolve(results);
          },
          (reason) => reject(reason)
        );
      });
    });
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        return reject(new TypeError("Argument must be an array"));
      }

      promises.forEach((promise) => {
        MyPromise.resolve(promise).then(resolve, reject);
      });
    });
  }

  static allSettled(promises) {
    return new MyPromise((resolve) => {
      if (!Array.isArray(promises)) {
        return resolve([]);
      }

      const results = new Array(promises.length);
      let count = 0;

      if (promises.length === 0) {
        return resolve(results);
      }

      const handleSettled = (index, status, valueOrReason) => {
        results[index] = {
          status,
          [status === "fulfilled" ? "value" : "reason"]: valueOrReason,
        };
        if (++count === promises.length) resolve(results);
      };

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          (value) => handleSettled(index, "fulfilled", value),
          (reason) => handleSettled(index, "rejected", reason)
        );
      });
    });
  }

  static resolve(value) {
    if (value instanceof MyPromise) return value;
    return new MyPromise((resolve) => resolve(value));
  }

  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }
}

// ****************** 测试用例 ******************
// 1. MyPromise.all 测试
const p1 = MyPromise.resolve(3);
const p2 = 42;
const p3 = new MyPromise((resolve) => setTimeout(() => resolve("foo"), 100));

MyPromise.all([p1, p2, p3]).then((values) => {
  console.log("all:", values); // [3, 42, "foo"]
});

// 2. MyPromise.race 测试
const p4 = new MyPromise((resolve) => setTimeout(() => resolve("fast"), 50));
const p5 = new MyPromise((resolve) => setTimeout(() => resolve("slow"), 200));

MyPromise.race([p4, p5]).then((value) => {
  console.log("race:", value); // "fast"
});

// 3. MyPromise.allSettled 测试
const p6 = MyPromise.resolve("success");
const p7 = MyPromise.reject("error");

MyPromise.allSettled([p6, p7]).then((results) => {
  console.log("allSettled:", results);
  // [
  //   { status: 'fulfilled', value: 'success' },
  //   { status: 'rejected', reason: 'error' }
  // ]
});
