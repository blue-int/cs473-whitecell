<template>
  <v-app>
    <v-app-bar app inverted-scroll class="px-0" elevation="0">
      <div class="d-flex align-center">
        <!-- <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
          transition="scale-transition"
          width="40"
        /> -->
        <router-link to="/lobby">
          <v-btn icon>
            <v-icon>arrow_back</v-icon>
          </v-btn>
        </router-link>
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
.v-toolbar__content {
  padding-left: 4px !important;
  padding-right: 4px !important;
}
</style>
