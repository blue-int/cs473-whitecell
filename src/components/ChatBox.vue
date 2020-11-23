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
          <v-sheet
            class="guage"
            height="44"
            :width="renderGuage(pin)"
            color="rgba(234,30,99,0.2)"
          ></v-sheet>
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
                {{ pin.msg }}
              </span>
            </v-list-item-title>
            <v-list-item-title class="like--text">
              {{ pin.likes }}
              <v-icon
                v-if="pin.fans.includes(currentUser.uid)"
                color="like"
                size="15"
                class="icon"
                >favorite</v-icon
              >
              <v-icon v-else color="like" size="15" class="icon"
                >favorite_border</v-icon
              >
            </v-list-item-title>
          </v-list-item-content>
          <v-menu v-if="currentUser.uid === hostUid" offset-x="-1" bottom left>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" class="menu-btn" v-on="on">
                <v-icon size="18">more_vert</v-icon>
              </v-btn>
            </template>

            <v-list class="pa-0">
              <v-list-item
                v-for="(banBtn, i) in banMenu"
                :key="i"
                class="px-2"
                color="like"
                @click="banBtn.click(pin)"
              >
                <v-list-item-title>ban </v-list-item-title>
                <v-icon right>{{ banBtn.icon }}</v-icon>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
    </v-card>
    <v-virtual-scroll :items="chatList" item-height="44" class="chat-box">
      <template v-slot:default="{ index, item }">
        <v-list-item :key="item.id" class="chat px-3" @click="like(item)">
          <v-list-item-avatar
            color="primary"
            size="20"
            class="my-3 mr-3"
          ></v-list-item-avatar>
          <v-list-item-content class="list-content py-0">
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
              <v-icon
                v-if="item.fans.includes(currentUser.uid)"
                color="like"
                size="15"
                class="icon"
                >favorite</v-icon
              >
              <v-icon v-else color="like" size="15" class="icon"
                >favorite_border</v-icon
              >
            </v-list-item-title>
          </v-list-item-content>
          <v-menu v-if="currentUser.uid === hostUid" offset-x="-1" bottom left>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" class="menu-btn" v-on="on">
                <v-icon size="18">more_vert</v-icon>
              </v-btn>
            </template>

            <v-list class="pa-0">
              <v-list-item
                v-for="(banBtn, i) in banMenu"
                :key="i"
                class="px-2"
                color="like"
                @click="banBtn.click(pin)"
              >
                <v-list-item-title>ban </v-list-item-title>
                <v-icon right>{{ banBtn.icon }}</v-icon>
                <v-divider></v-divider>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-list-item>
        <v-divider
          v-show="index !== chatList.length - 1 || hasScroll === false"
        ></v-divider>
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
  props: {
    hostUid: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      pinList: [],
      chatList: [],
      unsubList: [],
      text: '',
      stopDummy: null,
      currentUser: firebase.auth().currentUser,
      viewers: 0,
      decay: null,
      numLike: 0,
      numPinned: 0,
      stickBottom: true,
      hasScroll: false,
      jumpBottom: null,
      banMenu: [
        {
          description: 'ban only user',
          icon: 'account_circle',
          click: this.banChat2
        },
        {
          description: 'ban user and fans',
          icon: 'supervised_user_circle',
          click: this.banChat
        }
      ]
    }
  },
  computed: {
    roomRef() {
      return db.collection('lobby').doc(this.$route.params.id)
    }
  },
  async created() {
    this.unsubList = [
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
              estEndTime: this.estEndTime(doc.data()),
              currentTime: firebase.firestore.Timestamp.now().toMillis() / 1000,
              ...doc.data()
            }))
            .sort((a, b) => this.estEndTime(b) - this.estEndTime(a))
            .slice(0, 2)
        }),
      this.roomRef.collection('viewers').onSnapshot(snapshot => {
        this.viewers = snapshot.size
      }),
      this.roomRef
        .collection('chatList')
        .where('uid', '==', this.currentUser.uid)
        .onSnapshot(snapshot => {
          this.numLike = snapshot.docs.reduce((acc, doc) => {
            return acc + doc.data().likes
          }, 0)
          this.numPinned = snapshot.docs.filter(
            doc => doc.data().havebeenPinned || doc.data().pinned
          ).length
        })
    ]
  },
  mounted() {
    this.decay = setInterval(() => {
      if (this.pinList.length === 0) return
      const currentTime = firebase.firestore.Timestamp.now().toMillis() / 1000
      this.pinList = this.pinList.map(pin => {
        return {
          ...pin,
          estEndTime: this.estEndTime(pin),
          currentTime
        }
      })
      if (
        this.estEndTime(this.pinList[this.pinList.length - 1]) < currentTime
      ) {
        this.roomRef
          .collection('chatList')
          .doc(this.pinList[this.pinList.length - 1].id)
          .update({
            pinned: false,
            havebeenPinned: true
          })
      }
    }, 10)
    const chatBox = this.$el.querySelector('.chat-box')
    chatBox.onscroll = () => {
      if (
        chatBox.scrollHeight !==
        parseInt(chatBox.scrollTop + chatBox.clientHeight, 10)
      ) {
        this.stickBottom = false
      } else {
        this.stickBottom = true
      }
    }
  },
  updated() {
    const chatBox = this.$el.querySelector('.chat-box')
    if (this.stickBottom === true) {
      chatBox.scrollTop = chatBox.scrollHeight
    }
    this.$nextTick(() => {
      const scrollHeight = chatBox.scrollHeight
      const clientHeight = chatBox.clientHeight
      if (scrollHeight > clientHeight) {
        this.hasScroll = true
      } else {
        this.hasScroll = false
      }
    })
  },
  destroyed() {
    clearInterval(this.stopDummy)
    clearInterval(this.decay)
    this.unsubList.forEach(unsub => unsub())
  },
  methods: {
    renderGuage(pin) {
      return (window.innerWidth * (pin.estEndTime - pin.currentTime)) / 15
    },
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
        havebeenPinned: false
      })
      this.stickBottom = true
      this.text = ''
    },
    like(chat) {
      // if (chat.fans.includes(this.currentUser.uid) === true) return
      if (chat.deleted) {
        console.log('Deleted message.')
        return
      }

      this.roomRef
        .collection('chatList')
        .doc(chat.id)
        .update({
          likes: firebase.firestore.FieldValue.increment(1),
          fans: firebase.firestore.FieldValue.arrayUnion(this.currentUser.uid),
          pinned: this.pinned(chat)
        })
      clearTimeout(this.jumpBottom)
      this.jumpBottom = setTimeout(() => {
        this.stickBottom = true

        const chatBox = this.$el.querySelector('.chat-box')
        chatBox.scrollTop = chatBox.scrollHeight
      }, 3000)
    },
    pinned(chat) {
      if (chat.likes < 5) return false
      if (chat.pinned === true) return true
      if (
        this.estEndTime(chat) <
        firebase.firestore.Timestamp.now().toMillis() / 1000
      ) {
        return false
      }
      if (
        this.pinList.length < 3 ||
        this.estEndTime(this.pinList[this.pinList.length - 1]) <
          this.estEndTime(chat)
      ) {
        return true
      } else {
        return false
      }
    },
    estEndTime(chat) {
      const currentTime = firebase.firestore.Timestamp.now().toMillis() / 1000
      if (
        6 * chat.likes + chat.timeCreated.toMillis() / 1000 - 25 >
        currentTime + 15
      ) {
        return currentTime + 15
      } else {
        return 6 * chat.likes + chat.timeCreated.toMillis() / 1000 - 25
      }
    },
    showDummy() {
      const tempDummies = dummyChats.slice()
      this.stopDummy = setInterval(() => {
        const dummy = tempDummies.shift()
        if (dummy === undefined) return clearInterval(this.stopDummy)
        this.roomRef.collection('chatList').add({
          timeCreated: firebase.firestore.FieldValue.serverTimestamp(),
          ...dummy
        })
      }, 300)
    },
    banUser(targetChat) {
      if (firebase.auth().currentUser.uid !== this.hostUid) {
        alert('You are not host!')
        return
      } else if (targetChat.uid === this.hostUid) {
        alert('You cannot ban yourself!')
        return
      }

      this.roomRef.update({
        banListUid: firebase.firestore.FieldValue.arrayUnion(targetChat.uid)
      })
    },

    banChat(targetChat) {
      if (firebase.auth().currentUser.uid !== this.hostUid) {
        alert('You are not host!')
        return
      }
      const chatRef = this.roomRef.collection('chatList').doc(targetChat.id)
      chatRef.update({
        msg: 'This message has deleted',
        likes: -1,
        pinned: false,
        deleted: true
      })

      // Ban chatter & fans
      db.runTransaction(async transaction => {
        const room = await transaction.get(this.roomRef)

        if (!room.exists) {
          return
        }
        const mergedBanList = [
          ...new Set([
            ...room.data().banListUid,
            ...targetChat.fans,
            targetChat.uid
          ])
        ]
        return transaction.update(this.roomRef, { banListUid: mergedBanList })
      }).catch(e => console.log(e))
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
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr min-content;
}
.icon {
  padding-bottom: 2px;
}
.guage {
  position: absolute;
  margin-left: -12px;
}
.pin-chat-content {
  display: grid;
  grid-template-columns: min-content 1fr;
}
.menu-btn {
  margin-right: -16px;
}
</style>
