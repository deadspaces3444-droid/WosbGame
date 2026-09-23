import { supabase } from './supabase.js';

console.log('🚀 app.js v1.8.1');

// Fallback, если таблица site_admins недоступна
const ADMIN_EMAILS_FALLBACK = ['kolibri@wosb.ru'];
const APP_VERSION = '1.8.1';

const TABS = ['enemies', 'friends', 'neutral', 'personal'];
const UNLOCK_KEY = 'guild_unlocked';
const LAST_CLAN_KEY = 'guild_last_clan';
const BG_STORAGE_KEY = 'guild_bg_overrides';
const GAME_STORAGE_KEY = 'selected_game_id';
const VIEWER_NICK_KEY = 'viewer_nickname';
const CLAN_PASS_KEY = 'clan_pass';
const CLAN_ADMIN_PASS_KEY = 'clan_admin_pass';
const THEME_KEY = 'app_theme';
const SHARED = '__shared__';
const HEARTBEAT_MS = 30000;
const ONLINE_WINDOW_MS = 90000;

const VK_DOMAIN = 'worldofseabattle';
const VK_API_VERSION = '5.131';
const VK_POSTS_COUNT = 10;

let gamesCache    = {};
let clansCache    = {};
let alliancesCache = {};
let settingsCache = null;
let faqCache      = [];
let partnersCache = [];
let tacticsCache  = [];
let tradesCache   = [];
let siteAdminsCache = [];   // массив email (lowercase)
let currentSession = null;
let partnerLogoData = null;
let currentGame   = null;
let currentClan   = null;
let currentClanIsAdmin = false;
let currentClanPass = null;
let allianceClans = [];
let pendingClanId = null;
let currentTab    = 'enemies';
let isAdmin       = false;
let movingItem    = null;
let editingItem   = null;
let editingBuild  = null;
let editingGame   = null;
let duplicatingBuild = null;
let editingTactic = null;
let editingAlliance = null;
let acceptingTrade = null;
let tradeFormType = 'buy';
let tradeFilterType = 'all';
let tradeFilterCat = 'all';
let tradeFilterClan = 'all';
let heartbeatTimer = null;
let chatChannel   = null;
let onlineChannel = null;
let notifChannel  = null;
let chatMessages  = [];
let notifications = [];
let chatMode      = 'guild';
let chatPrivateWith = null;
let voiceActive   = false;

const $ = id => document.getElementById(id);
function on(id, event, handler) {
    const el = document.getElementById(id);
    if (!el) return false;
    el.addEventListener(event, handler);
    return true;
}
function val(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

const screenHome  = $('screen-home');
const screenClan  = $('screen-clan');
const screenAdmin = $('screen-admin');
const clanView    = $('clanView');
const bgFileInput = $('bgFileInput');

/* ============================================================
   УТИЛИТЫ
============================================================ */
function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
}
function flashStatusEl(el, text, color) {
    if (!el) return;
    el.textContent = text;
    el.style.color = color;
    clearTimeout(el._t);
    el._t = setTimeout(() => el.textContent = '', 2000);
}
function flashStatus(text, color) {
    const el = $('status');
    if (!el) return;
    el.textContent = text; el.style.color = color;
    clearTimeout(flashStatus._t);
    flashStatus._t = setTimeout(() => el.textContent = '', 2000);
}
function colorFromString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    const hue = Math.abs(h) % 360;
    return `linear-gradient(135deg, hsl(${hue}, 55%, 45%), hsl(${hue}, 55%, 30%))`;
}
function canEditClan(clanId) {
    if (isAdmin) return true;
    if (clanId === currentClan && currentClanIsAdmin) return true;
    return false;
}

/* ============================================================
   ТЕМА
============================================================ */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
}
function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(cur === 'dark' ? 'light' : 'dark');
}
function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || 'dark';
    applyTheme(saved);
}
['themeToggle','themeToggle2','themeToggle3'].forEach(id => on(id, 'click', toggleTheme));

/* ============================================================
   ЛОГИ
============================================================ */
async function logAdminAction(action, target = null, details = null) {
    try {
        await supabase.from('admin_log').insert({
            admin_nickname: localStorage.getItem(VIEWER_NICK_KEY) || 'админ',
            action, target, details
        });
    } catch (e) { }
}
async function logView(nickname, clanId, page) {
    if (!nickname) return;
    try {
        await supabase.from('view_history').insert({ nickname, clan_id: clanId, page });
    } catch (e) { }
}

/* ============================================================
   АДМИНЫ САЙТА
============================================================ */
async function loadSiteAdmins() {
    try {
        const { data, error } = await supabase.from('site_admins').select('email');
        if (error) throw error;
        siteAdminsCache = (data || []).map(r => (r.email || '').toLowerCase()).filter(Boolean);
    } catch (e) {
        console.warn('site_admins load error:', e.message);
        siteAdminsCache = [];
    }
    if (!siteAdminsCache.length) {
        siteAdminsCache = ADMIN_EMAILS_FALLBACK.map(e => e.toLowerCase());
    }
    recalcIsAdmin();
    renderSiteAdminsAdmin();
}

function recalcIsAdmin() {
    const email = (currentSession?.user?.email || '').toLowerCase();
    isAdmin = !!email && siteAdminsCache.includes(email);
}

function renderSiteAdminsAdmin() {
    const container = $('siteAdminsList');
    if (!container) return;
    container.innerHTML = '';
    if (!siteAdminsCache.length) {
        container.innerHTML = '<div class="empty">Пока нет админов</div>';
        return;
    }
    // Сортируем для стабильного отображения
    const list = siteAdminsCache.slice().sort();
    list.forEach(email => {
        const el = document.createElement('div');
        el.className = 'partners-admin-item';
        const isMe = (currentSession?.user?.email || '').toLowerCase() === email;
        const isFallback = ADMIN_EMAILS_FALLBACK.map(e => e.toLowerCase()).includes(email);
        const badge = isMe ? ' <span style="color:var(--gold);font-size:11px;">— вы</span>' : '';
        const protect = isFallback
            ? '<span style="color:var(--muted);font-size:11px;">основной</span>'
            : '';
        el.innerHTML = `
            <div class="logo-mini"><span>👑</span></div>
            <div class="txt">
                <b>${escapeHtml(email)}${badge}</b>
                ${protect}
            </div>
            <div class="actions">
                ${isFallback ? '' : `<button class="delete" title="Удалить">🗑</button>`}
            </div>
        `;
        const delBtn = el.querySelector('.delete');
        if (delBtn) delBtn.addEventListener('click', () => deleteSiteAdmin(email));
        container.appendChild(el);
    });
}

async function addSiteAdmin(email) {
    const msg = $('siteAdminsMsg');
    msg.textContent = '';
    msg.style.color = '';
    const clean = String(email || '').trim().toLowerCase();
    if (!clean) { msg.textContent = 'Укажи email'; msg.style.color = '#ff7a7a'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
        msg.textContent = 'Некорректный email'; msg.style.color = '#ff7a7a'; return;
    }
    if (siteAdminsCache.includes(clean)) {
        msg.textContent = 'Этот email уже в списке'; msg.style.color = '#ff7a7a'; return;
    }
    const { error } = await supabase.from('site_admins').insert({ email: clean });
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    await logAdminAction('Добавил админа сайта', clean);
    siteAdminsCache.push(clean);
    msg.textContent = '✔ Добавлено'; msg.style.color = '#6ee7a7';
    $('newSiteAdminEmail').value = '';
    renderSiteAdminsAdmin();
}

async function deleteSiteAdmin(email) {
    if (!isAdmin) return;
    if (!confirm(`Удалить админа «${email}»?`)) return;
    const { error } = await supabase.from('site_admins').delete().eq('email', email);
    if (error) return alert('Ошибка: ' + error.message);
    await logAdminAction('Удалил админа сайта', email);
    siteAdminsCache = siteAdminsCache.filter(e => e !== email);
    renderSiteAdminsAdmin();
}

on('addSiteAdminBtn', 'click', () => addSiteAdmin(val('newSiteAdminEmail')));
on('newSiteAdminEmail', 'keydown', e => { if (e.key === 'Enter') $('addSiteAdminBtn').click(); });

/* ============================================================
   ОНЛАЙН
============================================================ */
function getViewerNick() {
    return (localStorage.getItem(VIEWER_NICK_KEY) || '').trim();
}
async function sendHeartbeat() {
    let nickname = getViewerNick();
    if (!nickname) {
        let gid = sessionStorage.getItem('guest_id');
        if (!gid) {
            gid = 'guest_' + Math.random().toString(36).slice(2, 10);
            sessionStorage.setItem('guest_id', gid);
        }
        nickname = gid;
    }
    const nowIso = new Date().toISOString();
    const clanId = currentClan || null;
    try {
        const { data: updated } = await supabase
            .from('online_users')
            .update({ last_seen: nowIso, clan_id: clanId })
            .eq('nickname', nickname)
            .select('nickname');
        if (!updated || !updated.length) {
            await supabase.from('online_users')
                .insert({ nickname, clan_id: clanId, last_seen: nowIso });
        }
    } catch (e) { }
    updateOnlineCount();
}
async function updateOnlineCount() {
    const threshold = new Date(Date.now() - ONLINE_WINDOW_MS).toISOString();
    const { count, error } = await supabase
        .from('online_users')
        .select('*', { count: 'exact', head: true })
        .gte('last_seen', threshold);
    if (error) return;
    const el = $('onlineCount');
    if (el) el.textContent = count || 0;
}
function startHeartbeat() {
    sendHeartbeat();
    clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_MS);
    setInterval(updateOnlineCount, 20000);
}

/* ============================================================
   ФОНЫ
============================================================ */
function getOverrides() {
    try { return JSON.parse(localStorage.getItem(BG_STORAGE_KEY) || '{}'); }
    catch { return {}; }
}
function setOverride(key, dataUrl) {
    const all = getOverrides();
    if (dataUrl) all[key] = dataUrl; else delete all[key];
    try { localStorage.setItem(BG_STORAGE_KEY, JSON.stringify(all)); return true; }
    catch { alert('Фон слишком большой.'); return false; }
}
function currentBgKey() { return currentClan ? currentClan : 'main'; }
function currentBgFallback() {
    if (currentClan && clansCache[currentClan]?.bg) return clansCache[currentClan].bg;
    return null;
}
function applyBg() {
    const key = currentBgKey();
    const override = getOverrides()[key];
    const url = override || currentBgFallback();
    if (url) document.body.style.backgroundImage = `url('${url}')`;
    else document.body.style.backgroundImage = '';
}
function compressImage(file, maxW = 1920, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                const scale = img.width > maxW ? maxW / img.width : 1;
                const w = Math.round(img.width * scale);
                const h = Math.round(img.height * scale);
                const canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
on('bgChangeBtn', 'click', () => {
    if (!canEditClan(currentClan)) return;
    bgFileInput.value = ''; bgFileInput.click();
});
bgFileInput?.addEventListener('change', async () => {
    const file = bgFileInput.files[0]; if (!file) return;
    try {
        const dataUrl = await compressImage(file);
        if (setOverride(currentBgKey(), dataUrl)) applyBg();
    } catch (err) { alert('Не удалось обработать: ' + err.message); }
});
on('bgResetBtn', 'click', () => {
    if (!canEditClan(currentClan)) return;
    const key = currentBgKey();
    if (!getOverrides()[key]) return alert('Уже стоит стандартный фон.');
    if (!confirm('Вернуть стандартный фон?')) return;
    setOverride(key, null); applyBg();
});

/* ============================================================
   ЭКРАНЫ
============================================================ */
function showScreen(name) {
    if (screenHome)  screenHome.hidden  = name !== 'home';
    if (screenClan)  screenClan.hidden  = name !== 'clan';
    if (clanView)    clanView.hidden    = name !== 'lists';
    if (screenAdmin) screenAdmin.hidden = name !== 'admin';
    window.scrollTo(0, 0);
    applyBg();
}

/* ============================================================
   ИГРЫ
============================================================ */
async function loadGames() {
    const { data, error } = await supabase.from('games').select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });
    if (error) { console.error('Games load error:', error); return; }
    gamesCache = {};
    (data || []).forEach(g => { gamesCache[g.id] = g; });
    const saved = localStorage.getItem(GAME_STORAGE_KEY);
    if (saved && gamesCache[saved]) currentGame = saved;
    else currentGame = Object.keys(gamesCache)[0] || null;
    renderGamesAdmin();
    renderNewClanGameSelect();
    applyBg();
}

/* ============================================================
   СОЮЗЫ
============================================================ */
async function loadAlliances() {
    try {
        const { data, error } = await supabase.from('alliances').select('*').order('name');
        if (error) { console.warn('Alliances load error:', error.message); alliancesCache = {}; return; }
        alliancesCache = {};
        (data || []).forEach(a => { alliancesCache[a.id] = a; });
        renderAlliancesAdmin();
        renderAllianceSelects();
    } catch (e) { alliancesCache = {}; }
}
function renderAllianceSelects() {
    ['adminClanAlliance', 'newClanAlliance'].forEach(id => {
        const sel = $(id);
        if (!sel) return;
        const cur = sel.value;
        sel.innerHTML = '';
        const optEmpty = document.createElement('option');
        optEmpty.value = '';
        optEmpty.textContent = '— Без союза —';
        sel.appendChild(optEmpty);
        Object.values(alliancesCache).forEach(a => {
            const o = document.createElement('option');
            o.value = a.id; o.textContent = a.name;
            sel.appendChild(o);
        });
        if (cur && (cur === '' || alliancesCache[cur])) sel.value = cur;
    });
}
function renderAlliancesAdmin() {
    const container = $('alliancesAdminList');
    if (!container) return;
    container.innerHTML = '';
    const list = Object.values(alliancesCache);
    if (!list.length) {
        container.innerHTML = '<div class="empty">Пока нет союзов</div>';
        return;
    }
    list.forEach(a => {
        const memberClans = Object.values(clansCache).filter(c => c.alliance_id === a.id);
        const el = document.createElement('div');
        el.className = 'alliance-admin-item';
        el.innerHTML = `
            <div class="alliance-header">
                <div class="alliance-title">🤝 <b>${escapeHtml(a.name)}</b> <span class="alliance-id">[${escapeHtml(a.id)}]</span></div>
                <div class="alliance-actions">
                    <button class="edit" title="Редактировать">✏️</button>
                    <button class="delete" title="Удалить">🗑</button>
                </div>
            </div>
            ${a.description ? `<div class="alliance-desc">${escapeHtml(a.description)}</div>` : ''}
            <div class="alliance-clans">
                <b>Гильдии в союзе (${memberClans.length}):</b>
                ${memberClans.length
                    ? memberClans.map(c => `<span class="alliance-clan-chip">🏰 ${escapeHtml(c.name)}</span>`).join('')
                    : '<span style="color:var(--muted)">— никого —</span>'}
            </div>
        `;
        el.querySelector('.edit').addEventListener('click', () => openAllianceEdit(a));
        el.querySelector('.delete').addEventListener('click', () => deleteAlliance(a.id, a.name));
        container.appendChild(el);
    });
}

/* ============================================================
   САЙДБАР ГИЛЬДИИ
============================================================ */
document.querySelectorAll('.side-item').forEach(btn => {
    btn.addEventListener('click', () => {
        const section = btn.dataset.section;
        if (!section) return;
        document.querySelectorAll('.side-item').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.clan-section').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById('section-' + section);
        if (target) target.classList.add('active');
        if (section === 'lists') TABS.forEach(loadList);
        else if (section === 'events') renderEvents();
        else if (section === 'treasury') renderTreasury();
        else if (section === 'pvp') renderBuilds('pvp');
        else if (section === 'pb') renderBuilds('pb');
        else if (section === 'contacts') renderContacts();
        else if (section === 'members') { renderMembers(); renderAdmins(); }
        else if (section === 'applications') renderApplications();
    });
});

/* ============================================================
   САЙДБАР АДМИНА
============================================================ */
document.querySelectorAll('.admin-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
        const panel = btn.dataset.apanel;
        if (!panel) return;
        document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        const section = document.querySelector(`.admin-section[data-apanel="${panel}"]`);
        if (section) section.classList.add('active');
        if (panel === 'clans')     renderAdminClanSelect();
        if (panel === 'alliances') renderAlliancesAdmin();
        if (panel === 'games')     renderGamesAdmin();
        if (panel === 'partners')  renderPartnersAdmin();
        if (panel === 'faq')       renderFaqAdmin();
        if (panel === 'tactics')   renderTacticsAdmin();
        if (panel === 'online')    renderAdminOnlineList();
        if (panel === 'admins')    renderSiteAdminsAdmin();
        if (panel === 'settings')  renderSiteFields();
    });
});
on('adminBackHome', 'click', () => { currentClan = null; showScreen('home'); });

/* ============================================================
   ТАКТИКА
============================================================ */
async function loadTactics() {
    try {
        const { data, error } = await supabase.from('tactics').select('*').order('sort_order');
        if (error) { console.warn('Tactics load error:', error.message); tacticsCache = []; }
        else tacticsCache = data || [];
    } catch (e) { tacticsCache = []; }
    renderTacticsModal();
    renderTacticsAdmin();
}
function renderTacticsModal() {
    const body = $('tacticsBody');
    if (!body) return;
    body.innerHTML = '';
    if (!tacticsCache.length) {
        body.innerHTML = '<p class="empty" style="text-align:center;padding:20px;">Разделы тактики пока не добавлены.</p>';
        return;
    }
    tacticsCache.forEach(t => {
        const section = document.createElement('section');
        section.className = 'tactics-section';
        section.innerHTML = `
            <h3>${escapeHtml(t.icon || '📖')} ${escapeHtml(t.title || '')}</h3>
            <div class="tactics-text">${t.content || ''}</div>
        `;
        body.appendChild(section);
    });
}
function openTacticsModal() {
    const modal = $('tacticsModal');
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
}
function closeTacticsModal() {
    const modal = $('tacticsModal');
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
}
on('openTacticsBtn', 'click', openTacticsModal);
on('closeTactics', 'click', closeTacticsModal);
on('tacticsModal', 'click', e => {
    if (e.target.id === 'tacticsModal') closeTacticsModal();
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        const m = $('tacticsModal');
        if (m && !m.hidden) closeTacticsModal();
    }
});

/* ============================================================
   АДМИН: ВХОД
============================================================ */
function openAdminAuth() {
    $('adminAuthModal').hidden = false;
    $('adminAuthError').textContent = '';
    $('adminEmail').value = '';
    $('adminPassword').value = '';
    $('adminNickname').value = localStorage.getItem(VIEWER_NICK_KEY) || '';
    $('adminEmail').focus();
}
function closeAdminAuth() { $('adminAuthModal').hidden = true; }
on('adminLoginBtn', 'click', openAdminAuth);
on('cancelAdminLogin', 'click', closeAdminAuth);
on('doAdminLogin', 'click', async () => {
    const email = val('adminEmail').trim().toLowerCase();
    const password = val('adminPassword');
    const nickname = val('adminNickname').trim();
    const err = $('adminAuthError'); err.textContent = '';
    if (!email || !password) { err.textContent = 'Заполни email и пароль'; return; }
    if (!nickname) { err.textContent = 'Укажи ваш игровой ник'; return; }
    if (nickname.length < 2) { err.textContent = 'Ник слишком короткий'; return; }

    $('doAdminLogin').disabled = true;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    $('doAdminLogin').disabled = false;
    if (error) { err.textContent = error.message; return; }

    // Перезагрузим список админов, чтобы учесть возможные изменения
    await loadSiteAdmins();
    if (!isAdmin) {
        err.textContent = 'Этот email не в списке админов сайта';
        await supabase.auth.signOut();
        return;
    }

    localStorage.setItem(VIEWER_NICK_KEY, nickname);
    sendHeartbeat();
    await logAdminAction('Вход в админ-панель', nickname);
    closeAdminAuth();
});
on('adminPassword', 'keydown', e => {
    if (e.key === 'Enter') $('doAdminLogin').click();
});
async function adminLogout() { await supabase.auth.signOut(); }
on('adminLogoutBtn', 'click', adminLogout);
on('adminLogoutBtn2', 'click', adminLogout);

