<template>
  <div v-if="currentUser != null" class="home">
    <div>Welcome to Team WhiteCell!</div>
    <div>Hello! {{ currentUser.displayName }}</div>
    <button @click="$router.push('/lobby')">Enter Lobby</button>
  </div>
  <div v-else>
    You are not logged in!
  </div>
</template>

<script>
import firebase from 'firebase/app'

export default {
  name: 'Home',
  data() {
    return {
      currentUser: firebase.auth().currentUser
    }
  }
}
</script>
