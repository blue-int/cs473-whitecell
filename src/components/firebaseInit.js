import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/functions'
import firebaseConfig from './firebaseConfig'
const firebaseApp = firebase.initializeApp(firebaseConfig)
const auth = firebaseApp.auth()
const db = firebaseApp.firestore()
const functions = firebaseApp.functions('asia-northeast3')
// functions.useFunctionsEmulator('http://localhost:5003')
export { auth, db, functions }
