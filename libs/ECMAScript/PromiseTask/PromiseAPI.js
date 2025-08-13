/**
 * @description 模拟实现allSettled
 * @param {Promise[]} promises
 * @returns {Promise<Array<{status: 'fulfilled' | 'rejected', value: any}>>}
 */
const allSettledFake = (promises) => {
  const results = [];
  let completed = 0;

  return new Promise((resolve, reject) => {
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(value => {
          results[index] = { status: 'fulfilled', value };
        })
        .catch(reason => {
          results[index] = { status: 'rejected', reason };
        })
        .finally(() => {
          completed++;
          if (completed === promises.length) {
            resolve(results);
          }
        });
    });
  });
};
/**
 * @description 模拟实现all
 * @param {Promise[]} promises
 * @returns {Promise<any[]>}
 */
const allFake = (promises) => {
  return new Promise((resolve, reject) => {
    let completed = 0;
    const results = [];
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(value => {
          results[index] = value;
          completed++;
          if (completed === promises.length) {
            resolve(results);
          }
        })
        .catch(reason => {
          reject(reason);
        });
    });
  });
};

/**
 *
 * @description 模拟实现race
 * @param {Promise[]} promises
 * @returns {Promise<any>}
 */
const raceFake = (promises) => {
  return new Promise((resolve, reject) => {
    promises.forEach(promise => {
      Promise.resolve(promise)
        .then(resolve)
        .catch(reject);
    });
  });
};

function execPromiseFake(name) {
  function allSettledFakeTest() {
    const p1 = new Promise((resolve, reject) => {
      setTimeout(() => resolve('p1 resolved'), 1000);
    });
    const p2 = new Promise((resolve, reject) => {
      setTimeout(() => reject('p2 rejected'), 500);
    });
    const p3 = new Promise((resolve, reject) => {
      setTimeout(() => resolve('p3 resolved'), 1500);
    });

    allSettledFake([p1, p2, p3]).then(results => {
      console.log('All promises settled:', results);
    });
  }

  function allFakeTest() {
    const p1 = new Promise((resolve, reject) => {
      setTimeout(() => resolve('p1 resolved'), 1000);
    });
    const p2 = new Promise((resolve, reject) => {
      setTimeout(() => reject('p2 rejected'), 500);
    });
    const p3 = new Promise((resolve, reject) => {
      setTimeout(() => resolve('p3 resolved'), 1500);
    });

    allFake([p1, p2, p3]).then(results => {
      console.log('All promises resolved:', results);
    }).catch(error => {
      console.error('One of the promises was rejected:', error);
    });
  }

  function raceFakeTest() {
    const p1 = new Promise((resolve, reject) => {
      setTimeout(() => resolve('p1 resolved'), 1000);
    });
    const p2 = new Promise((resolve, reject) => {
      setTimeout(() => reject('p2 rejected'), 500);
    });
    const p3 = new Promise((resolve, reject) => {
      setTimeout(() => resolve('p3 resolved'), 150);
    });

    raceFake([p1, p2, p3]).then(result => {
      console.log('First settled promise:', result);
    }).catch(error => {
      console.error('First rejected promise:', error);
    });
  }
  switch (name) {
    case 'allFake':
      allFakeTest();
      break;
    case 'allSettledFake':
      allSettledFakeTest();
      break;
    case 'raceFake':
      raceFakeTest();
      break;
    default:
      console.log('no test');
      allSettledFakeTest();
      break;
  }
}

function execPromiseReal(name) {
  switch (name) {
    case 'all':
      console.log('all');
      break;
    case 'allSettled':
      console.log('allSettled');
      break;
  }
}

function execUpdateAPI() {
  console.log('update');
}

function main(scene, name) {
  switch (scene) {
    case 'fake':
      execPromiseFake(name);
      break;
    case 'real':
      execPromiseReal(name);
      break;
    case 'update':
      console.log('update');
      execUpdateAPI(name);
      break;
    default:
      console.log(`you input scene is ${scene}, not match any scene, please input fake, real, update`);
      break;
  }
}

const [nodeBinPath, currentFilePath, scene, k, ...args] = process.argv || [];
main(scene, k);

