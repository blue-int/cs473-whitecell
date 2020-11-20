<template>
  <v-container fluid class="pa-0 room-container">
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
    <v-toolbar elevation="3" color="rgb(245,245,245)">
      <v-btn @click="stopStream()">Stop stream</v-btn>
    </v-toolbar>
    <ChatBox />
    <!-- <v-row>
      <v-col>
        <vue-plyr>
          <div>
            <iframe
              src="https://clips.twitch.tv/embed?clip=BlazingGeniusPotUncleNox&parent=cs473-whitecell.web.app"
              frameborder="0"
              allowfullscreen="true"
              scrolling="no"
              height="378"
              width="620"
            ></iframe>
          </div>
        </vue-plyr>
      </v-col>
    </v-row> -->
  </v-container>
</template>

<script>
import firebase from 'firebase/app'
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
      unsubscribe: null
    }
  },
  computed: {
    roomRef() {
      return db.collection('lobby').doc(this.$route.params.id)
    }
  },
  async created() {
    const doc = await this.roomRef.get()
    if (!doc.exists) {
      alert('The room does not exists')
      this.$router.push('/lobby')
    } else {
      this.title = doc.data().title
      this.master = doc.data().master
      this.updateViewers()
    }
  },
  destroyed() {
    this.unsubscribe()
  },
  methods: {
    updateViewers() {
      this.unsubscribe = this.roomRef
        .collection('viewers')
        .onSnapshot(snapshot => {
          this.viewers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        })
    },
    // TODO: should be replaced to cloud functions trigger
    async stopStream() {
      const viewersRef = this.roomRef.collection('viewers')
      const chatsRef = this.roomRef.collection('chatList')

      await Promise.all([
        viewersRef.onSnapshot(snapshot => {
          snapshot.docs.forEach(doc => {
            doc.ref.delete()
          })
        }),
        chatsRef.onSnapshot(snapshot => {
          snapshot.docs.forEach(doc => {
            doc.ref.delete()
          })
        })
      ])
      this.roomRef.delete()
      this.$router.push('/lobby')
    }
  },
  beforeRouteEnter: (to, from, next) => {
    const currentUser = firebase.auth().currentUser
    const userInfo = {
      displayName: currentUser.displayName,
      uid: currentUser.uid,
      photoURL: currentUser.photoURL,
      email: currentUser.email
    }
    db.collection('lobby')
      .doc(to.params.id)
      .collection('viewers')
      .doc(userInfo.uid)
      .set(userInfo)
    next()
  },
  beforeRouteLeave: (to, from, next) => {
    db.collection('lobby')
      .doc(from.params.id)
      .collection('viewers')
      .doc(firebase.auth().currentUser.uid)
      .delete()
    next()
  }
}
</script>
<style lang="scss" scoped>
.room-container {
  //hard coded.. fix soon
  height: calc(100vh - 56px);

  display: grid;
  grid-template-rows: min-content min-content minmax(0, 1fr);
}
</style>
