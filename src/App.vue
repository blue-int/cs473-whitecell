<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link>
      <span v-if="currentUser != null">
        |
        <button @click="signOut()">Sign Out</button>
      </span>
    </div>
    <router-view :key="$route.fullPath" />
  </div>
</template>

<script>
import firebase from 'firebase/app'
export default {
  name: 'App',
  data() {
    return {
      currentUser: firebase.auth().currentUser
    }
  },
  methods: {
    async signOut() {
      try {
        await firebase.auth().signOut()
        this.$router.push('/login')
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>
<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
