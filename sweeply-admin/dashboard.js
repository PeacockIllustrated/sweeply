import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Use the SAME firebaseConfig as before
const firebaseConfig = {
  apiKey: "AIzaSyDqId2prkCcVHjSZEfzjDYWlAtWOED8UIM",
  authDomain: "sweeply-1bcda.firebaseapp.com",
  projectId: "sweeply-1bcda",
  storageBucket: "sweeply-1bcda.firebasestorage.app",
  messagingSenderId: "58209657479",
  appId: "1:58209657479:web:8f3b54b7558d3e88b54e22",
  measurementId: "G-KBPXBH8T9D"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const mainContent = document.getElementById('main-content');
const adminEmailSpan = document.getElementById('admin-email');
const signOutBtn = document.getElementById('signOutBtn');

// --- Gatekeeper: Check Authentication State ---
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, stay on the page and load initial data.
    console.log('Admin user authenticated:', user.email);
    adminEmailSpan.textContent = user.email;
    loadView('applications'); // Load applications view by default
  } else {
    // No user is signed in. Redirect to login page.
    console.log('User not authenticated. Redirecting to login.');
    window.location.href = 'login.html';
  }
});

// --- Sign Out Logic ---
signOutBtn.addEventListener('click', () => {
  signOut(auth).then(() => {
    console.log('Sign-out successful.');
    window.location.href = 'login.html';
  }).catch((error) => {
    console.error('Sign-out error:', error);
  });
});

// --- View Loading Logic ---
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');
        const viewName = e.target.getAttribute('data-view');
        loadView(viewName);
    });
});

function loadView(viewName) {
    mainContent.innerHTML = `<h2>Loading ${viewName}...</h2>`;
    switch(viewName) {
        case 'applications':
            loadApplications();
            break;
        case 'cleaners':
            mainContent.innerHTML = '<h2>Active Cleaners</h2><p>Functionality to view cleaners coming soon.</p>';
            break;
        case 'clients':
            mainContent.innerHTML = '<h2>Clients</h2><p>Functionality to view clients coming soon.</p>';
            break;
        case 'bookings':
            mainContent.innerHTML = '<h2>Bookings</h2><p>Functionality to view bookings coming soon.</p>';
            break;
    }
}

// --- Data Fetching: Applications Example ---
async function loadApplications() {
    try {
        const querySnapshot = await getDocs(collection(db, "applications"));
        let applicationsHTML = '<h2>Applications</h2>';
        applicationsHTML += '<table><thead><tr><th>Name</th><th>Email</th><th>Postcode</th><th>Submitted</th></tr></thead><tbody>';

        if(querySnapshot.empty) {
            applicationsHTML += '<tr><td colspan="4">No applications found.</td></tr>';
        } else {
            querySnapshot.forEach((doc) => {
                const app = doc.data();
                const submittedDate = app.submitted_at ? app.submitted_at.toDate().toLocaleDateString() : 'N/A';
                applicationsHTML += `
                    <tr>
                        <td>${app.first_name || ''} ${app.last_name || ''}</td>
                        <td>${app.email || ''}</td>
                        <td>${app.postcode || ''}</td>
                        <td>${submittedDate}</td>
                    </tr>
                `;
            });
        }
        
        applicationsHTML += '</tbody></table>';
        mainContent.innerHTML = applicationsHTML;

    } catch(error) {
        console.error("Error loading applications: ", error);
        mainContent.innerHTML = '<h2>Error</h2><p>Could not load applications.</p>';
    }
}