supabase.auth.onAuthStateChange(async (_e, session) => {
    currentSession = session;
    await loadSiteAdmins();
    await loadClans();
    applyAdminUI();
});

function applyAdminUI() {
    const setHidden = (id, hidden) => {
        const el = $(id);
        if (el) el.hidden = hidden;
    };
    setHidden('adminLoginBtn', isAdmin);
    setHidden('adminLogoutBtn', !isAdmin);
    setHidden('adminPanelBtn', !isAdmin);
    setHidden('adminLogoutBtn2', !isAdmin);
    setHidden('adminPanelBtn2', !isAdmin);
    setHidden('adminPanelBtn3', !isAdmin);
    const label = isAdmin ? '👑 Админ' : '';
    ['adminInfo','adminInfo2','adminInfo3'].forEach(id => {
        const el = $(id); if (el) el.textContent = label;
    });
    document.querySelectorAll('.admin-only').forEach(el => {
        el.hidden = !isAdmin;
        if (!isAdmin) el.style.display = '';
    });
    document.querySelectorAll('.add-form.admin-only').forEach(el => {
        el.style.display = isAdmin ? 'flex' : 'none';
    });
    document.querySelectorAll('.clan-admin-only').forEach(el => {
        const show = canEditClan(currentClan);
        el.hidden = !show;
        if (!show) el.style.display = '';
    });
    document.querySelectorAll('.add-form.clan-admin-only').forEach(el => {
        el.style.display = canEditClan(currentClan) ? 'flex' : 'none';
    });
    const clearBtn = $('chatClear');
    if (clearBtn) clearBtn.hidden = !isAdmin;
    renderAll();
}
function openAdminPage() {
    if (!isAdmin) return;
    const firstNav = document.querySelector('.admin-nav-item[data-apanel="clans"]');
    if (firstNav) firstNav.click();
    renderAdminClanSelect();
    renderSiteFields();
    renderFaqAdmin();
    renderPartnersAdmin();
    renderGamesAdmin();
    renderTacticsAdmin();
    renderAlliancesAdmin();
    renderSiteAdminsAdmin();
    showScreen('admin');
}
on('adminPanelBtn', 'click', openAdminPage);
on('adminPanelBtn2', 'click', openAdminPage);
on('adminPanelBtn3', 'click', openAdminPage);

/* ============================================================
   👥 АДМИН: ОНЛАЙН
============================================================ */
async function renderAdminOnlineList() {
    const container = $('adminOnlineList');
    if (!container) return;
    if (!isAdmin) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';

    const threshold = new Date(Date.now() - ONLINE_WINDOW_MS).toISOString();
    const { data, error } = await supabase
        .from('online_users')
        .select('*')
        .gte('last_seen', threshold)
        .order('last_seen', { ascending: false });

    if (error) {
        container.innerHTML = `<div class="empty">Ошибка: ${error.message}</div>`;
        return;
    }
    if (!data?.length) {
        container.innerHTML = '<div class="empty">Сейчас никого нет на сайте</div>';
        return;
    }

    const me = getViewerNick().toLowerCase();

    container.innerHTML = '';
    data.forEach(u => {
        const nick = u.nickname || '—';
        const isGuest = nick.startsWith('guest_');
        const isMe = nick.toLowerCase() === me;
        const clanName = u.clan_id && clansCache[u.clan_id]
            ? clansCache[u.clan_id].name
            : (u.clan_id || null);

        const diff = Date.now() - new Date(u.last_seen).getTime();
        let timeLabel;
        if (diff < 60000) timeLabel = 'только что';
        else if (diff < 3600000) timeLabel = `${Math.floor(diff/60000)} мин назад`;
        else timeLabel = `${Math.floor(diff/3600000)} ч назад`;

        const el = document.createElement('div');
        el.className = 'online-item' + (isGuest ? ' guest' : '') + (isMe ? ' me' : '');
        const icon = isGuest ? '👤' : '🟢';
        const name = isGuest ? `Гость (${nick})` : nick;

        el.innerHTML = `
            <div class="online-icon">${icon}</div>
            <div class="online-info">
                <div class="online-nick">${escapeHtml(name)}${isMe ? ' <span class="online-me">— это вы</span>' : ''}</div>
                <div class="online-meta">
                    ${clanName ? `🏰 ${escapeHtml(clanName)} · ` : ''}⏱ ${timeLabel}
                </div>
            </div>
            <div class="online-actions">
                ${!isGuest && !isMe
                    ? `<button class="online-msg-btn" data-nick="${escapeHtml(nick)}" title="Написать личное сообщение">✉️ Написать</button>`
                    : isGuest
                        ? `<span class="online-hint">гость</span>`
                        : ''}
            </div>
        `;

        const msgBtn = el.querySelector('.online-msg-btn');
        if (msgBtn) msgBtn.addEventListener('click', () => openPrivateChat(msgBtn.dataset.nick));
        container.appendChild(el);
    });
}
on('refreshOnlineList', 'click', renderAdminOnlineList);

/* ============================================================
   ГИЛЬДИИ
============================================================ */
async function loadClans() {
    const source = isAdmin ? 'clans' : 'clans_public';
    const { data, error } = await supabase.from(source).select('*');
    if (error) { console.error('loadClans error:', error); return; }
    clansCache = {};
    (data || []).forEach(c => { clansCache[c.id] = c; });
    renderHomeCards();
    renderAdminClanSelect();
    renderScopeSelects();
    renderContacts();
    renderTradeClanSelect();
    renderTradeClanFilters();
    renderApplyClanSelect();
    renderAlliancesAdmin();
    if (currentClan) updateAllianceBar();
}
function getClansForGame(gameId) {
    return Object.values(clansCache).filter(c => (c.game_id || 'wosb') === gameId);
}
function renderHomeCards() {
    const grid = $('clanGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const list = currentGame ? getClansForGame(currentGame) : Object.values(clansCache);
    if (!list.length) {
        grid.innerHTML = '<div class="empty">В этой игре пока нет гильдий</div>';
        return;
    }
    list.forEach(clan => {
        const btn = document.createElement('button');
        btn.className = 'clan-card';
        btn.dataset.clan = clan.id;
        btn.innerHTML = `
            <img src="${escapeHtml(clan.image || '')}" alt="${escapeHtml(clan.name)}" onerror="this.style.display='none'">
            <span class="clan-name">${escapeHtml(clan.name)}</span>
            <span class="clan-desc">${escapeHtml(clan.description || '')}</span>
            <span class="clan-more">Подробнее →</span>
        `;
        btn.addEventListener('click', () => handleClanClick(clan.id));
        grid.appendChild(btn);
    });
}
function isUnlocked() { return isAdmin || localStorage.getItem(UNLOCK_KEY) === '1'; }
function handleClanClick(id) {
    isUnlocked() ? openClan(id) : openClanInfo(id);
}

/* ============================================================
   SCOPE
============================================================ */
function renderScopeSelects() {
    const clans = Object.values(clansCache);
    ['pvpScope', 'pbScope', 'buildEditScope', 'buildDupScope', 'evScope'].forEach(id => {
        const sel = $(id);
        if (!sel) return;
        const current = sel.value;
        sel.innerHTML = '';
        const opt1 = document.createElement('option');
        opt1.value = SHARED;
        opt1.textContent = '🌐 Общий';
        sel.appendChild(opt1);
        clans.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = '🏰 ' + c.name;
            sel.appendChild(opt);
        });
        if (current && Array.from(sel.options).some(o => o.value === current)) {
            sel.value = current;
        } else if (currentClan && (id === 'pvpScope' || id === 'pbScope' || id === 'evScope')) {
            sel.value = currentClan;
        }
    });
}

/* ============================================================
   ОПИСАНИЕ ГИЛЬДИИ
============================================================ */
function openClanInfo(id) {
    const clan = clansCache[id];
    if (!clan) return;
    pendingClanId = id;
    const setSrc = (elId, src) => { const el = $(elId); if (el) el.src = src; };
    const setText = (elId, txt) => { const el = $(elId); if (el) el.textContent = txt; };
    setSrc('clanInfoLogo', clan.image || '');
    setText('clanInfoName', clan.name);
    setText('clanInfoDesc', clan.description || '');
    setText('clanInfoRules', clan.rules || 'Правила не заданы.');
    const newsWrap = $('clanInfoNewsWrap');
    if (clan.news && clan.news.trim()) {
        if (newsWrap) newsWrap.hidden = false;
        setText('clanInfoNews', clan.news);
    } else { if (newsWrap) newsWrap.hidden = true; }
    const allyWrap = $('clanInfoAllianceWrap');
    if (clan.alliance_id && alliancesCache[clan.alliance_id]) {
        const ally = alliancesCache[clan.alliance_id];
        const members = Object.values(clansCache).filter(c => c.alliance_id === ally.id && c.id !== clan.id);
        if (allyWrap) allyWrap.hidden = false;
        setText('clanInfoAlliance', `${ally.name}${ally.description ? ' — ' + ally.description : ''}\nСостоят: ${members.length ? members.map(c => c.name).join(', ') : 'только эта гильдия'}`);
    } else {
        if (allyWrap) allyWrap.hidden = true;
    }
    const loginBtn = $('clanLoginBtn');
    const viewBtn = $('clanViewBtn');
    if (loginBtn) loginBtn.hidden = isUnlocked();
    if (viewBtn) viewBtn.hidden = !isUnlocked();
    showScreen('clan');
}
on('backToHomeBtn', 'click', () => { pendingClanId = null; showScreen('home'); });
on('clanViewBtn', 'click', () => { if (pendingClanId) openClan(pendingClanId); });

/* ============================================================
   ВХОД ПО ПАРОЛЮ (с проверкой списка участников)
============================================================ */
on('clanLoginBtn', 'click', () => {
    if (!pendingClanId) return;
    const clan = clansCache[pendingClanId];
    if (!clan) return;
    const nameEl = $('clanPassName');
    if (nameEl) nameEl.textContent = clan.name;
    $('clanNickname').value = localStorage.getItem(VIEWER_NICK_KEY) || '';
    $('clanPassword').value = '';
    $('clanPassError').textContent = '';
    $('clanPassModal').hidden = false;
    ($('clanNickname').value ? $('clanPassword') : $('clanNickname')).focus();
});
on('cancelClanLogin', 'click', () => { $('clanPassModal').hidden = true; });

function normalizeNickList(raw) {
    if (!raw) return [];
    return String(raw).split('\n')
        .map(s => s.trim().replace(/^\d+\s*[-.)\]]?\s*/, '').trim())
        .filter(Boolean)
        .map(s => s.toLowerCase());
}

on('doClanLogin', 'click', async () => {
    const nick = val('clanNickname').trim();
    const entered = val('clanPassword');
    const clan = clansCache[pendingClanId];
    if (!clan) return;
    if (!nick) { $('clanPassError').textContent = 'Введите ваш ник'; return; }
    if (nick.length < 2) { $('clanPassError').textContent = 'Ник слишком короткий'; return; }
    if (!entered) { $('clanPassError').textContent = 'Введите пароль'; return; }

    const { data: ok, error: rpcErr } = await supabase.rpc('verify_clan_password', {
        clan_id: pendingClanId,
        entered_password: entered
    });
    let isClanAdminLogin = false;

    if (rpcErr || !ok) {
        const { data: okAdmin, error: admErr } = await supabase.rpc('verify_clan_admin_password', {
            cid: pendingClanId,
            entered: entered
        });
        if (admErr || !okAdmin) {
            $('clanPassError').textContent = 'Неверный пароль';
            return;
        }
        isClanAdminLogin = true;
    }

    const adminNicks = normalizeNickList(clan.admin_nicks);
    if (adminNicks.includes(nick.toLowerCase())) {
        isClanAdminLogin = true;
    }

    const memberNicks = normalizeNickList(clan.members_list);
    if (memberNicks.length > 0) {
        const isKnownAdmin = isClanAdminLogin || adminNicks.includes(nick.toLowerCase());
        if (!isKnownAdmin && !memberNicks.includes(nick.toLowerCase())) {
            $('clanPassError').textContent = 'Вашего ника нет в списке участников гильдии';
            return;
        }
    }

    localStorage.setItem(VIEWER_NICK_KEY, nick);
    localStorage.setItem(UNLOCK_KEY, '1');
    localStorage.setItem(CLAN_PASS_KEY, entered);
    localStorage.setItem(CLAN_ADMIN_PASS_KEY, isClanAdminLogin ? '1' : '0');

    $('clanPassModal').hidden = true;
    await logView(nick, pendingClanId, isClanAdminLogin ? 'вход в гильдию (админ)' : 'вход в гильдию');
    sendHeartbeat();
    const tn = $('tm-nickname');
    if (tn && !tn.value) tn.value = nick;
    const cid = pendingClanId; pendingClanId = null;
    openClan(cid, isClanAdminLogin);
});
on('clanNickname', 'keydown', e => { if (e.key === 'Enter') $('clanPassword').focus(); });
on('clanPassword', 'keydown', e => { if (e.key === 'Enter') $('doClanLogin').click(); });

/* ============================================================
   ПОЛОСА СОЮЗНЫХ ГИЛЬДИЙ
============================================================ */
function updateAllianceBar() {
    const bar = $('allianceBar');
    const list = $('allianceBarList');
    if (!bar || !list) return;
    const myClan = clansCache[currentClan];
    if (!myClan || !myClan.alliance_id) {
        bar.hidden = true;
        return;
    }
    const ally = alliancesCache[myClan.alliance_id];
    const members = Object.values(clansCache).filter(c =>
        c.alliance_id === myClan.alliance_id && c.id !== currentClan
    );
    if (!members.length) {
        bar.hidden = true;
        return;
    }
    bar.hidden = false;
    bar.querySelector('.alliance-bar-label').textContent = `🤝 ${ally ? ally.name : 'Союз'}:`;
    list.innerHTML = '';
    members.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'alliance-chip';
        btn.innerHTML = `<img src="${escapeHtml(c.image || '')}" alt="" onerror="this.style.display='none'"> ${escapeHtml(c.name)}`;
        btn.addEventListener('click', () => openClan(c.id, false));
        list.appendChild(btn);
    });
}

/* ============================================================
   ОТКРЫТИЕ ГИЛЬДИИ
============================================================ */
function openClan(id, isClanAdminLogin = false) {
    const clan = clansCache[id];
    if (!clan) return;
    if (!isUnlocked()) { openClanInfo(id); return; }
    currentClan = id;
    localStorage.setItem(LAST_CLAN_KEY, id);
    currentClanIsAdmin = isClanAdminLogin || (localStorage.getItem(CLAN_ADMIN_PASS_KEY) === '1' && localStorage.getItem(LAST_CLAN_KEY) === id);
    currentClanPass = localStorage.getItem(CLAN_PASS_KEY) || null;
    if (!currentClanIsAdmin) currentClanPass = null;

    const titleEl = $('clanTitle');
    if (titleEl) titleEl.textContent = clan.name;
    const iconEl = $('clanIcon');
    if (iconEl) { iconEl.src = clan.image || ''; iconEl.alt = clan.name; }
    showScreen('lists');
    document.querySelectorAll('.side-item').forEach(b => b.classList.toggle('active', b.dataset.section === 'lists'));
    document.querySelectorAll('.clan-section').forEach(s => s.classList.toggle('active', s.id === 'section-lists'));
    currentTab = 'enemies';
    document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === 'enemies'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === 'tab-enemies'));
    renderScopeSelects();
    applyAdminUI();
    updateAllianceBar();
    renderAll();
    renderBuilds('pvp');
    renderBuilds('pb');
    renderContacts();
    renderEvents();
    renderTreasury();
    renderApplications();
    renderMembers();
    renderAdmins();
    sendHeartbeat();
    initRealtime();
}
on('backBtn', 'click', () => {
    currentClan = null;
    currentClanIsAdmin = false;
    currentClanPass = null;
    closeChat();
    showScreen('home');
    sendHeartbeat();
    closeRealtime();
});
on('clanLeaveBtn', 'click', () => {
    if (!confirm('Заблокировать просмотр? Пароль потребуется ввести снова.')) return;
    localStorage.removeItem(UNLOCK_KEY);
    localStorage.removeItem(LAST_CLAN_KEY);
    localStorage.removeItem(CLAN_PASS_KEY);
    localStorage.removeItem(CLAN_ADMIN_PASS_KEY);
    currentClan = null;
    currentClanIsAdmin = false;
    currentClanPass = null;
    closeChat();
    closeRealtime();
    showScreen('home');
    sendHeartbeat();
});

/* ============================================================
   ВКЛАДКИ
============================================================ */
document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        currentTab = btn.dataset.tab;
        const tabContent = $('tab-' + currentTab);
        if (tabContent) tabContent.classList.add('active');
        applySearchFilter();
    });
});

