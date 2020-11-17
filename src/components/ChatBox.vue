<template>
  <v-container>
    <v-row no-gutters class="chat-box">
      <v-col>
        <v-row v-for="chat in chatList" :key="chat.id" class="px-2" no-gutters>
          <v-col class="py-1">{{ chat.displayName }}: {{ chat.msg }}</v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-text-field
      v-model="text"
      label="Please chat"
      class="pt-2"
      type="text"
      append-icon="send"
      autofocus
      outlined
      dense
      hide-details
      @keyup.enter="send()"
      @click:append="send()"
    />
  </v-container>
</template>

<script>
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
  /*  created() {
    db.collection('lobby')
      .doc(this.$route.params.id)
      .collection('chatList')
      .onSnapshot(snapshot => {
        this.chatList = snapshot.docs.map(doc => {
          return { id: doc.id, ...doc.data() }
        })
      })
    // test code
    for (let i = 0; i < 100; i++) {
      this.chatList.push({
        id: i,
        displayName: 'BLUE',
        msg: 'hiiiiiiiiiii'
      })
    }
  }, */
  updated() {
    const chatBox = this.$el.querySelector('.chat-box')
    chatBox.scrollTop = chatBox.scrollHeight
  },
  methods: {
    send() {
      if (this.text.length == 0) return
      this.chatList.push({
        uid: this.currentUser.uid,
        displayName: this.currentUser.displayName,
        photoURL: this.currentUser.photoURL,
        timeCreated: firebase.firestore.Timestamp.now(),
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
  height: 300px;
  border: 1px solid black;
  overflow-y: scroll;
}
</style>
