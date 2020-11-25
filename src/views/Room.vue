<template>
  <v-container fluid class="pa-0 room-container">
    <vue-plyr ref="plyr">
      <video controls playsinline>
        <source
          size="1080"
          src="https://clips-media-assets2.twitch.tv/40278264606-offset-4760.mp4"
          type="video/mp4"
        />
      </video>
    </vue-plyr>
    <v-btn
      v-if="hostUid === currentUser.uid"
      class="ma-3 float-btn dummy"
      elevation="12"
      fab
      dark
      x-small
      color="#3e7495"
      @click="showDummy()"
    >
      <v-icon dark>
        adb
      </v-icon>
    </v-btn>
    <v-btn
      v-if="hostUid === currentUser.uid"
      class="ma-3 float-btn stop"
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
    <ChatBox :host-uid="hostUid" />
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
import { dummyChats } from '@/components/dummy'
export default {
  name: 'Room',
  components: {
    ChatBox
  },
  data() {
    return {
      title: '',
      hostName: '',
      hostUid: null,
      viewers: [],
      unsubList: [],
      stopDummy: null
    }
  },
  computed: {
    currentUser() {
      return firebase.auth().currentUser
    },
    roomRef() {
      return db.collection('lobby').doc(this.$route.params.id)
    }
  },
  async created() {
    const banSnapshot = this.roomRef.onSnapshot(async doc => {
      if (!doc.exists) {
        alert('The room does not exists')
        this.$router.push('/lobby')
        return
      } else if (
        doc.data().banListUid.includes(firebase.auth().currentUser.uid)
      ) {
        alert('You are banned!!')
        this.$router.push('/lobby')
      }
      this.title = doc.data().title
      this.hostName = doc.data().hostName
      this.hostUid = doc.data().hostUid
      if (doc.data().start === true) {
        this.$refs.plyr.player.play()
      }
    })
    this.unsubList.push(banSnapshot)
  },
  mounted() {
    const viewerSnapshot = this.roomRef
      .collection('viewers')
      .onSnapshot(snapshot => {
        this.viewers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      })
    this.unsubList.push(viewerSnapshot)
  },
  destroyed() {
    clearInterval(this.stopDummy)
    this.unsubList.forEach(unsub => unsub())
  },
  methods: {
    showDummy() {
      clearInterval(this.stopDummy)
      const tempDummies = dummyChats.slice()
      let i = 0
      this.stopDummy = setInterval(() => {
        const dummy = tempDummies.shift()
        if (dummy === undefined) {
          this.roomRef.update({
            start: false
          })
          return clearInterval(this.stopDummy)
        }
        if (i++ % 2 == 1) return
        this.roomRef.collection('chatList').add({
          timeCreated: firebase.firestore.Timestamp.now(),
          ...dummy
        })
      }, 140)
      this.roomRef.update({
        start: true
      })
    },
    stopStream() {
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
    const roomRef = db.collection('lobby').doc(to.params.id)

    const batch = db.batch()
    batch.update(roomRef, {
      viewers: firebase.firestore.FieldValue.increment(1)
    })
    batch.set(roomRef.collection('viewers').doc(userInfo.uid), userInfo)
    batch.commit()

    next()
  },
  beforeRouteLeave: async (to, from, next) => {
    const roomRef = db.collection('lobby').doc(from.params.id)

    const batch = db.batch()
    batch.update(roomRef, {
      viewers: firebase.firestore.FieldValue.increment(-1)
    })
    batch.delete(
      roomRef.collection('viewers').doc(firebase.auth().currentUser.uid)
    )
    batch.commit().catch(() => {
      // console.log('Stop Stream')
    })
    next()
  }
}
</script>
<style lang="scss" scoped>
.room-container {
  height: 100vh;

  display: grid;
  grid-template-rows: min-content minmax(0, 1fr);
}
.float-btn {
  position: fixed;
  right: 0;
  z-index: 10;
  &.dummy {
    bottom: 144px;
  }
  &.stop {
    bottom: 100px;
  }
}
.float-toolbar {
  position: fixed;
  top: 0px;
  z-index: 10;
}

.goBack-btn {
  margin-left: -12px;
}
.ban-card {
  position: fixed;
  top: 50px;
  margin: 12px;
  width: calc(100% - 24px);
}
</style>