/* ============================================================
   ПОИСК
============================================================ */
on('searchInput', 'input', applySearchFilter);
function applySearchFilter() {
    const input = $('searchInput');
    if (!input) return;
    const q = input.value.toLowerCase().trim();
    document.querySelectorAll('.tab-content.active .player-list li').forEach(li => {
        if (!q) { li.style.display = ''; return; }
        li.style.display = li.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
}

/* ============================================================
   СПИСКИ
============================================================ */
function renderAll() { if (currentClan) TABS.forEach(loadList); }
async function loadList(tab) {
    if (!currentClan) return;
    const ul = document.querySelector(`[data-list="${tab}"]`);
    if (!ul) return;
    ul.innerHTML = '<li class="empty">Загрузка…</li>';
    const { data, error } = await supabase.from(tab).select('*').eq('clan', currentClan)
        .order('created_at', { ascending: false });
    ul.innerHTML = '';
    if (error) { ul.innerHTML = `<li class="empty">Ошибка: ${error.message}</li>`; return; }
    if (!data?.length) { ul.innerHTML = '<li class="empty">Список пуст</li>'; return; }
    data.forEach(item => {
        const li = document.createElement('li');
        const parts = [];
        if (item.nickname)     parts.push(`<span class="nick" data-nick="${escapeHtml(item.nickname)}">${escapeHtml(item.nickname)}</span>`);
        if (item.player_guild) parts.push(`<span class="guild">${escapeHtml(item.player_guild)}</span>`);
        if (item.faction)      parts.push(`<span class="faction">${escapeHtml(item.faction)}</span>`);
        const canEdit = canEditClan(currentClan);
        const actions = canEdit ? `<div class="actions">
            <button class="edit" title="Ред.">✏️</button>
            <button class="move" title="Пер.">↔</button>
            <button class="delete" title="Уд.">🗑</button>
        </div>` : '';
        li.innerHTML = `<div class="info"><div class="row-main">${parts.join('')}</div>
            ${item.note ? `<span class="note">${escapeHtml(item.note)}</span>` : ''}</div>${actions}`;
        if (canEdit) {
            li.querySelector('.edit').addEventListener('click', () => openEditModal(tab, item));
            li.querySelector('.move').addEventListener('click', () => openMoveModal(tab, item.id));
            li.querySelector('.delete').addEventListener('click', () => deleteItem(tab, item.id));
        }
        const nickEl = li.querySelector('.nick');
        if (nickEl) nickEl.addEventListener('click', () => openProfile(item.nickname));
        ul.appendChild(li);
    });
    applySearchFilter();
}

/* ============================================================
   БИЛДЫ
============================================================ */
function parseLines(text) {
    if (!text) return [];
    return String(text).split('\n').map(s => s.trim()).filter(Boolean);
}
function parseBonus(text) {
    const m = String(text).match(/^(.+?)\s*([+-]\s*\d+)\s*$/);
    if (!m) return { stat: text.trim(), value: null };
    return { stat: m[1].trim(), value: parseInt(m[2].replace(/\s/g, ''), 10) };
}
function parseSpecialists(text) {
    return parseLines(text).map(line => {
        const parts = line.split('|').map(p => p.trim()).filter(Boolean);
        if (!parts.length) return null;
        return { name: parts[0], bonuses: parts.slice(1).map(parseBonus) };
    }).filter(Boolean);
}
async function renderBuilds(type) {
    if (!currentClan) return;
    const container = $(type === 'pvp' ? 'pvpList' : 'pbList');
    if (!container) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    const { data, error } = await supabase.from('builds').select('*')
        .eq('type', type)
        .or(`is_shared.eq.true,clan.eq.${currentClan}`)
        .order('created_at', { ascending: false });
    if (error) { container.innerHTML = `<div class="empty">Ошибка: ${error.message}</div>`; return; }
    if (!data?.length) { container.innerHTML = '<div class="empty">Билды пока не добавлены</div>'; return; }
    container.innerHTML = '';
    if (type === 'pb') {
        const groups = {};
        data.forEach(b => {
            const r = b.rank || '—';
            (groups[r] ||= []).push(b);
        });
        const ranks = Object.keys(groups).sort((a, b) => {
            const na = parseInt(a, 10), nb = parseInt(b, 10);
            if (isNaN(na) && isNaN(nb)) return a.localeCompare(b);
            if (isNaN(na)) return 1;
            if (isNaN(nb)) return -1;
            return na - nb;
        });
        ranks.forEach(rank => {
            const g = document.createElement('div');
            g.className = 'build-group';
            const t = document.createElement('h3');
            t.className = 'build-group-title';
            t.textContent = `Ранг ${rank}`;
            g.appendChild(t);
            groups[rank].forEach(item => g.appendChild(createBuildCard(item)));
            container.appendChild(g);
        });
    } else {
        data.forEach(item => container.appendChild(createBuildCard(item)));
    }
}
function createBuildCard(item) {
    const card = document.createElement('div');
    card.className = 'build-card';
    const upgrades = parseLines(item.upgrades);
    const weapS = parseLines(item.weapons_small);
    const weapM = parseLines(item.weapons_medium);
    const weapL = parseLines(item.weapons_large);
    const cons = [item.consumable1, item.consumable2, item.consumable3].filter(Boolean);
    const cargo = item.cargo ? parseLines(item.cargo) : [];
    const specs = parseSpecialists(item.specialists);
    const scopeBadge = item.is_shared
        ? `<span class="build-scope shared">🌐 Общий</span>`
        : `<span class="build-scope clan">🏰 ${escapeHtml(clansCache[item.clan]?.name || item.clan || '?')}</span>`;
    const rankBadge = (item.type === 'pb' && item.rank)
        ? `<span class="build-rank">Ранг ${escapeHtml(item.rank)}</span>` : '';
    const canEditThis = canEditClan(item.clan) || isAdmin;
    const actions = `<div class="build-actions">
        <button class="share" title="Скопировать ссылку">🔗</button>
        ${canEditThis ? `
            <button class="edit" title="Редактировать">✏️</button>
            <button class="copy" title="Дублировать">📋</button>
            <button class="delete" title="Удалить">🗑</button>
        ` : ''}
    </div>`;
    card.innerHTML = `
        <div class="build-header">
            <h3 class="build-ship">${escapeHtml(item.ship_name)}</h3>
            ${rankBadge}${scopeBadge}${actions}
        </div>
        ${upgrades.length ? `<div class="build-section"><div class="build-section-label">🔧 Апгрейды</div><div class="build-chips">${upgrades.map(u => `<span class="chip chip-upgrade">${escapeHtml(u)}</span>`).join('')}</div></div>` : ''}
        ${weapS.length ? `<div class="build-section"><div class="build-section-label">🟢 Малые пушки (до 12ф)</div><div class="build-chips">${weapS.map(w => `<span class="chip chip-weap-small">${escapeHtml(w)}</span>`).join('')}</div></div>` : ''}
        ${weapM.length ? `<div class="build-section"><div class="build-section-label">🟡 Средние пушки (до 24ф)</div><div class="build-chips">${weapM.map(w => `<span class="chip chip-weap-medium">${escapeHtml(w)}</span>`).join('')}</div></div>` : ''}
        ${weapL.length ? `<div class="build-section"><div class="build-section-label">🔴 Большие пушки (до 48ф)</div><div class="build-chips">${weapL.map(w => `<span class="chip chip-weap-large">${escapeHtml(w)}</span>`).join('')}</div></div>` : ''}
        ${cons.length ? `<div class="build-section"><div class="build-section-label">⚗️ Расходники</div><div class="build-chips">${cons.map(c => `<span class="chip chip-cons">${escapeHtml(c)}</span>`).join('')}</div></div>` : ''}
        ${cargo.length ? `<div class="build-section"><div class="build-section-label">📦 Трюм</div><div class="build-chips">${cargo.map(c => `<span class="chip chip-cargo">${escapeHtml(c)}</span>`).join('')}</div></div>` : ''}
        ${specs.length ? `<div class="build-section"><div class="build-section-label">👤 Специалисты</div><div class="spec-list">${specs.map(s => `<div class="spec-item"><div class="spec-name">${escapeHtml(s.name)}</div>${s.bonuses.length ? `<div class="spec-bonuses">${s.bonuses.map(b => { const cls = b.value === null ? 'neutral' : (b.value > 0 ? 'plus' : 'minus'); const val = b.value === null ? '' : ` ${b.value > 0 ? '+' : ''}${b.value}`; return `<span class="spec-bonus ${cls}">${escapeHtml(b.stat)}${val}</span>`; }).join('')}</div>` : ''}</div>`).join('')}</div></div>` : ''}
    `;
    card.querySelector('.share').addEventListener('click', () => {
        const url = `${location.origin}${location.pathname}#build=${item.id}`;
        navigator.clipboard.writeText(url).then(
            () => alert('🔗 Ссылка на билд скопирована!'),
            () => prompt('Скопируйте ссылку:', url)
        );
    });
    if (canEditThis) {
        card.querySelector('.edit').addEventListener('click', () => openBuildEdit(item));
        card.querySelector('.copy').addEventListener('click', () => openBuildDup(item));
        card.querySelector('.delete').addEventListener('click', () => deleteBuild(item.id, item.type));
    }
    return card;
}

/* ============================================================
   ДОБАВЛЕНИЕ БИЛДА
============================================================ */
async function addBuild(type) {
    if (!canEditClan(currentClan)) return;
    const isPvp = type === 'pvp';
    const scopeEl = $(isPvp ? 'pvpScope' : 'pbScope');
    const scopeVal = scopeEl ? scopeEl.value : SHARED;
    const isShared = scopeVal === SHARED;
    const clanValue = isShared ? null : scopeVal;
    const rank = isPvp ? null : val(`${type}Rank`).trim();
    const ship = val(`${type}Ship`).trim();
    const statusEl = $(`${type}Status`);
    if (!ship) { flashStatusEl(statusEl, 'Введите название корабля', '#ff7a7a'); return; }
    if (!isPvp && !rank) { flashStatusEl(statusEl, 'Укажите ранг', '#ff7a7a'); return; }

    const data = {
        type, rank: rank || null, ship_name: ship,
        upgrades: val(`${type}Upgrades`) || null,
        weapons_small: val(`${type}WeapS`) || null,
        weapons_medium: val(`${type}WeapM`) || null,
        weapons_large: val(`${type}WeapL`) || null,
        consumable1: val(`${type}Cons1`).trim() || null,
        consumable2: val(`${type}Cons2`).trim() || null,
        consumable3: val(`${type}Cons3`).trim() || null,
        cargo: val(`${type}Cargo`) || null,
        specialists: val(`${type}Specs`) || null
    };

    if (isAdmin) {
        const { error } = await supabase.from('builds').insert({
            clan: clanValue, is_shared: isShared, ...data
        });
        if (error) { flashStatusEl(statusEl, 'Ошибка: ' + error.message, '#ff7a7a'); return; }
    } else {
        const { data: resp, error } = await supabase.rpc('clan_admin_action', {
            action: 'insert', target_table: 'builds', target_clan: currentClan,
            entered_password: currentClanPass,
            data: { ...data, is_shared: false }
        });
        if (error || resp?.error) {
            flashStatusEl(statusEl, 'Ошибка: ' + (resp?.error || error.message), '#ff7a7a'); return;
        }
    }

    await logAdminAction(`Добавил билд ${type.toUpperCase()}`, ship);
    ['Rank','Ship','Upgrades','WeapS','WeapM','WeapL','Cons1','Cons2','Cons3','Cargo','Specs']
        .forEach(suffix => {
            const el = $(`${type}${suffix}`);
            if (el) el.value = '';
        });
    flashStatusEl(statusEl, '✔ Добавлено', '#6ee7a7');
    renderBuilds(type);
}
on('pvpAddBtn', 'click', () => addBuild('pvp'));
on('pbAddBtn', 'click', () => addBuild('pb'));

/* ============================================================
   РЕДАКТИРОВАНИЕ БИЛДА
============================================================ */
function openBuildEdit(item) {
    editingBuild = { id: item.id, type: item.type, clan: item.clan };
    const titleEl = $('buildEditTitle');
    if (titleEl) titleEl.textContent = item.type === 'pvp'
        ? '✏️ Редактировать ПВП-билд' : '✏️ Редактировать ПБ-билд';
    const rankField = $('buildEditRankField');
    if (item.type === 'pb') { if (rankField) rankField.hidden = false; $('buildEditRank').value = item.rank || ''; }
    else { if (rankField) rankField.hidden = true; $('buildEditRank').value = ''; }
    $('buildEditShip').value = item.ship_name || '';
    $('buildEditUpgrades').value = item.upgrades || '';
    $('buildEditWeapS').value = item.weapons_small || '';
    $('buildEditWeapM').value = item.weapons_medium || '';
    $('buildEditWeapL').value = item.weapons_large || '';
    $('buildEditCons1').value = item.consumable1 || '';
    $('buildEditCons2').value = item.consumable2 || '';
    $('buildEditCons3').value = item.consumable3 || '';
    $('buildEditCargo').value = item.cargo || '';
    $('buildEditSpecs').value = item.specialists || '';
    renderScopeSelects();
    $('buildEditScope').value = item.is_shared ? SHARED : (item.clan || SHARED);
    $('buildEditError').textContent = '';
    $('buildEditModal').hidden = false;
    $('buildEditShip').focus();
}
on('cancelBuildEdit', 'click', () => {
    $('buildEditModal').hidden = true; editingBuild = null;
});
on('saveBuildEdit', 'click', async () => {
    if (!editingBuild) return;
    const scopeVal = val('buildEditScope');
    const isShared = scopeVal === SHARED;
    const clanValue = isShared ? null : scopeVal;
    const rank = val('buildEditRank').trim();
    const ship = val('buildEditShip').trim();
    if (!ship) { $('buildEditError').textContent = 'Введите название корабля'; return; }
    if (editingBuild.type === 'pb' && !rank) { $('buildEditError').textContent = 'Укажите ранг'; return; }

    const data = {
        rank: editingBuild.type === 'pb' ? rank : null,
        ship_name: ship,
        upgrades: val('buildEditUpgrades') || null,
        weapons_small: val('buildEditWeapS') || null,
        weapons_medium: val('buildEditWeapM') || null,
        weapons_large: val('buildEditWeapL') || null,
        consumable1: val('buildEditCons1').trim() || null,
        consumable2: val('buildEditCons2').trim() || null,
        consumable3: val('buildEditCons3').trim() || null,
        cargo: val('buildEditCargo') || null,
        specialists: val('buildEditSpecs') || null
    };

    if (isAdmin) {
        const { error } = await supabase.from('builds').update({
            clan: clanValue, is_shared: isShared, ...data
        }).eq('id', editingBuild.id);
        if (error) { $('buildEditError').textContent = 'Ошибка: ' + error.message; return; }
    } else {
        const { data: resp, error } = await supabase.rpc('clan_admin_action', {
            action: 'update', target_table: 'builds', target_clan: currentClan,
            entered_password: currentClanPass, record_id: editingBuild.id,
            data
        });
        if (error || resp?.error) { $('buildEditError').textContent = 'Ошибка: ' + (resp?.error || error.message); return; }
    }

    await logAdminAction(`Изменил билд ${editingBuild.type.toUpperCase()}`, ship);
    const type = editingBuild.type;
    $('buildEditModal').hidden = true;
    editingBuild = null;
    renderBuilds(type);
});

/* ============================================================
   ДУБЛИРОВАНИЕ
============================================================ */
function openBuildDup(item) {
    duplicatingBuild = item;
    $('buildDupName').textContent = item.ship_name;
    renderScopeSelects();
    $('buildDupScope').value = SHARED;
    $('buildDupMsg').textContent = '';
    $('buildDupModal').hidden = false;
}
on('cancelBuildDup', 'click', () => {
    $('buildDupModal').hidden = true; duplicatingBuild = null;
});
on('doBuildDup', 'click', async () => {
    if (!duplicatingBuild) return;
    const scopeVal = val('buildDupScope');
    const isShared = scopeVal === SHARED;
    const clanValue = isShared ? null : scopeVal;
    const msg = $('buildDupMsg');
    msg.style.color = '';
    const item = duplicatingBuild;

    if (!isAdmin) {
        msg.textContent = 'Дублирование доступно только админу сайта';
        msg.style.color = '#ff7a7a';
        return;
    }

    const { error } = await supabase.from('builds').insert({
        clan: clanValue, is_shared: isShared, type: item.type,
        rank: item.rank || null, ship_name: item.ship_name,
        upgrades: item.upgrades || null,
        weapons_small: item.weapons_small || null,
        weapons_medium: item.weapons_medium || null,
        weapons_large: item.weapons_large || null,
        consumable1: item.consumable1 || null,
        consumable2: item.consumable2 || null,
        consumable3: item.consumable3 || null,
        cargo: item.cargo || null, specialists: item.specialists || null
    });
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    await logAdminAction('Дублировал билд', item.ship_name);
    msg.textContent = '✔ Копия создана';
    msg.style.color = '#6ee7a7';
    setTimeout(() => {
        $('buildDupModal').hidden = true;
        duplicatingBuild = null;
        renderBuilds(item.type);
    }, 700);
});
async function deleteBuild(id, type) {
    if (!confirm('Удалить билд?')) return;
    if (isAdmin) {
        const { error } = await supabase.from('builds').delete().eq('id', id);
        if (error) return alert(error.message);
    } else {
        const { data: resp, error } = await supabase.rpc('clan_admin_action', {
            action: 'delete', target_table: 'builds', target_clan: currentClan,
            entered_password: currentClanPass, record_id: id
        });
        if (error || resp?.error) return alert('Ошибка: ' + (resp?.error || error.message));
    }
    await logAdminAction(`Удалил билд ${type.toUpperCase()}`, null, `id: ${id}`);
    renderBuilds(type);
}

/* ============================================================
   СОБЫТИЯ
============================================================ */
async function renderEvents() {
    if (!currentClan) return;
    const container = $('eventsList');
    if (!container) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    const { data, error } = await supabase.from('events').select('*')
        .or(`is_shared.eq.true,clan.eq.${currentClan}`)
        .order('event_date', { ascending: true });
    if (error) { container.innerHTML = `<div class="empty">Ошибка: ${error.message}</div>`; return; }
    if (!data?.length) { container.innerHTML = '<div class="empty">Событий пока нет</div>'; return; }
    container.innerHTML = '';
    const now = Date.now();
    const monthNames = ['ЯНВ','ФЕВ','МАР','АПР','МАЯ','ИЮН','ИЮЛ','АВГ','СЕН','ОКТ','НОЯ','ДЕК'];
    data.forEach(ev => {
        const d = new Date(ev.event_date);
        const isPast = d.getTime() < now;
        const day = String(d.getDate()).padStart(2, '0');
        const month = monthNames[d.getMonth()];
        const time = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
        const card = document.createElement('div');
        card.className = 'event-card' + (isPast ? ' past' : '');
        const scopeBadge = ev.is_shared
            ? `<span class="event-badge shared">🌐 Общий</span>`
            : `<span class="event-badge clan">🏰 ${escapeHtml(clansCache[ev.clan]?.name || ev.clan)}</span>`;
        const canDel = canEditClan(ev.clan);
        const actions = canDel ? `<div class="event-actions"><button class="delete" title="Удалить">🗑</button></div>` : '';
        card.innerHTML = `
            <div class="event-date-block">
                <div class="event-day">${day}</div>
                <div class="event-month">${month}</div>
            </div>
            <div class="event-info">
                <div class="event-title">${scopeBadge}${escapeHtml(ev.title)}</div>
                <div class="event-time">🕐 ${d.toLocaleDateString('ru-RU')} в ${time}</div>
                ${ev.description ? `<div class="event-desc">${escapeHtml(ev.description)}</div>` : ''}
            </div>
            ${actions}`;
        if (canDel) {
            card.querySelector('.delete').addEventListener('click', async () => {
                if (!confirm('Удалить событие?')) return;
                if (isAdmin) {
                    const { error } = await supabase.from('events').delete().eq('id', ev.id);
                    if (error) return alert(error.message);
                } else {
                    const { data: resp, error } = await supabase.rpc('clan_admin_action', {
                        action: 'delete', target_table: 'events', target_clan: currentClan,
                        entered_password: currentClanPass, record_id: ev.id
                    });
                    if (error || resp?.error) return alert('Ошибка: ' + (resp?.error || error.message));
                }
                await logAdminAction('Удалил событие', ev.title);
                renderEvents();
            });
        }
        container.appendChild(card);
    });
}
on('evAddBtn', 'click', async () => {
    if (!canEditClan(currentClan)) return;
    const title = val('evTitle').trim();
    const dateStr = val('evDate');
    const desc = val('evDesc').trim();
    const scopeVal = val('evScope');
    const isShared = scopeVal === SHARED;
    const clanVal = isShared ? null : scopeVal;
    const statusEl = $('evStatus');
    if (!title) { flashStatusEl(statusEl, 'Введите название', '#ff7a7a'); return; }
    if (!dateStr) { flashStatusEl(statusEl, 'Укажите дату', '#ff7a7a'); return; }

    if (isAdmin) {
        const { error } = await supabase.from('events').insert({
            clan: clanVal, is_shared: isShared, title,
            event_date: new Date(dateStr).toISOString(),
            description: desc || null
        });
        if (error) { flashStatusEl(statusEl, 'Ошибка: ' + error.message, '#ff7a7a'); return; }
    } else {
        const { data: resp, error } = await supabase.rpc('clan_admin_action', {
            action: 'insert', target_table: 'events', target_clan: currentClan,
            entered_password: currentClanPass,
            data: { title, event_date: new Date(dateStr).toISOString(), description: desc || null }
        });
        if (error || resp?.error) { flashStatusEl(statusEl, 'Ошибка: ' + (resp?.error || error.message), '#ff7a7a'); return; }
    }

    await logAdminAction('Добавил событие', title);
    ['evTitle','evDate','evDesc'].forEach(id => { const el = $(id); if (el) el.value = ''; });
    flashStatusEl(statusEl, '✔ Добавлено', '#6ee7a7');
    renderEvents();
});

/* ============================================================
   КАЗНА
============================================================ */
async function renderTreasury() {
    if (!currentClan) return;
    const container = $('treasuryList');
    if (!container) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    const { data, error } = await supabase.from('treasury').select('*')
        .eq('clan', currentClan)
        .order('created_at', { ascending: false });
    if (error) { container.innerHTML = `<div class="empty">Ошибка: ${error.message}</div>`; return; }
    const list = data || [];
    let balance = 0;
    list.forEach(t => {
        const amt = Number(t.amount) || 0;
        balance += t.type === 'in' ? amt : -amt;
    });
    const balEl = $('treasuryBalance');
    if (balEl) {
        balEl.textContent = balance.toLocaleString('ru-RU');
        balEl.classList.toggle('negative', balance < 0);
    }
    if (!list.length) { container.innerHTML = '<div class="empty">Операций пока нет</div>'; return; }
    container.innerHTML = '';
    list.forEach(t => {
        const amt = Number(t.amount) || 0;
        const d = new Date(t.created_at);
        const dateStr = d.toLocaleDateString('ru-RU') + ' ' +
                        String(d.getHours()).padStart(2,'0') + ':' +
                        String(d.getMinutes()).padStart(2,'0');
        const item = document.createElement('div');
        item.className = 'treasury-item ' + (t.type === 'in' ? 'in' : 'out');
        const canDel = canEditClan(currentClan);
        const delBtn = canDel ? `<button title="Удалить">🗑</button>` : '';
        item.innerHTML = `
            <div class="treasury-amount">${t.type === 'in' ? '+' : '−'}${amt.toLocaleString('ru-RU')}</div>
            <div class="treasury-info">
                <div class="treasury-desc">${escapeHtml(t.description || '—')}</div>
                <div class="treasury-date">${dateStr}</div>
            </div>
            ${delBtn}`;
        if (canDel) {
            item.querySelector('button').addEventListener('click', async () => {
                if (!confirm('Удалить операцию?')) return;
                if (isAdmin) {
                    const { error } = await supabase.from('treasury').delete().eq('id', t.id);
                    if (error) return alert(error.message);
                } else {
                    const { data: resp, error } = await supabase.rpc('clan_admin_action', {
                        action: 'delete', target_table: 'treasury', target_clan: currentClan,
                        entered_password: currentClanPass, record_id: t.id
                    });
                    if (error || resp?.error) return alert('Ошибка: ' + (resp?.error || error.message));
                }
                await logAdminAction('Удалил операцию казны', null, `id: ${t.id}`);
                renderTreasury();
            });
        }
        container.appendChild(item);
    });
}
on('trAddBtn', 'click', async () => {
    if (!canEditClan(currentClan)) return;
    const type = val('trType');
    const amount = Number(val('trAmount'));
    const desc = val('trDesc').trim();
    const statusEl = $('trStatus');
    if (!amount || amount <= 0) { flashStatusEl(statusEl, 'Введите сумму > 0', '#ff7a7a'); return; }
    if (!desc) { flashStatusEl(statusEl, 'Добавьте описание', '#ff7a7a'); return; }

    if (isAdmin) {
        const { error } = await supabase.from('treasury').insert({
            clan: currentClan, type, amount, description: desc
        });
        if (error) { flashStatusEl(statusEl, 'Ошибка: ' + error.message, '#ff7a7a'); return; }
    } else {
        const { data: resp, error } = await supabase.rpc('clan_admin_action', {
            action: 'insert', target_table: 'treasury', target_clan: currentClan,
            entered_password: currentClanPass,
            data: { type, amount, description: desc }
        });
        if (error || resp?.error) { flashStatusEl(statusEl, 'Ошибка: ' + (resp?.error || error.message), '#ff7a7a'); return; }
    }

    await logAdminAction(`Казна: ${type === 'in' ? 'доход' : 'расход'}`, `${amount}`, desc);
    $('trAmount').value = '';
    $('trDesc').value = '';
    flashStatusEl(statusEl, '✔ Добавлено', '#6ee7a7');
    renderTreasury();
});

/* ============================================================
   УЧАСТНИКИ И АДМИНЫ ГИЛЬДИИ
============================================================ */
function parseMembersList(text) {
    if (!text) return [];
    return String(text).split('\n').map(line => {
        line = line.trim();
        if (!line) return null;
        const m = line.match(/^(\d+)\s*[-.)\]]?\s+(.+)$/);
        if (m) return { num: m[1], name: m[2].trim() };
        return { num: '', name: line };
    }).filter(Boolean);
}

