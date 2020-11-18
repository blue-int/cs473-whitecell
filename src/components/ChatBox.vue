<template>
  <v-container>
    <!--    <v-row no-gutters class="chat-box">-->
    <div class="Pinned">
      <div v-for="pin in pinnedchatList" :key="pin.id">
        <div class="py-1" @click="like(pin)">
          {{ pin.displayName }}: {{ pin.msg }} , likes:{{ pin.likes }}
        </div>
      </div>
    </div>
    <v-col class="chat-box">
      <v-row v-for="chat in chatList" :key="chat.id" class="px-2" no-gutters>
        <v-col class="py-1" @click="like(chat)">
          {{ chat.displayName }}: {{ chat.msg }} likes:{{ chat.likes }}
        </v-col>
      </v-row>
    </v-col>
    <!--    </v-row>-->
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
//import PinnedChats from './PinnedChats'
export default {
  name: 'ChatBox',
  /*  components: {
    PinnedChats
  },*/
  data() {
    return {
      chatList: [],
      text: '',
      currentUser: firebase.auth().currentUser,
      pinnedchatList: [],
      number: 1
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
        updateTime: 0,
        pinnedTime: 0,
        msg: this.text,
        likes: 0
      })
      this.text = ''
    },
    like(chat) {
      chat.likes = chat.likes + 1
      this.update_pin(chat)
    },
    update_pin(chat) {
      if (chat.likes > 5) {
        if (!this.pinnedchatList.includes(chat)) {
          if (this.pinnedchatList.length < 3) {
            this.pinnedchatList.push(chat)

            chat.pinnedTime = firebase.firestore.Timestamp.now().seconds
          } else {
            if (
              this.pinnedchatList[this.pinnedchatList.length - 1].likes <
              chat.likes
            ) {
              this.pinnedchatList.pop()
              this.pinnedchatList.push(chat)

              chat.pinnedTime = firebase.firestore.Timestamp.now().seconds
            }
          }
        }

        //console.log(chat.updateTime)
        this.pinnedchatList.sort(function(a, b) {
          return (
            b['likes'] -
            (firebase.firestore.Timestamp.now().seconds - b['pinnedTime']) -
            (a['likes'] -
              (firebase.firestore.Timestamp.now().seconds - a['pinnedTime'])) //현재는 now.seconds 빼도 되긴 함 : linear해서
          )
        })
      }
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
.Pinned {
  height: 100px;
  width: 702px;
  border: 1px solid black;
  overflow-y: scroll;
}
</style>
