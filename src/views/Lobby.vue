<template>
  <div class="lobby">
    <button @click="newRoom()">Make a new room</button>
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
        const docRef = await db.collection('lobby').add({
          title: 'Hi everyone!',
          master: 'KST',
          timeCreated: firebase.firestore.FieldValue.serverTimestamp(),
          viewers: 0
        })
        this.$router.push(`/lobby/${docRef.id}`)
      } catch (e) {
        console.log(e)
      }
    },
    enterRoom(room) {
      this.$router.push(`/lobby/${room.id}`)
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