function renderMembers() {
    if (!currentClan) return;
    const container = $('membersList');
    if (!container) return;
    const clan = clansCache[currentClan];
    const parsed = parseMembersList(clan?.members_list || '');
    if (!parsed.length) {
        container.innerHTML = '<div class="empty">Список участников пока пуст</div>';
        return;
    }
    container.innerHTML = parsed.map(m => `
        <div class="member-row">
            <span class="member-num">${m.num || '•'}</span>
            <span class="member-name">${escapeHtml(m.name)}</span>
        </div>
    `).join('');
}

function renderAdmins() {
    if (!currentClan) return;
    const container = $('adminsList');
    if (!container) return;
    const clan = clansCache[currentClan];
    const parsed = parseMembersList(clan?.admin_nicks || '');
    if (!parsed.length) {
        container.innerHTML = '<div class="empty">Список админов пока пуст</div>';
        return;
    }
    container.innerHTML = parsed.map(m => `
        <div class="member-row admin">
            <span class="member-num">👑</span>
            <span class="member-name">${escapeHtml(m.name)}</span>
        </div>
    `).join('');
}

/* ---------- Загрузка участников из файла ---------- */
on('membersUploadBtn', 'click', () => {
    if (!canEditClan(currentClan)) return;
    const fileInput = $('membersFileInput');
    if (fileInput) {
        fileInput.value = '';
        fileInput.click();
    }
});

on('membersFileInput', 'change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!canEditClan(currentClan)) {
        alert('Нет прав на редактирование');
        return;
    }

    const statusEl = $('membersUploadStatus');
    if (statusEl) statusEl.textContent = '⏳ Чтение файла…';

    try {
        const text = await file.text();
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

        if (!lines.length) {
            if (statusEl) statusEl.textContent = '⚠️ Файл пуст';
            return;
        }

        const nicks = lines.map(line => {
            const m = line.match(/^\d+\s*[-.)\]]?\s*(.+)$/);
            return m ? m[1].trim() : line;
        }).filter(Boolean);

        const membersText = nicks.join('\n');

        if (isAdmin) {
            const { error } = await supabase.from('clans')
                .update({ members_list: membersText })
                .eq('id', currentClan);
            if (error) throw new Error(error.message);
        } else {
            const { data: resp, error } = await supabase.rpc('clan_admin_action', {
                action: 'update', target_table: 'clans', target_clan: currentClan,
                entered_password: currentClanPass, record_id: currentClan,
                data: { members_list: membersText }
            });
            if (error || resp?.error) throw new Error(resp?.error || error.message);
        }

        if (clansCache[currentClan]) clansCache[currentClan].members_list = membersText;
        await logAdminAction('Загрузил список участников из файла', currentClan);
        if (statusEl) statusEl.textContent = `✔ Загружено ${nicks.length} участников`;
        renderMembers();
    } catch (err) {
        if (statusEl) statusEl.textContent = '❌ Ошибка: ' + err.message;
    }
});

