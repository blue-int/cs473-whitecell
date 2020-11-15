<template>
  <div>
    <router-link to="/lobby">Lobby</router-link>
    <div>Room {{ $route.params.id }}</div>
    <div>{{ title }}</div>
    <div>{{ master }}</div>
    <vue-plyr>
      <div class="plyr__video-embed">
        <iframe
          src="https://www.youtube.com/embed/bTqVqk7FSmY?amp;iv_load_policy=3&amp;modestbranding=1&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1"
          allowfullscreen
          allowtransparency
          allow="autoplay"
        ></iframe>
      </div>
    </vue-plyr>
    <ChatBox />
  </div>
</template>

<script>
import { db } from '@/components/firebaseInit'
import ChatBox from '@/components/ChatBox'
export default {
  name: 'Room',
  components: {
    ChatBox
  },
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
