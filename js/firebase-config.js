/**
 * Firebase Configuration and Initialization
 * Handles Firebase setup and exports db and auth instances
 * 
 * SECURITY NOTE: This file should be in .gitignore
 */

const firebaseConfig = {
  apiKey: "AIzaSyDiFIVoHkp5irRezerYuBX1ejw9_458J2I",
  authDomain: "book-library-95091.firebaseapp.com",
  projectId: "book-library-95091",
  storageBucket: "book-library-95091.firebasestorage.app",
  messagingSenderId: "976306987324",
  appId: "1:976306987324:web:11eed18d2f364b1f45be39",
  measurementId: "G-LF2EB3DX6K"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
var auth = firebase.auth();
