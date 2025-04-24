document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.meme-nav a').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const id = link.getAttribute('href').substring(1);
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          history.replaceState(null, '', `#${id}`);
        }
      });
    });
  
    const hash = location.hash.substring(1);
    if (hash) {
      const target = document.getElementById(hash);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  });