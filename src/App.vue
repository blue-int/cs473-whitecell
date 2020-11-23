<template>
  <v-app>
    <v-app-bar
      v-if="['Lobby'].includes($route.name)"
      app
      v-bind="appBarScroll"
      class="px-0"
      elevation="0"
    >
      <v-spacer></v-spacer>
      <v-toolbar-subtitle>
        <span v-if="currentUser !== null">
          <v-breadcrumbs class="pr-0" divider="/">
            <v-breadcrumbs-item>
              {{ currentUser.displayName }}
            </v-breadcrumbs-item>
            <v-breadcrumbs-item class="pr-0">
              <v-btn
                dark
                x-small
                color="rgba(0,0,0,0.5)"
                elevation="0"
                @click="signOut()"
                >Sign Out</v-btn
              >
            </v-breadcrumbs-item>
          </v-breadcrumbs>
        </span>
        <span v-else>please login</span>
      </v-toolbar-subtitle>
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
    }
  }
}
</script>
<style lang="scss" scoped>
.avatar {
  margin-bottom: 2px;
}
</style>
