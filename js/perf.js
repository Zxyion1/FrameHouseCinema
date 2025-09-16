// FrameHouseCinema performance helpers (no quality loss)
(function(){
  // Speed up entrance animations globally
  document.documentElement.classList.add('fast');

  function applyContentVisibility(){
    const heavy = document.querySelectorAll('main, section, footer, .sections, .gallery, .grid');
    heavy.forEach(el => el.classList.add('cv-auto'));
  }

  function optimizeImages(){
    const imgs = document.querySelectorAll('img');
    imgs.forEach(img => {
      const isCritical = img.getAttribute('fetchpriority') === 'high' || img.classList.contains('brand-logo');
      if (!isCritical && !img.hasAttribute('loading')) img.setAttribute('loading','lazy');
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding','async');
    });
  }

  function optimizeVideos(){
    const vids = document.querySelectorAll('video');
    vids.forEach(v => {
      const isHero = v.id === 'homeVideoHero';
      if (!isHero && (!v.hasAttribute('preload') || v.getAttribute('preload') === 'auto')) {
        v.setAttribute('preload','metadata');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { applyContentVisibility(); optimizeImages(); optimizeVideos(); });
  } else {
    applyContentVisibility(); optimizeImages(); optimizeVideos();
  }
})();