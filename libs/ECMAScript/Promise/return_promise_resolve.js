Promise.resolve()
.then(() => {
console.log('0');
return Promise.reject(43)
// return Promise.resolve(43)
})
.catch((err)=>console.log(err))
.then((res)=>console.log(res))

Promise.resolve()
.then(()=>console.log('1'))
.then(()=>console.log('2'))
.then(()=>console.log('3'))
.then(()=>console.log('5'))
.then(()=>console.log('6'))
.then(()=>console.log('7'))

// 结果：01234567