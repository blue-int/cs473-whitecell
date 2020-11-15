import * as functions from 'firebase-functions'
import admin = require('firebase-admin')
admin.initializeApp()
const db = admin.firestore()

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info('Hello logs!', { structuredData: true })
//   response.send('Hello from Firebase!')
// })

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
      throw new functions.https.HttpsError(e.code, e.message, e.details)
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
      throw new functions.https.HttpsError(e.code, e.message, e.details)
    }
  })
