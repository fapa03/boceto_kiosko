// Handle card clicks in the menu
document.addEventListener('DOMContentLoaded', () => {
  console.log('index.js loaded - initializing card click handlers');

  // ── Error banner (redirected back from AutoClick timeout) ─────────────────
  const errorParam = new URLSearchParams(window.location.search).get('error');
  if (errorParam === 'conexion') {
    const banner = document.createElement('div');
    banner.style.cssText = [
      'position:fixed', 'top:24px', 'left:50%', 'transform:translateX(-50%)',
      'z-index:9999', 'background:rgba(220,38,38,0.93)',
      'color:#fff', 'padding:14px 26px', 'border-radius:10px',
      'font-family:Segoe UI,sans-serif', 'font-size:14px', 'font-weight:500',
      'box-shadow:0 4px 20px rgba(0,0,0,0.3)', 'backdrop-filter:blur(6px)',
      'display:flex', 'align-items:center', 'gap:10px',
      'max-width:90vw', 'white-space:nowrap'
    ].join(';');
    banner.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      Fallo en conexión, favor de volver a intentar
    `;
    document.body.appendChild(banner);
    setTimeout(() => {
      banner.style.transition = 'opacity 0.5s';
      banner.style.opacity = '0';
      setTimeout(() => banner.remove(), 500);
    }, 5000);
    // Clean URL so a page refresh won't re-show the banner
    history.replaceState(null, '', window.location.pathname);
  }

  // Sub-button clicks (inline-item inside a card)
  document.querySelectorAll('.inline-item[data-href]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const autoClick = item.dataset.autoclick;
      if (autoClick && typeof chrome !== 'undefined' && chrome.storage) {
        // Store pending auto-click target + destination href before cross-origin navigation.
        // The href is preserved so AutoClick can re-navigate if Oracle lands on the wrong
        // page after first login (e.g. FuseWelcome instead of FuseOverview).
        chrome.storage.local.set({
          'kiosko-pending-click': autoClick,
          'kiosko-pending-href': item.dataset.href
        }, () => {
          window.location.href = item.dataset.href;
        });
      } else {
        window.location.href = item.dataset.href;
      }
    });
  });

  // Main card clicks
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.inline-item')) return;
      e.preventDefault();
      const href = card.getAttribute('href');
      console.log('Card clicked, navigating to:', href);
      sessionStorage.setItem('cerrar-pestaña-después', 'true');
      window.location.href = href;
    });
  });
});