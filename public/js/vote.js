// js/vote.js

document.addEventListener('DOMContentLoaded', () => {
  const forms   = document.querySelectorAll('.voteForm');
  const topList = document.getElementById('topList');
  const API_URL = 'http://localhost:4000';  // адрес вашего Express-сервера

  // Расширения для картинок по идентификатору
  const exts = {
    luna:       'gif',
    oiia:       'gif',
    wiwiwi:     'gif',
    stress:     'gif',
    chipichapa: 'gif',
    popcat:     'gif',
    vibingcat:  'gif',
    maxwellcat: 'gif',
    keyboardcat:'gif',
    floppa:     'jpg',
    smiling:    'jpg'
  };

  // Навешиваем обработчики на формы голосования
  forms.forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const meme_id = form.dataset.id;
      const rating  = +form.querySelector('select').value;
      const token   = localStorage.getItem('jwt');

      if (!token) {
        alert('Пожалуйста, войдите в аккаунт, чтобы голосовать.');
        return location.href = 'auth.html';
      }

      try {
        const res = await fetch(`${API_URL}/api/vote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ meme_id, rating })
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(err || res.statusText);
        }

        alert('Ваш голос учтён!');
        if (topList) await renderTop();
      } catch (err) {
        console.error('Ошибка при голосовании:', err);
        alert('Ошибка при голосовании: ' + err.message);
      }
    });
  });

  // При загрузке страницы отрисовываем Топ-5, если контейнер есть
  if (topList) renderTop();

  async function renderTop() {
    try {
      const res = await fetch(`${API_URL}/api/top5`);
      if (!res.ok) throw new Error(res.statusText);
      const top = await res.json(); // [{ meme_id, avg_rating }, …]

      topList.innerHTML = top.map(({ meme_id, avg_rating }) => {
        // приводим avg_rating к числу
        const avg = parseFloat(avg_rating);
        const ext   = exts[meme_id] || 'jpg';
        const title = meme_id.charAt(0).toUpperCase() + meme_id.slice(1);
        return `
          <div class="meme-card">
            <a href="meme.html#${meme_id}">
              <div class="img-container">
                <img src="img/${meme_id}.${ext}" alt="${title}">
              </div>
              <p>
                ${title}
                <span class="avg-rating">(avg: ${avg.toFixed(1)})</span>
              </p>
            </a>
          </div>
        `;
      }).join('');
    } catch (err) {
      console.error('Не удалось загрузить Топ-5 мемов:', err);
      topList.innerHTML = '<p class="no-votes">Ошибка загрузки Топ-5 мемов.</p>';
    }
  }
});

