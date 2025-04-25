// js/comment.js
document.addEventListener('DOMContentLoaded', () => {
  // ========== Настройка API_URL ==========
  // Если фронт и бэк на одном домене, можно оставить ''
  // или использовать window.location.origin, если бэк на том же хосте
  const API_URL = ''; // e.g. 'http://localhost:4000' или ''

  const token = localStorage.getItem('jwt');

  // ------------------
  // 1) Глобальные комментарии (index.html)
  // ------------------
  const globalForm = document.getElementById('commentForm');
  const globalList = document.getElementById('commentList');

  if (globalForm && globalList) {
    // Загрузка и рендер всех комментариев
    async function loadGlobal() {
      try {
        const res = await fetch(`${API_URL}/api/comments`);
        if (!res.ok) throw new Error(await res.text());
        const comments = await res.json();

        globalList.innerHTML = comments.map(c => {
          const date = new Date(c.created_at).toLocaleString('ru-RU', {
            day:    '2-digit',
            month:  '2-digit',
            year:   'numeric',
            hour:    '2-digit',
            minute:  '2-digit'
          });
          return `
            <div class="comment">
              <div class="comment-header">
                <span class="comment-author">${c.author}</span>
                <span class="comment-date">${date}</span>
              </div>
              <p class="comment-text">${c.content}</p>
            </div>
          `;
        }).join('');
      } catch (err) {
        console.error(err);
        globalList.innerHTML = `<p class="error">Не удалось загрузить комментарии.</p>`;
      }
    }

    // Отправка нового глобального комментария
    globalForm.addEventListener('submit', async e => {
      e.preventDefault();
      if (!token) {
        alert('Пожалуйста, войдите, чтобы оставить комментарий.');
        return location.href = 'auth.html';
      }
      const textarea = document.getElementById('commentText');
      const content  = textarea.value.trim();
      if (!content) return;

      try {
        const res = await fetch(`${API_URL}/api/comments`, {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ meme_id: null, content })
        });
        if (!res.ok) throw new Error(await res.text());
        textarea.value = '';
        await loadGlobal();
      } catch (err) {
        console.error(err);
        alert('Ошибка при отправке: ' + err.message);
      }
    });

    // Инициализация
    loadGlobal();
  }

  // ------------------
  // 2) Комментарии к конкретному мему (meme.html)
  // ------------------
  document.querySelectorAll('.comment-form').forEach(form => {
    const memeId   = form.dataset.memeId;
    const block    = form.closest('.comments-block');
    const list     = block.querySelector('.comment-list');
    const textarea = form.querySelector('textarea');

    // Загрузка и рендер комментариев для данного memeId
    async function loadForMeme() {
      try {
        const res = await fetch(`${API_URL}/api/comments/${memeId}`);
        if (!res.ok) throw new Error(await res.text());
        const comments = await res.json();

        list.innerHTML = comments.map(c => {
          const date = new Date(c.created_at).toLocaleString('ru-RU', {
            day:    '2-digit',
            month:  '2-digit',
            year:   'numeric',
            hour:    '2-digit',
            minute:  '2-digit'
          });
          return `
            <div class="comment">
              <div class="comment-header">
                <span class="comment-author">${c.author}</span>
                <span class="comment-date">${date}</span>
              </div>
              <p class="comment-text">${c.content}</p>
            </div>
          `;
        }).join('');
      } catch (err) {
        console.error(err);
        list.innerHTML = `<p class="error">Не удалось загрузить комментарии.</p>`;
      }
    }

    // Отправка комментария к этому мему
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!token) {
        alert('Пожалуйста, войдите, чтобы оставить комментарий.');
        return location.href = 'auth.html';
      }
      const content = textarea.value.trim();
      if (!content) return;

      try {
        const res = await fetch(`${API_URL}/api/comments`, {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ meme_id: memeId, content })
        });
        if (!res.ok) throw new Error(await res.text());
        textarea.value = '';
        await loadForMeme();
      } catch (err) {
        console.error(err);
        alert('Ошибка при отправке: ' + err.message);
      }
    });

    // Инициализация
    loadForMeme();
  });
});



