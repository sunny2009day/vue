export class Store {
  constructor (options = {}) {
    const { state = {} } = options

    // store内部的状态
    this._subscribers = [] // 收集订阅行为,来回调用
    // bind commit and dispatch to self
    const store = this
    const { commit } = this

    // store.commit 调用store类的commit, 绑定至自己身上
    this.commit = function boundCommit (type, payload, options) {
      return commit.call(store, type, payload, options)
    }
    this.state = state
  }

  commit (_type, _payload, _options) {
    console.log(_type, _payload, _options)
    const mutation = { _type, _payload }
    // 订阅commit行为,在本身的类mutations中执行commit回调
    this._subscribers.slice().forEach(sub => { // slice如果订阅服务器同步调用unsubscribe，则浅拷贝可防止迭代器失效
      sub(mutation, this.state) // 执行mutations中的commit 行为
    })
  }

  /**
   * 订阅
   */
  subscribe (fn, options) {
    return genericSubscribe(fn, this._subscribers, options)
  }
}
function genericSubscribe (fn, subs, options) {
  if (subs.indexOf(fn) < 0) {
    options && options.prepend
      ? subs.unshift(fn)
      : subs.push(fn)
  }
  return () => {
    const i = subs.indexOf(fn)
    if (i > -1) {
      subs.splice(i, 1)
    }
  }
}
export function install () {

}