/* ============================================================
   ТОРГОВЛЯ
============================================================ */
const TRADE_CATEGORIES = [
    { id: 'resource',  name: 'Ресурс',    icon: '🪵' },
    { id: 'ship',      name: 'Корабль',   icon: '⛵' },
    { id: 'module',    name: 'Модуль',    icon: '⚙️' },
    { id: 'weapon',    name: 'Оружие',    icon: '⚔️' },
    { id: 'ammo',      name: 'Боеприпас', icon: '💣' },
    { id: 'blueprint', name: 'Чертёж',    icon: '📜' },
    { id: 'consum',    name: 'Расходник', icon: '🧪' },
    { id: 'other',     name: 'Прочее',    icon: '📦' },
];
function tradeCatById(id) {
    return TRADE_CATEGORIES.find(c => c.id === id) || TRADE_CATEGORIES[TRADE_CATEGORIES.length - 1];
}
function tradeFmtGold(n) { return Number(n).toLocaleString('ru-RU') + ' 🪙'; }
function tradePlural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
}
function tradeTimeAgo(iso) {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return 'только что';
    if (s < 3600) return `${Math.floor(s / 60)} мин назад`;
    if (s < 86400) return `${Math.floor(s / 3600)} ч назад`;
    return `${Math.floor(s / 86400)} дн назад`;
}
function initTradeCategorySelect() {
    const sel = $('tm-category');
    if (!sel) return;
    sel.innerHTML = TRADE_CATEGORIES.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
}
function initTradeCategoryFilters() {
    const wrap = $('tm-cat-filters');
    if (!wrap) return;
    wrap.innerHTML = `<span class="tm-chip active" data-cat="all">Все категории</span>` +
        TRADE_CATEGORIES.map(c => `<span class="tm-chip" data-cat="${c.id}">${c.icon} ${c.name}</span>`).join('');
}
function renderTradeClanSelect() {
    const sel = $('tm-clan');
    if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = '';
    const list = currentGame ? getClansForGame(currentGame) : Object.values(clansCache);
    list.forEach(c => {
        const o = document.createElement('option');
        o.value = c.id; o.textContent = c.name; sel.appendChild(o);
    });
    if (cur && clansCache[cur]) sel.value = cur;
}
function renderTradeClanFilters() {
    const wrap = $('tm-clan-filters');
    if (!wrap) return;
    wrap.innerHTML = `<span class="tm-chip active" data-clan="all">Все гильдии</span>` +
        Object.values(clansCache).map(c => `<span class="tm-chip" data-clan="${c.id}">🏰 ${escapeHtml(c.name)}</span>`).join('');
    if (tradeFilterClan !== 'all' && !clansCache[tradeFilterClan]) tradeFilterClan = 'all';
    wrap.querySelectorAll('.tm-chip').forEach(chip => {
        if (chip.dataset.clan === tradeFilterClan) chip.classList.add('active');
        else chip.classList.remove('active');
    });
}
async function renderTrades() {
    const container = $('tm-listings');
    if (!container) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    const { data, error } = await supabase.from('trades').select('*')
        .order('created_at', { ascending: false }).limit(500);
    if (error) { container.innerHTML = `<div class="empty">Ошибка: ${error.message}</div>`; return; }
    tradesCache = data || [];
    renderTradeCounters();
    renderTradeListings();
}
function renderTradeCounters() {
    let buyGold = 0, sellGold = 0, buyN = 0, sellN = 0;
    tradesCache.forEach(t => {
        if (t.status === 'done') return;
        const total = Number(t.price) * Number(t.qty);
        if (t.type === 'buy') { buyGold += total; buyN++; }
        else { sellGold += total; sellN++; }
    });
    const elBuy = $('tm-counter-buy-gold');
    const elSell = $('tm-counter-sell-gold');
    const elBuySub = $('tm-counter-buy-sub');
    const elSellSub = $('tm-counter-sell-sub');
    if (elBuy) elBuy.textContent = tradeFmtGold(buyGold);
    if (elSell) elSell.textContent = tradeFmtGold(sellGold);
    if (elBuySub) elBuySub.textContent = buyN + ' ' + tradePlural(buyN, 'заявка', 'заявки', 'заявок');
    if (elSellSub) elSellSub.textContent = sellN + ' ' + tradePlural(sellN, 'заявка', 'заявки', 'заявок');
}
function tradeVisibleListings() {
    const searchInput = $('tm-search');
    const onlyMineInput = $('tm-only-mine');
    const q = (searchInput?.value || '').trim().toLowerCase();
    const onlyMine = onlyMineInput?.checked;
    const myNick = getViewerNick().toLowerCase();
    return tradesCache.filter(t => {
        if (tradeFilterType !== 'all' && t.type !== tradeFilterType) return false;
        if (tradeFilterCat !== 'all' && t.category !== tradeFilterCat) return false;
        if (tradeFilterClan !== 'all' && t.clan !== tradeFilterClan) return false;
        if (q && !(t.name || '').toLowerCase().includes(q)) return false;
        if (onlyMine && (t.nickname || '').toLowerCase() !== myNick) return false;
        return true;
    });
}
function renderTradeListings() {
    const container = $('tm-listings');
    if (!container) return;
    const items = tradeVisibleListings();
    if (!items.length) {
        container.innerHTML = '<p class="empty">Заявок пока нет. Будьте первым!</p>';
        return;
    }
    const myNick = getViewerNick().toLowerCase();
    container.innerHTML = '';
    items.forEach(t => {
        const cat   = tradeCatById(t.category);
        const total = Number(t.price) * Number(t.qty);
        const isMine        = myNick && (t.nickname || '').toLowerCase() === myNick;
        const isDone        = t.status === 'done';
        const isAccepted    = !isDone && !!t.accepted_by;
        const iAmAccepter   = myNick && isAccepted && (t.accepted_by || '').toLowerCase() === myNick;
        const canDelete     = isAdmin || (isMine && !isAccepted && !isDone);
        const typeLabel     = t.type === 'buy' ? '🛒 Куплю' : '💰 Продам';
        const clanName      = clansCache[t.clan]?.name || t.clan;
        let statusBadge = '';
        if (isDone)          statusBadge = `<span class="tm-badge done">✅ Завершено</span>`;
        else if (isAccepted) statusBadge = `<span class="tm-badge progress">⏳ В работе</span>`;
        else                 statusBadge = `<span class="tm-badge free">🔵 Свободна</span>`;
        let actionsHtml = '';
        if (!isDone && !isAccepted && !isMine) {
            actionsHtml = `<div class="tm-listing-actions"><button class="tm-accept" data-id="${t.id}">🤝 Принять</button></div>`;
        } else if (!isDone && isAccepted && isMine) {
            actionsHtml = `<div class="tm-listing-actions">
                <button class="tm-confirm" data-id="${t.id}">✅ Подтвердить сделку</button>
                <button class="tm-cancel" data-id="${t.id}">✖ Отменить принятие</button>
            </div>`;
        }
        let acceptedNote = '';
        if (isAccepted) {
            acceptedNote = `<div class="tm-accepted-note">🤝 Принял: <b>${escapeHtml(t.accepted_by)}</b>${iAmAccepter ? ' — ждём подтверждения от владельца' : ''}</div>`;
        } else if (isDone) {
            acceptedNote = `<div class="tm-accepted-note">✅ Сделка завершена${t.accepted_by ? ` — с <b>${escapeHtml(t.accepted_by)}</b>` : ''}</div>`;
        }
        const el = document.createElement('article');
        el.className = 'tm-listing ' + t.type + (isMine ? ' mine' : '') + (isDone ? ' done' : '');
        el.dataset.id = t.id;
        el.innerHTML = `
            <div class="tm-listing-head">
                <div class="tm-listing-icon">${cat.icon}</div>
                <div class="tm-listing-title">
                    <h4>${escapeHtml(t.name)}</h4>
                    <div class="tm-listing-tags">
                        <span class="tm-tag ${t.type}">${typeLabel}</span>
                        <span class="tm-tag cat">${cat.name}</span>
                        <span class="tm-tag clan">🏰 ${escapeHtml(clanName)}</span>
                        ${statusBadge}
                    </div>
                </div>
            </div>
            <div class="tm-listing-price">
                <span class="amount">${Number(t.price).toLocaleString('ru-RU')}</span>
                <span class="per">🪙 / шт.</span>
                ${Number(t.qty) > 1 ? `<span class="total">×${t.qty} = ${tradeFmtGold(total)}</span>` : ''}
            </div>
            ${t.port ? `<div class="tm-listing-port">⚓ Порт: ${escapeHtml(t.port)}</div>` : ''}
            ${t.note ? `<div class="tm-listing-note">«${escapeHtml(t.note)}»</div>` : ''}
            ${acceptedNote}
            ${actionsHtml}
            <div class="tm-listing-foot">
                <span class="author" data-nick="${escapeHtml(t.nickname)}">👤 ${escapeHtml(t.nickname)}</span>
                <span class="time">${tradeTimeAgo(t.created_at)}</span>
                ${canDelete ? `<button class="tm-delete" data-id="${t.id}" title="Удалить">✕</button>` : ''}
            </div>
        `;
        const authorEl = el.querySelector('.author');
        if (authorEl) authorEl.addEventListener('click', () => openProfile(t.nickname));
        container.appendChild(el);
    });
}
function updateTradeFormTotal() {
    const p = parseInt(val('tm-price')) || 0;
    const q = parseInt(val('tm-qty')) || 0;
    const el = $('tm-total');
    if (el) el.value = tradeFmtGold(p * q);
}
function setTradeStatus(msg, type = '') {
    const el = $('tm-status');
    if (!el) return;
    el.textContent = msg;
    el.className = 'tm-status ' + type;
    if (msg) setTimeout(() => {
        if (el.textContent === msg) el.textContent = '';
    }, 3500);
}
document.querySelectorAll('.tm-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tm-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        tradeFormType = btn.dataset.type;
    });
});
on('tm-price', 'input', updateTradeFormTotal);
on('tm-qty', 'input', updateTradeFormTotal);
on('tm-search', 'input', renderTradeListings);
on('tm-only-mine', 'change', renderTradeListings);
on('tm-type-filters', 'click', e => {
    const chip = e.target.closest('.tm-chip');
    if (!chip) return;
    document.querySelectorAll('#tm-type-filters .tm-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    tradeFilterType = chip.dataset.type;
    renderTradeListings();
});
on('tm-cat-filters', 'click', e => {
    const chip = e.target.closest('.tm-chip');
    if (!chip) return;
    document.querySelectorAll('#tm-cat-filters .tm-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    tradeFilterCat = chip.dataset.cat;
    renderTradeListings();
});
on('tm-clan-filters', 'click', e => {
    const chip = e.target.closest('.tm-chip');
    if (!chip) return;
    document.querySelectorAll('#tm-clan-filters .tm-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    tradeFilterClan = chip.dataset.clan;
    renderTradeListings();
});
on('tm-listings', 'click', async e => {
    const delBtn = e.target.closest('.tm-delete');
    if (delBtn) {
        const id = delBtn.dataset.id;
        const t = tradesCache.find(x => String(x.id) === String(id));
        if (!t) return;
        if (!confirm(`Удалить заявку «${t.name}»?`)) return;
        const { error } = await supabase.from('trades').delete().eq('id', id);
        if (error) return alert(error.message);
        await logAdminAction('Удалил торговую заявку', `${t.nickname} — ${t.name}`);
        renderTrades();
        return;
    }
    const acceptBtn = e.target.closest('.tm-accept');
    if (acceptBtn) {
        const id = acceptBtn.dataset.id;
        const t = tradesCache.find(x => String(x.id) === String(id));
        if (!t) return;
        openAcceptTradeModal(t);
        return;
    }
    const confirmBtn = e.target.closest('.tm-confirm');
    if (confirmBtn) {
        const id = confirmBtn.dataset.id;
        const t = tradesCache.find(x => String(x.id) === String(id));
        if (!t) return;
        if (!confirm(`Подтвердить сделку с «${t.accepted_by}»?`)) return;
        const { error } = await supabase.from('trades').update({ status: 'done' }).eq('id', id);
        if (error) return alert(error.message);
        await logAdminAction('Подтвердил сделку', `${t.name} — с ${t.accepted_by}`);
        await createNotification(t.accepted_by, 'trade', 'Сделка завершена', `Сделка «${t.name}» подтверждена владельцем`, null);
        renderTrades();
        return;
    }
    const cancelBtn = e.target.closest('.tm-cancel');
    if (cancelBtn) {
        const id = cancelBtn.dataset.id;
        const t = tradesCache.find(x => String(x.id) === String(id));
        if (!t) return;
        if (!confirm('Отменить принятие? Заявка снова станет свободной.')) return;
        const { error } = await supabase.from('trades').update({ accepted_by: null, accepted_at: null }).eq('id', id);
        if (error) return alert(error.message);
        await logAdminAction('Отменил принятие сделки', t.name);
        renderTrades();
        return;
    }
});
on('tm-submit', 'click', async () => {
    const clan = val('tm-clan');
    if (!clan) return setTradeStatus('Выберите гильдию.', 'error');
    const category = val('tm-category');
    const name = val('tm-name').trim();
    const price = parseInt(val('tm-price'));
    const qty = parseInt(val('tm-qty'));
    const port = val('tm-port').trim();
    const nickname = val('tm-nickname').trim();
    const note = val('tm-note').trim();
    if (!name) return setTradeStatus('Укажите название.', 'error');
    if (!price || price <= 0) return setTradeStatus('Укажите корректную цену.', 'error');
    if (!qty || qty <= 0) return setTradeStatus('Укажите корректное количество.', 'error');
    if (!nickname) return setTradeStatus('Укажите ваш ник.', 'error');
    if (nickname.length < 2) return setTradeStatus('Ник слишком короткий.', 'error');
    const { error } = await supabase.from('trades').insert({
        clan, type: tradeFormType, category, name, price, qty,
        port: port || null, nickname, note: note || null, status: 'active'
    });
    if (error) return setTradeStatus('Ошибка: ' + error.message, 'error');
    await logAdminAction(`Новая торговая заявка (${tradeFormType === 'buy' ? 'куплю' : 'продам'})`, `${nickname} — ${name} — ${price}×${qty}`);
    localStorage.setItem(VIEWER_NICK_KEY, nickname);
    sendHeartbeat();
    $('tm-name').value = '';
    $('tm-price').value = '';
    $('tm-qty').value = 1;
    $('tm-port').value = '';
    $('tm-note').value = '';
    updateTradeFormTotal();
    setTradeStatus('✅ Заявка опубликована!', 'success');
    renderTrades();
});

/* ============================================================
   ПРИНЯТИЕ СДЕЛКИ
============================================================ */
function openAcceptTradeModal(t) {
    acceptingTrade = t;
    $('acceptTradeName').textContent = t.name;
    $('acceptTradeInfo').textContent = `${t.type === 'buy' ? 'Покупка' : 'Продажа'} · ${Number(t.price).toLocaleString('ru-RU')} 🪙/шт · ${t.qty} шт`;
    const savedNick = getViewerNick();
    $('acceptTradeNickname').value = savedNick || '';
    $('acceptTradeError').textContent = '';
    $('acceptTradeModal').hidden = false;
    (savedNick ? $('doAcceptTrade') : $('acceptTradeNickname')).focus();
}
function closeAcceptTradeModal() {
    $('acceptTradeModal').hidden = true;
    acceptingTrade = null;
}
on('cancelAcceptTrade', 'click', closeAcceptTradeModal);
on('acceptTradeModal', 'click', e => {
    if (e.target.id === 'acceptTradeModal') closeAcceptTradeModal();
});
on('doAcceptTrade', 'click', async () => {
    if (!acceptingTrade) return;
    const nick = val('acceptTradeNickname').trim();
    const err = $('acceptTradeError');
    err.textContent = '';
    if (!nick) { err.textContent = 'Укажите ваш ник'; return; }
    if (nick.length < 2) { err.textContent = 'Ник слишком короткий'; return; }
    if (nick.toLowerCase() === (acceptingTrade.nickname || '').toLowerCase()) { err.textContent = 'Нельзя принять собственную заявку'; return; }
    $('doAcceptTrade').disabled = true;
    const { error } = await supabase.from('trades').update({
        accepted_by: nick, accepted_at: new Date().toISOString()
    }).eq('id', acceptingTrade.id);
    $('doAcceptTrade').disabled = false;
    if (error) { err.textContent = 'Ошибка: ' + error.message; return; }
    localStorage.setItem(VIEWER_NICK_KEY, nick);
    sendHeartbeat();
    await logAdminAction('Принял торговую заявку', `${acceptingTrade.name} — ${nick}`);
    await createNotification(acceptingTrade.nickname, 'trade', 'Вашу заявку приняли', `${nick} принял заявку «${acceptingTrade.name}»`, null);
    const tn = $('tm-nickname');
    if (tn) tn.value = nick;
    closeAcceptTradeModal();
    renderTrades();
});

/* ============================================================
   ЗАЯВКИ
============================================================ */
async function renderApplications() {
    const container = $('applicationsList');
    if (!container || !isAdmin) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    const { data, error } = await supabase.from('applications').select('*')
        .order('created_at', { ascending: false });
    if (error) { container.innerHTML = `<div class="empty">Ошибка: ${error.message}</div>`; return; }
    if (!data?.length) { container.innerHTML = '<div class="empty">Заявок пока нет</div>'; return; }
    container.innerHTML = '';
    data.forEach(app => {
        const d = new Date(app.created_at);
        const dateStr = d.toLocaleDateString('ru-RU') + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
        const card = document.createElement('div');
        card.className = 'application-card ' + (app.status || 'new');
        const targetClanName = app.target_clan && clansCache[app.target_clan] ? clansCache[app.target_clan].name : (app.target_clan || '—');
        card.innerHTML = `
            <div class="application-head">
                <div class="application-nick">👤 ${escapeHtml(app.nickname)}</div>
                <div class="application-date">${dateStr}</div>
            </div>
            <div class="application-grid">
                <div><b>Возраст</b>${escapeHtml(app.age || '—')}</div>
                <div><b>Опыт</b>${escapeHtml(app.experience || '—')}</div>
                <div><b>Контакт</b>${escapeHtml(app.contact || '—')}</div>
                <div><b>Гильдия</b>${escapeHtml(targetClanName)}</div>
            </div>
            ${app.why ? `<div class="application-why">${escapeHtml(app.why)}</div>` : ''}
            <div class="application-actions">
                ${app.status !== 'approved' ? `<button class="approve">✅ Принять</button>` : ''}
                ${app.status !== 'rejected' ? `<button class="reject">❌ Отклонить</button>` : ''}
                <button class="delete">🗑 Удалить</button>
            </div>`;
        const approveBtn = card.querySelector('.approve');
        const rejectBtn = card.querySelector('.reject');
        const deleteBtn = card.querySelector('.delete');
        if (approveBtn) approveBtn.addEventListener('click', () => updateAppStatus(app.id, 'approved'));
        if (rejectBtn) rejectBtn.addEventListener('click', () => updateAppStatus(app.id, 'rejected'));
        if (deleteBtn) deleteBtn.addEventListener('click', async () => {
            if (!confirm('Удалить заявку?')) return;
            await supabase.from('applications').delete().eq('id', app.id);
            await logAdminAction('Удалил заявку', app.nickname);
            renderApplications();
        });
        container.appendChild(card);
    });
}
async function updateAppStatus(id, status) {
    const { error } = await supabase.from('applications').update({ status }).eq('id', id);
    if (error) return alert(error.message);
    await logAdminAction(`Заявка → ${status === 'approved' ? 'принята' : 'отклонена'}`);
    renderApplications();
}

/* ============================================================
   ФОРМА ЗАЯВКИ
============================================================ */
function renderApplyClanSelect() {
    const sel = $('applyClan');
    if (!sel) return;
    sel.innerHTML = '<option value="">— Не выбрано —</option>';
    const list = currentGame ? getClansForGame(currentGame) : Object.values(clansCache);
    list.forEach(c => {
        const o = document.createElement('option');
        o.value = c.id; o.textContent = c.name; sel.appendChild(o);
    });
}
on('applyBtn', 'click', async () => {
    const nick = val('applyNick').trim();
    const why = val('applyWhy').trim();
    const msg = $('applyMsg');
    msg.style.color = '';
    if (!nick) { msg.textContent = 'Введите никнейм'; msg.style.color = '#ff7a7a'; return; }
    if (!why) { msg.textContent = 'Расскажите, почему хотите вступить'; msg.style.color = '#ff7a7a'; return; }
    const payload = {
        nickname: nick,
        age: val('applyAge').trim() || null,
        experience: val('applyExp').trim() || null,
        why,
        contact: val('applyContact').trim() || null,
        target_clan: val('applyClan') || null
    };
    $('applyBtn').disabled = true;
    const { error } = await supabase.from('applications').insert(payload);
    $('applyBtn').disabled = false;
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    msg.textContent = '✔ Заявка отправлена! С вами свяжутся.';
    msg.style.color = '#6ee7a7';
    ['applyNick','applyAge','applyExp','applyContact','applyWhy'].forEach(id => {
        const el = $(id);
        if (el) el.value = '';
    });
    $('applyClan').value = '';
});

/* ============================================================
   FAQ
============================================================ */
async function loadFaq() {
    const { data, error } = await supabase.from('faq').select('*').order('sort_order');
    if (error) { console.warn(error); return; }
    faqCache = data || [];
    renderFaq();
    renderFaqAdmin();
}
function renderFaq() {
    const container = $('faqList');
    if (!container) return;
    container.innerHTML = '';
    if (!faqCache.length) { container.innerHTML = '<div class="empty">Пока нет вопросов</div>'; return; }
    faqCache.forEach(item => {
        const details = document.createElement('details');
        details.className = 'faq-item';
        details.innerHTML = `<summary class="faq-q">${escapeHtml(item.question)}</summary>
            <div class="faq-a">${escapeHtml(item.answer)}</div>`;
        container.appendChild(details);
    });
}
function renderFaqAdmin() {
    const container = $('faqAdminList');
    if (!container) return;
    container.innerHTML = '';
    if (!faqCache.length) { container.innerHTML = '<div class="empty">Пока нет</div>'; return; }
    faqCache.forEach(item => {
        const el = document.createElement('div');
        el.className = 'faq-admin-item';
        el.innerHTML = `
            <div class="txt"><b>${escapeHtml(item.question)}</b><span>${escapeHtml(item.answer)}</span></div>
            <button title="Удалить">🗑</button>`;
        el.querySelector('button').addEventListener('click', async () => {
            if (!confirm('Удалить вопрос?')) return;
            await supabase.from('faq').delete().eq('id', item.id);
            await logAdminAction('Удалил вопрос FAQ', item.question);
            loadFaq();
        });
        container.appendChild(el);
    });
}
on('faqAddBtn', 'click', async () => {
    const q = val('faqQ').trim();
    const a = val('faqA').trim();
    if (!q || !a) { alert('Заполни вопрос и ответ'); return; }
    const { error } = await supabase.from('faq').insert({
        question: q, answer: a, sort_order: faqCache.length + 1
    });
    if (error) return alert(error.message);
    await logAdminAction('Добавил вопрос FAQ', q);
    $('faqQ').value = ''; $('faqA').value = '';
    loadFaq();
});

/* ============================================================
   ПАРТНЁРЫ
============================================================ */
async function loadPartners() {
    const { data, error } = await supabase.from('partners').select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });
    if (error) { console.warn('Партнёры не загружены:', error.message); return; }
    partnersCache = data || [];
    renderPartnersHome();
    renderPartnersAdmin();
}
function isYouTubeUrl(url) {
    if (!url) return false;
    try { return /(?:^|\.)(?:youtube\.com|youtu\.be)$/i.test(new URL(url.trim()).hostname); }
    catch { return false; }
}
function extractYouTubeHandle(url) {
    if (!url) return '';
    try {
        const u = new URL(url.trim());
        if (!/(?:^|\.)(?:youtube\.com|youtu\.be)$/i.test(u.hostname)) return '';
        const path = u.pathname.replace(/^\/+/, '').replace(/\/+$/, '');
        if (!path) return '';
        if (path.startsWith('@')) return path.split('/')[0];
        if (path.startsWith('channel/')) return path.replace('channel/', '').split('/')[0];
        if (path.startsWith('c/')) return path.replace('c/', '').split('/')[0];
        if (path.startsWith('user/')) return path.replace('user/', '').split('/')[0];
        return path.split('/')[0] || '';
    } catch { return ''; }
}
function getPartnerLogo(p) {
    if (p.logo_url && p.logo_url.startsWith('data:')) return p.logo_url;
    const handle = extractYouTubeHandle(p.url);
    if (handle) return `https://unavatar.io/youtube/${handle}`;
    if (p.logo_url) return p.logo_url;
    return null;
}
function renderPartnersHome() {
    const section = $('partnersSection');
    const list = $('partnersList');
    if (!section || !list) return;
    list.innerHTML = '';
    if (!partnersCache.length) { section.hidden = true; return; }
    section.hidden = false;
    partnersCache.forEach(p => {
        if (isYouTubeUrl(p.url)) list.appendChild(createYouTubeCard(p));
        else list.appendChild(createPartnerCard(p));
    });
}
function createYouTubeCard(p) {
    const a = document.createElement('a');
    a.className = 'yt-promo-card';
    a.href = p.url; a.target = '_blank'; a.rel = 'noopener';
    const logoSrc = getPartnerLogo(p);
    const logoEl = document.createElement('img');
    logoEl.className = 'yt-promo-logo';
    logoEl.alt = p.name;
    logoEl.src = logoSrc || 'images/aov.png';
    logoEl.onerror = () => { logoEl.onerror = null; logoEl.src = 'images/aov.png'; };
    const info = document.createElement('div');
    info.className = 'yt-promo-info';
    info.innerHTML = `
        <div class="yt-promo-name">${escapeHtml(p.name)}</div>
        ${p.description ? `<div class="yt-promo-desc">${escapeHtml(p.description)}</div>` : ''}
        <div class="yt-promo-btn">Смотреть на YouTube</div>`;
    a.appendChild(logoEl); a.appendChild(info);
    return a;
}
function createPartnerCard(p) {
    const a = document.createElement('a');
    a.className = 'partner-card';
    a.href = p.url; a.target = '_blank'; a.rel = 'noopener';
    const logoEl = document.createElement('div');
    logoEl.className = 'partner-logo';
    const logoSrc = getPartnerLogo(p);
    if (logoSrc) {
        const img = document.createElement('img');
        img.src = logoSrc; img.alt = '';
        img.onerror = () => img.replaceWith(makePartnerLetter(p.name));
        logoEl.appendChild(img);
    } else {
        logoEl.appendChild(makePartnerLetter(p.name));
    }
    const info = document.createElement('div');
    info.className = 'partner-info';
    info.innerHTML = `
        <div class="partner-name">${escapeHtml(p.name)}</div>
        ${p.description ? `<div class="partner-desc">${escapeHtml(p.description)}</div>` : ''}
        <div class="partner-link">🔗 ${escapeHtml(p.url)}</div>`;
    a.appendChild(logoEl); a.appendChild(info);
    return a;
}
function makePartnerLetter(name) {
    const span = document.createElement('span');
    span.className = 'partner-letter';
    span.textContent = (name || '?').trim()[0]?.toUpperCase() || '?';
    span.style.background = colorFromString(name || '?');
    return span;
}
function renderPartnersAdmin() {
    const container = $('partnersAdminList');
    if (!container) return;
    container.innerHTML = '';
    if (!partnersCache.length) {
        container.innerHTML = '<div class="empty">Пока нет партнёров</div>';
        return;
    }
    partnersCache.forEach((p, idx) => {
        const el = document.createElement('div');
        el.className = 'partners-admin-item';
        const letter = (p.name || '?')[0].toUpperCase();
        const logoSrc = getPartnerLogo(p);
        const logoHtml = logoSrc
            ? `<img src="${escapeHtml(logoSrc)}" alt="" onerror="this.outerHTML='<span>${escapeHtml(letter)}</span>'">`
            : `<span>${escapeHtml(letter)}</span>`;
        el.innerHTML = `
            <div class="logo-mini">${logoHtml}</div>
            <div class="txt"><b>${escapeHtml(p.name)}</b>
                <a href="${escapeHtml(p.url)}" target="_blank" rel="noopener">${escapeHtml(p.url)}</a>
            </div>
            <div class="actions">
                <button class="up" ${idx === 0 ? 'disabled style="opacity:.3"' : ''}>▲</button>
                <button class="down" ${idx === partnersCache.length - 1 ? 'disabled style="opacity:.3"' : ''}>▼</button>
                <button class="delete">🗑</button>
            </div>`;
        el.querySelector('.up')?.addEventListener('click', () => movePartner(p.id, -1));
        el.querySelector('.down')?.addEventListener('click', () => movePartner(p.id, +1));
        el.querySelector('.delete').addEventListener('click', () => deletePartner(p.id));
        container.appendChild(el);
    });
}
async function movePartner(id, dir) {
    const idx = partnersCache.findIndex(p => p.id === id);
    if (idx === -1) return;
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= partnersCache.length) return;
    const a = partnersCache[idx]; const b = partnersCache[swapIdx];
    await supabase.from('partners').update({ sort_order: swapIdx }).eq('id', a.id);
    await supabase.from('partners').update({ sort_order: idx }).eq('id', b.id);
    await loadPartners();
}
async function deletePartner(id) {
    if (!confirm('Удалить партнёра?')) return;
    await supabase.from('partners').delete().eq('id', id);
    await logAdminAction('Удалил партнёра');
    await loadPartners();
}
function compressLogo(file, maxSize = 128, quality = 0.85) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = maxSize; canvas.height = maxSize;
                const ctx = canvas.getContext('2d');
                const minSide = Math.min(img.width, img.height);
                const sx = (img.width - minSide) / 2;
                const sy = (img.height - minSide) / 2;
                ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, maxSize, maxSize);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
