<template>
  <v-container>
    <v-row no-gutters>
      <v-col class="pin-box">
        <v-row v-for="pin in pinList" :key="pin.id" class="px-2" no-gutters>
          <v-col class="py-1" @click="like(pin)">
            {{ pin.displayName }}: {{ pin.msg }} , likes:{{ pin.likes }}
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col class="chat-box">
        <v-row v-for="chat in chatList" :key="chat.id" class="px-2" no-gutters>
          <v-col class="py-1" @click="like(chat)">
            {{ chat.displayName }}: {{ chat.msg }} likes:{{ chat.likes }}
          </v-col>
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
import { db } from '@/components/firebaseInit'
import firebase from 'firebase/app'
export default {
  name: 'ChatBox',
  data() {
    return {
      pinList: [],
      chatList: [],
      unsubscribe: [],
      text: '',
      currentUser: firebase.auth().currentUser
    }
  },
  computed: {
    docRef() {
      return db.collection('lobby').doc(this.$route.params.id)
    }
  },
  created() {
    this.unsubscribe = [
      this.docRef
        .collection('chatList')
        .orderBy('timeCreated', 'desc')
        .onSnapshot(snapshot => {
          this.chatList = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            .reverse()
        }),
      this.docRef
        .collection('chatList')
        .where('pinned', '==', true)
        .orderBy('timeCreated', 'desc')
        .onSnapshot(snapshot => {
          this.pinList = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            .sort((a, b) => this.importance(b) - this.importance(a))
            .slice(0, 2)
        })
    ]
  },
  updated() {
    const chatBox = this.$el.querySelector('.chat-box')
    chatBox.scrollTop = chatBox.scrollHeight
  },
  destroyed() {
    this.unsubscribe.forEach(unsub => unsub())
  },
  methods: {
    send() {
      if (this.text.length == 0) return
      this.docRef.collection('chatList').add({
        uid: this.currentUser.uid,
        displayName: this.currentUser.displayName,
        photoURL: this.currentUser.photoURL,
        timeCreated: firebase.firestore.FieldValue.serverTimestamp(),
        msg: this.text,
        likes: 0,
        pinned: false
      })
      this.text = ''
    },
    like(chat) {
      this.docRef
        .collection('chatList')
        .doc(chat.id)
        .update({
          likes: firebase.firestore.FieldValue.increment(1),
          pinned: this.pinned(chat)
        })
    },
    pinned(chat) {
      if (chat.likes < 5 || this.pinList.includes(chat)) return false
      else if (
        this.pinList.length < 3 ||
        this.importance(this.pinList[this.pinList.length - 1]) <
          this.importance(chat)
      ) {
        return true
      } else return false
    },
    importance(chat) {
      return 6 * chat.likes + chat.timeCreated.seconds
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-box {
  height: 200px;
  border: 1px solid black;
  overflow-y: scroll;
}
.pin-box {
  height: 100px;
  border: 1px solid black;
  overflow-y: scroll;
}
</style>
