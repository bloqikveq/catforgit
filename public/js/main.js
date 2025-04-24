// js/main.js
document.addEventListener('DOMContentLoaded', () => {
  // 1) Подсветка активного пункта меню
  const links = document.querySelectorAll('nav a');
  links.forEach(a => {
    if (a.href === location.href) a.classList.add('active');
    a.addEventListener('click', () => localStorage.setItem('last', a.href));
  });
  const last = localStorage.getItem('last');
  if (last) {
    links.forEach(a => {
      if (a.href === last) a.classList.add('active');
    });
  }

  // 2) Динамический блок авторизации
  const navAuth = document.getElementById('nav-auth');
  const token   = localStorage.getItem('jwt');
  const email   = localStorage.getItem('currentUser');

  if (token && email) {
    // если залогинен — показываем email и кнопку "Выйти"
    navAuth.innerHTML = `
      <a href="profile.html" id="link-profile" class="auth-link">${email}</a>
      <button id="logoutBtn" style="margin-left:8px">Выйти</button>
    `;
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('jwt');
      localStorage.removeItem('currentUser');
      location.reload();
    });
  } else {
    // если не залогинен — показываем кнопку "Войти"
    navAuth.innerHTML = `<a href="auth.html" id="link-auth" class="auth-link">Войти</a>`;
  }
});