on('partnerLogoPick', 'click', () => $('partnerLogoFile').click());
on('partnerLogoFile', 'change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
        partnerLogoData = await compressLogo(file);
        $('partnerLogoImg').src = partnerLogoData;
        $('partnerLogoPreview').hidden = false;
        $('partnerLogoName').textContent = file.name;
    } catch (err) { alert('Не удалось загрузить картинку: ' + err.message); }
});
on('partnerLogoClear', 'click', () => {
    partnerLogoData = null;
    $('partnerLogoFile').value = '';
    $('partnerLogoPreview').hidden = true;
    $('partnerLogoName').textContent = '';
});
on('partnerAddBtn', 'click', async () => {
    const name = val('partnerName').trim();
    const url = val('partnerUrl').trim();
    const desc = val('partnerDesc').trim();
    const statusEl = $('partnerStatus');
    if (!name) { flashStatusEl(statusEl, 'Укажи название', '#ff7a7a'); return; }
    if (!url) { flashStatusEl(statusEl, 'Укажи ссылку', '#ff7a7a'); return; }
    if (!/^https?:\/\//i.test(url)) { flashStatusEl(statusEl, 'Ссылка должна начинаться с http:// или https://', '#ff7a7a'); return; }
    const { error } = await supabase.from('partners').insert({
        name, url,
        logo_url: partnerLogoData || null,
        description: desc || null,
        sort_order: partnersCache.length
    });
    if (error) { flashStatusEl(statusEl, 'Ошибка: ' + error.message, '#ff7a7a'); return; }
    await logAdminAction('Добавил партнёра', name);
    ['partnerName','partnerUrl','partnerDesc'].forEach(id => {
        const el = $(id);
        if (el) el.value = '';
    });
    partnerLogoData = null;
    $('partnerLogoFile').value = '';
    $('partnerLogoPreview').hidden = true;
    $('partnerLogoName').textContent = '';
    flashStatusEl(statusEl, '✔ Добавлено', '#6ee7a7');
    await loadPartners();
});

/* ============================================================
   АДМИН: ТАКТИКА
============================================================ */
function renderTacticsAdmin() {
    const container = $('tacticsAdminList');
    if (!container) return;
    container.innerHTML = '';
    if (!tacticsCache.length) {
        container.innerHTML = '<div class="empty">Пока нет разделов</div>';
        return;
    }
    tacticsCache.forEach((t, idx) => {
        const el = document.createElement('div');
        el.className = 'partners-admin-item';
        el.innerHTML = `
            <div class="logo-mini"><span>${escapeHtml(t.icon || '📖')}</span></div>
            <div class="txt"><b>${escapeHtml(t.title || t.id)}</b>
                <span style="color:var(--muted);font-size:11px">Порядок: ${t.sort_order ?? 0}</span>
            </div>
            <div class="actions">
                <button class="up" ${idx === 0 ? 'disabled style="opacity:.3"' : ''}>▲</button>
                <button class="down" ${idx === tacticsCache.length - 1 ? 'disabled style="opacity:.3"' : ''}>▼</button>
                <button class="edit">✏️</button>
                <button class="delete">🗑</button>
            </div>`;
        el.querySelector('.up')?.addEventListener('click', () => moveTactic(t.id, -1));
        el.querySelector('.down')?.addEventListener('click', () => moveTactic(t.id, +1));
        el.querySelector('.edit').addEventListener('click', () => openTacticEdit(t));
        el.querySelector('.delete').addEventListener('click', () => deleteTactic(t.id, t.title || t.id));
        container.appendChild(el);
    });
}
async function moveTactic(id, dir) {
    const idx = tacticsCache.findIndex(t => t.id === id);
    if (idx === -1) return;
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= tacticsCache.length) return;
    const a = tacticsCache[idx]; const b = tacticsCache[swapIdx];
    await supabase.from('tactics').update({ sort_order: b.sort_order }).eq('id', a.id);
    await supabase.from('tactics').update({ sort_order: a.sort_order }).eq('id', b.id);
    await loadTactics();
}
function openTacticEdit(t) {
    editingTactic = t;
    $('tacEditId').value = t.id;
    $('tacEditTitle').value = t.title || '';
    $('tacEditIcon').value = t.icon || '';
    $('tacEditOrder').value = t.sort_order ?? 0;
    $('tacEditContent').value = t.content || '';
    $('tacEditMsg').textContent = '';
    $('tacticsEditModal').hidden = false;
    $('tacEditTitle').focus();
}
on('cancelTacEdit', 'click', () => {
    $('tacticsEditModal').hidden = true; editingTactic = null;
});
on('saveTacEdit', 'click', async () => {
    if (!editingTactic) return;
    const title = val('tacEditTitle').trim();
    const icon = val('tacEditIcon').trim();
    const content = val('tacEditContent');
    const order = parseInt(val('tacEditOrder')) || 0;
    const msg = $('tacEditMsg');
    if (!title) { msg.textContent = 'Укажи заголовок'; msg.style.color = '#ff7a7a'; return; }
    if (!content.trim()) { msg.textContent = 'Укажи содержимое'; msg.style.color = '#ff7a7a'; return; }
    const { error } = await supabase.from('tactics').update({
        title, icon: icon || null, content, sort_order: order,
        updated_at: new Date().toISOString()
    }).eq('id', editingTactic.id);
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    await logAdminAction('Изменил раздел тактики', title);
    $('tacticsEditModal').hidden = true;
    editingTactic = null;
    await loadTactics();
});
async function deleteTactic(id, title) {
    if (!confirm(`Удалить раздел «${title}»?`)) return;
    await supabase.from('tactics').delete().eq('id', id);
    await logAdminAction('Удалил раздел тактики', title);
    await loadTactics();
}
on('tacAddBtn', 'click', async () => {
    const id = val('tacId').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const title = val('tacTitle').trim();
    const icon = val('tacIcon').trim();
    const content = val('tacContent');
    const order = parseInt(val('tacOrder')) || 0;
    const statusEl = $('tacStatus');
    if (!id) { flashStatusEl(statusEl, 'Укажи ID', '#ff7a7a'); return; }
    if (!title) { flashStatusEl(statusEl, 'Укажи заголовок', '#ff7a7a'); return; }
    if (!content.trim()) { flashStatusEl(statusEl, 'Укажи содержимое', '#ff7a7a'); return; }
    const { error } = await supabase.from('tactics').insert({
        id, title, icon: icon || null, content, sort_order: order
    });
    if (error) { flashStatusEl(statusEl, 'Ошибка: ' + error.message, '#ff7a7a'); return; }
    await logAdminAction('Добавил раздел тактики', title);
    ['tacId','tacTitle','tacIcon','tacContent'].forEach(i => {
        const el = $(i);
        if (el) el.value = '';
    });
    $('tacOrder').value = 10;
    flashStatusEl(statusEl, '✔ Добавлено', '#6ee7a7');
    await loadTactics();
});

/* ============================================================
   АДМИН: СОЮЗЫ
============================================================ */
on('allyAddBtn', 'click', async () => {
    const id = val('allyId').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const name = val('allyName').trim();
    const desc = val('allyDesc').trim();
    const msg = $('allyMsg');
    msg.textContent = '';
    if (!id || !name) { msg.textContent = 'ID и название обязательны'; msg.style.color = '#ff7a7a'; return; }
    if (alliancesCache[id]) { msg.textContent = 'ID уже занят'; msg.style.color = '#ff7a7a'; return; }
    const { error } = await supabase.from('alliances').insert({ id, name, description: desc || null });
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    await logAdminAction('Создал союз', name);
    ['allyId','allyName','allyDesc'].forEach(i => { const el = $(i); if (el) el.value = ''; });
    msg.textContent = '✔ Союз создан'; msg.style.color = '#6ee7a7';
    await loadAlliances();
});
function openAllianceEdit(a) {
    editingAlliance = a;
    $('allyEditId').value = a.id;
    $('allyEditName').value = a.name || '';
    $('allyEditDesc').value = a.description || '';
    $('allyEditMsg').textContent = '';
    $('allyEditModal').hidden = false;
    $('allyEditName').focus();
}
on('cancelAllyEdit', 'click', () => {
    $('allyEditModal').hidden = true; editingAlliance = null;
});
on('saveAllyEdit', 'click', async () => {
    if (!editingAlliance) return;
    const name = val('allyEditName').trim();
    const desc = val('allyEditDesc').trim();
    const msg = $('allyEditMsg');
    if (!name) { msg.textContent = 'Укажи название'; msg.style.color = '#ff7a7a'; return; }
    const { error } = await supabase.from('alliances').update({
        name, description: desc || null
    }).eq('id', editingAlliance.id);
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    await logAdminAction('Изменил союз', name);
    $('allyEditModal').hidden = true;
    editingAlliance = null;
    await loadAlliances();
});
async function deleteAlliance(id, name) {
    if (!confirm(`Удалить союз «${name}»?\n\nГильдии из него не удалятся, но останутся без союза.`)) return;
    const { error } = await supabase.from('alliances').delete().eq('id', id);
    if (error) return alert('Ошибка: ' + error.message);
    await logAdminAction('Удалил союз', name);
    await loadAlliances();
    await loadClans();
}

/* ============================================================
   НАСТРОЙКИ + СТАТИСТИКА
============================================================ */
async function loadSettings() {
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'main').single();
    if (error) { console.warn('Настройки не загружены:', error.message); return; }
    settingsCache = data;
}
async function loadStats() {
    const row = $('statsRow');
    if (!row) return;
    row.innerHTML = '';
    try {
        const [e, f, n, p, b1, b2, c, t] = await Promise.all([
            supabase.from('enemies').select('id', { count: 'exact', head: true }),
            supabase.from('friends').select('id', { count: 'exact', head: true }),
            supabase.from('neutral').select('id', { count: 'exact', head: true }),
            supabase.from('personal').select('id', { count: 'exact', head: true }),
            supabase.from('builds').select('id', { count: 'exact', head: true }).eq('type', 'pvp'),
            supabase.from('builds').select('id', { count: 'exact', head: true }).eq('type', 'pb'),
            supabase.from('clans_public').select('id', { count: 'exact', head: true }),
            supabase.from('trades').select('id', { count: 'exact', head: true })
        ]);
        const stats = [
            { label: 'Врагов', value: e.count || 0, ico: '🔴' },
            { label: 'Друзей', value: f.count || 0, ico: '🟢' },
            { label: 'Нейтралов', value: n.count || 0, ico: '🟡' },
            { label: 'В личном', value: p.count || 0, ico: '🟠' },
            { label: 'Билды ПВП', value: b1.count || 0, ico: '⚔️' },
            { label: 'Билды ПБ', value: b2.count || 0, ico: '🛡' },
            { label: 'Гильдий', value: c.count || 0, ico: '🏰' },
            { label: 'Сделок', value: t.count || 0, ico: '🪙' }
        ];
        stats.forEach(s => {
            const el = document.createElement('div');
            el.className = 'stat-card';
            el.innerHTML = `<div class="stat-value">${s.ico} ${s.value}</div><div class="stat-label">${s.label}</div>`;
            row.appendChild(el);
        });
    } catch (err) { }
}

/* ============================================================
   КОНТАКТЫ
============================================================ */
function renderContacts() {
    const container = $('contactsList');
    if (!container) return;
    container.innerHTML = '';
    let clans;
    if (isAdmin) {
        clans = Object.values(clansCache);
    } else if (currentClan && clansCache[currentClan]?.alliance_id) {
        const ally = clansCache[currentClan].alliance_id;
        clans = Object.values(clansCache).filter(c => c.alliance_id === ally);
    } else if (currentClan) {
        clans = [clansCache[currentClan]].filter(Boolean);
    } else {
        clans = [];
    }
    if (!clans.length) { container.innerHTML = '<div class="empty">Гильдий пока нет</div>'; return; }
    clans.forEach(clan => {
        const card = document.createElement('div');
        card.className = 'contact-card';
        const hasLink = clan.discord && clan.discord.trim();
        const btn = hasLink
            ? `<a class="contact-btn" href="${escapeHtml(clan.discord)}" target="_blank" rel="noopener">💬 Discord</a>`
            : `<span class="contact-btn disabled">💬 Нет ссылки</span>`;
        card.innerHTML = `
            <img src="${escapeHtml(clan.image || '')}" alt="${escapeHtml(clan.name)}">
            <div class="contact-info">
                <div class="contact-name">${escapeHtml(clan.name)}</div>
                <div class="contact-discord">${hasLink ? escapeHtml(clan.discord) : 'Ссылка не указана'}</div>
            </div>
            ${btn}`;
        container.appendChild(card);
    });
}

/* ============================================================
   АДМИН: ИГРЫ
============================================================ */
function renderGamesAdmin() {
    const container = $('gamesAdminList');
    if (!container) return;
    container.innerHTML = '';
    const list = Object.values(gamesCache);
    if (!list.length) {
        container.innerHTML = '<div class="empty">Пока нет игр</div>';
        return;
    }
    list.forEach(g => {
        const el = document.createElement('div');
        el.className = 'games-admin-item';
        const logoHtml = g.image
            ? `<img src="${escapeHtml(g.image)}" alt="" onerror="this.outerHTML='<span>🎮</span>'">`
            : `<span>🎮</span>`;
        el.innerHTML = `
            <div class="logo-mini">${logoHtml}</div>
            <div class="txt">
                <b>${escapeHtml(g.name)}</b>
                <span>ID: ${escapeHtml(g.id)}${g.bg ? ' · 🎨 фон' : ''}</span>
            </div>
            <div class="actions">
                <button class="edit" title="Редактировать">✏️</button>
                <button class="delete" title="Удалить">🗑</button>
            </div>`;
        el.querySelector('.edit').addEventListener('click', () => openGameEdit(g));
        el.querySelector('.delete').addEventListener('click', () => deleteGame(g.id, g.name));
        container.appendChild(el);
    });
}
on('gameAddBtn', 'click', async () => {
    const id = val('gameId').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const name = val('gameName').trim();
    const image = val('gameImage').trim();
    const bg = val('gameBg').trim();
    const statusEl = $('gameStatus');
    if (!id) { flashStatusEl(statusEl, 'Укажи ID (латиница)', '#ff7a7a'); return; }
    if (!name) { flashStatusEl(statusEl, 'Укажи название', '#ff7a7a'); return; }
    if (gamesCache[id]) { flashStatusEl(statusEl, 'ID уже существует', '#ff7a7a'); return; }
    const { error } = await supabase.from('games').insert({
        id, name, image: image || null, bg: bg || null,
        sort_order: Object.keys(gamesCache).length
    });
    if (error) { flashStatusEl(statusEl, 'Ошибка: ' + error.message, '#ff7a7a'); return; }
    await logAdminAction('Создал игру', name);
    ['gameId','gameName','gameImage','gameBg'].forEach(i => {
        const el = $(i);
        if (el) el.value = '';
    });
    flashStatusEl(statusEl, '✔ Добавлено', '#6ee7a7');
    await loadGames();
});
function openGameEdit(g) {
    editingGame = g;
    $('gameEditId').value = g.id;
    $('gameEditName').value = g.name;
    $('gameEditImage').value = g.image || '';
    $('gameEditBg').value = g.bg || '';
    $('gameEditMsg').textContent = '';
    $('gameEditModal').hidden = false;
    $('gameEditName').focus();
}
on('cancelGameEdit', 'click', () => {
    $('gameEditModal').hidden = true; editingGame = null;
});
on('saveGameEdit', 'click', async () => {
    if (!editingGame) return;
    const name = val('gameEditName').trim();
    const image = val('gameEditImage').trim();
    const bg = val('gameEditBg').trim();
    const msg = $('gameEditMsg');
    if (!name) { msg.textContent = 'Укажи название'; msg.style.color = '#ff7a7a'; return; }
    const { error } = await supabase.from('games').update({
        name, image: image || null, bg: bg || null
    }).eq('id', editingGame.id);
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    await logAdminAction('Изменил игру', name);
    $('gameEditModal').hidden = true;
    editingGame = null;
    await loadGames();
});
async function deleteGame(id, name) {
    const count = Object.values(clansCache).filter(c => (c.game_id || 'wosb') === id).length;
    let msg = `Удалить игру «${name}»?`;
    if (count > 0) msg += `\n\n⚠️ К этой игре привязано гильдий: ${count}.`;
    if (!confirm(msg)) return;
    const { error } = await supabase.from('games').delete().eq('id', id);
    if (error) return alert('Ошибка: ' + error.message);
    await logAdminAction('Удалил игру', name);
    if (currentGame === id) {
        currentGame = null;
        localStorage.removeItem(GAME_STORAGE_KEY);
    }
    await loadGames();
    await loadClans();
    renderHomeCards();
}

