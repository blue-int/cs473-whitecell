import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import firebase from 'firebase/app'
import '@/components/firebaseInit'
import VuePlyr from 'vue-plyr'
import 'vue-plyr/dist/vue-plyr.css'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false
Vue.use(VuePlyr)

let app

const createApp = () => {
  if (!app) {
    app = new Vue({
      router,
      store,
      vuetify,
      render: h => h(App)
    }).$mount('#app')
  }
}

firebase.auth().onAuthStateChanged(() => {
  createApp()
})
