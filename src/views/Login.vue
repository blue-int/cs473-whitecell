<template>
  <div>
    <button @click="googleLogin()">login</button>
    <button @click="signOut()">logout</button>
  </div>
</template>

<script>
import firebase from 'firebase/app'

export default {
  name: 'Login',
  data() {
    return {
      email: ''
    }
  },
  methods: {
    async googleLogin() {
      const provider = new firebase.auth.GoogleAuthProvider()
      try {
        console.log(provider)
        const result = await firebase.auth().signInWithPopup(provider)
        console.log(result.user)
        alert(`hello, ${result.user.displayName}!`)
        this.$router.push('/')
      } catch (e) {
        console.log(e)
      }
    },
    async signOut() {
      try {
        await firebase.auth().signOut()
        this.$router.push('/')
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>
