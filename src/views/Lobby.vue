<template>
  <div class="lobby">
    <button @click="newRoom()">Make a new room</button>
    <div>
      <div v-for="room in roomList" :key="room.id">
        {{ room.title }} {{ room.master }}
        {{ room.timeCreated.toDate().getMonth() }} /
        {{ room.timeCreated.toDate().getDate() }}
        {{ room.timeCreated.toDate().getHours() }} :
        {{ room.timeCreated.toDate().getMinutes() }} :
        {{ room.timeCreated.toDate().getSeconds() }}
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
  async created() {
    try {
      await db
        .collection('lobby')
        .orderBy('timeCreated', 'desc')
        .onSnapshot(snapshot => {
          snapshot.forEach(doc => {
            this.roomList.push(doc.data())
            console.log(doc.data().timeCreated.toDate())
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
    }
  }
}
</script>
