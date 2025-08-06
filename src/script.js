// script.js (PUBLIC SITE) - FULLY UPDATED

import { db, collection, addDoc, serverTimestamp } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('applyForm');
  const thanks = document.getElementById('thanks');
  if (!form || !thanks) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // --- NEW LOGIC FOR AVAILABILITY ---
    // 1. Create a structured object for availability
    const availability = {
      mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: []
    };

    // 2. Process all form entries to populate the availability object
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('availability_')) {
        const parts = key.split('_'); // e.g., ['availability', 'mon', 'morning']
        const day = parts[1];
        const time = parts[2];
        if (availability[day]) {
          availability[day].push(time);
        }
        // Delete the raw checkbox key from the main data object
        delete data[key];
      }
    }
    
    // 3. Add the clean, structured availability object to our data
    data.availability = availability;
    // --- END NEW LOGIC ---

    try {
      await addDoc(collection(db, 'applications'), {
        ...data,
        rate: data.rate ? Number(data.rate) : null,
        status: 'pending', // Add a status field by default for new applications
        submitted_at: serverTimestamp()
      });

      form.style.display = 'none';
      thanks.style.display = 'block';

    } catch (err) {
      console.error("Error adding document: ", err);
      alert('There was an error submitting your application. Please try again.');
      submitButton.disabled = false;
      submitButton.textContent = 'Submit your application';
    }
  });
});
