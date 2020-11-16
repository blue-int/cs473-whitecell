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
        var newRoom = {
          title: 'Hi everyone!',
          master: 'KST',
          timeCreated: firebase.firestore.FieldValue.serverTimestamp(),
          viewers: []
        }
        await db.collection('lobby').add(newRoom)
        self.enterRoom(newRoom)
      } catch (e) {
        console.log(e)
      }
    },
    async enterRoom(room) {
      const curUser = firebase.auth().currentUser
      if (curUser != null) {
        let docRef = db.collection('lobby').doc(room.id)
        await docRef
          .get()
          .then(function(doc) {
            let viewers = doc.data().viewers
            const insideUser = viewers.find(user => {
              if (user.uid == curUser.uid) {
                return true
              }
            })
            if (insideUser != undefined) {
              console.log('Already participating')
              return
            }

            viewers.push({
              name: curUser.displayName,
              uid: curUser.uid,
              photoURL: curUser.photoURL,
              email: curUser.email
            })
            console.log(viewers)

            const data = doc.data()
            docRef.set({
              title: data.title,
              master: data.master,
              timeCreated: data.timeCreated,
              viewers: viewers
            })
          })
          .catch(function(error) {
            console.log('Error getting document:', error)
          })
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
