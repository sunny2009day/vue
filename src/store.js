import Vue from 'vue'
import Vuex from './vuex'

Vue.use(Vuex) // install 方法

export default new Vuex.Store({
  modules: {
    a: {
      state: {
        count: 200
      },
      mutations: {
        change (state) {
          console.log('_______________', state)
        }
      },
      modules: {
        b: {
          state: {
            count: 300
          }
        }
      }
    }
  },
  state: {
    count: 100
  },
  getters: {
    newCounts (state) {
      return state.count + 1
    }
  },
  mutations: {
    change (state) {
      state.count += 10
    }
  },
  actions: {
    change ({ commit }) {
      debugger
      setTimeout(() => {
        commit('change')
      }, 1000)
    }
  }
})
