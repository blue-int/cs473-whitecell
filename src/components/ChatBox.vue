<template>
  <div class="chat-box">
    ChatBox!
    <div v-for="chat in chatList" :key="chat.id">
      {{ chat.displayName }}: {{ chat.msg }}
    </div>
    <input v-model="text" placeholder="chat" />
    <button @click="send()">send</button>
  </div>
</template>

<script>
import { db } from '@/components/firebaseInit'
import firebase from 'firebase/app'
export default {
  name: 'ChatBox',
  data() {
    return {
      chatList: [],
      text: '',
      currentUser: firebase.auth().currentUser
    }
  },
  created() {
    db.collection('lobby')
      .doc(this.$route.params.id)
      .collection('chatList')
      .onSnapshot(snapshot => {
        this.chatList = snapshot.docs.map(doc => {
          return { id: doc.id, ...doc.data() }
        })
      })
    /*
       test code
    for (let i = 0; i < 100; i++) {
      this.chatList.push({
        id: i,
        displayName: 'BLUE',
        msg: 'hiiiiiiiiiii'
      })
    }*/
  },
  methods: {
    send() {
      this.chatList.push({
        uid: this.currentUser.uid,
        displayName: this.currentUser.displayName,
        photoURL: this.currentUser.photoURL,
        timeCreated: firebase.firestore.FieldValue.serverTimestamp(),
        msg: this.text,
        likes: 0
      })
      this.text = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-box {
  width: 500px;
  height: 100px;
  border: 1px solid black;
  overflow: scroll;
}
</style>
