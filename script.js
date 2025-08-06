// Sweeply cleaner sign-up: local-only submit handler (swap to real API later)
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('applyForm');
  const thanks = document.getElementById('thanks');
  if (!form || !thanks) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const key = 'sweeplyApplicants';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.push({ ...data, submitted_at: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(list));
    form.style.display = 'none';
    thanks.style.display = 'block';
    // TODO: replace with your endpoint
    // fetch('/api/apply', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
  });
});
