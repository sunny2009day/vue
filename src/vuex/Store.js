let Vue

class ModuleCollection { // 默认mutation和action都会定义到store上
  constructor (options) { // vuex [a ,b]
    this.register([], options)
  }

  register (path, rawModule) {
    // path是个空数组
    const newModule = {
      _raw: rawModule, // 相当于原对象
      _children: {}, // 表示他包含的模块
      state: rawModule.state // 自己模块的状态
    }
    if (path.length === 0) {
      this.root = newModule // 根
    } else {
      // [a, b]
      const parent = path.slice(0, -1).reduce((root, current) => {
        return this.root._children[current]
      }, this.root)
      parent._children[path[path.length - 1]] = newModule
    }
    if (rawModule.modules) { // 如果有子模块
      forEach(rawModule.modules, (childName, module) => {
        this.register(path.concat(childName), module)
      })
    }
  }
}
function installModule (store, rootState, path, rootModule) {
  // rootModule.state = {count: 100}
  // rootModule._children.a.state
  if (path.length > 0) {
    const parent = path.slice(0, -1).reduce((root, current) => {
      return root[current]
    }, rootState) // {_raw, children.state}

    Vue.set(parent, path[path.length - 1], rootModule.state)
    // 将多级的state挂载到根
  }

  if (rootModule._raw.getters) {
    forEach(rootModule._raw.getters, (getterName, getterFn) => {
      Object.defineProperty(store.getters, getterName, {
        get: () => {
          return getterFn(rootModule.state)
        }
      })
    })
  }
  if (rootModule._raw.actions) {
    forEach(rootModule._raw.actions, (actionName, actionFn) => {
      const entry = store.actions[actionName] || (store.actions[actionName] = [])
      entry.push(() => {
        actionFn.call(store, store)
      })
    })
  }

  if (rootModule._raw.mutations) {
    forEach(rootModule._raw.mutations, (mutationName, mutationFn) => {
      const entry = store.mutations[mutationName] || (store.mutations[mutationName] = [])
      entry.push(() => {
        mutationFn.call(store, rootModule.state)
      })
    })
  }
  forEach(rootModule._children, (childName, module) => {
    installModule(store, rootState, path.concat(childName), module)
  })
}
export class Store {
  constructor (options) {
    const state = options.state
    // 有get,set的属性可以实现双向绑定,有get和set new vue({data: {}})
    this.getters = {}
    this.mutations = {}
    this.actions = {}

    // vuex核心,借用了vuex的实例,vue的实例数据变化,会刷新视图
    this._vm = new Vue({
      data: {
        state
      }
    })
    // 把模块之间的关系进行整理,
    // rot._children=>a._children
    this.modules = new ModuleCollection(options)
    console.log(this.modules)
    //  无论是子模块还是孙子模块,所有的mutation都是根上的

    // 所有层级的模块的mutation都是共用的

    installModule(this, state, [], this.modules.root)

    // // 如果有getters
    // if (options.getters) {
    //   const getters = options.getters //

    //   forEach(getters, (getterName, getterFn) => {
    //     Object.defineProperty(this.getters, getterName, {
    //       configurable: true,
    //       get: () => { // vue.computed实现
    //         return getterFn(state)
    //       }

    //     })
    //   })
    // }
    // const mutations = options.mutations
    // forEach(mutations, (mutationName, mutationFn) => {
    //   this.mutations[mutationName] = () => {
    //     mutationFn.call(this, state)
    //   }
    // })

    // const actions = options.actions
    // forEach(actions, (actionName, actionFn) => {
    //   this.actions[actionName] = () => {
    //     actionFn.call(this, this)
    //   }
    // })

    const { commit, dispatch } = this
    this.commit = (type) => {
      commit.call(this, type)
    }
    this.dispatch = (type) => {
      dispatch.call(this, type)
    }
  }

  get state () { // Object.definefineProperty get
    return this._vm.state
  }

  commit (type) {
    this.mutations[type].forEach(fn => fn())
  }

  dispatch (type) {
    this.actions[type].forEach(fn => fn())
  }
}

function forEach (obj, callback) {
  Object.keys(obj).forEach(item => callback(item, obj[item]))
}
export function install (_Vue) {
  Vue = _Vue // 保留vue的构造函数
  Vue.mixin({
    beforeCreate () {
      // 把根组件store实例都增加$store
      console.log('beforeCreate')
      // 是否根组件
      if (this.$options && this.$options.store) {
        this.$store = this.$options.store
      } else { // 子组件,深度优先
        console.log(this.$options.name)
        this.$store = this.$parent && this.$parent.$store
      }
    }
  })
}
