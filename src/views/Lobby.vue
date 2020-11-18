<template>
  <v-container fluid class="lobby">
    <v-row>
      <v-col align="center">
        <v-btn @click="newRoom()">Start a new stream</v-btn>
      </v-col>
    </v-row>
    <v-card
      v-for="room in roomList"
      :key="room.id"
      class="ma-3"
      elevation="12"
      @click="enterRoom(room)"
    >
      <v-img
        :aspect-ratio="16 / 9"
        src="https://img.youtube.com/vi/bTqVqk7FSmY/maxresdefault.jpg"
      ></v-img>
      <!-- <v-avatar color="primary" size="48"></v-avatar> -->
      <v-card-title class="pa-3">{{ room.title }}</v-card-title>
      <v-card-subtitle class="px-3 pb-3"
        >{{ room.master }} · 1234viewers</v-card-subtitle
      >
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
      roomList: []
    }
  },
  created() {
    try {
      db.collection('lobby')
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
  methods: {
    async newRoom() {
      try {
        const newRoom = {
          title: 'Hi everyone!',
          master: 'KST',
          timeCreated: firebase.firestore.FieldValue.serverTimestamp(),
          pinnableNum: 3 // The max. number of pinned chat
        }
        const docRef = await db.collection('lobby').add(newRoom)
        const chatCollection = docRef.collection('pinnedChats')

        console.log('collection??')
        const curUser = firebase.auth().currentUser
        const chatInfo = {
          uid: curUser.uid,
          displayName: curUser.displayName,
          photoURL: curUser.photoURL,
          timeCreated: firebase.firestore.Timestamp.now(),
          msg: 'Hello, I am pinned chat! It is available only for debugging.',
          likes: 100
        }

        await chatCollection.doc('pinChat1').set(chatInfo)
        await chatCollection.doc('pinChat2').set(chatInfo)
        await chatCollection.doc('pinChat3').set(chatInfo)
        console.log(docRef.id)
        this.enterRoom(docRef)
      } catch (e) {
        console.log(e)
      }
    },

    enterRoom(room) {
      let curUser = firebase.auth().currentUser
      if (curUser != null) {
        let userInfo = {
          name: curUser.displayName,
          uid: curUser.uid,
          photoURL: curUser.photoURL,
          email: curUser.email
        }
        let userRef = db
          .collection('lobby')
          .doc(room.id)
          .collection('viewers')
        userRef.doc(userInfo.uid).set(userInfo)
        this.$router.push(`/lobby/${room.id}`)
        console.log('Update done.')
      } else {
        alert('You are not logged in!')
      }
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
</style>
