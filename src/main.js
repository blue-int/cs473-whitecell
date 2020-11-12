import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import firebase from 'firebase/app'
import '@/components/firebaseInit'

Vue.config.productionTip = false

let app

const createApp = () => {
  if (!app) {
    new Vue({
      router,
      store,
      render: h => h(App)
    }).$mount('#app')
    // a.component('test')
  }
}

firebase.auth().onAuthStateChanged(() => {
  createApp()
})
