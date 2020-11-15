<template>
  <div>
    <router-link to="/lobby">Lobby</router-link>
    <div>Room {{ $route.params.id }}</div>
    <div>{{ title }}</div>
    <div>{{ master }}</div>
    <ChatRoom />
  </div>
</template>

<script>
import { db } from '@/components/firebaseInit'
import ChatRoom from '@/components/ChatRoom'
export default {
  name: 'Room',
  components: ChatRoom,
  data() {
    return {
      title: '',
      master: ''
    }
  },
  async created() {
    const doc = await db
      .collection('lobby')
      .doc(this.$route.params.id)
      .get()
    if (!doc.exists) {
      alert('The room does not exists')
      this.$router.push('/lobby')
    } else {
      this.title = doc.data().title
      this.master = doc.data().master
    }
  }
}
</script>
