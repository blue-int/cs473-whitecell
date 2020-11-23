<template>
  <v-container fluid fill-height class="pa-0 chatbox-container">
    <v-card
      class="header rounded-0 px-3 align-start"
      elevation="0"
      color="rgb(245,245,245)"
    >
      <div>
        <v-card-title class="px-0 py-2">
          Live Chat
        </v-card-title>
        <v-card-subtitle class="px-0 py-2">
          {{ viewers }} viewers
        </v-card-subtitle>
      </div>
      <v-spacer></v-spacer>
      <v-btn x-small dark class="my-3 mr-2" color="like" elevation="3">
        {{ numLike }}
        <v-icon right size="15">favorite</v-icon>
      </v-btn>
      <v-btn x-small class="my-3" color="secondary" elevation="3">
        {{ numPinned }}
        <v-icon right size="15">push_pin</v-icon>
      </v-btn>
    </v-card>

    <v-card class="rounded-0 card" elevation="0" color="rgb(220,220,220)">
      <v-divider v-if="pinList.length !== 0"></v-divider>
      <v-list class="py-0 pin-box" color="rgb(245,245,245)">
        <v-list-item
          v-for="pin in pinList"
          :key="pin.id"
          class="pin-chat px-3"
          @click="like(pin)"
        >
          <v-list-item-avatar
            color="primary"
            size="20"
            class="my-3 mr-3"
          ></v-list-item-avatar>
          <v-list-item-content class="list-content py-0">
            <v-list-item-title class="my-0 mr-1">
              <span class="font-weight-bold">
                {{ pin.displayName }}
              </span>
              <span class="font-weight-light">
                {{ pin.msg }} {{ pin.leftpinnedTime }}
              </span>
            </v-list-item-title>
            <v-list-item-title class="like--text">
              {{ pin.likes }}
              <v-icon color="like" size="15" class="icon"
                >favorite_border</v-icon
              >
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
    </v-card>

    <v-virtual-scroll :items="totChatList" item-height="44" class="chat-box">
      <template v-slot:default="{ item }">
        <v-list-item :key="item.id" class="chat px-3" @click="like(item)">
          <v-list-item-avatar
            color="primary"
            size="20"
            class="my-3 mr-3"
          ></v-list-item-avatar>
          <v-list-item-content class="list-content">
            <v-list-item-title class="my-0 mr-1">
              <span class="font-weight-bold">
                {{ item.displayName }}
              </span>
              <span class="font-weight-light">
                {{ item.msg }}
              </span>
            </v-list-item-title>
            <v-list-item-title class="like--text">
              {{ item.likes }}
              <v-icon color="like" size="15" class="icon"
                >favorite_border</v-icon
              >
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
      @click="showDummy()"
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
import { dummyChats } from '@/components/dummy'
export default {
  name: 'ChatBox',
  data() {
    return {
      pinList: [],
      chatList: [],
      dummyChats: [],
      dummies: [],
      unsubscribe: [],
      text: '',
      stopdummy: null,
      currentUser: firebase.auth().currentUser,
      viewers: 0,
      decay: null,
      numLike: 0,
      numPinned: 0
    }
  },
  computed: {
    roomRef() {
      return db.collection('lobby').doc(this.$route.params.id)
    },
    totChatList() {
      return this.chatList.concat(this.dummies).sort((a, b) => {
        if (a.timeCreated === null) return 1
        if (b.timeCreated === null) return -1
        return a.timeCreated.toMillis() - b.timeCreated.toMillis()
      })
    }
    //sum: 0
  },
  created() {
    this.dummyChats = dummyChats.slice()
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
        }),
      this.roomRef.collection('viewers').onSnapshot(snapshot => {
        this.viewers = snapshot.size
      }),
      this.roomRef
        .collection('chatList')
        .where('uid', '==', this.currentUser.uid)
        .onSnapshot(snapshot => {
          this.numLike = 0
          snapshot.forEach(doc => {
            this.numLike = this.numLike + doc.data().likes
          })
        }),
      this.roomRef
        .collection('chatList')
        .where('uid', '==', this.currentUser.uid)
        .where('havebeenPinned', '==', true)
        .onSnapshot(snapshot => {
          this.numPinned = snapshot.size
        })
    ]
  },
  mounted() {
    this.decay = setInterval(() => {
      if (this.pinList.length === 0) return
      var i = 0
      while (i < this.pinList.length) {
        this.pinList[i].leftpinnedTime =
          this.importance(this.pinList[i]) -
          firebase.firestore.Timestamp.now().seconds -
          25
        i++
      }
      if (
        this.importance(this.pinList[this.pinList.length - 1]) <
        firebase.firestore.Timestamp.now().seconds + 25
      ) {
        this.roomRef
          .collection('chatList')
          .doc(this.pinList[this.pinList.length - 1].id)
          .update({
            pinned: false,
            havebeenPinned: true
          })
      }
    }, 100)
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
        fans: [],
        pinned: false,
        deleted: false,
        havebeenPinned: false,
        leftpinnedTime: 0
      })
      this.text = ''
    },
    like(chat) {
      // if (chat.fans.includes(this.currentUser.uid) === true) return
      if (chat.deleted) return
      const chatRef =
        chat.uid === 'dummy'
          ? db.collection('dummies').doc(chat.id)
          : this.roomRef.collection('chatList').doc(chat.id)
      chatRef.update({
        likes: firebase.firestore.FieldValue.increment(1),
        fans: firebase.firestore.FieldValue.arrayUnion(this.currentUser.uid),
        pinned: this.pinned(chat)
      })
    },
    pinned(chat) {
      if (chat.likes < 5) return false
      if (chat.pinned === true) return true
      if (
        this.importance(chat) <
        firebase.firestore.Timestamp.now().seconds + 25
      )
        return false
      if (
        this.pinList.length < 3 ||
        this.importance(this.pinList[this.pinList.length - 1]) <
          this.importance(chat)
      ) {
        return true
      } else {
        return false
      }
    },
    havebeenPinned(chat) {
      console.log(chat.pinned)
      return chat.pinned
    },
    addDummy() {
      for (const [index, dummy] of this.dummyChats.entries()) {
        db.collection('dummies').add({
          index,
          ...dummy
        })
      }
    },
    showDummy() {
      this.unsubscribe.push(
        db
          .collection('dummies')
          .orderBy('index')
          .onSnapshot(snapshot => {
            const dummies = snapshot.docs.map(doc => {
              return {
                id: doc.id,
                ...doc.data()
              }
            })
            this.stopdummy = setInterval(() => {
              const dummy = dummies.shift()
              if (dummy === undefined) return clearInterval(this.stopdummy)
              this.dummies.push({
                timeCreated: firebase.firestore.Timestamp.now(),
                ...dummy
              })
            }, 140)
          })
      )
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
  align-self: start;
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
.list-content {
  display: grid;
  grid-template-columns: 1fr min-content;
}
.icon {
  padding-bottom: 2px;
}
</style>
