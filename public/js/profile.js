// js/profile.js
document.addEventListener('DOMContentLoaded', () => {
    const API     = 'http://localhost:4000';
    const token   = localStorage.getItem('jwt');
    const email   = localStorage.getItem('currentUser');
    const msgElem = document.getElementById('changePwdMsg');
    const emailEl = document.getElementById('user-email');
  
    // если не залогинен — редирект
    if (!token || !email) {
      return location.href = 'auth.html';
    }
  
    // подставляем email
    emailEl.textContent = email;
  
    // обработка формы смены пароля
    document.getElementById('changePwdForm').addEventListener('submit', async e => {
      e.preventDefault();
      msgElem.textContent = '';
      const oldPassword = document.getElementById('oldPwd').value;
      const newPassword = document.getElementById('newPwd').value;
  
      try {
        const res = await fetch(`${API}/api/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ oldPassword, newPassword })
        });
  
        if (res.ok) {
          msgElem.style.color = 'green';
          msgElem.textContent = 'Пароль успешно обновлён';
          e.target.reset();
        } else {
          const text = await res.text();
          msgElem.style.color = 'red';
          msgElem.textContent = text || 'Ошибка при смене пароля';
        }
      } catch (err) {
        console.error(err);
        msgElem.style.color = 'red';
        msgElem.textContent = 'Ошибка сети, попробуйте позже.';
      }
    });
  });
  