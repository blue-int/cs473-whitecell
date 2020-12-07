<template>
  <v-container fluid class="lobby pa-0">
    <div class="parallax pa-0"></div>
    <v-toolbar dark elevation="0" color="transparent">
      <v-spacer></v-spacer>
      <div>
        <span v-if="currentUser !== null">
          <v-breadcrumbs class="pr-0" divider="/">
            <v-breadcrumbs-item>
              {{ currentUser.displayName }}
            </v-breadcrumbs-item>
            <v-breadcrumbs-item class="pr-0">
              <v-btn
                x-small
                color="rgba(0,0,0,0.5)"
                elevation="0"
                @click="signOut()"
                >Sign Out</v-btn
              >
            </v-breadcrumbs-item>
          </v-breadcrumbs>
        </span>
        <span v-else>please login</span>
      </div>
    </v-toolbar>

    <v-dialog v-model="dialog" @click:outside="$refs.form.resetValidation()">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          elevation="12"
          fab
          dark
          color="#3e7495"
          class="mx-3 my-6 float-btn"
          v-bind="attrs"
          v-on="on"
        >
          <v-icon dark>
            add
          </v-icon>
        </v-btn>
      </template>
      <v-card>
        <v-card-title>
          Stream Information
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-text-field
              v-model="title"
              label="Stream Title"
              :rules="titleRule"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="dialog = false">Close</v-btn>
          <v-btn @click="newRoom()">Start Stream</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-card
      v-for="room in roomList"
      :key="room.id"
      class="mx-6 mb-3"
      elevation="12"
      @click="$router.push(`/lobby/${room.id}`)"
    >
      <v-img
        :aspect-ratio="16 / 9"
        src="https://img.youtube.com/vi/bTqVqk7FSmY/maxresdefault.jpg"
      />
      <!-- <v-avatar color="primary" size="48"></v-avatar> -->
      <v-card-title class="pa-3">{{ room.title }}</v-card-title>
      <v-card-subtitle class="px-3 pb-3">
        {{ room.hostName }} · {{ room.viewers }} viewers
      </v-card-subtitle>
      <v-btn dark x-small elevation="3" class="live-btn" color="like">
        Live
      </v-btn>
    </v-card>
  </v-container>
</template>

<script>
import firebase from 'firebase/app'
import { db } from '@/components/firebaseInit'
export default {
  name: 'Lobby',
  data() {
    return {
      dialog: false,
      valid: true,
      title: '',
      titleRule: [
        v => !!v || 'Please type the title',
        v => v.length <= 18 || 'The title should be less than 18 characters'
      ],
      roomList: [],
      unsubscribe: null
    }
  },
  computed: {
    currentUser() {
      return firebase.auth().currentUser
    }
  },
  created() {
    try {
      this.unsubscribe = db
        .collection('lobby')
        .orderBy('timeCreated', 'desc')
        .onSnapshot(snapshot => {
          this.roomList = snapshot.docs.map(doc => {
            return {
              id: doc.id,
              ...doc.data()
            }
          })
        })
    } catch (e) {
      console.log(e)
    }
  },
  destroyed() {
    this.unsubscribe()
  },
  methods: {
    async newRoom() {
      if (!this.$refs.form.validate()) return
      this.dialog = false
      try {
        const newRoom = {
          title: this.title,
          hostName: firebase.auth().currentUser.displayName,
          hostUid: firebase.auth().currentUser.uid,
          banListUid: [],
          timeCreated: firebase.firestore.FieldValue.serverTimestamp(),
          viewers: 0,
          start: false
        }
        const docRef = await db.collection('lobby').add(newRoom)

        this.$router.push(`/lobby/${docRef.id}`)
      } catch (e) {
        console.log(e)
      }
    },
    toTime(room) {
      if (room.timeCreated !== null) {
        const date = room.timeCreated.toDate()
        return `${date.getMonth() +
          1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
      }
    },
    async signOut() {
      try {
        await firebase.auth().signOut()
        this.$router.push('/login')
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import 'src/styles/variables.scss';
.lobby {
  display: grid;
  grid-template-rows: 15vh;
}
.space {
  height: 15vh;
  color: white;
  background-color: transparent;
  text-align: center;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}
.parallax {
  z-index: 0;
  position: absolute;
  width: 100%;
  height: 30vh;
  background-color: #3e7495;
  // background-color: transparent;
}
.float-btn {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 10;
}
.live-btn {
  pointer-events: none;
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 1;
}
</style>
