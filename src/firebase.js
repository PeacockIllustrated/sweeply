// firebase.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqId2prkCcVHjSZEfzjDYWlAtWOED8UIM",
  authDomain: "sweeply-1bcda.firebaseapp.com",
  projectId: "sweeply-1bcda",
  storageBucket: "sweeply-1bcda.firebasestorage.app",
  messagingSenderId: "58209657479",
  appId: "1:58209657479:web:8f3b54b7558d3e88b54e22",
  measurementId: "G-KBPXBH8T9D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Initialize Firestore

// Export the functions we'll need in our main script
export { db, collection, addDoc, serverTimestamp };