// js/auth.js
document.addEventListener('DOMContentLoaded', () => {
  const API_URL      = ''; // пусто = текущий хост, чтобы не было проблем при деплое
  const loginForm    = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const showLoginBtn = document.getElementById('showLogin');
  const showRegBtn   = document.getElementById('showRegister');
  const msgElem      = document.getElementById('authMessage');

  // Переключение между формами
  function switchForm(isLogin) {
    showLoginBtn .classList.toggle('active', isLogin);
    showRegBtn   .classList.toggle('active', !isLogin);
    loginForm    .classList.toggle('active', isLogin);
    registerForm .classList.toggle('active', !isLogin);
    msgElem.textContent = '';
  }
  showLoginBtn.addEventListener('click', () => switchForm(true));
  showRegBtn  .addEventListener('click', () => switchForm(false));

  // — ЛОГИН —
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const pwd   = document.getElementById('loginPassword').value;

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pwd })
      });
      if (res.status === 404) {
        if (confirm('Пользователь не найден. Зарегистрироваться?')) {
          document.getElementById('registerEmail').value = email;
          switchForm(false);
        }
        return;
      }
      if (res.status === 401) {
        msgElem.textContent = 'Неверный пароль';
        return;
      }
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || res.statusText);
      }

      const { token } = await res.json();
      localStorage.setItem('jwt', token);
      localStorage.setItem('currentUser', email);
      // переходим на главную
      location.href = 'index.html';
    } catch (err) {
      console.error(err);
      msgElem.textContent = 'Ошибка при входе: ' + err.message;
    }
  });

  // — РЕГИСТРАЦИЯ —
  registerForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value.trim();
    const pwd1  = document.getElementById('registerPassword').value;
    const pwd2  = document.getElementById('registerPassword2').value;

    if (pwd1 !== pwd2) {
      msgElem.textContent = 'Пароли не совпадают';
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pwd1 })
      });
      if (res.status === 409) {
        msgElem.textContent = 'Пользователь с таким email уже существует';
        return;
      }
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || res.statusText);
      }

      alert('Регистрация прошла успешно! Теперь войдите в систему.');
      switchForm(true);
      document.getElementById('loginEmail').value = email;
      registerForm.reset();
    } catch (err) {
      console.error(err);
      msgElem.textContent = 'Ошибка при регистрации: ' + err.message;
    }
  });
});



