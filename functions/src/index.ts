import * as functions from 'firebase-functions'
import admin = require('firebase-admin')
admin.initializeApp()
const db = admin.firestore()
const firebase_tools = require('firebase-tools')

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info('Hello logs!', { structuredData: true })
//   response.send('Hello from Firebase!')
// })

export const roomDeleted = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .region('asia-northeast3')
  .firestore.document('/lobby/{roomId}')
  .onDelete(async (snap, context) => {
    try {
      // Run a recursive delete on the given document or collection path.
      // The 'token' must be set in the functions config, and can be generated
      // at the command line by running 'firebase login:ci'.
      const chats = snap.ref.collection('chatList').path
      const viewers = snap.ref.collection('viewers').path
      console.log(`deleting two collections ${chats}, ${viewers}`)
      return Promise.all([
        firebase_tools.firestore.delete(chats, {
          project: process.env.GCLOUD_PROJECT,
          recursive: true,
          yes: true,
          token: functions.config().fb.token
        }),
        firebase_tools.firestore.delete(viewers, {
          project: process.env.GCLOUD_PROJECT,
          recursive: true,
          yes: true,
          token: functions.config().fb.token
        })
      ])
    } catch (e) {
      return console.error(e)
    }
  })

export const userCreated = functions
  .region('asia-northeast3')
  .auth.user()
  .onCreate(async user => {
    try {
      const displayName = user.displayName
      return db
        .collection('users')
        .doc(user.uid)
        .set({
          displayName: displayName,
          email: user.email,
          photoURL: user.photoURL
        })
    } catch (e) {
      return console.error(e)
    }
  })

export const userDeleted = functions
  .region('asia-northeast3')
  .auth.user()
  .onDelete(user => {
    try {
      return db
        .collection('users')
        .doc(user.uid)
        .delete()
    } catch (e) {
      return console.error(e)
    }
  })
