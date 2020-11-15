<template>
  <div class="chat-box">
    ChatBox!
    <div v-for="chat in chatList" :key="chat.id">
      {{ chat.displayName }}: {{ chat.msg }}
    </div>
  </div>
</template>

<script>
import { db } from '@/components/firebaseInit'
export default {
  name: 'ChatBox',
  data() {
    return {
      chatList: []
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
    // test code
    // for (let i = 0; i < 100; i++) {
    //   this.chatList.push({
    //     id: i,
    //     displayName: 'BLUE',
    //     msg: 'hiiiiiiiiiii'
    //   })
    // }
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
