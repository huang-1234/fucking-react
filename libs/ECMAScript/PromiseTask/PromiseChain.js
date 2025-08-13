const log = console.log;
let key = 3

if (key === 1) {
  const p2 = new Promise((rs, rj) => {
    rs('p2 resolve')
  })

  p2.then((res) => {
    log('p2 then:1', res)
    throw 'p2 throw error'
  }).then((res) => {
    log('p2 then:2', res)
  }).catch((err) => {
    log('catch:1', err)
  }).then(res => {
    log('p2 then:3', res)
  }).catch((err) => {
    log('catch:2', err)
  })
} else if (key === 2) {
  const p1 = new Promise((rs, rj) => {
    rj('p1 reject')
  })
  p1.then((res) => {
    log('p2 then:1', res)
    throw 'p2 throw error'
  }
    // , err => {
    //   log('p2 catch:1', err)
    // }
  ).then((res) => {
    log('p2 then:2', res)
  }).catch((err) => {
    log('catch:1', err)
  }).then(res => {
    log('p2 then:3', res)
    // return 'return p2 then:3'
  }).catch((err) => {
    log('catch:2', err)
  }).then(res => {
    log('p2 then:4', res)
  }).then(res => {
    log('p2 then:5', res)
    // throw 'throw p2 then:5'
  }).catch(err => {
    log('catch:3', err)
  })
} else if (key === 3) {
  const p31 = new Promise((rs, rj) => {
    rs('p3 resolve')
  })
  const p32 = new Promise((rs, rj) => {
    rs('p3 resolve')
  })

  p31.then((res) => {
    log('p31 then:1', res)
  }).then(res => {
    log('p31 then:2', res)
    // return 'p31 resolve'
  }, err => {
    log('p31 catch:1', err)
    return 'p31 catch: 1 return'
  }).then(res => {
    log('p31 then:3', res)
  }).then(res => {
    log('p31 then:4', res)
  }).then(res => {
    log('p31 then:5', res)
  }).then(res => {
    log('p31 then:6', res)
  }).catch(err => {
    log('p31 catch:1', err)
  })
  // p32.then((res) => {
  //   log('p32 then:1', res)
  // }).then(res => {
  //   log('p32 then:2', res)
  // }).then(res => {
  //   log('p32 then:3', res)
  // }).then(res => {
  //   log('p32 then:4', res)
  // }).then(res => {
  //   log('p32 then:5', res)
  // }).then(res => {
  //   log('p32 then:6', res)
  // })
}
