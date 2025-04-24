// js/api.js

// Ваш ключ GIPHY
const GIPHY_KEY = 'xKBVVKXrHza7wxvJFptkCAqWSLBYYOij';

// Кнопка «Случайный мем» на странице meme.html
const btnRand = document.getElementById('randomMeme');
if (btnRand) {
  btnRand.onclick = async () => {
    try {
      const res = await fetch(
        `https://api.giphy.com/v1/gifs/random?api_key=${GIPHY_KEY}&tag=cat`
      );
      if (!res.ok) throw new Error(`Ошибка GIPHY: ${res.status}`);
      const { data } = await res.json();
      const url = data.images.fixed_height.url;
      document.getElementById('memeContainer').innerHTML =
        `<img src="${url}" alt="Random cat meme">`;
    } catch (err) {
      console.error(err);
      alert('Не удалось загрузить мем. Попробуйте позже.');
    }
  };
}

// Leaflet-карта в contacts.html
window.addEventListener('DOMContentLoaded', () => {
  const mapEl = document.getElementById('map');
  if (!mapEl) return;

  // Инициализация карты
  const map = L.map('map').setView([55.76, 37.64], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  L.marker([59.916365, 30.315760])
    .addTo(map)
    .bindPopup(`<strong>БГТУ «ВОЕНМЕХ» им. Д. Ф. Устинова</strong><br>
                190005, Санкт-Петербург<br>
                ул. 1-я Красноармейская, д. 1`)
    .openPopup();
});
