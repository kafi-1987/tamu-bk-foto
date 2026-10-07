/* ==========================================================
   PANEL ADMIN (2/2) — Kelola Admin, Log & Konfigurasi (QR, Audit, Database & Sampah)
   Hanya Super Admin (kecuali QR yang dapat diunduh semua admin)
   ========================================================== */
(function () {
  'use strict';
  const { $, $$, esc, ic } = BK;
  const fail = e => BK.adminFail(e);

  /* ================= KELOLA ADMIN ================= */
  function users() {
    const m = BK.adminShell('users');
    m.innerHTML = `<div class="view-enter">
    <div class="page-head"><div><div class="crumb">Panel Super Admin <span>/</span> Hak Akses & Pengguna <span>/</span> <b>Kelola Admin</b></div><h1 class="h-lg">Manajemen Akun Guru BK & Staf</h1><p class="t2" style="max-width:640px">Kelola kredensial akun, perizinan role (Super Admin & Admin), status keaktifan, dan audit keamanan login pengelola buku tamu.</p></div>
      <div class="act"><a class="btn btn-outline" href="#/admin/log?tab=log">${ic('history', 16)} Log Riwayat Akses</a><button class="btn btn-primary" id="addU">${ic('plus', 16)} Tambah Admin Baru</button></div></div>
    <div class="alert warn" style="margin-bottom:16px">${ic('shield', 20)}<div><b>Perhatian Keamanan Hak Akses</b> <span class="pill lvl-warn">Terkunci Sistem</span><br>Sistem mencegah penurunan level atau penghapusan Super Admin tunggal agar kepemilikan kelola sistem tidak hilang.</div></div>
    <div id="ubody"><div class="grid g4">${'<div class="card skel" style="height:120px"></div>'.repeat(4)}</div></div></div>`;
    $('#addU').onclick = () => userModal();
    BK.swr('users', () => BK.api('listUsers'), d => paintUsers(d)).catch(e => { $('#ubody').innerHTML = `<div class="card empty">${esc(e.message)}</div>`; });
  }
  let UF = 'Semua', UQ = '';
  function paintUsers(d) {
    const b = $('#ubody'); if (!b) return; BK.state.users = d.users; const s = d.stat, me = BK.Auth.user;
    let list = d.users.filter(u => (UF === 'Semua' || (UF === 'Super Admin' && u.role === 'Super Admin') || (UF === 'Admin' && u.role === 'Admin')) && (!UQ || (u.nama + u.username + u.nip + u.email).toLowerCase().indexOf(UQ) > -1));
    b.innerHTML = `<div class="grid g4">
      <div class="card kpi" style="min-height:0"><span class="eyebrow">Total Akun Terdaftar</span><div class="metric">${s.total} <small class="t2" style="font-size:13px;font-weight:500">Akun</small></div><span class="small t2">${s.aktif} aktif • ${s.total - s.aktif} nonaktif</span></div>
      <div class="card card-dark kpi" style="min-height:0"><span class="eyebrow">Super Admin</span><div class="metric">${s.super} <small style="font-size:13px;font-weight:500">Guru BK</small></div><span class="small" style="color:#a7f3d0">Akses penuh, konfigurasi & audit log</span></div>
      <div class="card kpi" style="min-height:0"><span class="eyebrow">Admin Reguler BK</span><div class="metric">${s.admin} <small class="t2" style="font-size:13px;font-weight:500">Staf & Guru Piket</small></div><span class="small t2">Kelola registrasi tamu & layanan</span></div>
      <div class="card kpi" style="min-height:0"><span class="eyebrow">Sesi Aktif Saat Ini</span><div class="metric">${s.sesiAktif} <small class="t2" style="font-size:13px;font-weight:500">Pengguna</small></div><span class="small t2">Login dalam 60 menit terakhir</span></div></div>
    <div class="card" style="margin-top:16px"><div style="display:flex;gap:12px;justify-content:space-between;flex-wrap:wrap;align-items:center;margin-bottom:12px"><div><b class="h-md">Daftar Akun Administrator BK</b><p class="small muted">Hak akses operasional dan verifikasi kehadiran tamu sekolah</p></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><div class="input-wrap">${ic('search', 15)}<input class="input" id="uq" style="height:40px;min-width:200px" placeholder="Cari NIP, nama, username..." value="${esc(UQ)}"></div><div class="seg" id="useg">${['Semua', 'Super Admin', 'Admin'].map(x => `<button data-f="${x}" class="${UF === x ? 'on' : ''}">${x}</button>`).join('')}</div></div></div>
      <div class="tbl-wrap"><table class="tbl" style="min-width:860px"><thead><tr><th>Guru BK / Pengguna</th><th>Username</th><th>Role</th><th>Tugas</th><th>Status</th><th>Login Terakhir</th><th>Aksi</th></tr></thead><tbody>
      ${list.map(u => { const self = u.username === me.username; return `<tr style="cursor:default"><td><div style="display:flex;gap:10px;align-items:center"><span class="avatar lg">${esc(BK.initials(u.nama))}</span><div><b>${esc(u.nama)}</b>${self ? ' <span class="pill tag-live">Anda</span>' : ''}<div class="small muted">${u.nip ? 'NIP. ' + esc(u.nip) : ''}${u.email ? '<br>' + esc(u.email) : ''}</div></div></div></td>
        <td class="mono">@${esc(u.username)}<div class="muted">${esc(u.id)}</div></td><td><span class="badge" style="background:${u.role === 'Super Admin' ? 'var(--primary);color:#fff' : '#F1F5F9;color:var(--text-2)'}">${ic(u.role === 'Super Admin' ? 'shieldok' : 'user', 13)} ${esc(u.role)}</span></td>
        <td class="small t2" style="max-width:160px">${esc(u.tugas || '—')}</td><td>${u.status === 'Aktif' ? '<span class="badge s-Selesai"><i class="dot"></i>Aktif</span>' : '<span class="badge" style="background:#F1F5F9;color:var(--neutral)"><i class="dot"></i>Nonaktif</span>'}</td>
        <td class="small t2">${u.loginTerakhir ? esc(BK.fmtDT(u.loginTerakhir)) + '<br><span class="muted">' + esc(u.perangkat) + '</span>' : '—'}</td>
        <td><div style="display:flex;gap:6px"><button class="btn-icon" style="width:34px;height:34px" data-a="edit" data-id="${esc(u.id)}" title="Ubah">${ic('edit', 15)}</button><button class="btn-icon" style="width:34px;height:34px" data-a="reset" data-id="${esc(u.id)}" title="Reset password">${ic('key', 15)}</button>${self ? '' : `<button class="btn-icon" style="width:34px;height:34px;color:#DC2626" data-a="del" data-id="${esc(u.id)}" title="Hapus">${ic('trash', 15)}</button>`}</div></td></tr>`; }).join('') || '<tr><td colspan="7" class="empty">Tidak ada akun.</td></tr>'}</tbody></table></div>
      <p class="small muted" style="margin-top:10px">Menampilkan ${list.length} dari total ${d.users.length} akun administrator BK</p></div>
    <div class="grid g2" style="margin-top:16px;align-items:start"><div class="card"><b class="h-md" style="display:flex;gap:8px;align-items:center">${ic('plus', 20)} Tambah Akun Pengguna BK Baru</b><p class="small muted" style="margin-bottom:12px">Daftarkan Guru BK atau Staf Piket resmi ke sistem buku tamu digital.</p><button class="btn btn-primary" id="addU2">${ic('plus', 16)} Buka Formulir Akun Baru</button></div>
      <div class="card"><b class="h-md" style="display:flex;gap:8px;align-items:center">${ic('lock', 20)} Ubah Password Pribadi</b><p class="small muted" style="margin-bottom:12px">Perbarui kata sandi untuk akun Super Admin aktif Anda.</p><div id="pwc">${BK.pwFormHtml()}</div><button class="btn btn-primary btn-block" id="pwgo" style="margin-top:14px">${ic('lock', 15)} Perbarui Password Saya</button></div></div>`;
    $('#addU2').onclick = () => userModal();
    BK.pwBind($('#pwc')); $('#pwgo').onclick = async e => { if (await BK.pwSubmit($('#pwc'), e.currentTarget)) $$('#pwc input').forEach(i => i.value = ''); };
    $('#uq').oninput = BK.debounce(e => { UQ = e.target.value.trim().toLowerCase(); paintUsers(BK.cache.users.d); $('#uq').focus(); }, 200);
    $('#useg').onclick = e => { const x = e.target.closest('[data-f]'); if (x) { UF = x.dataset.f; paintUsers(BK.cache.users.d); } };
    b.querySelector('tbody').onclick = async e => {
      const x = e.target.closest('[data-a]'); if (!x) return; const u = d.users.find(z => z.id === x.dataset.id);
      if (x.dataset.a === 'edit') userModal(u);
      if (x.dataset.a === 'reset') { if (!await BK.confirm('Reset password?', `Password <b>${esc(u.nama)}</b> akan diganti dengan sandi sementara. Pengguna wajib menggantinya saat login berikutnya.`, 'Reset')) return;
        try { const r = await BK.api('resetPassword', { id: u.id }); tempModal(u.nama, u.username, r.sandiSementara); } catch (er) { fail(er); } }
      if (x.dataset.a === 'del') { if (!await BK.confirm('Hapus akun?', `Akun <b>${esc(u.nama)}</b> (@${esc(u.username)}) akan dihapus permanen.`, 'Hapus Akun', true)) return;
        try { await BK.api('deleteUser', { id: u.id }); BK.toast('Akun dihapus', 'ok'); refreshUsers(); } catch (er) { fail(er); } }
    };
  }
  const refreshUsers = () => BK.api('listUsers').then(d => { BK.cache.users = { t: Date.now(), d }; BK.SS.set('c_users', BK.cache.users); paintUsers(d); }).catch(fail);
  function tempModal(nama, username, pw) {
    const m = BK.modal(`<h3>Sandi Sementara</h3><p class="t2 small">Berikan kepada <b>${esc(nama)}</b>. Sandi ini hanya tampil sekali.</p><div class="ticket" style="margin-top:12px"><div><span class="small muted">Username</span><div class="mono" style="font-size:14px">${esc(username)}</div><span class="small muted">Sandi sementara</span><div class="mono" style="font-size:18px;font-weight:700" id="tp">${esc(pw)}</div></div><button class="btn btn-sm btn-outline" data-c>${ic('copy', 14)} Salin</button></div><div class="foot"><button class="btn btn-primary" data-x>Selesai</button></div>`, { sticky: true });
    $('[data-c]', m).onclick = () => BK.copy(pw, 'Sandi disalin'); $('[data-x]', m).onclick = () => m.remove();
  }
  function userModal(u) {
    const e = !!u; u = u || { role: 'Admin', status: 'Aktif' };
    const m = BK.modal(`<h3>${e ? 'Ubah Akun' : 'Tambah Akun Pengguna BK Baru'}</h3><div class="form-grid c2" style="margin-top:12px">
      <div class="field span2"><label>Nama Lengkap & Gelar *</label><input class="input" id="un" maxlength="100" value="${esc(u.nama || '')}" placeholder="mis. Wahyu Hidayat, S.Pd"></div>
      <div class="field"><label>NIP / NIK Sekolah</label><input class="input" id="unip" maxlength="30" value="${esc(u.nip || '')}"></div>
      <div class="field"><label>Username Akun *</label><input class="input" id="uu" maxlength="40" value="${esc(u.username || '')}" placeholder="wahyuhidayat" autocapitalize="none"></div>
      <div class="field span2"><label>Email Sekolah</label><input class="input" id="ue" type="email" value="${esc(u.email || '')}"></div>
      <div class="field span2"><label>Tugas / Penugasan</label><input class="input" id="ut" maxlength="100" value="${esc(u.tugas || '')}" placeholder="mis. Guru BK Fase F"></div>
      ${e ? '' : `<div class="field span2"><label>Password Awal Sementara <span class="muted">(kosongkan untuk dibuat otomatis)</span></label><input class="input mono" id="upw" maxlength="60"></div>`}
      <div class="field span2"><span class="lbl">Tingkat Akses (Role) *</span><div class="radios c3" style="grid-template-columns:1fr 1fr">${['Admin', 'Super Admin'].map(r => `<button type="button" class="radio ${u.role === r ? 'on' : ''}" data-r="${r}"><span class="rb"></span><span><b>${r === 'Admin' ? 'Admin BK' : 'Super Admin'}</b><br><span class="small muted">${r === 'Admin' ? 'Terima tamu, edit data, ekspor' : 'Akses penuh & audit'}</span></span></button>`).join('')}</div></div>
      ${e ? `<div class="field span2"><span class="lbl">Status Akun</span><div class="radios c3" style="grid-template-columns:1fr 1fr">${['Aktif', 'Nonaktif'].map(r => `<button type="button" class="radio ${u.status === r ? 'on' : ''}" data-st="${r}"><span class="rb"></span><b>${r}</b></button>`).join('')}</div></div>` : ''}</div>
      <div class="foot"><button class="btn btn-outline" data-x>Batal</button><button class="btn btn-primary" data-ok>${ic('check', 15)} Simpan Akun</button></div>`, { wide: true });
    let role = u.role, st = u.status;
    m.onclick = ev => { const r = ev.target.closest('[data-r]'), s = ev.target.closest('[data-st]'); if (r) { role = r.dataset.r; $$('[data-r]', m).forEach(x => x.classList.toggle('on', x === r)); } if (s) { st = s.dataset.st; $$('[data-st]', m).forEach(x => x.classList.toggle('on', x === s)); } };
    $('[data-x]', m).onclick = () => m.remove();
    $('[data-ok]', m).onclick = async ev => {
      const d = { id: u.id, nama: $('#un', m).value.trim(), nip: $('#unip', m).value.trim(), username: $('#uu', m).value.trim(), email: $('#ue', m).value.trim(), tugas: $('#ut', m).value.trim(), role, status: st, password: e ? '' : $('#upw', m).value.trim() };
      if (!d.nama || !d.username) return BK.toast('Nama dan username wajib diisi', 'warn');
      BK.loading(ev.currentTarget, true);
      try { const r = await BK.api('saveUser', d); m.remove(); BK.toast('Akun disimpan', 'ok'); refreshUsers(); if (r.sandiSementara) tempModal(d.nama, d.username.toLowerCase(), r.sandiSementara); }
      catch (er) { fail(er); BK.loading(ev.currentTarget, false); }
    };
  }

  /* ================= QR ================= */
  let qrLib = null;
  const loadQR = () => qrLib || (qrLib = new Promise((res, rej) => { if (window.qrcode) return res(); const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js'; s.onload = res; s.onerror = () => { qrLib = null; rej(new Error('Gagal memuat pustaka QR (periksa internet)')); }; document.head.appendChild(s); }));
  async function qrCanvas(url) {
    await loadQR(); const q = window.qrcode(0, 'M'); q.addData(url); q.make();
    const n = q.getModuleCount(), cell = 10, pad = 24, S = n * cell + pad * 2, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, S, S); x.fillStyle = '#0F3824';
    for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) x.fillRect(pad + k * cell, pad + r * cell, cell, cell);
    return c;
  }
  async function qrPoster(url) {
    const qc = await qrCanvas(url), W = 1240, H = 1754, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.fillStyle = '#1B5E3C'; x.fillRect(0, 0, W, 260);
    x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = '800 64px "Plus Jakarta Sans",Arial'; x.fillText(BK.cfg.NAMA_SEKOLAH.toUpperCase(), W / 2, 130);
    x.font = '600 38px "Plus Jakarta Sans",Arial'; x.fillStyle = '#a7f3d0'; x.fillText('BUKU TAMU DIGITAL RUANG BK', W / 2, 200);
    x.drawImage(qc, (W - 880) / 2, 380, 880, 880);
    x.fillStyle = '#0F172A'; x.font = '800 56px "Plus Jakarta Sans",Arial'; x.fillText('Pindai dengan Kamera HP', W / 2, 1380);
    x.font = '500 34px "Plus Jakarta Sans",Arial'; x.fillStyle = '#475569'; x.fillText('Isi buku tamu sebelum masuk Ruang Bimbingan & Konseling', W / 2, 1445);
    x.font = '600 30px ui-monospace,monospace'; x.fillStyle = '#1B5E3C'; x.fillText(url.replace(/^https?:\/\//, ''), W / 2, 1540);
    return c;
  }
  const dlCanvas = (c, name) => c.toBlob(b => BK.download(name, b), 'image/png');
  BK.qrModal = async () => {
    const url = BK.appUrl(), m = BK.modal(`<h3>QR Code Portal Tamu</h3><p class="t2 small">Cetak dan tempel di meja resepsionis atau pintu Ruang BK.</p><div class="qr-box" style="margin-top:12px"><div id="qrh" class="skel" style="width:240px;height:240px"></div><b>${esc(BK.cfg.NAMA_SEKOLAH)}</b><span class="mono muted" style="word-break:break-all">${esc(url)}</span></div><div class="foot"><button class="btn btn-outline" data-x>Tutup</button><button class="btn btn-primary" data-dl disabled>${ic('download', 15)} Unduh Poster PNG</button></div>`);
    $('[data-x]', m).onclick = () => m.remove();
    try { const c = await qrCanvas(url); $('#qrh', m).replaceWith(c); c.style.cssText = 'max-width:240px;width:100%;height:auto'; const b = $('[data-dl]', m); b.disabled = false; b.onclick = async () => dlCanvas(await qrPoster(url), 'QR-Buku-Tamu-BK.png'); }
    catch (e) { $('#qrh', m).outerHTML = `<div class="empty">${esc(e.message)}</div>`; }
  };

  /* ================= LOG & KONFIGURASI ================= */
  const TABS = [['qr', 'QR Code Portal Tamu', 'qr'], ['log', 'Log Aktivitas & Audit', 'history'], ['db', 'Pengaturan Database & Sampah', 'db']];
  function logPage(_, q) {
    const tab = q.tab || 'qr', m = BK.adminShell('log');
    m.innerHTML = `<div class="view-enter"><div class="crumb">Administrasi Sekolah <span>/</span> <b>Log & Pengaturan Sistem</b></div><div class="page-head"><div><h1 class="h-lg">Log & Konfigurasi</h1><p class="t2">Manajemen QR Kiosk, rekam jejak audit keamanan, serta parameter database BK.</p></div><span class="pill tag-live" style="padding:8px 14px">${ic('shieldok', 14)} Otoritas: Super Administrator</span></div>
      <div class="tabs" style="margin-bottom:16px">${TABS.map(t => `<a class="tab ${t[0] === tab ? 'on' : ''}" href="#/admin/log?tab=${t[0]}">${ic(t[2], 16)} ${t[1]}</a>`).join('')}</div><div id="lbody"></div></div>`;
    ({ qr: tabQR, log: tabLog, db: tabDB })[tab in { qr: 1, log: 1, db: 1 } ? tab : 'qr']();
  }
  async function tabQR() {
    const url = BK.appUrl(), b = $('#lbody');
    b.innerHTML = `<div class="banner" style="margin:0 0 16px"><div><span class="pill" style="background:rgba(255,255,255,.14);color:#fff">${ic('printer', 13)} Instruksi Pencetakan Stiker & Akrilik Meja</span><h2 class="h-lg" style="margin:10px 0 6px">QR Barcode Standar Layanan Mandiri BK</h2><p style="color:#d1fae5;max-width:700px">Cetak dan tempatkan barcode ini pada meja resepsionis atau daun pintu Ruang BK. Siswa, orang tua, dan instansi dapat memindai dengan kamera smartphone untuk mengisi formulir buku tamu.</p></div></div>
    <div class="grid g-main" style="align-items:start"><div class="card"><div class="grid g2" style="align-items:center"><div class="qr-box" style="background:#F8FAFC"><b>${esc(BK.cfg.NAMA_SEKOLAH.toUpperCase())}</b><span class="small muted">BUKU TAMU DIGITAL BK</span><div id="qrh" class="skel" style="width:240px;height:240px"></div><span class="small muted">Pindai dengan kamera HP</span></div>
      <div><span class="pill tag-live">${ic('checkc', 13)} Format siap cetak</span><h3 class="h-md" style="margin:8px 0">Tautan Resmi Portal Tamu</h3><p class="small t2">Akses instan formulir registrasi tamu.</p><div class="ticket" style="margin:10px 0;padding:10px 12px"><span class="mono" style="word-break:break-all">${esc(url)}</span><button class="btn btn-sm btn-outline" id="cu">${ic('copy', 13)}</button></div><button class="btn btn-primary btn-block" id="dq" disabled>${ic('download', 16)} Unduh Poster PNG (A4)</button><p class="small muted" style="margin-top:8px">Poster memuat judul sekolah dan QR ukuran besar.</p></div></div></div>
      <div style="display:grid;gap:16px"><div class="card card-dark"><span class="eyebrow">Dedicated Tablet View</span><h3 class="h-md" style="margin:6px 0">Mode Kiosk Layar Penuh</h3><p class="small" style="color:#d1fae5;margin-bottom:12px">Jalankan buku tamu di tablet Android atau iPad piket agar pengunjung fokus mengisi data dan swafoto.</p><button class="btn btn-accent btn-block" id="kiosk">${ic('full', 16)} Luncurkan Kiosk Fullscreen</button></div>
        <div class="card"><b class="h-sm" style="display:flex;gap:8px">${ic('bulb', 18)} Standar Pemasangan Fisik Meja BK</b><ul style="margin-top:10px;display:grid;gap:8px;list-style:none" class="small t2">${['Tinggi pemasangan akrilik meja ideal 90 – 110 cm dari permukaan lantai.', 'Pastikan pencahayaan ruangan tidak menimbulkan silau (glare) pada laminasi kode QR.', 'Siapkan koneksi Wi-Fi terbuka khusus pengunjung tamu.'].map(t => `<li style="display:flex;gap:8px">${ic('checkc', 16)}<span>${t}</span></li>`).join('')}</ul></div></div></div>`;
    $('#cu').onclick = () => BK.copy(url, 'Tautan disalin');
    $('#kiosk').onclick = () => { const el = document.documentElement; (el.requestFullscreen || el.webkitRequestFullscreen || (() => Promise.resolve())).call(el); BK.state.mode = null; BK.go('#/'); };
    try { const c = await qrCanvas(url); const h = $('#qrh'); if (h) { h.replaceWith(c); c.style.cssText = 'max-width:240px;width:100%;height:auto'; const d = $('#dq'); d.disabled = false; d.onclick = async () => dlCanvas(await qrPoster(url), 'QR-Buku-Tamu-BK.png'); } }
    catch (e) { const h = $('#qrh'); if (h) h.outerHTML = `<div class="empty">${esc(e.message)}</div>`; }
  }

  /* ---- Log aktivitas ---- */
  let LQ = { q: '', aksi: '', tingkat: '', page: 1, size: 10 };
  function tabLog() {
    $('#lbody').innerHTML = `<div id="lstat" class="grid g4">${'<div class="card skel" style="height:110px"></div>'.repeat(4)}</div>
    <div class="card" style="margin-top:16px"><div class="filters" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr))"><div class="input-wrap">${ic('search', 15)}<input class="input" id="lq" placeholder="Cari admin, ID log, aksi..." value="${esc(LQ.q)}"></div>
      <select class="select" id="la"><option value="">Semua Aksi</option>${['LOGIN_SUCCESS', 'LOGIN_FAILED', 'CREATE_RECORD', 'UPDATE_BK_NOTES', 'UPDATE_RECORD', 'DELETE_RECORD', 'RESTORE_RECORD', 'PURGE_RECORD', 'PERMISSION_CHANGE', 'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'RESET_PASSWORD', 'CHANGE_PASSWORD', 'EXPORT_DATA', 'UPDATE_SETTINGS', 'SYSTEM_BACKUP', 'SYSTEM_PURGE'].map(a => `<option ${LQ.aksi === a ? 'selected' : ''}>${a}</option>`).join('')}</select>
      <select class="select" id="lt"><option value="">Semua Tingkat</option>${[['info', 'Info'], ['warn', 'Peringatan'], ['critical', 'Kritis']].map(t => `<option value="${t[0]}" ${LQ.tingkat === t[0] ? 'selected' : ''}>${t[1]}</option>`).join('')}</select>
      <button class="btn btn-outline btn-sm" id="lr">${ic('refresh', 14)} Segarkan</button></div></div>
    <div class="card" style="margin-top:14px;padding:8px 12px 16px"><div id="ltbl"></div><div id="lpg"></div></div>
    <div class="grid g3" style="margin-top:16px">${[['shield', 'Immutability WORM', 'Log berprinsip Write Once, Read Many. Entri yang telah masuk tidak dapat diedit atau dihapus lewat aplikasi.'], ['refresh', 'Concurrency Lock', 'LockService menjaga nomor tiket tetap unik saat banyak tamu mengisi bersamaan.'], ['lock', 'Perlindungan Data', 'Catatan sensitif bimbingan konseling hanya dapat diakses admin terautentikasi.']].map(c => `<div class="card"><b class="h-sm" style="display:flex;gap:8px;align-items:center">${ic(c[0], 18)} ${c[1]}</b><p class="small t2" style="margin-top:6px">${c[2]}</p></div>`).join('')}</div>`;
    const go = () => { LQ.page = 1; loadLog(); };
    $('#lq').oninput = BK.debounce(e => { LQ.q = e.target.value.trim(); go(); }, 300); $('#la').onchange = e => { LQ.aksi = e.target.value; go(); }; $('#lt').onchange = e => { LQ.tingkat = e.target.value; go(); };
    $('#lr').onclick = () => { BK.cache.log = null; loadLog(true); };
    loadLog();
  }
  function loadLog(force) {
    const key = 'log_' + JSON.stringify(LQ), fetcher = () => BK.api('listLog', LQ);
    (force ? fetcher().then(d => { BK.cache[key] = { t: Date.now(), d }; paintLog(d); }) : BK.swr(key, fetcher, d => paintLog(d))).catch(e => { const t = $('#ltbl'); if (t) t.innerHTML = `<div class="empty">${esc(e.message)}</div>`; });
  }
  const ACT = { LOGIN_SUCCESS: ['#DEF7EC', '#03543F'], LOGIN_FAILED: ['#FEE2E2', '#B91C1C'], CREATE_RECORD: ['#DEF7EC', '#03543F'], DELETE_RECORD: ['#FEE2E2', '#B91C1C'], PURGE_RECORD: ['#FEE2E2', '#B91C1C'], DELETE_USER: ['#FEE2E2', '#B91C1C'], PERMISSION_CHANGE: ['#FEF3C7', '#92400E'], RESET_PASSWORD: ['#FEF3C7', '#92400E'], UPDATE_SETTINGS: ['#FEF3C7', '#92400E'] };
  function paintLog(d) {
    if (!$('#ltbl')) return; const s = d.stat;
    $('#lstat').innerHTML = [['Total Aktivitas Tercatat', s.total.toLocaleString('id-ID') + ' Log', 'chart'], ['Operasi Kritis', s.kritis + ' Log', 'alert'], ['Aktivitas Hari Ini', s.hariIni + ' Log', 'history'], ['Login Gagal Hari Ini', s.gagalLogin + ' Percobaan', 'lock']].map((k, i) => `<div class="card kpi" style="min-height:0"><div class="top"><span class="eyebrow">${k[0]}</span><span class="ib" ${i === 1 ? 'style="background:#FEF3C7;color:#B45309"' : i === 3 ? 'style="background:#FEE2E2;color:#B91C1C"' : ''}>${ic(k[2], 18)}</span></div><div class="metric">${k[1]}</div></div>`).join('');
    if (!d.rows.length) { $('#ltbl').innerHTML = '<div class="empty">Tidak ada log yang cocok.</div>'; $('#lpg').innerHTML = ''; return; }
    $('#ltbl').innerHTML = `<div class="tbl-wrap"><table class="tbl" style="min-width:820px"><thead><tr><th>Timestamp</th><th>ID Log</th><th>Pelaku</th><th>Kategori & Tindakan</th><th>Detail</th></tr></thead><tbody>${d.rows.map(r => { const c = ACT[r.aksi] || ['#EFF6FF', '#1E40AF']; return `<tr style="cursor:default"><td><b style="font-size:13px">${esc(BK.fmtDT(r.ts))}</b><div class="small muted">${esc(BK.ago(r.ts))}</div></td><td class="mono">${esc(r.id)}</td><td><div style="display:flex;gap:8px;align-items:center"><span class="avatar">${esc(BK.initials(r.pelaku))}</span><div><b style="font-size:13px">${esc(r.pelaku)}</b><div class="small muted">${esc(r.role)}</div></div></div></td><td><span class="badge" style="background:${c[0]};color:${c[1]}"><i class="dot"></i>${esc(r.aksi)}</span></td><td class="small t2" style="max-width:340px;white-space:normal;line-height:1.4">${esc(r.detail)}</td></tr>`; }).join('')}</tbody></table></div>`;
    const pages = Math.max(1, Math.ceil(d.total / d.size)), p = d.page;
    $('#lpg').innerHTML = `<div class="pager"><span class="small t2">Menampilkan <b>${(p - 1) * d.size + 1} – ${Math.min(p * d.size, d.total)}</b> dari <b>${d.total}</b> log</span><div class="pg"><button data-p="${p - 1}" ${p <= 1 ? 'disabled' : ''}>${ic('left', 16)}</button><button class="on">${p}</button><span class="small muted">/ ${pages}</span><button data-p="${p + 1}" ${p >= pages ? 'disabled' : ''}>${ic('right', 16)}</button></div></div>`;
    $('#lpg').onclick = e => { const b = e.target.closest('[data-p]'); if (b && !b.disabled) { LQ.page = +b.dataset.p; loadLog(); } };
  }

  /* ---- Database, pengaturan, referensi, sampah ---- */
  const REFS = [['kelas', 'Kelas & Rombel'], ['bidang', 'Bidang Layanan'], ['status_tamu', 'Status Tamu'], ['tujuan_siswa', 'Tujuan Siswa'], ['tujuan_khusus', 'Tujuan Tamu Khusus']];
  let RT = 'kelas';
  async function tabDB() {
    const b = $('#lbody'); b.innerHTML = `<div class="card skel" style="height:200px"></div>`;
    let S; try { S = await BK.api('getSettings'); } catch (e) { b.innerHTML = `<div class="card empty">${esc(e.message)}</div>`; return; }
    const st = S.set, sis = S.sistem;
    b.innerHTML = `<div class="grid g4"><div class="card card-dark kpi" style="min-height:0"><span class="eyebrow">Database Google Sheets</span><div class="h-md">DB_BukuTamuBK</div><a class="small" style="color:#a7f3d0" href="${esc(sis.spreadsheetUrl)}" target="_blank" rel="noopener">Buka di Sheets ${ic('ext', 12)}</a></div>
      <div class="card kpi" style="min-height:0"><span class="eyebrow">Penyimpanan Swafoto Drive</span><div class="metric">${sis.jumlahFoto.toLocaleString('id-ID')} <small class="t2" style="font-size:13px;font-weight:500">Foto</small></div><a class="small" style="color:var(--primary)" href="${esc(sis.driveUrl)}" target="_blank" rel="noopener">Buka folder Drive ${ic('ext', 12)}</a></div>
      <div class="card kpi" style="min-height:0"><span class="eyebrow">Opsi Referensi Dropdown</span><div class="metric">${Object.keys(S.ref).reduce((a, k) => a + S.ref[k].length, 0)} <small class="t2" style="font-size:13px;font-weight:500">Parameter</small></div></div>
      <div class="card kpi" style="min-height:0"><span class="eyebrow">Keranjang Sampah</span><div class="metric" style="color:var(--pending)">${sis.sampah} <small class="t2" style="font-size:13px;font-weight:500">Entri soft-delete</small></div><span class="small muted">Retensi 30 hari sebelum purge otomatis</span></div></div>
    <div class="grid g2" style="margin-top:16px;align-items:start">
      <div class="card"><b class="h-md">Informasi Layanan (tampil di portal tamu)</b><div class="form-grid" style="margin-top:12px">${[['nama_sekolah', 'Nama sekolah'], ['konselor_standby', 'Guru BK piket / standby'], ['konselor_info', 'Keterangan konselor'], ['jam_layanan', 'Jam pelayanan'], ['lokasi_bk', 'Lokasi ruang BK'], ['hotline', 'Hotline BK']].map(k => `<div class="field"><label>${k[1]}</label><input class="input" data-s="${k[0]}" maxlength="200" value="${esc(st[k[0]] || '')}"></div>`).join('')}</div><button class="btn btn-primary" id="ss" style="margin-top:14px">${ic('check', 15)} Simpan Parameter</button></div>
      <div class="card"><b class="h-md">Kelola Opsi Dropdown Formulir</b><p class="small muted">Sinkronisasi otomatis dengan sheet "Referensi".</p><div class="tabs" id="rtabs" style="margin:12px 0">${REFS.map(r => `<button class="tab ${RT === r[0] ? 'on' : ''}" data-r="${r[0]}">${r[1]}</button>`).join('')}</div><div id="rl"></div></div></div>
    <div class="card" style="margin-top:16px"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><div><b class="h-md" style="display:flex;gap:8px;align-items:center">${ic('trash', 20)} Keranjang Sampah & Arsip Terhapus <span class="pill" style="background:#F1F5F9">Masa Retensi 30 Hari</span></b><p class="small muted">Data kunjungan dan swafoto yang dihapus disimpan sementara sebelum dihapus permanen.</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-soft btn-sm" id="rs">${ic('refresh', 14)} Pulihkan Terpilih</button><button class="btn btn-danger btn-sm" id="es">${ic('trash', 14)} Kosongkan Sampah</button></div></div><div id="trash" style="margin-top:12px"><div class="skel" style="height:80px"></div></div></div>`;
    $('#ss').onclick = async e => { const d = {}; $$('[data-s]').forEach(i => d[i.dataset.s] = i.value.trim()); BK.loading(e.currentTarget, true); try { await BK.api('saveSettings', d); BK.LS.del('pub'); BK.loadPub(); BK.toast('Parameter disimpan', 'ok'); } catch (er) { fail(er); } finally { BK.loading(e.currentTarget, false); } };
    const drawRef = () => {
      const list = S.ref[RT] || []; $$('#rtabs .tab').forEach(t => t.classList.toggle('on', t.dataset.r === RT));
      $('#rl').innerHTML = `<div class="chips" id="rch">${list.map((v, i) => `<span class="chip" style="cursor:default">${esc(v)} <button data-d="${i}" aria-label="Hapus ${esc(v)}" style="display:inline-flex">${ic('x', 13)}</button></span>`).join('')}</div><div style="display:flex;gap:8px;margin-top:12px"><input class="input" id="rn" style="height:42px" maxlength="60" placeholder="Tambah opsi baru"><button class="btn btn-outline btn-sm" id="ra">${ic('plus', 14)} Tambah</button></div><button class="btn btn-primary btn-sm" id="rsv" style="margin-top:12px">${ic('check', 14)} Simpan Daftar</button>`;
      $('#rch').onclick = e => { const d = e.target.closest('[data-d]'); if (d) { list.splice(+d.dataset.d, 1); drawRef(); } };
      const add = () => { const v = $('#rn').value.trim(); if (v && list.indexOf(v) < 0) { list.push(v); drawRef(); $('#rn').focus(); } };
      $('#ra').onclick = add; $('#rn').onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); add(); } };
      $('#rsv').onclick = async e => { BK.loading(e.currentTarget, true); try { const r = await BK.api('saveReferensi', { kategori: RT, list }); S.ref = r.ref; BK.LS.del('pub'); BK.loadPub(); BK.toast('Daftar disimpan', 'ok'); } catch (er) { fail(er); } finally { BK.loading(e.currentTarget, false); } };
    };
    $('#rtabs').onclick = e => { const t = e.target.closest('[data-r]'); if (t) { RT = t.dataset.r; drawRef(); } }; drawRef();
    loadTrash();
  }
  async function loadTrash() {
    const box = $('#trash'); if (!box) return;
    try {
      const d = await BK.api('listTrash', {}); const sel = new Set();
      box.innerHTML = d.rows.length ? `<div class="tbl-wrap"><table class="tbl" style="min-width:760px"><thead><tr><th></th><th>ID & Waktu</th><th>Pengunjung</th><th>Dihapus Oleh</th><th>Alasan</th><th>Sisa Retensi</th><th>Aksi</th></tr></thead><tbody>${d.rows.map(r => `<tr style="cursor:default"><td><input type="checkbox" data-c="${esc(r.ID_Kunjungan)}" style="accent-color:var(--primary);width:16px;height:16px"></td><td class="mono">${esc(r.ID_Kunjungan)}<div class="muted">${esc(BK.fmtTgl(r.Tanggal))}</div></td><td><div style="display:flex;gap:8px;align-items:center">${BK.avatar(r)}<div><b>${esc(r.Nama)}</b><div class="small muted">${esc(BK.JENIS[r.Jenis].l)}</div></div></div></td><td class="small">${esc(r.Dihapus_Oleh)}</td><td class="small t2" style="white-space:normal;max-width:220px">${esc(r.Alasan_Hapus)}</td><td><span class="pill ${r.sisa <= 7 ? 'lvl-critical' : 'tag-live'}">${r.sisa} hari</span></td><td><button class="btn-icon" style="width:34px;height:34px" data-rs="${esc(r.ID_Kunjungan)}" title="Pulihkan">${ic('history', 15)}</button> <button class="btn-icon" style="width:34px;height:34px;color:#DC2626" data-pg="${esc(r.ID_Kunjungan)}" title="Hapus permanen">${ic('x', 15)}</button></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">Keranjang sampah kosong.</div>';
      const done = () => { Object.keys(BK.cache).filter(k => k.indexOf('list_') === 0 || k === 'dash').forEach(k => delete BK.cache[k]); BK.SS.clear('c_'); loadTrash(); };
      box.onclick = async e => { const r = e.target.closest('[data-rs]'), p = e.target.closest('[data-pg]');
        if (r) { try { await BK.api('restoreTamu', { ids: [r.dataset.rs] }); BK.toast('Data dipulihkan', 'ok'); done(); } catch (er) { fail(er); } }
        if (p && await BK.confirm('Hapus permanen?', 'Data dan foto akan dihapus selamanya dan tidak bisa dipulihkan.', 'Hapus Permanen', true)) { try { await BK.api('purgeTamu', { ids: [p.dataset.pg] }); BK.toast('Dihapus permanen', 'ok'); done(); } catch (er) { fail(er); } } };
      $('#rs').onclick = async () => { const ids = $$('[data-c]:checked', box).map(x => x.dataset.c); if (!ids.length) return BK.toast('Pilih data yang akan dipulihkan', 'warn'); try { await BK.api('restoreTamu', { ids }); BK.toast(ids.length + ' data dipulihkan', 'ok'); done(); } catch (er) { fail(er); } };
      $('#es').onclick = async () => { if (!d.total) return BK.toast('Sampah sudah kosong', 'warn'); if (await BK.confirm('Kosongkan sampah?', `${d.total} entri akan dihapus permanen beserta fotonya.`, 'Kosongkan', true)) { try { await BK.api('purgeTamu', { semua: true }); BK.toast('Sampah dikosongkan', 'ok'); done(); } catch (er) { fail(er); } } };
    } catch (e) { box.innerHTML = `<div class="empty">${esc(e.message)}</div>`; }
  }

  BK.route(/^\/admin\/users$/, users, { admin: true, superOnly: true });
  BK.route(/^\/admin\/log$/, logPage, { admin: true, superOnly: true });
})();
