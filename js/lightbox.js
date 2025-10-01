// Lightweight Lightbox / Fullscreen Viewer
// Features: dblclick to open, click background / ESC to close, arrow keys or on-screen arrows to navigate, wheel zoom + drag pan.
(function(){
  if(window.__FHC_LIGHTBOX__) return; window.__FHC_LIGHTBOX__=true;

  const style = document.createElement('style');
  style.textContent = `
  .fhc-lightbox{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .25s;pointer-events:none;}
  .fhc-lightbox.visible{opacity:1;pointer-events:auto;}
  .fhc-lightbox img{max-width:90vw;max-height:90vh;object-fit:contain;box-shadow:0 0 30px rgba(0,0,0,.6);cursor:grab;user-select:none;transition:transform .15s;}
  .fhc-lightbox button.lb-nav{position:absolute;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.5);border:1px solid #444;color:#fff;width:52px;height:52px;border-radius:50%;font-size:1.6rem;display:flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(4px);}
  .fhc-lightbox button.lb-nav:hover{background:rgba(255,255,255,.12);} 
  .fhc-lightbox button.lb-prev{left:20px;} .fhc-lightbox button.lb-next{right:20px;}
  .fhc-lightbox button.lb-close{position:absolute;top:14px;right:14px;width:46px;height:46px;font-size:1.4rem;border-radius:50%;}
  .fhc-lightbox .lb-counter{position:absolute;bottom:12px;left:50%;transform:translateX(-50%);color:#bbb;font-size:.85rem;letter-spacing:.5px;font-family:system-ui,Arial,sans-serif;}
  @media (max-width:700px){.fhc-lightbox button.lb-nav{width:44px;height:44px;font-size:1.35rem;} .fhc-lightbox img{max-width:94vw;max-height:78vh;}}
  `;
  document.head.appendChild(style);

  const sel = '.gallery img, .gallery-item img, .portfolio img, main img'; // broaden later if needed
  let images = [];
  const gather = () => {
    images = Array.from(document.querySelectorAll(sel))
      .filter(img => img.naturalWidth > 0 || img.complete)
      .filter(img => !img.closest('header, footer'));
    images.forEach((img, idx)=>{ img.dataset.lbIndex = idx; });
  };
  gather();
  const mo = new MutationObserver(()=>gather());
  mo.observe(document.documentElement,{childList:true,subtree:true});

  let currentIndex = 0;
  let overlay, overlayImg, counterEl;
  let scale=1, originX=0, originY=0, startX=0, startY=0, panX=0, panY=0, dragging=false;

  function build(){
    overlay = document.createElement('div');
    overlay.className='fhc-lightbox';
    overlay.innerHTML = `
      <button class="lb-nav lb-prev" aria-label="Previous">‹</button>
      <button class="lb-nav lb-next" aria-label="Next">›</button>
      <button class="lb-nav lb-close" aria-label="Close">✕</button>
      <div class="lb-counter"></div>
    `;
    overlayImg = document.createElement('img');
    overlay.appendChild(overlayImg);
    document.body.appendChild(overlay);
    counterEl = overlay.querySelector('.lb-counter');

    overlay.addEventListener('click', e=>{ if(e.target===overlay) close(); });
    overlay.querySelector('.lb-close').addEventListener('click', close);
    overlay.querySelector('.lb-prev').addEventListener('click', ()=>nav(-1));
    overlay.querySelector('.lb-next').addEventListener('click', ()=>nav(1));

    window.addEventListener('keydown', e=>{
      if(!overlay.classList.contains('visible')) return;
      if(e.key==='Escape') close();
      if(e.key==='ArrowRight') nav(1);
      if(e.key==='ArrowLeft') nav(-1);
    });

    overlayImg.addEventListener('wheel', e=>{
      e.preventDefault();
      const delta = Math.sign(e.deltaY) * -0.15;
      const newScale = Math.min(6, Math.max(1, scale + delta));
      if(newScale !== scale){
        const rect = overlayImg.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        panX = (panX - cx/scale) * (newScale/scale) + cx/newScale;
        panY = (panY - cy/scale) * (newScale/scale) + cy/newScale;
        scale = newScale;
        applyTransform();
      }
    }, {passive:false});

    overlayImg.addEventListener('mousedown', e=>{ dragging=true; startX=e.clientX; startY=e.clientY; overlayImg.style.cursor='grabbing'; });
    window.addEventListener('mousemove', e=>{ if(!dragging) return; panX += (e.clientX - startX)/scale; panY += (e.clientY - startY)/scale; startX=e.clientX; startY=e.clientY; applyTransform(); });
    window.addEventListener('mouseup', ()=>{ dragging=false; overlayImg.style.cursor='grab'; });
    window.addEventListener('resize', ()=>applyTransform());
    overlay.addEventListener('dblclick', resetZoom);
  }

  function resetZoom(){ scale=1; panX=0; panY=0; applyTransform(); }
  function applyTransform(){ overlayImg.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`; }

  function open(index){
    if(!overlay) build();
    gather();
    currentIndex = index;
    const img = images[currentIndex];
    if(!img) return;
    scale=1; panX=0; panY=0; applyTransform();
    overlayImg.src = img.currentSrc || img.src;
    counterEl.textContent = `${currentIndex+1} / ${images.length}`;
    overlay.classList.add('visible');
    document.body.style.overflow='hidden';
  }
  function close(){
    if(!overlay) return;
    overlay.classList.remove('visible');
    document.body.style.overflow='';
    // Reset any grab cursor state
    if(overlayImg){
      overlayImg.style.cursor='grab';
      // slight delay ensures pointer-events removed before potential rapid dblclick
      setTimeout(()=>{ dragging=false; scale=1; panX=0; panY=0; applyTransform(); },120);
    }
  }
  function nav(dir){ if(!images.length) return; currentIndex=(currentIndex+dir+images.length)%images.length; open(currentIndex); }

  document.addEventListener('dblclick', e=>{
    const img = e.target.closest('img');
    if(!img) return;
    if(img.closest('header, footer')) return;
    gather();
    const idx = parseInt(img.dataset.lbIndex,10);
    if(!isNaN(idx)) open(idx);
  }, true);

  // Touch support (pinch + swipe)
  let touchStartDist=0, baseScale=1, touchStartX=0, touchStartY=0, basePanX=0, basePanY=0;
  overlayImg && overlayImg.addEventListener('touchstart', onTouchStart, {passive:false});
  function onTouchStart(e){ if(e.touches.length===2){ e.preventDefault(); touchStartDist=dist(e.touches[0], e.touches[1]); baseScale=scale; } else if(e.touches.length===1){ touchStartX=e.touches[0].clientX; touchStartY=e.touches[0].clientY; basePanX=panX; basePanY=panY; }}
  function onTouchMove(e){ if(e.touches.length===2){ e.preventDefault(); const d = dist(e.touches[0], e.touches[1]); const f = d / touchStartDist; scale = Math.min(6, Math.max(1, baseScale * f)); applyTransform(); } else if(e.touches.length===1 && scale>1){ e.preventDefault(); panX = basePanX + (e.touches[0].clientX - touchStartX)/scale; panY = basePanY + (e.touches[0].clientY - touchStartY)/scale; applyTransform(); }}
  function onTouchEnd(e){ if(e.touches.length===0 && scale<1.02){ resetZoom(); }}
  function dist(a,b){ return Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY); }
  document.addEventListener('touchmove', onTouchMove, {passive:false});
  document.addEventListener('touchend', onTouchEnd, {passive:true});
})();
