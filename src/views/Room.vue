<template>
  <v-container>
    <v-row>
      <v-col>
        <router-link to="/lobby">Lobby</router-link>
        <div>Room {{ $route.params.id }}</div>
        <div>{{ title }}</div>
        <div>{{ master }}<br /></div>
        <div>Viewers: {{ viewers.length }}</div>
        <div>Viewerslist: {{ viewers }}</div>
        <v-btn @click="stopStream()">Stop stream</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
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
      </v-col>
    </v-row>
    <ChatBox />
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
      viewers: [],
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
      this.updateUserList()
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
    }
  },
  methods: {
    updateUserList() {
      db.collection('lobby')
        .doc(this.$route.params.id)
        .collection('viewers')
        .onSnapshot(snapshot => {
          this.viewers = snapshot.docs.map(doc => {
            return { id: doc.id, ...doc.data() }
          })
        })
    },
    stopStream() {
      const curRoom = db.collection('lobby').doc(this.$route.params.id)
      const viewColRef = curRoom.collection('viewers')
      const pinColRef = curRoom.collection('pinnedChats')

      const deleteViewers = viewColRef.onSnapshot(snapshot => {
        snapshot.docs.forEach(doc => {
          viewColRef.doc(doc.id).delete()
        })
      })
      const deletePinned = pinColRef.onSnapshot(snapshot => {
        snapshot.docs.forEach(doc => {
          pinColRef.doc(doc.id).delete()
        })
      })
      deleteViewers()
      deletePinned()
      curRoom.delete()
      this.$router.push('/lobby')
    }
  }
}
</script>
