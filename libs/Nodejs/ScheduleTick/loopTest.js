setImmediate(() => console.log('Immediate'));
setTimeout(() => console.log('Timeout'), 0);
process.nextTick(() => console.log('NextTick'));
Promise.resolve().then(() => console.log('Promise'));