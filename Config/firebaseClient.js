// This is for client-side Firebase operations (like signInWithEmailAndPassword)
// In Cloud Functions, we still need this for email/password authentication

const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');

// Firebase client configuration - get from Firebase Console > Project Settings
const firebaseConfig = {
  apiKey: "AIzaSyD4lwNw3wXS0dsqhBgKq7cDvZyZA5IEOuI", // Get from Firebase Console
  authDomain: "saadhvi-silks.firebaseapp.com",
  projectId: "saadhvi-silks",
  storageBucket: "saadhvi-silks.firebasestorage.app",
  messagingSenderId: "696011033583",
  appId: "1:696011033583:web:d32519d800ebf0570e041a"
};

// Initialize client app
const clientApp = initializeApp(firebaseConfig);
const clientAuth = getAuth(clientApp);

module.exports = {
  clientAuth,
  clientApp
};