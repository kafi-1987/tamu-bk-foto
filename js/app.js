/* ==========================================================
   APP — inisialisasi, pemanasan server, status jaringan
   ========================================================== */
(function () {
  'use strict';
  BK.Auth.load();
  if (!location.hash) history.replaceState(null, '', location.pathname + '#/');

  // pemanasan: bangunkan GAS & muat referensi publik di latar belakang (form tampil instan dari cache)
  BK.warm();
  if (BK.configured()) BK.loadPub().then(() => { if (BK.state.mode === 'pub' && BK.parse().path === '/' && !document.querySelector('#form input:focus,#form select:focus,#form textarea:focus')) { /* data referensi baru dipakai pada render berikutnya */ } });
  // jaga server tetap hangat selama kiosk menyala (hindari cold start 2–5 dtk)
  setInterval(() => { if (!document.hidden) BK.warm(); }, 4 * 60 * 1000);

  window.addEventListener('offline', () => { BK.online(false); BK.toast('Koneksi terputus', 'warn'); });
  window.addEventListener('online', () => { BK.online(true); BK.warm(); BK.toast('Koneksi pulih', 'ok'); });
  window.addEventListener('unhandledrejection', e => { if (e.reason && e.reason.code) return; console.warn(e.reason); });

  BK.resolve();
})();
