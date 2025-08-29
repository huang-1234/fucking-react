function promiseAllTest() {
  const aPromise = (name) => new Promise((resolve) => setTimeout(() => resolve(`a_${name}`), 2000));
  console.time('promise.all');
  const promises = new Array(40).fill(0).map((_, i) => {
    try {
      if (i < 10) {
        return aPromise(`e${i + 1}`);
      }
      return Promise.reject(`Error in promise ${i}`);
    } catch (error) {
      console.error(`Error in promise ${i}:`, error);
      return Promise.reject(error);

    }
  });
  Promise.all(promises)
    .then(results => console.log(`Done! ${results}`))
    .catch(console.error)
    .finally(() => console.timeEnd('promise.all'));

  // 输出：
  // Done! a,b,c,d,e1,e2,e3,e4,e5
  // promise.all: 2.029s
}

function promiseRaceTest() {
  const aPromise = (name) => new Promise((resolve) => setTimeout(() => resolve(`a_${name}`), 2000));
  console.time('promise.race');
  const promises = new Array(40).fill(0).map((_, i) => {
    try {
      if (i < 10) {
        return aPromise(`e${i + 1}`);
      }
      return Promise.reject(`Error in promise ${i}`);
    } catch (error) {
      console.error(`Error in promise ${i}:`, error);
      return Promise.reject(error);
    }
  });
  Promise.race(promises)
    .then(result => console.log(`Done! ${result}`))
    .catch(console.error)
    .finally(() => console.timeEnd('promise.race'));

  // 输出：
  // Done! a,b,c,d,e1,e2,e3,e4,e5
  // promise.race: 2.029s
}
function promiseAllSettledTest() {
  const aPromise = (name) => new Promise((resolve) => setTimeout(() => resolve(`a_${name}`), 2000));
  console.time('promise.allSettled');
  const promises = new Array(40).fill(0).map((_, i) => {
    try {
      if (i < 10) {
        return aPromise(`e${i + 1}`);
      }
      return Promise.reject(`Error in promise ${i}`);
    } catch (error) {
      console.error(`Error in promise ${i}:`, error);
      return Promise.reject(error);
    }
  });
  Promise.allSettled(promises)
    .then(results => {
      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          console.log(`Promise ${i} succeeded with result: ${result.value}`);
        } else {
          console.error(`Promise ${i} failed with reason: ${result.reason}`);
        }
      });
    })
    .finally(() => console.timeEnd('promise.allSettled'));

  // 输出：
  // Promise 0 succeeded with result: a_e1
  // Promise 1 succeeded with result: a_e2
  // ...
  // Promise 10 failed with reason: Error in promise 10
  // promise.allSettled: 2.029s
}

function main() {
  console.log('env', process.argv);
  switch (process.argv[2]) {
    case 'all':
      promiseAllTest();
      break;
    case 'race':
      promiseRaceTest();
      break;
    case 'allSettled':
      promiseAllSettledTest();
    default:
      console.log('Usage: node all.js all');
  }
}

main()