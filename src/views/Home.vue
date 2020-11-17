<template>
  <v-container v-if="currentUser != null" class="home">
    <v-row>
      <v-col align="center">Welcome to Team WhiteCell!</v-col>
    </v-row>
    <v-row>
      <v-col align="center">Hello! {{ currentUser.displayName }}</v-col>
    </v-row>
    <v-row>
      <v-col align="center">
        <v-btn @click="$router.push('/lobby')">Enter Lobby</v-btn>
      </v-col>
    </v-row>
  </v-container>
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
