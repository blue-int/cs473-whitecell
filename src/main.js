import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import firebase from 'firebase/app'
import '@/components/firebaseInit'
import VuePlyr from 'vue-plyr'
import 'vue-plyr/dist/vue-plyr.css'

Vue.config.productionTip = false

let app

const createApp = () => {
  if (!app) {
    Vue.use(VuePlyr)
    new Vue({
      router,
      store,
      render: h => h(App)
    }).$mount('#app')
  }
}

firebase.auth().onAuthStateChanged(() => {
  createApp()
})
