const btn=document.getElementById('toTop');
window.addEventListener('scroll',()=>{ btn.style.display=window.scrollY>200?'block':'none'; });
btn.onclick=()=>window.scrollTo({top:0,behavior:'smooth'});