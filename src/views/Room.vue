<template>
  <div>
    Room {{ $route.params.id }}
    <div>{{ title }}</div>
    <div>{{ master }}</div>
  </div>
</template>

<script>
import { db } from '@/components/firebaseInit'
export default {
  name: 'Room',
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
    this.title = doc.data().title
    this.master = doc.data().master
  }
}
</script>
