<template>
  <v-container fluid class="pa-0 login-container">
    <div class="parallax pa-0"></div>
    <div>Please Login</div>
    <v-btn x-large class="login-btn" elevation="6" @click="googleLogin()">
      <v-img
        class="google-logo"
        left
        contain
        lazy-src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
        max-height="24"
        max-width="24"
        src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
      ></v-img>
      Google Login
    </v-btn>
  </v-container>
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
        this.$router.push('/lobby')
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.parallax {
  z-index: 0;
  position: absolute;
  width: 100%;
  height: 30vh;
  background-color: #3e7495;
  // background-color: transparent;
}

.login-container {
  height: 100vh;
  display: grid;
  align-items: center;
  justify-items: center;
}
.login-btn {
  width: calc(100vw - 48px);
}
.google-logo {
  position: absolute;
  left: 0;
}
</style>
