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
    <v-btn
      class="ma-3 float-btn"
      elevation="12"
      fab
      dark
      x-small
      color="#3e7495"
      @click="stopStream()"
    >
      <v-icon dark>
        clear
      </v-icon>
    </v-btn>
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
    <v-toolbar elevation="0" color="transparent" class="float-toolbar">
      <v-btn icon dark class="goBack-btn" @click="$router.push('/lobby')">
        <v-icon>arrow_back</v-icon>
      </v-btn>
    </v-toolbar>
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
      unsubList: []
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
      const unsub = this.roomRef.collection('viewers').onSnapshot(snapshot => {
        this.viewers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      })
      this.unsubList = [unsub]
    }
  },
  destroyed() {
    this.unsubList.forEach(unsub => unsub())
  },
  methods: {
    async stopStream() {
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
  height: 100vh;

  display: grid;
  grid-template-rows: min-content minmax(0, 1fr);
}
.float-btn {
  position: fixed;
  bottom: 56px;
  right: 0;
  z-index: 10;
}
.float-toolbar {
  position: fixed;
  top: 0px;
  z-index: 10;
}

.goBack-btn {
  margin-left: -12px;
}
</style>
