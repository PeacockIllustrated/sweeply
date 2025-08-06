import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Use the SAME firebaseConfig from your public site's firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyDqId2prkCcVHjSZEfzjDYWlAtWOED8UIM",
  authDomain: "sweeply-1bcda.firebaseapp.com",
  projectId: "sweeply-1bcda",
  storageBucket: "sweeply-1bcda.firebasestorage.app",
  messagingSenderId: "58209657479",
  appId: "1:58209657479:web:8f3b54b7558d3e88b54e22",
  measurementId: "G-KBPXBH8T9D"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('error-message');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in successfully
      console.log('Login successful:', userCredential.user);
      window.location.href = 'dashboard.html'; // Redirect to the dashboard
    })
    .catch((error) => {
      errorMessage.textContent = 'Invalid email or password.';
      console.error('Login error:', error);
    });
});

// Add this new block of code in auth.js

const googleSignInBtn = document.getElementById('googleSignInBtn');
const provider = new GoogleAuthProvider();

googleSignInBtn.addEventListener('click', () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      console.log('Google sign-in successful:', user);
      window.location.href = 'dashboard.html'; // Redirect to dashboard
    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.error('Google sign-in error:', errorMessage);
      document.getElementById('error-message').textContent = 'Could not sign in with Google.';
    });
});
