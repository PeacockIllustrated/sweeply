// dashboard.js - FULLY UPDATED WITH CLEANER MANAGEMENT AND FIXES

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, setDoc, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- Firebase Config & Initialization ---
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
const db = getFirestore(app);

const mainContent = document.getElementById('main-content');
const adminEmailSpan = document.getElementById('admin-email');
const signOutBtn = document.getElementById('signOutBtn');

// --- Gatekeeper & Navigation Logic ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        adminEmailSpan.textContent = user.email;
        loadView('applications'); // Start on the applications page
    } else {
        window.location.href = 'login.html';
    }
});

signOutBtn.addEventListener('click', () => signOut(auth));

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.nav-link.active')?.classList.remove('active');
        e.target.classList.add('active');
        loadView(e.target.dataset.view);
    });
});

function loadView(viewName, docId = null) {
    mainContent.innerHTML = `<h2>Loading...</h2>`;
    switch (viewName) {
        case 'applications':
            docId ? loadApplicationDetail(docId) : loadApplicationsList();
            break;
        case 'cleaners':
            loadCleaners();
            break;
        default:
            mainContent.innerHTML = `<h2>${viewName.charAt(0).toUpperCase() + viewName.slice(1)}</h2><p>Functionality coming soon.</p>`;
    }
}

// --- List View Functions ---
async function loadApplicationsList() {
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
                html += `<tr data-id="${doc.id}"><td>${app.first_name || ''} ${app.last_name || ''}</td><td>${app.email || ''}</td><td>${app.postcode || ''}</td><td>${submittedDate}</td><td><button class="btn-action view">View</button></td></tr>`;
            });
        }
        html += '</tbody></table>';
        mainContent.innerHTML = html;
    } catch (error) {
        console.error("Error loading applications:", error);
        mainContent.innerHTML = '<h2>Error</h2><p>Could not load applications. Check your Firestore rules.</p>';
    }
}

async function loadCleaners() {
    try {
        const querySnapshot = await getDocs(collection(db, "cleaners"));
        let html = '<h2>Cleaner Management</h2><table><thead><tr><th>Name</th><th>Email</th><th>City</th><th>Status</th></tr></thead><tbody>';
        if (querySnapshot.empty) {
            html += '<tr><td colspan="4">No active cleaners found. Approve an application first.</td></tr>';
        } else {
            querySnapshot.forEach((doc) => {
                const cleaner = doc.data();
                html += `
                    <tr>
                        <td>${cleaner.first_name || ''} ${cleaner.last_name || ''}</td>
                        <td>${cleaner.email || ''}</td>
                        <td>${cleaner.city || ''}</td>
                        <td>
                            <select class="status-select" data-id="${doc.id}">
                                <option value="active" ${cleaner.status === 'active' ? 'selected' : ''}>Active</option>
                                <option value="paused" ${cleaner.status === 'paused' ? 'selected' : ''}>Paused</option>
                                <option value="suspended" ${cleaner.status === 'suspended' ? 'selected' : ''}>Suspended</option>
                            </select>
                        </td>
                    </tr>`;
            });
        }
        html += '</tbody></table>';
        mainContent.innerHTML = html;
    } catch (error) {
        console.error("Error loading cleaners:", error);
        mainContent.innerHTML = '<h2>Error</h2><p>Could not load cleaners.</p>';
    }
}


// --- Detail View Function ---
async function loadApplicationDetail(docId) {
    try {
        const docRef = doc(db, "applications", docId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) { throw new Error("Application not found"); }
        const app = docSnap.data();
        const fullName = `${app.first_name || ''} ${app.last_name || ''}`;
        const renderAvailability = (availability) => { if (!availability || typeof availability !== 'object') { return '<p>No availability data provided.</p>'; } const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']; let html = '<ul class="availability-display">'; days.forEach(day => { const slots = availability[day]; html += `<li><span class="day">${day}</span>`; if (slots && slots.length > 0) { html += `<div class="slots">${slots.map(s => `<span class="slot">${s}</span>`).join('')}</div>`; } else { html += `<span class="none">Unavailable</span>`; } html += '</li>'; }); html += '</ul>'; return html; };
        const html = `<div class="detail-view-header"><div><h2>Application: ${fullName}</h2><p class="muted">Submitted: ${app.submitted_at?.toDate().toLocaleString() || 'N/A'}</p></div><div><button class="btn-action approve" data-id="${docId}">Approve</button><button class="btn-action reject" data-id="${docId}">Reject</button></div></div><button class="back-button">← Back to List</button><div class="detail-grid"><div class="detail-card"><h3>Contact & Location</h3><p><strong>Email:</strong> ${app.email || 'N/A'}</p><p><strong>Phone:</strong> ${app.phone || 'N/A'}</p><p><strong>Postcode:</strong> ${app.postcode || 'N/A'}</p><p><strong>City:</strong> ${app.city || 'N/A'}</p></div><div class="detail-card"><h3>Experience & Preferences</h3><p><strong>Experience:</strong> ${app.experience || 'N/A'}</p><p><strong>Rate (£/hr):</strong> ${app.rate || 'N/A'}</p><p><strong>DBS Status:</strong> ${app.dbs || 'N/A'}</p><p><strong>Supplies:</strong> ${app.supplies || 'N/A'}</p></div><div class="detail-card" style="grid-column: 1 / -1;"><h3>Availability</h3>${renderAvailability(app.availability)}</div></div>`;
        mainContent.innerHTML = html;
    } catch (error) {
        console.error("Error loading application detail:", error);
        mainContent.innerHTML = `<h2>Error</h2><p>Could not load details for application ${docId}.</p>`;
    }
}

// --- Event Delegation ---
mainContent.addEventListener('click', async (e) => {
    const target = e.target;
    if (target.classList.contains('back-button')) { loadView('applications'); return; }
    const docId = target.dataset.id || target.closest('tr')?.dataset.id;
    if (!docId) return;

    if (target.classList.contains('view')) { loadView('applications', docId); } 
    else if (target.classList.contains('approve')) { target.disabled = true; await approveApplication(docId); } 
    else if (target.classList.contains('reject')) { target.disabled = true; await rejectApplication(docId); }
});

mainContent.addEventListener('change', async (e) => {
    const target = e.target;
    if (target.classList.contains('status-select')) {
        const cleanerId = target.dataset.id;
        const newStatus = target.value;
        await updateCleanerStatus(cleanerId, newStatus);
    }
});


// --- Action Functions ---
async function approveApplication(id) {
    console.log(`Approving application ${id}`);
    try {
        const appRef = doc(db, "applications", id);
        const appSnap = await getDoc(appRef);
        if (!appSnap.exists()) { throw new Error("Application not found!"); }
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
            availability: appData.availability || {},
            status: 'active',
            avg_rating: 0,
            jobs_completed: 0,
            joined_at: new Date()
        });

        await updateDoc(appRef, { status: "approved" });
        console.log(`Successfully approved ${id} and created cleaner profile.`);
        loadApplicationsList();
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
        loadApplicationsList();
    } catch (error) {
        console.error("Error rejecting application:", error);
        alert("Could not reject application.");
    }
}

async function updateCleanerStatus(cleanerId, newStatus) {
    console.log(`Updating cleaner ${cleanerId} to status: ${newStatus}`);
    const cleanerRef = doc(db, "cleaners", cleanerId);
    try {
        await updateDoc(cleanerRef, { status: newStatus });
        // You could add a small success pop-up/toast notification here in the future
    } catch (error) {
        console.error("Error updating cleaner status:", error);
        alert("Failed to update cleaner status. Please try again.");
    }
}