/* ============================================================
   АДМИН: ГИЛЬДИИ
============================================================ */
function renderAdminClanSelect() {
    const sel = $('adminClanSelect');
    if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = '';
    Object.values(clansCache).forEach(c => {
        const o = document.createElement('option');
        o.value = c.id; o.textContent = c.name; sel.appendChild(o);
    });
    if (cur && clansCache[cur]) sel.value = cur;
    updateAdminFields();
}
function renderGameSelectForClanAdmin() {
    const sel = $('adminClanGame');
    if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = '';
    Object.values(gamesCache).forEach(g => {
        const o = document.createElement('option');
        o.value = g.id; o.textContent = g.name; sel.appendChild(o);
    });
    if (cur && gamesCache[cur]) sel.value = cur;
}
function renderNewClanGameSelect() {
    const sel = $('newClanGame');
    if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = '';
    Object.values(gamesCache).forEach(g => {
        const o = document.createElement('option');
        o.value = g.id; o.textContent = g.name; sel.appendChild(o);
    });
    if (cur && gamesCache[cur]) sel.value = cur;
    else if (currentGame && gamesCache[currentGame]) sel.value = currentGame;
}
on('adminClanSelect', 'change', updateAdminFields);
function updateAdminFields() {
    const cid = val('adminClanSelect');
    const clan = clansCache[cid];
    renderGameSelectForClanAdmin();
    renderAllianceSelects();
    if (clan) {
        $('adminClanGame').value = clan.game_id || 'wosb';
        $('adminClanAlliance').value = clan.alliance_id || '';
    }
    $('adminCurrentPass').value = clan?.password || '—';
    $('adminCurrentAdminPass').value = clan?.admin_password || '—';
    $('adminNewPass').value = '';
    $('adminNewAdminPass').value = '';
    $('adminDiscord').value = clan?.discord || '';
    $('adminNews').value = clan?.news || '';
    $('adminRules').value = clan?.rules || '';
    $('adminNicks').value = clan?.admin_nicks || '';
    $('adminMembers').value = clan?.members_list || '';
    $('adminPanelMsg').textContent = '';
}
on('saveAdminSettings', 'click', async () => {
    const cid = val('adminClanSelect');
    const newPass = val('adminNewPass').trim();
    const newAdminPass = val('adminNewAdminPass').trim();
    const newDiscord = val('adminDiscord').trim();
    const newNews = val('adminNews');
    const newRules = val('adminRules');
    const newGame = val('adminClanGame');
    const newAlliance = val('adminClanAlliance');
    const newAdminNicks = val('adminNicks');
    const newMembers = val('adminMembers');
    const msg = $('adminPanelMsg');
    if (!cid) return;
    const clan = clansCache[cid]; if (!clan) return;
    const payload = {
        discord: newDiscord || null,
        news: newNews || null,
        rules: newRules,
        game_id: newGame || null,
        alliance_id: newAlliance || null,
        admin_nicks: newAdminNicks || null,
        members_list: newMembers || null,
        updated_at: new Date().toISOString()
    };
    if (newPass) payload.password = newPass;
    if (newAdminPass) payload.admin_password = newAdminPass;
    const { error } = await supabase.from('clans').update(payload).eq('id', cid);
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    await logAdminAction('Изменил настройки гильдии', clan.name);
    Object.assign(clansCache[cid], payload);
    msg.textContent = '✔ Сохранено'; msg.style.color = '#6ee7a7';
    $('adminNewPass').value = '';
    $('adminNewAdminPass').value = '';
    $('adminCurrentPass').value = clansCache[cid].password || '—';
    $('adminCurrentAdminPass').value = clansCache[cid].admin_password || '—';
    if (pendingClanId === cid) {
        $('clanInfoRules').textContent = newRules || 'Правила не заданы.';
        const nw = $('clanInfoNewsWrap');
        if (newNews?.trim()) { nw.hidden = false; $('clanInfoNews').textContent = newNews; }
        else nw.hidden = true;
    }
    if (currentClan === cid) { renderMembers(); renderAdmins(); }
    renderHomeCards();
    renderContacts();
    renderAlliancesAdmin();
    updateAllianceBar();
});
on('deleteClanBtn', 'click', async () => {
    const cid = val('adminClanSelect');
    if (!cid) return alert('Выберите гильдию');
    const clan = clansCache[cid];
    if (!clan) return alert('Гильдия не найдена');
    if (!confirm(`Удалить гильдию «${clan.name}»?\n\n⚠️ Вместе с ней удалятся ВСЕ записи.`)) return;
    const typed = prompt(`Для подтверждения введи название гильдии:\n«${clan.name}»`);
    if (typed !== clan.name) { alert('Название не совпадает. Удаление отменено.'); return; }
    const btn = $('deleteClanBtn');
    btn.disabled = true;
    btn.textContent = '⏳ Удаление…';
    try {
        for (const t of TABS) { await supabase.from(t).delete().eq('clan', cid); }
        await supabase.from('events').delete().eq('clan', cid).eq('is_shared', false);
        await supabase.from('treasury').delete().eq('clan', cid);
        await supabase.from('trades').delete().eq('clan', cid);
        await supabase.from('builds').delete().eq('clan', cid).eq('is_shared', false);
        const { error } = await supabase.from('clans').delete().eq('id', cid);
        if (error) throw error;
        await logAdminAction('Удалил гильдию', clan.name);
        delete clansCache[cid];
        if (currentClan === cid) {
            currentClan = null;
            localStorage.removeItem(LAST_CLAN_KEY);
            localStorage.removeItem(UNLOCK_KEY);
        }
        renderHomeCards();
        renderAdminClanSelect();
        renderScopeSelects();
        renderContacts();
        renderTradeClanSelect();
        renderTradeClanFilters();
        renderAlliancesAdmin();
        applyBg();
        $('adminPanelMsg').textContent = `✔ Гильдия «${clan.name}» удалена`;
        $('adminPanelMsg').style.color = '#6ee7a7';
    } catch (err) {
        $('adminPanelMsg').textContent = 'Ошибка: ' + err.message;
        $('adminPanelMsg').style.color = '#ff7a7a';
    } finally {
        btn.disabled = false;
        btn.textContent = '🗑 Удалить гильдию';
    }
});
function renderSiteFields() {
    const s = settingsCache || {};
    $('adminWebhook').value = s.discord_webhook || '';
    const rssEl = $('adminNewsRss');
    if (rssEl) rssEl.value = s.news_rss_url || 'https://vk.ru/@worldofseabattle';
    $('adminSiteMsg').textContent = '';
}
on('saveSiteSettings', 'click', async () => {
    const msg = $('adminSiteMsg');
    msg.style.color = '';
    const rssEl = $('adminNewsRss');
    const payload = {
        discord_webhook: val('adminWebhook').trim() || null,
        news_rss_url: rssEl ? (rssEl.value.trim() || null) : null,
        updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('site_settings').update(payload).eq('id', 'main');
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    settingsCache = Object.assign({ id: 'main' }, settingsCache || {}, payload);
    await logAdminAction('Изменил настройки сайта');
    msg.textContent = '✔ Сохранено';
    msg.style.color = '#6ee7a7';
});

/* ============================================================
   ДОБАВЛЕНИЕ ГИЛЬДИИ
============================================================ */
on('openAddClan', 'click', () => {
    ['newClanId','newClanName','newClanDesc','newClanRules','newClanPass','newClanAdminPass','newClanDiscord','newClanImage','newClanBg']
        .forEach(id => { const el = $(id); if (el) el.value = ''; });
    renderNewClanGameSelect();
    renderAllianceSelects();
    $('newClanAlliance').value = '';
    $('addClanMsg').textContent = '';
    $('addClanModal').hidden = false;
    $('newClanId').focus();
});
on('cancelAddClan', 'click', () => { $('addClanModal').hidden = true; });
on('saveNewClan', 'click', async () => {
    const id = val('newClanId').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const name = val('newClanName').trim();
    const pass = val('newClanPass').trim();
    const adminPass = val('newClanAdminPass').trim();
    const game = val('newClanGame');
    const alliance = val('newClanAlliance');
    const msg = $('addClanMsg');
    if (!id || !name || !pass) { msg.textContent = 'ID, название и пароль обязательны'; msg.style.color = '#ff7a7a'; return; }
    if (!game) { msg.textContent = 'Выберите игру'; msg.style.color = '#ff7a7a'; return; }
    if (clansCache[id]) { msg.textContent = 'ID уже занят'; msg.style.color = '#ff7a7a'; return; }
    const payload = {
        id, name, game_id: game,
        description: val('newClanDesc').trim(),
        rules: val('newClanRules'),
        password: pass,
        admin_password: adminPass || null,
        alliance_id: alliance || null,
        discord: val('newClanDiscord').trim() || null,
        image: val('newClanImage').trim() || 'images/aov.png',
        bg: val('newClanBg').trim() || 'images/bg-main.jpg'
    };
    const { error } = await supabase.from('clans').insert(payload);
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    await logAdminAction('Создал гильдию', name);
    clansCache[id] = payload;
    renderHomeCards(); renderAdminClanSelect(); renderScopeSelects(); renderContacts();
    renderTradeClanSelect(); renderTradeClanFilters(); renderApplyClanSelect();
    renderAlliancesAdmin();
    msg.textContent = '✔ Гильдия создана'; msg.style.color = '#6ee7a7';
    setTimeout(() => { $('addClanModal').hidden = true; }, 800);
});

/* ============================================================
   РЕДАКТИРОВАНИЕ ЗАПИСИ
============================================================ */
function openEditModal(tab, item) {
    editingItem = { tab, id: item.id };
    $('editPlayerGuild').value = item.player_guild || '';
    $('editNickname').value = item.nickname || '';
    $('editFaction').value = item.faction || '';
    $('editNote').value = item.note || '';
    $('editError').textContent = '';
    $('editModal').hidden = false;
    $('editPlayerGuild').focus();
}
on('cancelEdit', 'click', () => { $('editModal').hidden = true; editingItem = null; });
on('saveEdit', 'click', async () => {
    if (!editingItem) return;
    const pg = val('editPlayerGuild').trim();
    const nick = val('editNickname').trim();
    if (!pg && !nick) { $('editError').textContent = 'Заполни Гильдию или Никнейм'; return; }
    const { tab, id } = editingItem;
    const data = {
        nickname: nick || null, player_guild: pg || null,
        faction: val('editFaction').trim() || null,
        note: val('editNote').trim() || null
    };
    if (isAdmin) {
        const { error } = await supabase.from(tab).update(data).eq('id', id);
        if (error) { $('editError').textContent = 'Ошибка: ' + error.message; return; }
    } else {
        const { data: resp, error } = await supabase.rpc('clan_admin_action', {
            action: 'update', target_table: tab, target_clan: currentClan,
            entered_password: currentClanPass, record_id: id, data
        });
        if (error || resp?.error) { $('editError').textContent = 'Ошибка: ' + (resp?.error || error.message); return; }
    }
    await logAdminAction(`Изменил запись (${tab})`, nick || pg);
    $('editModal').hidden = true; editingItem = null;
    loadList(tab);
});
['editPlayerGuild','editNickname','editFaction','editNote'].forEach(id => {
    on(id, 'keydown', e => { if (e.key === 'Enter') $('saveEdit').click(); });
});

/* ============================================================
   ДОБАВЛЕНИЕ ЗАПИСИ
============================================================ */
on('addBtn', 'click', async () => {
    if (!canEditClan(currentClan)) return;
    const pg = val('playerGuild').trim();
    const nick = val('nickname').trim();
    if (!pg && !nick) { flashStatus('Заполни Гильдию или Никнейм', '#ff7a7a'); return; }
    const data = {
        nickname: nick || null, player_guild: pg || null,
        faction: val('faction').trim() || null,
        note: val('note').trim() || null
    };
    if (isAdmin) {
        const { error } = await supabase.from(currentTab).insert({ ...data, clan: currentClan });
        if (error) { flashStatus('Ошибка: ' + error.message, '#ff7a7a'); return; }
    } else {
        const { data: resp, error } = await supabase.rpc('clan_admin_action', {
            action: 'insert', target_table: currentTab, target_clan: currentClan,
            entered_password: currentClanPass, data
        });
        if (error || resp?.error) { flashStatus('Ошибка: ' + (resp?.error || error.message), '#ff7a7a'); return; }
    }
    await logAdminAction(`Добавил запись (${currentTab})`, nick || pg);
    ['playerGuild','nickname','faction','note'].forEach(id => {
        const el = $(id);
        if (el) el.value = '';
    });
    $('playerGuild').focus();
    flashStatus('✔ Добавлено', '#6ee7a7');
    loadList(currentTab);
});
['playerGuild','nickname','faction','note'].forEach(id => {
    on(id, 'keydown', e => { if (e.key === 'Enter') $('addBtn').click(); });
});

/* ============================================================
   УДАЛЕНИЕ И ПЕРЕМЕЩЕНИЕ
============================================================ */
async function deleteItem(tab, id) {
    if (!confirm('Удалить запись?')) return;
    if (isAdmin) {
        const { error } = await supabase.from(tab).delete().eq('id', id);
        if (error) return alert(error.message);
    } else {
        const { data: resp, error } = await supabase.rpc('clan_admin_action', {
            action: 'delete', target_table: tab, target_clan: currentClan,
            entered_password: currentClanPass, record_id: id
        });
        if (error || resp?.error) return alert('Ошибка: ' + (resp?.error || error.message));
    }
    await logAdminAction(`Удалил запись (${tab})`);
    loadList(tab);
}
function openMoveModal(fromTab, id) {
    movingItem = { fromTab, id };
    $('moveModal').hidden = false;
}
on('cancelMove', 'click', () => { $('moveModal').hidden = true; movingItem = null; });
document.querySelectorAll('#moveModal [data-target]').forEach(btn => {
    btn.addEventListener('click', async () => {
        if (!movingItem || !currentClan) return;
        const { fromTab, id } = movingItem;
        const toTab = btn.dataset.target;
        $('moveModal').hidden = true; movingItem = null;
        if (toTab === fromTab) return;
        const { data, error } = await supabase.from(fromTab).select('*').eq('id', id).single();
        if (error) return alert(error.message);
        if (isAdmin) {
            const { error: insErr } = await supabase.from(toTab).insert({
                nickname: data.nickname, player_guild: data.player_guild,
                faction: data.faction, note: data.note, clan: currentClan
            });
            if (insErr) return alert(insErr.message);
            await supabase.from(fromTab).delete().eq('id', id);
        } else {
            const { data: resp1, error: err1 } = await supabase.rpc('clan_admin_action', {
                action: 'insert', target_table: toTab, target_clan: currentClan,
                entered_password: currentClanPass,
                data: { nickname: data.nickname, player_guild: data.player_guild, faction: data.faction, note: data.note }
            });
            if (err1 || resp1?.error) return alert('Ошибка: ' + (resp1?.error || err1.message));
            const { data: resp2, error: err2 } = await supabase.rpc('clan_admin_action', {
                action: 'delete', target_table: fromTab, target_clan: currentClan,
                entered_password: currentClanPass, record_id: id
            });
            if (err2 || resp2?.error) return alert('Ошибка удаления: ' + (resp2?.error || err2.message));
        }
        await logAdminAction(`Переместил запись ${fromTab} → ${toTab}`, data.nickname || data.player_guild);
        loadList(fromTab); loadList(toTab);
    });
});

/* ============================================================
   #build=ID
============================================================ */
async function handleBuildHash() {
    const m = location.hash.match(/^#build=([a-f0-9-]+)$/i);
    if (!m) return;
    const { data, error } = await supabase.from('builds').select('*').eq('id', m[1]).single();
    if (error || !data) return;
    const section = data.type === 'pvp' ? 'pvp' : 'pb';
    document.querySelector(`.side-item[data-section="${section}"]`)?.click();
    setTimeout(() => {
        document.querySelectorAll('.build-card').forEach(c => {
            if (c.querySelector('.build-ship')?.textContent === data.ship_name) {
                c.scrollIntoView({ behavior: 'smooth', block: 'center' });
                c.style.boxShadow = '0 0 0 3px #b48aff';
                setTimeout(() => c.style.boxShadow = '', 2500);
            }
        });
    }, 600);
}
window.addEventListener('hashchange', () => { if (location.hash.startsWith('#build=')) handleBuildHash(); });

/* ============================================================
   👤 ПРОФИЛЬ ИГРОКА
============================================================ */
async function openProfile(nickname) {
    if (!nickname) return;
    $('profileNickname').textContent = nickname;
    const statsEl = $('profileStats');
    statsEl.innerHTML = '<div class="empty">Загрузка…</div>';
    $('profileModal').hidden = false;
    try {
        const [en, fr, ne, pe, tradesBuy, tradesSell] = await Promise.all([
            supabase.from('enemies').select('id', { count: 'exact', head: true }).eq('nickname', nickname),
            supabase.from('friends').select('id', { count: 'exact', head: true }).eq('nickname', nickname),
            supabase.from('neutral').select('id', { count: 'exact', head: true }).eq('nickname', nickname),
            supabase.from('personal').select('id', { count: 'exact', head: true }).eq('nickname', nickname),
            supabase.from('trades').select('id', { count: 'exact', head: true }).eq('nickname', nickname).eq('type', 'buy'),
            supabase.from('trades').select('id', { count: 'exact', head: true }).eq('nickname', nickname).eq('type', 'sell')
        ]);
        const stats = [
            { label: '🔴 В списках врагов',    value: en.count || 0 },
            { label: '🟢 В списках друзей',    value: fr.count || 0 },
            { label: '⚪ В нейтралитете',      value: ne.count || 0 },
            { label: '🟡 В «не трогать»',      value: pe.count || 0 },
            { label: '🛒 Заявок на покупку',   value: tradesBuy.count || 0 },
            { label: '💰 Заявок на продажу',   value: tradesSell.count || 0 }
        ];
        const { data: online } = await supabase.from('online_users').select('last_seen').eq('nickname', nickname).maybeSingle();
        let onlineLabel = '⚫ Офлайн';
        if (online?.last_seen) {
            const diff = Date.now() - new Date(online.last_seen).getTime();
            if (diff < 90000) onlineLabel = '🟢 Онлайн';
            else if (diff < 3600000) onlineLabel = `🔵 Был ${Math.floor(diff/60000)} мин назад`;
            else if (diff < 86400000) onlineLabel = `🔵 Был ${Math.floor(diff/3600000)} ч назад`;
        }
        stats.unshift({ label: '📡 Статус', value: onlineLabel });
        statsEl.innerHTML = stats.map(s => `
            <div class="profile-stat-row">
                <span class="profile-stat-label">${s.label}</span>
                <span class="profile-stat-value">${s.value}</span>
            </div>
        `).join('');
    } catch (err) {
        statsEl.innerHTML = `<div class="empty">Ошибка: ${err.message}</div>`;
    }
}
on('closeProfile', 'click', () => { $('profileModal').hidden = true; });
on('profileModal', 'click', e => { if (e.target.id === 'profileModal') $('profileModal').hidden = true; });

/* ============================================================
   🔔 УВЕДОМЛЕНИЯ
============================================================ */
async function loadNotifications() {
    const nick = getViewerNick();
    if (!nick) { notifications = []; renderNotifications(); return; }
    const { data, error } = await supabase.from('notifications').select('*')
        .eq('user_nickname', nick).order('created_at', { ascending: false }).limit(50);
    if (error) { console.warn('Notif error:', error.message); return; }
    notifications = data || [];
    renderNotifications();
}
function renderNotifications() {
    const list = $('notifList');
    if (!list) return;
    const unread = notifications.filter(n => !n.is_read).length;
    ['notifBadge', 'notifBadge2'].forEach(id => {
        const badge = $(id);
        if (!badge) return;
        if (unread > 0) { badge.textContent = unread > 99 ? '99+' : unread; badge.hidden = false; }
        else badge.hidden = true;
    });
    if (!notifications.length) {
        list.innerHTML = '<p class="empty" style="padding:20px;text-align:center;">Уведомлений пока нет</p>';
        return;
    }
    const icons = { event: '📅', trade: '🪙', application: '📝', chat: '💬', system: '⚙️' };
    list.innerHTML = notifications.map(n => `
        <div class="notif-item ${n.is_read ? '' : 'unread'}" data-id="${n.id}">
            <div class="notif-item-icon">${icons[n.type] || '🔔'}</div>
            <div class="notif-item-body">
                <div class="notif-item-title">${escapeHtml(n.title)}</div>
                ${n.body ? `<div class="notif-item-text">${escapeHtml(n.body)}</div>` : ''}
                <div class="notif-item-time">${tradeTimeAgo(n.created_at)}</div>
            </div>
        </div>
    `).join('');
    list.querySelectorAll('.notif-item').forEach(el => {
        el.addEventListener('click', async () => {
            const id = el.dataset.id;
            const n = notifications.find(x => String(x.id) === String(id));
            if (!n) return;
            if (!n.is_read) {
                await supabase.from('notifications').update({ is_read: true }).eq('id', id);
                n.is_read = true;
                renderNotifications();
            }
            if (n.link) {
                if (n.link.startsWith('#build=')) location.hash = n.link;
                else if (n.link.startsWith('clan:')) {
                    const cid = n.link.split(':')[1];
                    if (clansCache[cid]) openClan(cid);
                }
            }
            $('notifPanel').hidden = true;
        });
    });
}
async function createNotification(userNickname, type, title, body, link) {
    if (!userNickname) return;
    try {
        await supabase.from('notifications').insert({
            user_nickname: userNickname, type, title, body: body || null, link: link || null
        });
    } catch (e) { }
}
function openNotifPanel() { $('notifPanel').hidden = false; loadNotifications(); }
function closeNotifPanel() { $('notifPanel').hidden = true; }
on('notifBell', 'click', e => {
    e.stopPropagation();
    $('notifPanel').hidden ? openNotifPanel() : closeNotifPanel();
});
on('notifBell2', 'click', e => {
    e.stopPropagation();
    $('notifPanel').hidden ? openNotifPanel() : closeNotifPanel();
});
document.addEventListener('click', e => {
    const panel = $('notifPanel');
    if (!panel || panel.hidden) return;
    if (e.target.closest('#notifPanel')) return;
    if (e.target.closest('#notifBell') || e.target.closest('#notifBell2')) return;
    closeNotifPanel();
});
on('notifMarkAllRead', 'click', async () => {
    const nick = getViewerNick();
    if (!nick) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_nickname', nick).eq('is_read', false);
    loadNotifications();
});

/* ============================================================
   💬 ЧАТ
============================================================ */
function setChatMode(mode) {
    chatMode = mode;

    document.querySelectorAll('.chat-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.mode === mode);
    });

    const privTab = $('chatPrivateTab');
    if (privTab) {
        if (chatPrivateWith) { privTab.hidden = false; privTab.textContent = '✉️ ' + chatPrivateWith; }
        else privTab.hidden = true;
    }

    const voiceTab = $('chatVoiceTab');
    if (voiceTab) voiceTab.hidden = !currentClan;

    const clearBtn = $('chatClear');
    if (clearBtn) clearBtn.hidden = !isAdmin || mode === 'voice';

    const inputRow = $('chatInputRow');
    const voiceBox = $('chatVoiceContainer');
    const msgBox = $('chatMessages');

    if (mode === 'voice') {
        if (inputRow) inputRow.hidden = true;
        if (msgBox) msgBox.hidden = true;
        if (voiceBox) voiceBox.hidden = false;
        startVoiceChat();
        return;
    } else {
        if (inputRow) inputRow.hidden = false;
        if (msgBox) msgBox.hidden = false;
        if (voiceBox) voiceBox.hidden = true;
        stopVoiceChat();
    }

    const input = $('chatInput');
    if (input) {
        if (mode === 'private' && chatPrivateWith) input.placeholder = `Личное сообщение для ${chatPrivateWith}...`;
        else if (mode === 'general') input.placeholder = 'Общий чат — напишите всем игрокам...';
        else input.placeholder = 'Чат гильдии...';
    }

    loadChatMessages();
    initChatRealtime();
}

/* ---------- Голосовой чат (Jitsi External API) ---------- */
let jitsiApi = null;
let jitsiLoading = false;

function buildVoiceRoomName() {
    const cid = String(currentClan || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return 'wosb_guild_' + (cid || 'common');
}
function ensureJitsiApi(cb) {
    if (window.JitsiMeetExternalAPI) { cb(); return; }
    if (jitsiLoading) return;
    jitsiLoading = true;
    const s = document.createElement('script');
    s.src = 'https://meet.jit.si/external_api.js';
    s.async = true;
    s.onload = () => { jitsiLoading = false; cb(); };
    s.onerror = () => {
        jitsiLoading = false;
        console.error('Не удалось загрузить Jitsi External API');
        alert('Не удалось загрузить голосовой чат. Проверьте соединение.');
    };
    document.head.appendChild(s);
}
function startVoiceChat() {
    if (!currentClan) return;
    const container = $('chatVoiceContainer');
    if (!container) return;
    if (jitsiApi) return;

    ensureJitsiApi(() => {
        const roomName = buildVoiceRoomName();
        const nick = getViewerNick() || 'Гость';
        container.innerHTML = '';

        jitsiApi = new window.JitsiMeetExternalAPI('meet.jit.si', {
            roomName,
            parentNode: container,
            width: '100%',
            height: '100%',
            userInfo: { displayName: nick },
            configOverwrite: {
                startWithVideoMuted: true,
                startWithAudioMuted: false,
                prejoinPageEnabled: false,
                disableDeepLinking: true,
                p2p: { enabled: false },
                toolbarButtons: [
                    'microphone', 'camera', 'desktop', 'chat',
                    'raisehand', 'tileview', 'settings', 'hangup'
                ]
            },
            interfaceConfigOverwrite: {
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                DEFAULT_BACKGROUND: '#0a0d12'
            }
        });

        jitsiApi.addEventListener('ready', () => {
            console.log('🎙 Голосовой чат готов, комната:', roomName);
        });
        jitsiApi.addEventListener('videoConferenceLeft', () => {
            stopVoiceChat();
        });

        voiceActive = true;
    });
}
function stopVoiceChat() {
    if (jitsiApi) {
        try { jitsiApi.dispose(); } catch (e) { }
        jitsiApi = null;
    }
    const container = $('chatVoiceContainer');
    if (container) container.innerHTML = '';
    voiceActive = false;
}

async function loadChatMessages() {
    const container = $('chatMessages');
    if (!container) return;
    if (chatMode === 'guild' && !currentClan) {
        container.innerHTML = '<p class="empty" style="text-align:center;padding:20px;">🏰 Зайдите в гильдию, чтобы писать в чат гильдии. Или переключитесь на 🌍 Общий.</p>';
        chatMessages = [];
        return;
    }
    if (chatMode === 'private' && !chatPrivateWith) {
        container.innerHTML = '<p class="empty" style="text-align:center;padding:20px;">Выберите, кому написать — откройте админ-панель → Онлайн.</p>';
        chatMessages = [];
        return;
    }
    container.innerHTML = '<p class="empty" style="text-align:center;">Загрузка…</p>';
    const myNick = getViewerNick();
    let query = supabase.from('chat_messages').select('*');
    if (chatMode === 'guild') {
        query = query.eq('clan_id', currentClan).is('recipient', null);
    } else if (chatMode === 'general') {
        query = query.is('clan_id', null).is('recipient', null);
    } else if (chatMode === 'private') {
        const other = chatPrivateWith;
        const me = myNick || '__no_nick__';
        query = query.or(`and(nickname.eq.${me},recipient.eq.${other}),and(nickname.eq.${other},recipient.eq.${me})`);
    }
    const { data, error } = await query.order('created_at', { ascending: true }).limit(100);
    if (error) { container.innerHTML = `<p class="empty" style="text-align:center;">Ошибка: ${error.message}</p>`; return; }
    chatMessages = data || [];
    renderChatMessages();
}
function renderChatMessages() {
    const container = $('chatMessages');
    if (!container) return;
    if (!chatMessages.length) {
        container.innerHTML = '<p class="empty" style="text-align:center;padding:20px;">Сообщений пока нет. Будьте первым! 👋</p>';
        return;
    }
    const myNick = getViewerNick().toLowerCase();
    container.innerHTML = chatMessages.map(m => {
        const isMine = myNick && (m.nickname || '').toLowerCase() === myNick;
        const d = new Date(m.created_at);
        const time = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
        const dateStr = d.toLocaleDateString('ru-RU');
        const today = new Date().toLocaleDateString('ru-RU');
        const timeLabel = dateStr === today ? time : `${dateStr} ${time}`;
        const isPrivate = !!m.recipient;
        const privBadge = isPrivate ? ' ✉️' : '';
        return `
            <div class="chat-message ${isMine ? 'mine' : ''} ${isPrivate ? 'private' : ''}">
                <div class="chat-message-head">
                    <span class="chat-message-author" data-nick="${escapeHtml(m.nickname)}">${escapeHtml(m.nickname)}${privBadge}</span>
                    <span class="chat-message-time">${timeLabel}</span>
                </div>
                <div class="chat-message-text">${escapeHtml(m.text)}</div>
            </div>
        `;
    }).join('');
    container.scrollTop = container.scrollHeight;
    container.querySelectorAll('.chat-message-author').forEach(el => {
        el.addEventListener('click', () => openProfile(el.dataset.nick));
    });
}
async function sendChatMessage() {
    const input = $('chatInput');
    const text = input.value.trim();
    if (!text) return;
    if (chatMode === 'guild' && !currentClan) { alert('Сначала зайдите в гильдию, либо переключитесь на 🌍 Общий чат'); return; }
    if (chatMode === 'private' && !chatPrivateWith) { alert('Выберите получателя'); return; }
    let nick = getViewerNick();
    if (!nick) {
        nick = prompt('Введите ваш ник для чата:');
        if (!nick || nick.trim().length < 2) { alert('Ник слишком короткий'); return; }
        nick = nick.trim();
        localStorage.setItem(VIEWER_NICK_KEY, nick);
        sendHeartbeat();
    }
    const payload = { nickname: nick, text };
    if (chatMode === 'guild') payload.clan_id = currentClan;
    else if (chatMode === 'general') { payload.clan_id = null; payload.recipient = null; }
    else if (chatMode === 'private') { payload.clan_id = null; payload.recipient = chatPrivateWith; }
    $('chatSend').disabled = true;
    const { error } = await supabase.from('chat_messages').insert(payload);
    $('chatSend').disabled = false;
    if (error) { alert('Ошибка: ' + error.message); return; }
    input.value = '';
}
async function clearChat() {
    if (!isAdmin) return;
    let label;
    if (chatMode === 'general') label = 'ОБЩИЙ чат';
    else if (chatMode === 'private') label = `личные сообщения с «${chatPrivateWith}»`;
    else label = `чат гильдии «${clansCache[currentClan]?.name || currentClan}»`;
    if (!confirm(`Очистить ${label}?\n\nВсе сообщения будут удалены безвозвратно.`)) return;
    let query = supabase.from('chat_messages').delete();
    const myNick = getViewerNick();
    if (chatMode === 'guild') query = query.eq('clan_id', currentClan).is('recipient', null);
    else if (chatMode === 'general') query = query.is('clan_id', null).is('recipient', null);
    else if (chatMode === 'private') {
        const other = chatPrivateWith;
        query = query.or(`and(nickname.eq.${myNick},recipient.eq.${other}),and(nickname.eq.${other},recipient.eq.${myNick})`);
    }
    const { error } = await query;
    if (error) { alert('Ошибка: ' + error.message); return; }
    await logAdminAction(`Очистил чат`, label);
    chatMessages = [];
    renderChatMessages();
}
function openChat(mode) {
    const clearBtn = $('chatClear');
    if (clearBtn) clearBtn.hidden = !isAdmin;
    $('chatPanel').hidden = false;
    if (mode === 'voice' && currentClan) setChatMode('voice');
    else if (mode === 'private' && chatPrivateWith) setChatMode('private');
    else if (mode === 'general') setChatMode('general');
    else if (mode === 'guild') setChatMode('guild');
    else setChatMode(currentClan ? 'guild' : 'general');
}
function openPrivateChat(nickname) {
    if (!nickname) return;
    chatPrivateWith = nickname;
    openChat('private');
    if (!$('screen-admin').hidden) showScreen('home');
}
function closeChat() {
    $('chatPanel').hidden = true;
    if (chatChannel) { supabase.removeChannel(chatChannel); chatChannel = null; }
    stopVoiceChat();
}
on('openChatBtn', 'click', () => openChat('guild'));
on('openGeneralChatBtn', 'click', () => openChat('general'));
on('chatClose', 'click', closeChat);
on('chatSend', 'click', sendChatMessage);
on('chatClear', 'click', clearChat);
on('chatInput', 'keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
});
document.querySelectorAll('.chat-tab').forEach(tab => {
    tab.addEventListener('click', () => setChatMode(tab.dataset.mode));
});
on('chatVoiceTab', 'click', () => openChat('voice'));
function initChatRealtime() {
    if (chatChannel) { supabase.removeChannel(chatChannel); chatChannel = null; }
    if (chatMode === 'voice') return;
    const channelName = 'chat_' + chatMode + '_' + (chatPrivateWith || currentClan || 'global');
    chatChannel = supabase
        .channel(channelName)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, payload => {
            const m = payload.new;
            const myNick = getViewerNick();
            if (chatMode === 'guild') {
                if (m.clan_id !== currentClan) return;
                if (m.recipient) return;
            } else if (chatMode === 'general') {
                if (m.clan_id !== null || m.recipient) return;
            } else if (chatMode === 'private') {
                if (!chatPrivateWith) return;
                const other = chatPrivateWith;
                const a = m.nickname === myNick && m.recipient === other;
                const b = m.nickname === other && m.recipient === myNick;
                if (!a && !b) return;
            }
            if (chatMessages.some(x => x.id === m.id)) return;
            chatMessages.push(m);
            if (chatMessages.length > 200) chatMessages.shift();
            renderChatMessages();
        })
        .subscribe();
}

