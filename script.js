/*
 * Sweeply Cleaner Sign‑up – Client‑side behaviour
 *
 * Handles form submission by storing data locally and showing a thank‑you message.
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const thankYou = document.getElementById('thank-you');

    form.addEventListener('submit', event => {
        event.preventDefault();
        // Gather form data into an object
        const data = {};
        const formData = new FormData(form);
        formData.forEach((value, key) => {
            // Checkboxes that are unchecked won't appear in FormData, so default to false
            data[key] = value;
        });
        // For unchecked checkboxes explicitly set to false
        data.dbs = form.querySelector('#dbs').checked;
        data.supplies = form.querySelector('#supplies').checked;
        // Persist submissions in localStorage as a simple stand‑in for an API
        const submissionsKey = 'sweeply-submissions';
        const stored = JSON.parse(localStorage.getItem(submissionsKey) || '[]');
        stored.push(data);
        localStorage.setItem(submissionsKey, JSON.stringify(stored));
        // Hide the form and show thank you message
        form.style.display = 'none';
        thankYou.style.display = 'block';
        // Optionally scroll to thank you message
        thankYou.scrollIntoView({ behavior: 'smooth' });
    });
});