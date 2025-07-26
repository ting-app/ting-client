import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import Toast, { POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import axios from './axios'

const newVue = () => {
  const app = createApp(App)

  app.use(router)
  app.use(store)
  app.use(vuetify)
  app.use(Toast, {
    position: POSITION.TOP_CENTER,
    timeout: 2000
  })

  app.mount('#app')
}

try {
  const me = JSON.parse(localStorage.getItem('me'))

  if (me) {
    axios.get('/users/me')
      .then((response) => {
        store.commit('setMe', response)
      })
      .catch((error) => {
        console.error(error)

        localStorage.removeItem('me')
        store.commit('setMe', null)
      })
      .finally(() => {
        newVue()
      })
  } else {
    newVue()
  }
} catch (error) {
  console.error(error)

  newVue()
}
