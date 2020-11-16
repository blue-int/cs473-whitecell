<template>
  <div class="lobby">
    <button @click="newRoom()">Start a new stream</button>
    <div>
      <div v-for="room in roomList" :key="room.id" @click="enterRoom(room)">
        {{ room.title }} {{ room.master }}
        {{ toTime(room) }}
      </div>
    </div>
  </div>
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
        let newRoom = {
          title: 'Hi everyone!',
          master: 'KST',
          timeCreated: firebase.firestore.FieldValue.serverTimestamp(),
          pinnableNum: 3 // The max. number of pinned chat
        }
        let docRef = await db.collection('lobby').add(newRoom)
        let chatCollection = docRef.collection('pinnedChats')

        console.log('collection??')
        let curUser = firebase.auth().currentUser
        let chatInfo = {
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
