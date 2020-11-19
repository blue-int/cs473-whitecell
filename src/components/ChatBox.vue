<template>
  <v-container fluid fill-height class="pa-0 chatbox-container">
    <!-- <v-list class="chat-box">
      <v-list-item v-for="chat in chatList" :key="chat.id">
        <v-list-item-avatar>
          <v-avatar size="56">
            {{ chat.displayName }}
          </v-avatar>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{ chat.displayName }}</v-list-item-title>
          <v-list-item-title>{{ chat.msg }}</v-list-item-title>
          <v-divider></v-divider>
        </v-list-item-content>
      </v-list-item>
    </v-list> -->
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
    <v-toolbar elevation="3" class="pa-0" bottom>
      <v-text-field
        v-model="text"
        label="Please chat"
        type="text"
        append-icon="send"
        outlined
        dense
        hide-details
        @keyup.enter="send()"
        @click:append="send()"
      />
      <v-btn @click="showdummy()">chat with dummy</v-btn>
    </v-toolbar>
  </v-container>
</template>

<script>
import { db } from '@/components/firebaseInit'
import firebase from 'firebase/app'
import { dummychats } from '@/components/dummy'
export default {
  name: 'ChatBox',
  data() {
    return {
      pinList: [],
      chatList: [],
      dummychats: [],
      unsubscribe: [],
      text: '',
      stopdummy: null,
      currentUser: firebase.auth().currentUser
    }
  },
  computed: {
    roomRef() {
      return db.collection('lobby').doc(this.$route.params.id)
    }
  },
  created() {
    this.dummychats = dummychats.slice()
    this.unsubscribe = [
      this.roomRef
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
      this.roomRef
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
    clearInterval(this.stopdummy)
    this.unsubscribe.forEach(unsub => unsub())
  },
  methods: {
    send() {
      if (this.text.length == 0) return
      this.roomRef.collection('chatList').add({
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
      this.roomRef
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
    showdummy() {
      this.stopdummy = setInterval(() => {
        if (this.dummychats.length === 0) {
          this.clearInterval(this.stopdummy)
          return
        }
        const chat = this.dummychats.shift()
        this.chatList.push({
          uid: null,
          displayName: chat.name,
          photoURL: null,
          timeCreated: firebase.firestore.Timestamp.now(),
          msg: chat.msg,
          likes: 0,
          pinned: false
        })
      }, 140)
    },
    importance(chat) {
      return 6 * chat.likes + chat.timeCreated.seconds
    }
  }
}
</script>

<style lang="scss" scoped>
.chatbox-container {
  display: grid;
  grid-template-rows: minmax(0, 1fr) min-content;
}
.chat-box {
  height: 200px;
  border: 1px solid black;
  overflow-y: scroll;
}
.pin-box {
  height: 100%;
  border: 1px solid black;
  overflow-y: scroll;
}
</style>
