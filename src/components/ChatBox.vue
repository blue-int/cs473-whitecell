<template>
  <v-container fluid fill-height class="pa-0 chatbox-container">
    <v-card
      class="header rounded-0 px-4"
      elevation="0"
      color="rgb(245,245,245)"
    >
      <div>
        <v-card-title class="px-0 py-2">
          Live Chat
        </v-card-title>
        <v-card-subtitle class="px-0 py-2">
          8k viewers
        </v-card-subtitle>
      </div>
      <v-spacer></v-spacer>
      <v-btn fab x-small class="mr-2" dark color="like" elevation="0">
        <v-icon>favorite</v-icon>
      </v-btn>
      <v-btn fab x-small dark color="secondary" elevation="0">
        <v-icon>push_pin</v-icon>
      </v-btn>
    </v-card>

    <v-card class="rounded-0 card" elevation="0" color="rgb(220,220,220)">
      <v-divider v-if="pinList.length !== 0"></v-divider>
      <!-- <v-card-title class="py-1">Most liked chats</v-card-title>
      <v-card-actions class="pa-0">
        <v-btn icon>
          <v-icon>keyboard_arrow_down</v-icon>
        </v-btn>
      </v-card-actions> -->
      <v-list class="py-0 pin-box" color="rgb(245,245,245)">
        <v-list-item v-for="pin in pinList" :key="pin.id" @click="like(pin)">
          <v-list-item-avatar
            color="primary"
            size="24"
            class="my-2"
          ></v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              <span class="font-weight-bold">
                {{ pin.displayName }}
              </span>
              <span class="font-weight-light">
                {{ pin.msg }} , likes:{{ pin.likes }}
              </span>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
    </v-card>

    <v-virtual-scroll :items="chatList" item-height="44" class="chat-box">
      <template v-slot:default="{ item }">
        <v-list-item :key="item.id" class="chat" @click="like(item)">
          <v-list-item-avatar color="primary" size="24"></v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              <span class="font-weight-bold">
                {{ item.displayName }}
              </span>
              <span class="font-weight-light">
                {{ item.msg }} , likes:{{ item.likes }}
              </span>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-divider></v-divider>
      </template>
    </v-virtual-scroll>

    <v-card class="rounded-0" elevation="0">
      <v-divider></v-divider>
      <v-toolbar elevation="0" class="pa-0" bottom color="rgb(245,245,245)">
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
      </v-toolbar>
    </v-card>
    <v-btn
      class="ma-3 float-btn"
      elevation="12"
      fab
      dark
      x-small
      color="#3e7495"
      @click="showdummy()"
    >
      <v-icon dark>
        adb
      </v-icon>
    </v-btn>
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
          clearInterval(this.stopdummy)
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
  grid-template-rows: min-content min-content minmax(0, 1fr) min-content;
  overflow-y: hidden;
}
.header {
  display: grid;
  grid-template-columns: max-content 1fr max-content max-content;
  align-items: center;
}
.card {
  display: grid;
  grid-template-columns: 1fr min-content;
  grid-template-rows: min-content minmax(0, 1fr) min-content;
}
.pin-box {
  grid-column: 1/-1;
}
.float-btn {
  position: fixed;
  bottom: 100px;
  right: 0;
  z-index: 10;
}
</style>
