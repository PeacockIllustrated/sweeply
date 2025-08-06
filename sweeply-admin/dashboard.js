// dashboard.js - FULLY UPDATED

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, setDoc, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- Firebase Config (as before) ---
const firebaseConfig = {
  apiKey: "AIzaSyDqId2prkCcVHjSZEfzjDYWlAtWOED8UIM",
  authDomain: "sweeply-1bcda.firebaseapp.com",
  projectId: "sweeply-1bcda",
  storageBucket: "sweeply-1bcda.firebasestorage.app",
  messagingSenderId: "58209657479",
  appId: "1:58209657479:web:8f3b54b7558d3e88b54e22",
  measurementId: "G-KBPXBH8T9D"
};

// --- Initialize Firebase Services ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- DOM Elements ---
const mainContent = document.getElementById('main-content');
const adminEmailSpan = document.getElementById('admin-email');
const signOutBtn = document.getElementById('signOutBtn');

// --- Gatekeeper: Check Authentication State ---
onAuthStateChanged(auth, (user) => {
  if (user) {
    adminEmailSpan.textContent = user.email;
    loadView('applications'); // Load initial view
  } else {
    window.location.href = 'login.html';
  }
});

// --- Sign Out Logic ---
signOutBtn.addEventListener('click', () => signOut(auth));

// --- View Navigation ---
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.nav-link.active').classList.remove('active');
    e.target.classList.add('active');
    loadView(e.target.dataset.view);
  });
});

function loadView(viewName) {
  mainContent.innerHTML = `<h2>Loading ${viewName}...</h2>`;
  switch (viewName) {
    case 'applications': loadApplications(); break;
    case 'cleaners': loadCleaners(); break;
    default: mainContent.innerHTML = `<h2>${viewName.charAt(0).toUpperCase() + viewName.slice(1)}</h2><p>Functionality coming soon.</p>`;
  }
}

// --- Data Fetching & Rendering ---
async function loadApplications() {
  try {
    const q = query(collection(db, "applications"), where("status", "not-in", ["approved", "rejected"]));
    const querySnapshot = await getDocs(q);
    
    let html = '<h2>Pending Applications</h2><table><thead><tr><th>Name</th><th>Email</th><th>Postcode</th><th>Submitted</th><th>Actions</th></tr></thead><tbody>';

    if (querySnapshot.empty) {
      html += '<tr><td colspan="5">No pending applications found.</td></tr>';
    } else {
      querySnapshot.forEach((doc) => {
        const app = doc.data();
        const submittedDate = app.submitted_at?.toDate().toLocaleDateString() || 'N/A';
        html += `
          <tr data-id="${doc.id}">
            <td>${app.first_name || ''} ${app.last_name || ''}</td>
            <td>${app.email || ''}</td>
            <td>${app.postcode || ''}</td>
            <td>${submittedDate}</td>
            <td>
              <button class="btn-action approve">Approve</button>
              <button class="btn-action reject">Reject</button>
            </td>
          </tr>`;
      });
    }
    html += '</tbody></table>';
    mainContent.innerHTML = html;
  } catch (error) {
    console.error("Error loading applications:", error);
    mainContent.innerHTML = '<h2>Error</h2><p>Could not load applications. Check Firestore rules.</p>';
  }
}

async function loadCleaners() {
  try {
    const querySnapshot = await getDocs(collection(db, "cleaners"));
    let html = '<h2>Active Cleaners</h2><table><thead><tr><th>Name</th><th>Email</th><th>City</th><th>Status</th></tr></thead><tbody>';

    if (querySnapshot.empty) {
      html += '<tr><td colspan="4">No active cleaners found.</td></tr>';
    } else {
      querySnapshot.forEach((doc) => {
        const cleaner = doc.data();
        html += `
          <tr>
            <td>${cleaner.first_name || ''} ${cleaner.last_name || ''}</td>
            <td>${cleaner.email || ''}</td>
            <td>${cleaner.city || ''}</td>
            <td>${cleaner.status || 'active'}</td>
          </tr>`;
      });
    }
    html += '</tbody></table>';
    mainContent.innerHTML = html;
  } catch(error) {
    console.error("Error loading cleaners:", error);
    mainContent.innerHTML = '<h2>Error</h2><p>Could not load cleaners.</p>';
  }
}

// --- Event Delegation for Action Buttons ---
mainContent.addEventListener('click', async (e) => {
    const target = e.target;
    const row = target.closest('tr');
    if (!row || !row.dataset.id) return; 

    const docId = row.dataset.id;

    if (target.classList.contains('approve')) {
        target.disabled = true;
        await approveApplication(docId);
        target.disabled = false;
    } else if (target.classList.contains('reject')) {
        target.disabled = true;
        await rejectApplication(docId);
        target.disabled = false;
    }
});

// --- Action Functions ---
async function approveApplication(id) {
    console.log(`Approving application ${id}`);
    try {
        const appRef = doc(db, "applications", id);
        const appSnap = await getDoc(appRef);
        if (!appSnap.exists()) {
            throw new Error("Application not found!");
        }
        const appData = appSnap.data();

        const cleanerRef = doc(db, "cleaners", id); 
        await setDoc(cleanerRef, {
            first_name: appData.first_name || null,
            last_name: appData.last_name || null,
            email: appData.email || null,
            phone: appData.phone || null,
            postcode: appData.postcode || null,
            city: appData.city || null,
            experience: appData.experience || null,
            rate: Number(appData.rate) || 0,
            dbs: appData.dbs || null,
            supplies: appData.supplies || null,
            availability: appData.availability || null,
            status: 'active',
            avg_rating: 0,
            jobs_completed: 0,
            joined_at: new Date()
        });

        await updateDoc(appRef, { status: "approved" });

        console.log(`Successfully approved ${id} and created cleaner profile.`);
        loadApplications();
    } catch (error) {
        console.error("Error approving application:", error);
        alert("Could not approve application.");
    }
}

async function rejectApplication(id) {
    console.log(`Rejecting application ${id}`);
    try {
        const appRef = doc(db, "applications", id);
        await updateDoc(appRef, { status: "rejected" });
        loadApplications();
    } catch (error) {
        console.error("Error rejecting application:", error);
        alert("Could not reject application.");
    }
}
