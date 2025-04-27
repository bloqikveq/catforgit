// js/scroll.js
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('toTop');
    window.addEventListener('scroll', () => {
      btn.classList.toggle('show', window.scrollY > 200);
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  });
  