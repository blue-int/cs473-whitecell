<template>
  <v-container fluid fill-height class="pa-0 room-container">
    <vue-plyr>
      <div class="plyr__video-embed">
        <iframe
          src="https://www.youtube.com/embed/bTqVqk7FSmY?amp;iv_load_policy=3&amp;modestbranding=1&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1"
          allowfullscreen
          allowtransparency
          allow="autoplay"
        ></iframe>
      </div>
    </vue-plyr>
    <v-toolbar elevation="3"></v-toolbar>
    <ChatBox />
    <!-- <v-row>
      <v-col>
        <router-link to="/lobby">Lobby</router-link>
        <div>Room {{ $route.params.id }}</div>
        <div>{{ title }}</div>
        <div>{{ master }}<br /></div>
        <div>Viewers: {{ viewers }}</div>
        <v-btn @click="stopStream()">Stop stream</v-btn>
      </v-col>
    </v-row> -->
  </v-container>
</template>

<script>
import { db } from '@/components/firebaseInit'
import ChatBox from '@/components/ChatBox'
export default {
  name: 'Room',
  components: {
    ChatBox
  },
  data() {
    return {
      title: '',
      master: '',
      viewers: 0,
      pinnedChats: []
    }
  },
  async created() {
    const doc = await db
      .collection('lobby')
      .doc(this.$route.params.id)
      .get()
    if (!doc.exists) {
      alert('The room does not exists')
      this.$router.push('/lobby')
    } else {
      this.title = doc.data().title
      this.master = doc.data().master
    }
  },
  async updated() {
    const doc = await db
      .collection('lobby')
      .doc(this.$route.params.id)
      .get()
    if (!doc.exists) {
      alert('The room does not exists')
      this.$router.push('/lobby')
    } else {
      this.title = doc.data().title
      this.master = doc.data().master
      db.collection('lobby')
        .doc(this.$route.params.id)
        .collection('viewers')
        .get()
        .then(view_list => (this.viewers = view_list.size))
      /*
      db.collection('lobby')
        .doc(this.$route.params.id)
        .collection('pinnedChats')
        .get()
        .then(pinnedChats => {
          console.log(pinnedChats)
          this.pinnedChats = pinnedChats
        })
        */
    }
  },
  methods: {
    stopStream() {
      db.collection('lobby')
        .doc(this.$route.params.id)
        .delete()
      this.$router.push('/lobby')
    }
  }
}
</script>
<style lang="scss" scoped>
.room-container {
  display: grid;
  grid-template-rows: min-content min-content minmax(0, 1fr);
}
</style>