/* ============================================================
   🔄 REALTIME
============================================================ */
function initRealtime() {
    closeRealtime();
    if (!currentClan) return;
    onlineChannel = supabase
        .channel('online')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'online_users' }, () => { updateOnlineCount(); })
        .subscribe();
    const nick = getViewerNick();
    if (nick) {
        notifChannel = supabase
            .channel('notif_' + nick)
            .on('postgres_changes', {
                event: 'INSERT', schema: 'public', table: 'notifications',
                filter: `user_nickname=eq.${nick}`
            }, payload => {
                notifications.unshift(payload.new);
                if (notifications.length > 50) notifications.pop();
                renderNotifications();
                ['notifBell', 'notifBell2'].forEach(id => {
                    const b = $(id);
                    if (!b) return;
                    b.style.transform = 'scale(1.15)';
                    setTimeout(() => b.style.transform = '', 300);
                });
            })
            .subscribe();
    }
}
function closeRealtime() {
    if (onlineChannel) { supabase.removeChannel(onlineChannel); onlineChannel = null; }
    if (notifChannel) { supabase.removeChannel(notifChannel); notifChannel = null; }
}

/* ============================================================
   📰 НОВОСТИ ВКОНТАКТЕ (через открытый VK API)
============================================================ */
function openVkNewsModal() {
    const modal = $('vkNewsModal');
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    loadNews();
}
function closeVkNewsModal() {
    const modal = $('vkNewsModal');
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
}

async function loadNews() {
    const container = $('vkNewsList');
    if (!container) return;
    container.innerHTML = '<div class="vk-news-loading">Загрузка новостей…</div>';

    const srcLink = $('vkNewsSourceLink');
    if (srcLink && settingsCache?.news_rss_url) {
        srcLink.href = settingsCache.news_rss_url;
    }

    const apiUrl = `https://api.vk.com/method/wall.get?domain=${encodeURIComponent(VK_DOMAIN)}&count=${VK_POSTS_COUNT}&v=${VK_API_VERSION}`;

    const proxies = [
        u => 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u),
        u => 'https://corsproxy.io/?' + encodeURIComponent(u),
        u => 'https://thingproxy.freeboard.io/fetch/' + u
    ];

    let json = null;
    let lastError = null;

    for (const make of proxies) {
        try {
            const res = await fetch(make(apiUrl), { cache: 'no-store' });
            if (!res.ok) continue;
            const data = await res.json();
            if (data && data.response) { json = data; break; }
            if (data && data.error) lastError = data.error.error_msg || 'VK API error';
        } catch (e) {
            lastError = e.message;
        }
    }

    if (!json) {
        container.innerHTML = `
            <div class="vk-news-error">
                Не удалось загрузить новости ВКонтакте.<br>
                ${lastError ? escapeHtml(lastError) : 'Проверьте соединение.'}
            </div>`;
        return;
    }

    const posts = json.response?.items || [];
    if (!posts.length) {
        container.innerHTML = '<div class="vk-news-empty">Новостей пока нет</div>';
        return;
    }

    container.innerHTML = '';
    posts.forEach(post => container.appendChild(createVkNewsCard(post)));
}

function createVkNewsCard(post) {
    const card = document.createElement('article');
    card.className = 'vk-news-item';
    const date = new Date(post.date * 1000);
    const dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    let text = post.text || '';
    const maxLen = 1000;
    const isLong = text.length > maxLen;
    const displayText = isLong ? text.substring(0, maxLen) + '…' : text;
    const postLink = `https://vk.com/wall${post.owner_id}_${post.id}`;

    let photosHtml = '';
    const photos = [];
    if (post.attachments) {
        post.attachments.forEach(att => {
            if (att.type === 'photo' && att.photo) {
                const sizes = att.photo.sizes || [];
                const suitable = sizes.filter(s => s.width <= 1300).sort((a, b) => b.width - a.width)[0];
                const best = suitable || sizes.sort((a, b) => b.width - a.width)[0];
                if (best) photos.push(best.url);
            }
        });
    }
    if (photos.length) {
        photosHtml = `<div class="vk-news-attachments">${photos.slice(0, 2).map(url => `<img class="vk-news-photo" src="${escapeHtml(url)}" alt="" loading="lazy" onerror="this.style.display='none'">`).join('')}</div>`;
    }

    const likes = post.likes?.count || 0;
    card.innerHTML = `
        <div class="vk-news-header"><span class="vk-news-date">📅 ${dateStr}</span></div>
        ${displayText ? `<div class="vk-news-text">${escapeHtml(displayText)}</div>` : ''}
        ${photosHtml}
        <div class="vk-news-footer">
            <span class="vk-news-likes">❤️ ${likes}</span>
            <a class="vk-news-link" href="${escapeHtml(postLink)}" target="_blank" rel="noopener">Читать полностью →</a>
        </div>
    `;
    return card;
}

on('openVkNewsBtn', 'click', openVkNewsModal);
on('closeVkNews', 'click', closeVkNewsModal);
on('vkNewsModal', 'click', e => { if (e.target.id === 'vkNewsModal') closeVkNewsModal(); });
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        const m = $('vkNewsModal');
        if (m && !m.hidden) closeVkNewsModal();
    }
});

/* ============================================================
   🚀 СТАРТ
============================================================ */
(async () => {
    const verEl = document.querySelector('.footer-right');
    if (verEl) verEl.textContent = 'v' + APP_VERSION;
    initTheme();

    // 1. Сессия
    const { data: { session } } = await supabase.auth.getSession();
    currentSession = session;

    // 2. Список админов сайта (до loadClans!)
    await loadSiteAdmins();
    // loadSiteAdmins уже вызвал recalcIsAdmin

    // 3. Данные
    await loadGames();
    await loadAlliances();
    await loadClans();
    await loadSettings();
    await loadPartners();
    renderApplyClanSelect();
    await loadFaq();
    await loadTactics();
    await loadStats();
    initTradeCategorySelect();
    initTradeCategoryFilters();
    updateTradeFormTotal();
    renderTradeClanSelect();
    renderTradeClanFilters();
    await renderTrades();
    await loadNotifications();
    applyAdminUI();

    const lastClan = localStorage.getItem(LAST_CLAN_KEY);
    if (lastClan && isUnlocked() && clansCache[lastClan]) {
        openClan(lastClan, localStorage.getItem(CLAN_ADMIN_PASS_KEY) === '1');
    } else {
        showScreen('home');
    }
    startHeartbeat();
    setTimeout(handleBuildHash, 800);
    setInterval(() => {
        const onlineSection = document.querySelector('.admin-section[data-apanel="online"]');
        if (onlineSection && onlineSection.classList.contains('active') && isAdmin) {
            renderAdminOnlineList();
        }
    }, 15000);
})();
