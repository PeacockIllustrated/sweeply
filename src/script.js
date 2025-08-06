// script.js

// Import the database connection and firestore functions from our firebase.js file
import { db, collection, addDoc, serverTimestamp } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('applyForm');
  const thanks = document.getElementById('thanks');
  if (!form || !thanks) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Disable the button to prevent multiple submissions
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    // Get the form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      // Add the new application to the 'applications' collection in Firestore
      const docRef = await addDoc(collection(db, 'applications'), {
        ...data,
        rate: data.rate ? Number(data.rate) : null, // Ensure rate is a number
        submitted_at: serverTimestamp() // Use the server's timestamp for accuracy
      });

      console.log("Document written with ID: ", docRef.id);

      // Show the 'thank you' message
      form.style.display = 'none';
      thanks.style.display = 'block';

    } catch (err) {
      console.error("Error adding document: ", err);
      alert('There was an error submitting your application. Please try again.');
      // Re-enable the button if submission fails
      submitButton.disabled = false;
      submitButton.textContent = 'Submit your application';
    }
  });
});