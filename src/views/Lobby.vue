<template>
  <v-container fluid class="lobby pa-0">
    <div class="parallax pa-0"></div>
    <v-toolbar elevation="0" color="transparent">
      <v-btn icon dark class="ma-0" @click="leaveLobby()">
        <v-icon>arrow_back</v-icon>
      </v-btn>
    </v-toolbar>

    <v-btn
      class="mx-3 my-6 float-btn"
      elevation="12"
      fab
      dark
      color="#3e7495"
      @click="newRoom()"
    >
      <v-icon dark>
        add
      </v-icon>
    </v-btn>

    <v-card
      v-for="room in roomList"
      :key="room.id"
      class="mx-6 mb-3"
      elevation="12"
      @click="$router.push(`/lobby/${room.id}`)"
    >
      <v-img
        :aspect-ratio="16 / 9"
        src="https://img.youtube.com/vi/bTqVqk7FSmY/maxresdefault.jpg"
      />
      <!-- <v-avatar color="primary" size="48"></v-avatar> -->
      <v-card-title class="pa-3">{{ room.title }}</v-card-title>
      <v-card-subtitle class="px-3 pb-3">
        {{ room.hostName }} · {{ room.viewers }} viewers
      </v-card-subtitle>
    </v-card>
  </v-container>
</template>

<script>
import firebase from 'firebase/app'
import { db } from '@/components/firebaseInit'
export default {
  name: 'Lobby',
  data() {
    return {
      roomList: [],
      unsubscribe: null
    }
  },
  created() {
    try {
      this.unsubscribe = db
        .collection('lobby')
        .orderBy('timeCreated', 'desc')
        .onSnapshot(snapshot => {
          this.roomList = snapshot.docs.map(doc => {
            return {
              id: doc.id,
              ...doc.data()
            }
          })
        })
    } catch (e) {
      console.log(e)
    }
  },
  destroyed() {
    this.unsubscribe()
  },
  methods: {
    async newRoom() {
      try {
        const newRoom = {
          title: 'Hi everyone!',
          hostName: firebase.auth().currentUser.displayName,
          hostUid: firebase.auth().currentUser.uid,
          banListUid: [],
          timeCreated: firebase.firestore.FieldValue.serverTimestamp(),
          viewers: 0
        }
        const docRef = await db.collection('lobby').add(newRoom)

        this.$router.push(`/lobby/${docRef.id}`)
      } catch (e) {
        console.log(e)
      }
    },
    leaveLobby() {
      this.$router.push('/')
    },
    toTime(room) {
      if (room.timeCreated !== null) {
        const date = room.timeCreated.toDate()
        return `${date.getMonth() +
          1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import 'src/styles/variables.scss';
.lobby {
  display: grid;
  grid-template-rows: 15vh;
}
.space {
  height: 15vh;
  color: white;
  background-color: transparent;
  text-align: center;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}
.parallax {
  z-index: 0;
  position: absolute;
  width: 100%;
  height: 30vh;
  background-color: #3e7495;
  // background-color: transparent;
}
.float-btn {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 10;
}
</style>
