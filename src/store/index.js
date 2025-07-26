import { createStore } from 'vuex'

export default createStore({
  state: {
    me: null
  },
  mutations: {
    setMe (state, me) {
      state.me = me
    }
  },
  actions: {
  },
  modules: {
  }
})
