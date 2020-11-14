<template>
  <div>
    <div>Please Login</div>
    <button @click="googleLogin()">Google Login</button>
  </div>
</template>

<script>
import firebase from 'firebase/app'

export default {
  name: 'Login',
  data() {
    return {}
  },
  methods: {
    async googleLogin() {
      const provider = new firebase.auth.GoogleAuthProvider()
      try {
        await firebase.auth().signInWithPopup(provider)
        this.$router.push('/')
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>
