
function isFunction(value) {
  return typeof value === 'function';
}
class EventEmitter {
  constructor() {
    this.events = {};
  }
  logColor(value) {
    console.log('%c %s', 'color: red', `${value}`);
  }

  /**
   * 监听事件
   * @param {string} name 事件名称
   * @param {function} callback 事件回调函数
   */
  on(name, callback) {
    if (!this.events[name]) {
      this.events[name] = [];
    }
    this.events[name].push(callback);
  }
  /**
   * 触发事件
   * @param {string} name 事件名称
   * @param {any} args 参数
   */
  emit(name, ...args) {
    if (!this.events[name]) {
      this.logColor(`No event named ${name}`);
      return;
    }
    if (this.events[name]) {
      this.events[name].forEach(callback => {
        callback(args);
      })
    }
  }
  /**
   * only emit once
   * @param {string} name 事件名称
   * @param {function} callback 事件回调函数
   */
  once(name, callback) {
    if (!this.events[name]) {
      this.events[name] = [];
    }
    if (!isFunction(callback)) {
      this.logColor(`${callback} is not a function`);
      return;
    }
    const targetFn = (...args) => {
      callback(...args);
      this.off(name, targetFn);
    }
  }
  /**
   * 移除事件
   * @param {string} name 事件名称
   * @param {function} callback 事件回调函数
   */
  off(name, callback) {
    if (!this.events[name]) {
      this.logColor(`No event named ${name}`);
      return;
    }
    if (this.events[name]) {
      this.events[name] = this.events[name].filter(cb => cb !== callback);
    }
  }
}


(function () {
  let key = process?.argv[2] || 'on'

  const emitter = new EventEmitter();
  const eventType = {
    event1: 'event1',
    event2: 'event2',
    event3: 'event3'
  }
  const event1 = function () {
    emitter.logColor(eventType.event1)
  }
  emitter.on(eventType.event1, event1);
  switch (key) {
    case 'emit':
      emitter.logColor(key)
      emitter.emit(eventType.event1);
      break;
    case 'off':
      emitter.logColor(key)
      emitter.emit(eventType.event1);
      emitter.off(eventType.event1, event1);
      emitter.emit(eventType.event1);
      break;
    case 'once':
      emitter.logColor(key)
      emitter.once(eventType.event1, event1);
      emitter.emit(eventType.event1);
      emitter.emit(eventType.event1);
      break;
    default:
      break;
  }
})()