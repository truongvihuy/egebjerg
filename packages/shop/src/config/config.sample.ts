import firebase from 'firebase/app';
import 'firebase/database';

export const TIME_ZONE = 'Europe/Copenhagen';
let firebaseClient = undefined;
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBWlGr-UqBrV5QNVAmNvMh9rsEoK5LagcM",
  authDomain: "test-3f17e.firebaseapp.com",
  databaseURL: "https://test-3f17e-default-rtdb.firebaseio.com",
  projectId: "test-3f17e",
  storageBucket: "test-3f17e.appspot.com",
  messagingSenderId: "570579904067",
  appId: "1:570579904067:web:482825e5fd05f51329d6f6",
  measurementId: "G-6CMDS7PKG5"
}

export const THUMBOR_SERVER_URL = 'http://img.egebjerg.local';

export const initFirebase = () => {
  if (firebaseClient) {
    return firebaseClient;
  } else {
    try {
      firebase.initializeApp(FIREBASE_CONFIG);
    } catch (err) {
      if (!/already exists/.test(err.message)) {
        console.error('Firebase initialization error', err.stack)
      }

      return null;
    }
    return firebase;
  }
}
