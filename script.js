// Sweeply cleaner sign‑up form handler
// This script listens for form submission, stores the data locally and
// displays a thank‑you message. Replace the placeholder endpoint with
// real backend integration when deploying.

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('applyForm');
  const thanks = document.getElementById('thanks');
  if (!form || !thanks) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    // Persist the submission in local storage as a stand‑in for a real DB
    const key = 'sweeplyApplicants';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.push(Object.assign({}, data, { submitted_at: new Date().toISOString() }));
    localStorage.setItem(key, JSON.stringify(list));
    // Hide the form and show thank you state
    form.style.display = 'none';
    thanks.style.display = 'block';
    // Example: send data to backend (uncomment and replace YOUR_ENDPOINT)
    // fetch('YOUR_ENDPOINT', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });
  });
});