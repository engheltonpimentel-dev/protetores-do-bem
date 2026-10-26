(() => {
  'use strict';
  const episodes = [
    {id: 'fogo-nao', title: 'Fogo Não!', video: 'videos/fogo-nao.mp4', poster: 'assets/images/fogo-nao.webp', description: 'Tuca e Pingo aprendem que uma pequena chama pode causar um grande perigo para a floresta.'},
    {id: 'rio-pede-socorro', title: 'O Rio Pede Socorro!', video: 'videos/rio-pede-socorro.mp4', poster: 'assets/images/rio-pede-socorro.webp', description: 'Com a ajuda de Naná, nossos amigos descobrem por que precisamos manter os rios limpos.'},
    {id: 'chuvas-intensas', title: 'Chuvas Intensas', video: 'videos/chuvas-intensas.mp4', poster: 'assets/images/chuvas-intensas.webp', description: 'Uma tempestade na floresta ensina cuidados importantes em dias de chuva forte.'},
    {id: 'pingo-que-diversao', title: 'Pingo, Que Diversão!', video: 'videos/pingo-que-diversao.mp4', poster: 'assets/images/pingo-que-diversao.webp', description: 'Bata palmas, pule e dance com o Pingo em um musical especial.'}
  ];
  const overlay = document.getElementById('watch-overlay');
  const player = document.getElementById('site-player');
  const watchTitle = document.getElementById('watch-title');
  const watchDescription = document.getElementById('watch-description');
  const downloadVideo = document.getElementById('download-video');
  const closeButton = document.getElementById('close-watch');
  const nextButton = document.getElementById('next-video');
  const copyButton = document.getElementById('copy-link');
  const searchInput = document.getElementById('episode-search');
  const episodeCards = [...document.querySelectorAll('.episode-card')];
  const chips = [...document.querySelectorAll('.filter-chip')];
  const empty = document.getElementById('no-episodes');
  const mobileMenu = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.primary-nav');
  let filter = 'todos';
  let currentIndex = -1;
  let lastFocus = null;

  function openVideo(id, options = {}) {
    const idx = episodes.findIndex(e => e.id === id);
    if (idx < 0) return;
    const entry = episodes[idx];
    if (!options.fromHash && overlay.hidden) lastFocus = document.activeElement;
    currentIndex = idx;
    player.pause();
    player.src = entry.video;
    player.poster = entry.poster;
    watchTitle.textContent = entry.title;
    watchDescription.textContent = entry.description;
    downloadVideo.href = entry.video;
    downloadVideo.download = entry.id + '.mp4';
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    closeButton.focus();
    if (location.hash !== '#video=' + id) history.replaceState(null, '', '#video=' + id);
    if (!options.noAutoPlay) {
      const promise = player.play();
      if (promise && promise.catch) promise.catch(() => {}); // browsers may block autoplay
    }
  }
  function closeVideo() {
    if (overlay.hidden) return;
    player.pause();
    player.removeAttribute('src');
    player.load();
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    currentIndex = -1;
    if (location.hash.startsWith('#video=')) history.replaceState(null, '', '#episodios');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }
  document.querySelectorAll('[data-play]').forEach(el => el.addEventListener('click', () => openVideo(el.dataset.play)));
  document.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeVideo));
  closeButton.addEventListener('click', closeVideo);
  nextButton.addEventListener('click', () => { if (currentIndex !== -1) openVideo(episodes[(currentIndex + 1) % episodes.length].id); });
  copyButton.addEventListener('click', async () => {
    const link = location.href;
    try { await navigator.clipboard.writeText(link); copyButton.textContent = '✓ Link copiado'; }
    catch (_) { window.prompt('Copie o link do vídeo:', link); }
    setTimeout(() => {copyButton.textContent = '⧉ Copiar link';}, 1800);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !overlay.hidden) closeVideo();
    if (!overlay.hidden && event.key === 'Tab') {
      const focusables = [...overlay.querySelectorAll('button,a,[controls]')].filter(el => !el.hasAttribute('disabled'));
      const start = focusables[0], end = focusables[focusables.length-1];
      if (event.shiftKey && document.activeElement === start) {event.preventDefault();end.focus();}
      else if (!event.shiftKey && document.activeElement === end) {event.preventDefault();start.focus();}
    }
  });
  function applyFilters() {
    const q = searchInput.value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
    let count = 0;
    for (const card of episodeCards) {
      const text = (card.dataset.title + ' ' + card.textContent).toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      const matches = (filter === 'todos' || card.dataset.category === filter) && text.includes(q);
      card.hidden = !matches;
      if(matches) count++;
    }
    empty.hidden = count > 0;
  }
  chips.forEach(chip => chip.addEventListener('click', () => {
    filter = chip.dataset.filter;
    chips.forEach(c => {const active=c===chip;c.classList.toggle('active',active);c.setAttribute('aria-pressed',String(active));});
    applyFilters();
  }));
  searchInput.addEventListener('input', applyFilters);
  document.getElementById('reset-filters').addEventListener('click', () => {
    searchInput.value=''; filter='todos'; chips.forEach(c=>{const active=c.dataset.filter==='todos';c.classList.toggle('active',active);c.setAttribute('aria-pressed',String(active));});applyFilters();searchInput.focus();
  });
  mobileMenu.addEventListener('click', () => {
    const expanded = mobileMenu.getAttribute('aria-expanded') === 'true';
    mobileMenu.setAttribute('aria-expanded', String(!expanded)); nav.classList.toggle('expanded', !expanded);
  });
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('expanded');mobileMenu.setAttribute('aria-expanded','false');}));
  function handleHash() {
    const match=location.hash.match(/^#video=([\w-]+)$/);
    if(match) openVideo(match[1], {fromHash:true, noAutoPlay:true});
    else if(!overlay.hidden) closeVideo();
  }
  window.addEventListener('hashchange',handleHash);
  if(location.hash.startsWith('#video=')) handleHash();
})();
