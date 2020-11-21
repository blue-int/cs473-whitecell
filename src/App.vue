<template>
  <v-app>
    <v-app-bar
      v-if="$route.name !== 'Room'"
      app
      v-bind="appBarScroll"
      class="px-0"
      elevation="0"
    >
      <div class="d-flex align-center">
        <!-- <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
          transition="scale-transition"
          width="40"
        /> -->
        <v-btn class="goBack-btn" icon @click="goBack()">
          <v-icon>arrow_back</v-icon>
        </v-btn>
      </div>

      <v-spacer></v-spacer>

      <span v-if="currentUser != null">
        |
        <button @click="signOut()">Sign Out</button>
      </span>
    </v-app-bar>

    <v-main>
      <router-view :key="$route.fullPath" />
    </v-main>
  </v-app>
</template>

<script>
import firebase from 'firebase/app'

export default {
  name: 'App',
  data: () => ({
    currentUser: firebase.auth().currentUser
  }),
  computed: {
    appBarScroll: function() {
      return {
        'inverted-scroll': this.$route.name === 'Lobby' ? true : false
      }
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
    },
    goBack() {
      if (this.$route.name === 'Room') {
        this.$router.push('/lobby')
      } else if (this.$route.name === 'Lobby') {
        this.$router.push('/')
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.goBack-btn {
  margin-left: -12px;
}
</style>
