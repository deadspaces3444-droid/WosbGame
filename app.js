/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   World of Sea Battle — Гильдии                                      ║
   ║   app.js v2.1.0                                                      ║
   ║                                                                      ║
   ║   Единый файл, разбитый на логические блоки большими рамками.       ║
   ║   Навигация: Ctrl+F → "19." (карта), "24." (билды), "35." (чат)      ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   1.  📦  ИМПОРТЫ И КОНСТАНТЫ                                        ║
   ║                                                                      ║
   ║   • 1.1  Импорт supabase                                             ║
   ║   • 1.2  Версия и fallback-админы                                    ║
   ║   • 1.3  Флаги гильдий                                               ║
   ║   • 1.4  Ключи localStorage                                          ║
   ║   • 1.5  Тайминги и ROMAN                                            ║
   ║   • 1.6  Пути к картам по умолчанию                                  ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
import { supabase } from './supabase.js';

const APP_VERSION = '2.1.0';
console.log('🚀 app.js v' + APP_VERSION);

const PAGE = document.documentElement.dataset.page || 'home';

const ADMIN_EMAILS_FALLBACK = ['dead_antihrist@mail.ru'];
const BINDING_OWNERS = ['kolibri@wosb.ru', 'dead_antihrist@mail.ru'];

const CLAN_FLAGS = {
    neutral: 'images/flags/neutral.png',
    pirate:  'images/flags/pirate.png',
    spain:   'images/flags/spain.png',
    england: 'images/flags/england.png',
    russia:  'images/flags/russia.png'
};

const TABS = ['enemies', 'friends', 'neutral', 'personal'];
const UNLOCK_KEY = 'guild_unlocked';
const LAST_CLAN_KEY = 'guild_last_clan';
const MY_CLAN_KEY = 'guild_my_clan';
const BG_STORAGE_KEY = 'guild_bg_overrides';
const GAME_STORAGE_KEY = 'selected_game_id';
const VIEWER_NICK_KEY = 'viewer_nickname';
const CLAN_PASS_KEY = 'clan_pass';
const CLAN_ADMIN_PASS_KEY = 'clan_admin_pass';
const THEME_KEY = 'app_theme';
const SHARED = '__shared__';
const LEADERS_ROOM = '__leaders__';
const HEARTBEAT_MS = 30000;
const ONLINE_WINDOW_MS = 90000;
const VK_DOMAIN = 'worldofseabattle';
const VK_POSTS_COUNT = 10;
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

const MAP_DEFAULT_DETAILED = 'images/map/detailed.jpg';
const MAP_DEFAULT_CLEAN    = 'images/map/clean.jpg';

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   2.  🧠  СОСТОЯНИЕ ПРИЛОЖЕНИЯ                                       ║
   ║                                                                      ║
   ║   Все кэши, счётчики и флаги, которые меняются во время работы.     ║
   ║                                                                      ║
   ║   • 2.1  Кэши данных                                                 ║
   ║   • 2.2  Текущий пользователь                                        ║
   ║   • 2.3  Текущая гильдия                                             ║
   ║   • 2.4  Карта и маркеры                                             ║
   ║   • 2.5  Фильтры и режимы                                            ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */

// ── 2.1. Кэши данных ──────────────────────────────────────
let gamesCache = {}, clansCache = {}, alliancesCache = {};
let settingsCache = null, faqCache = [], partnersCache = [], tacticsCache = [], tradesCache = [];
let shipsCache = [];
let siteAdminsCache = [];
let resourcesCache = [];
let recipesCache = [];
let discountsCache = [];
let factionsCache = [], portsCache = [], ranksCache = [];
let eventsCache = {};

// ── 2.2. Текущий пользователь ────────────────────────────
let currentSession = null;
let isOwner = false, isMod = false, siteAdminRole = null, myAdminClanId = null;
let isAdmin = false;

// ── 2.3. Текущая гильдия ──────────────────────────────────
let currentGame = null, currentClan = null;
let currentClanIsAdmin = false, currentClanPass = null;
let pendingClanId = null, currentTab = 'enemies';

// ── 2.4. Карта и маркеры ──────────────────────────────────
let mapSettings = null;
let currentMapView = 'detailed';
let mapFsZoom = 1, mapFsX = 0, mapFsY = 0, mapFsDragging = false;
let mapFsDragStart = null;
let mapDetailedData = null, mapCleanData = null;

let clanMarkers = [];
let clanMapPlaceMode = false;
let clanMapCurrentView = 'detailed';
let editingMarkerId = null;
let pendingMarkerXY = null;
let clanMapFsZoom = 1, clanMapFsX = 0, clanMapFsY = 0, clanMapFsDragging = false;
let clanMapFsDragStart = null;

// ── 2.5. Фильтры и режимы ─────────────────────────────────
let movingItem = null, editingItem = null, editingBuild = null, editingGame = null;
let duplicatingBuild = null, editingTactic = null, editingAlliance = null, acceptingTrade = null;
let tradeFormType = 'buy', tradeFilterType = 'all', tradeFilterCat = 'all', tradeFilterClan = 'all';
let tradeSort = 'new', tradeStatusFilter = 'active';
let tradeOnlyShips = false;
let editingTradeId = null;
let shipsFilterLevel = 'all', shipsFilterType = 'all', shipsSort = 'level-desc';
let heartbeatTimer = null;
let chatChannel = null, onlineChannel = null, notifChannel = null;
let chatMessages = [], notifications = [];
let chatMode = 'guild', chatPrivateWith = null, voiceActive = false, voiceRoomOverride = null;
let pricingSaveTimers = {};
let editingResourceId = null;
let partnerLogoData = null, clanLogoData = null, newClanLogoData = null;

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   3.  🛠️  УТИЛИТЫ                                                    ║
   ║                                                                      ║
   ║   • 3.1  Короткие хелперы DOM ($, on, val)                          ║
   ║   • 3.2  Безопасный HTML                                             ║
   ║   • 3.3  Flash-сообщения                                             ║
   ║   • 3.4  Работа с логотипами и флагами                              ║
   ║   • 3.5  Сжатие изображений                                          ║
   ║   • 3.6  Пользователь / localStorage                                 ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */

// ── 3.1. Короткие хелперы DOM ────────────────────────────
const $ = id => document.getElementById(id);
function on(id, event, handler, opts) {
    const el = $(id);
    if (!el) return false;
    el.addEventListener(event, handler, opts);
    return true;
}
function val(id) { const el = $(id); return el ? el.value : ''; }

// ── 3.2. Безопасный HTML ──────────────────────────────────
function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
function colorFromString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    const hue = Math.abs(h) % 360;
    return `linear-gradient(135deg, hsl(${hue}, 55%, 45%), hsl(${hue}, 55%, 30%))`;
}

// ── 3.3. Flash-сообщения ──────────────────────────────────
function flashStatusEl(el, text, color) {
    if (!el) return;
    el.textContent = text; el.style.color = color;
    clearTimeout(el._t); el._t = setTimeout(() => el.textContent = '', 2000);
}
function flashStatus(text, color) {
    const el = $('status'); if (!el) return;
    el.textContent = text; el.style.color = color;
    clearTimeout(flashStatus._t); flashStatus._t = setTimeout(() => el.textContent = '', 2000);
}

// ── 3.4. Работа с логотипами и флагами ───────────────────
function isClanUsingFlag(clan) { return !(clan && clan.image && String(clan.image).trim()); }
function getClanImage(clan) {
    if (clan && clan.image && String(clan.image).trim()) return clan.image;
    const flag = clan?.flag || 'neutral';
    return CLAN_FLAGS[flag] || CLAN_FLAGS.neutral;
}
function isVideoMedia(url) {
    if (!url) return false;
    const s = String(url).toLowerCase();
    if (s.startsWith('data:video/')) return true;
    const clean = s.split('?')[0].split('#')[0];
    return clean.endsWith('.mp4') || clean.endsWith('.webm');
}
function renderClanLogoHtml(clan, size = 'card') {
    const url = getClanImage(clan);
    const useFlag = isClanUsingFlag(clan);
    const useVideo = isVideoMedia(url) && !useFlag;
    const flagClass = useFlag ? ' clan-flag' : '';
    const nameAttr = escapeHtml(clan.name || '');
    if (useVideo) {
        const classMap = { card: ``, info: ``, icon: `clan-icon-small`, alliance: ``, contact: `` };
        const cls = classMap[size] || '';
        return `<video autoplay muted loop playsinline preload="metadata" class="${cls}${flagClass}"><source src="${escapeHtml(url)}" type="video/mp4"><source src="${escapeHtml(url)}" type="video/webm"></video>`;
    }
    const classMap = { card: ``, info: ``, icon: `clan-icon-small`, alliance: ``, contact: `` };
    const cls = (classMap[size] || '') + flagClass;
    return `<img src="${escapeHtml(url)}" alt="${nameAttr}" class="${cls}" onerror="this.style.display='none'">`;
}

// ── 3.5. Сжатие изображений ───────────────────────────────
function compressImage(file, maxW = 1920, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                const scale = img.width > maxW ? maxW / img.width : 1;
                const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
                const canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject; img.src = e.target.result;
        };
        reader.onerror = reject; reader.readAsDataURL(file);
    });
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
                ctx.drawImage(img, (img.width - minSide) / 2, (img.height - minSide) / 2, minSide, minSide, 0, 0, maxSize, maxSize);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject; img.src = e.target.result;
        };
        reader.onerror = reject; reader.readAsDataURL(file);
    });
}

// ── 3.6. Пользователь / localStorage ─────────────────────
function canEditBindings() {
    const myEmail = (currentSession?.user?.email || '').toLowerCase();
    return BINDING_OWNERS.map(e => e.toLowerCase()).includes(myEmail);
}
function getViewerNick() { return (localStorage.getItem(VIEWER_NICK_KEY) || '').trim(); }
function getMyClanId() { return localStorage.getItem(MY_CLAN_KEY) || null; }
function getLeaderClanId() { return myAdminClanId || getMyClanId() || currentClan || null; }
function isUnlocked() { return isAdmin || localStorage.getItem(UNLOCK_KEY) === '1'; }

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   4.  🔐  ПРАВА ДОСТУПА                                              ║
   ║                                                                      ║
   ║   • 4.1  canEditClan — может ли юзер редактировать гильдию          ║
   ║   • 4.2  isClanLeader — является ли главой                           ║
   ║   • 4.3  canAccessClan — можно ли смотреть чужую гильдию            ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */

// ── 4.1. Может ли юзер редактировать гильдию ─────────────
function canEditClan(clanId) {
    if (isOwner) return true;
    if (isAdmin) {
        if (myAdminClanId) return clanId === myAdminClanId;
        if (isMod) return false;
        return true;
    }
    if (clanId === currentClan && currentClanIsAdmin) return true;
    return false;
}

// ── 4.2. Является ли главой ───────────────────────────────
function isClanLeader() {
    if (isOwner && getLeaderClanId()) return true;
    if ((isAdmin || isMod) && myAdminClanId) return true;
    return !!(currentClanIsAdmin && getMyClanId());
}

// ── 4.3. Можно ли смотреть чужую гильдию ─────────────────
function canAccessClan(clanId) {
    if (isOwner) return true;
    if (isAdmin && myAdminClanId) {
        if (clanId === myAdminClanId) return true;
        const my = clansCache[myAdminClanId];
        const target = clansCache[clanId];
        if (!my || !target || !my.alliance_id) return false;
        return target.alliance_id === my.alliance_id;
    }
    if (isAdmin && !myAdminClanId && !isMod) return true;
    if (isMod && !myAdminClanId) return false;
    const myClan = getMyClanId();
    if (!myClan) return false;
    if (clanId === myClan) return true;
    const my = clansCache[myClan];
    const target = clansCache[clanId];
    if (!my || !target) return false;
    if (!my.alliance_id) return false;
    return target.alliance_id === my.alliance_id;
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   5.  👁  ПЕРЕКЛЮЧАТЕЛЬ ПАРОЛЯ                                       ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
document.querySelectorAll('.pwd-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
        const inp = document.getElementById(btn.dataset.target);
        if (!inp) return;
        inp.type = inp.type === 'password' ? 'text' : 'password';
        btn.textContent = inp.type === 'password' ? '👁' : '🙈';
    });
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   6.  🌓  ТЕМА (тёмная / светлая)                                    ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
}
function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(cur === 'dark' ? 'light' : 'dark');
}
function initTheme() { applyTheme(localStorage.getItem(THEME_KEY) || 'dark'); }
['themeToggle','themeToggle2','themeToggle3','themeToggle4'].forEach(id => on(id, 'click', toggleTheme));

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   7.  📝  ЛОГИ                                                        ║
   ║                                                                      ║
   ║   • 7.1  logAdminAction — действия админов                          ║
   ║   • 7.2  logView — история просмотров                                ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
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
    try { await supabase.from('view_history').insert({ nickname, clan_id: clanId, page }); } catch (e) { }
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   8.  💬  DISCORD WEBHOOK                                            ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function sendDiscordWebhook(payload) {
    try {
        const webhookUrl = settingsCache?.discord_webhook;
        if (!webhookUrl || !webhookUrl.trim()) return;
        const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) console.warn('Discord webhook error:', res.status);
    } catch (e) { console.warn('Discord webhook failed:', e.message); }
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   9.  👑  АДМИНЫ САЙТА                                              ║
   ║                                                                      ║
   ║   • 9.1  loadSiteAdmins — загрузка списка                            ║
   ║   • 9.2  recalcIsAdmin — пересчёт прав                               ║
   ║   • 9.3  renderSiteAdminsAdmin — отрисовка в админке                ║
   ║   • 9.4  CRUD админов (create / delete / role / clan / pass / nick)  ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */

// ── 9.1. loadSiteAdmins ───────────────────────────────────
async function loadSiteAdmins() {
    try {
        const { data, error } = await supabase.from('site_admins').select('email, role, nickname, clan_id');
        if (error) throw error;
        siteAdminsCache = data || [];
    } catch (e) {
        console.warn('site_admins load error:', e.message);
        siteAdminsCache = [];
    }
    if (!siteAdminsCache.length) {
        siteAdminsCache = ADMIN_EMAILS_FALLBACK.map(email => ({
            email: email.toLowerCase(), role: 'owner', nickname: 'Владелец', clan_id: null
        }));
    }
    recalcIsAdmin();
    if (PAGE === 'admin') renderSiteAdminsAdmin();
}

// ── 9.2. recalcIsAdmin ────────────────────────────────────
function recalcIsAdmin() {
    const email = (currentSession?.user?.email || '').toLowerCase();
    const me = siteAdminsCache.find(r => (r.email || '').toLowerCase() === email);
    isAdmin = !!me;
    isOwner = me?.role === 'owner';
    isMod = me?.role === 'mod';
    siteAdminRole = me?.role || null;
    myAdminClanId = me?.clan_id || null;
}

// ── 9.3. renderSiteAdminsAdmin ────────────────────────────
async function renderSiteAdminsAdmin() {
    const container = $('siteAdminsList'); if (!container) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    const canBind = canEditBindings();
    document.querySelectorAll('.owner-only').forEach(el => { el.hidden = !isOwner; });
    if (!siteAdminsCache.length) { container.innerHTML = '<div class="empty">Пока нет админов</div>'; return; }

    let clansList = Object.values(clansCache);
    if (!clansList.length) {
        try {
            const { data } = await supabase.from('clans').select('id, name').order('name');
            clansList = data || [];
            clansList.forEach(c => { clansCache[c.id] = c; });
        } catch (e) {
            try {
                const { data } = await supabase.from('clans_public').select('id, name').order('name');
                clansList = data || [];
            } catch (e2) { }
        }
    }

    const roleLabels = { owner: '👑 Владелец', admin: '⚙️ Админ', mod: '🎖 Глава Клана' };
    const roleIcons  = { owner: '👑', admin: '⚙️', mod: '🎖' };
    const clanOptionsHtml = (selectedId) => {
        if (!clansList.length) return '<option value="">— Нет гильдий —</option>';
        const sorted = clansList.slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        return ['<option value="">— Без привязки —</option>']
            .concat(sorted.map(c =>
                `<option value="${escapeHtml(c.id)}" ${c.id === selectedId ? 'selected' : ''}>🏰 ${escapeHtml(c.name)}</option>`
            )).join('');
    };
    const list = siteAdminsCache.slice().sort((a, b) => {
        const order = { owner: 0, admin: 1, mod: 2 };
        return (order[a.role] ?? 9) - (order[b.role] ?? 9);
    });

    container.innerHTML = '';
    list.forEach(item => {
        const email = (item.email || '').toLowerCase();
        const role = item.role || 'admin';
        const nick = item.nickname || '—';
        const clanId = item.clan_id || '';
        const el = document.createElement('div');
        el.className = 'partners-admin-item';
        const myEmail = (currentSession?.user?.email || '').toLowerCase();
        const isMe = email === myEmail;

        const roleHtml = isOwner && !isMe
            ? `<select class="role-select" data-email="${escapeHtml(email)}">
                   <option value="owner" ${role === 'owner' ? 'selected' : ''}>👑 Владелец</option>
                   <option value="admin" ${role === 'admin' ? 'selected' : ''}>⚙️ Админ</option>
                   <option value="mod"   ${role === 'mod'   ? 'selected' : ''}>🎖 Глава Клана</option>
               </select>`
            : `<span class="role-badge ${role}">${roleLabels[role] || role}</span>`;

        const clanHtml = canBind && !isMe
            ? `<select class="clan-select" data-email="${escapeHtml(email)}">${clanOptionsHtml(clanId)}</select>`
            : (clanId && clansCache[clanId]
                ? `<span class="role-badge admin">🏰 ${escapeHtml(clansCache[clanId].name)}</span>`
                : `<span class="role-badge mod">🌐 Все гильдии</span>`);

        el.innerHTML = `
            <div class="logo-mini"><span>${roleIcons[role] || '⚙️'}</span></div>
            <div class="txt">
                <div>
                    <span class="admin-nick">${escapeHtml(nick)}</span>
                    ${isMe ? '<span style="color:var(--gold);font-size:11px;">— вы</span>' : ''}
                </div>
                <div class="admin-row">
                    <span class="admin-email">${escapeHtml(email)}</span>
                    ${roleHtml}
                </div>
                <div class="admin-row">
                    <span class="admin-email-label">Гильдия:</span>
                    ${clanHtml}
                </div>
            </div>
            <div class="actions">
                ${(isOwner || isMe) ? `<button class="edit" title="Сменить пароль">🔑</button>` : ''}
                ${(isOwner && !isMe) ? `<button class="nick-btn" title="Сменить никнейм">✏️</button>` : ''}
                ${(isOwner && !isMe) ? `<button class="delete" title="Удалить">🗑</button>` : ''}
            </div>`;
        const roleSelect = el.querySelector('.role-select');
        if (roleSelect) roleSelect.addEventListener('change', () => setAdminRole(email, roleSelect.value));
        const clanSelect = el.querySelector('.clan-select');
        if (clanSelect) clanSelect.addEventListener('change', () => setAdminClanId(email, clanSelect.value));
        const passBtn = el.querySelector('.edit');
        if (passBtn) passBtn.addEventListener('click', () => changeAdminPassword(email));
        const nickBtn = el.querySelector('.nick-btn');
        if (nickBtn) nickBtn.addEventListener('click', () => changeAdminNickname(email, nick));
        const delBtn = el.querySelector('.delete');
        if (delBtn) delBtn.addEventListener('click', () => deleteSiteAdmin(email));
        container.appendChild(el);
    });
}

// ── 9.4. CRUD админов ────────────────────────────────────
async function addSiteAdmin(email, password, role, nickname) {
    const msg = $('siteAdminsMsg');
    msg.textContent = ''; msg.style.color = '';
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanNick = String(nickname || '').trim();
    if (!cleanNick) { msg.textContent = 'Укажи никнейм'; msg.style.color = '#ff7a7a'; return; }
    if (!cleanEmail) { msg.textContent = 'Укажи email'; msg.style.color = '#ff7a7a'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) { msg.textContent = 'Некорректный email'; msg.style.color = '#ff7a7a'; return; }
    if (!password || password.length < 6) { msg.textContent = 'Пароль от 6 символов'; msg.style.color = '#ff7a7a'; return; }
    if (!['owner', 'admin', 'mod'].includes(role)) { msg.textContent = 'Некорректная роль'; msg.style.color = '#ff7a7a'; return; }
    const btn = $('addSiteAdminBtn');
    btn.disabled = true; btn.textContent = '⏳ Создание…';
    const { data, error } = await supabase.rpc('create_site_admin', {
        new_email: cleanEmail, new_password: password, new_role: role, new_nickname: cleanNick
    });
    btn.disabled = false; btn.textContent = '➕ Создать админа';
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    if (data?.error) { msg.textContent = data.error; msg.style.color = '#ff7a7a'; return; }
    await logAdminAction('Добавил админа сайта', cleanEmail, `ник: ${cleanNick}, роль: ${role}`);
    msg.textContent = '✔ Админ создан'; msg.style.color = '#6ee7a7';
    ['newSiteAdminNickname','newSiteAdminEmail','newSiteAdminPassword'].forEach(id => { const el = $(id); if (el) el.value = ''; });
    $('newSiteAdminRole').value = 'admin';
    await loadSiteAdmins();
    renderSiteAdminsAdmin();
}
async function deleteSiteAdmin(email) {
    if (!isOwner) { alert('Только владелец может удалять админов'); return; }
    if (!confirm(`Удалить админа «${email}»?`)) return;
    const { data, error } = await supabase.rpc('delete_site_admin', { target_email: email });
    if (error) return alert('Ошибка: ' + error.message);
    if (data?.error) return alert(data.error);
    await logAdminAction('Удалил админа сайта', email);
    await loadSiteAdmins(); renderSiteAdminsAdmin();
}
async function setAdminRole(email, newRole) {
    if (!isOwner) { alert('Только владелец'); renderSiteAdminsAdmin(); return; }
    const { data, error } = await supabase.rpc('set_admin_role', { target_email: email, new_role: newRole });
    if (error) { alert('Ошибка: ' + error.message); renderSiteAdminsAdmin(); return; }
    if (data?.error) { alert(data.error); renderSiteAdminsAdmin(); return; }
    await logAdminAction('Изменил роль админа', email, `новая: ${newRole}`);
    await loadSiteAdmins(); renderSiteAdminsAdmin();
}
async function setAdminClanId(email, clanId) {
    if (!canEditBindings()) { alert('Менять привязку может только владелец'); renderSiteAdminsAdmin(); return; }
    const { data, error } = await supabase.rpc('set_admin_clan_id', { target_email: email, new_clan_id: clanId || '' });
    if (error) { alert('Ошибка: ' + error.message); renderSiteAdminsAdmin(); return; }
    if (data?.error) { alert(data.error); renderSiteAdminsAdmin(); return; }
    await logAdminAction('Привязал админа к гильдии', email, `clan_id: ${clanId || '—'}`);
    await loadSiteAdmins(); renderSiteAdminsAdmin();
}
async function changeAdminPassword(email) {
    const target = prompt(`Новый пароль для «${email}» (от 6 символов):`, '');
    if (!target) return;
    if (target.length < 6) { alert('Пароль от 6 символов'); return; }
    const { data, error } = await supabase.rpc('change_admin_password', { target_email: email, new_password: target });
    if (error) return alert('Ошибка: ' + error.message);
    if (data?.error) return alert(data.error);
    await logAdminAction('Сменил пароль админа', email);
    alert('✔ Пароль изменён');
}
async function changeAdminNickname(email, current) {
    const target = prompt(`Новый никнейм для «${email}»:`, current && current !== '—' ? current : '');
    if (!target) return;
    const clean = target.trim();
    if (!clean) { alert('Никнейм не может быть пустым'); return; }
    const { data, error } = await supabase.rpc('set_admin_nickname', { target_email: email, new_nickname: clean });
    if (error) return alert('Ошибка: ' + error.message);
    if (data?.error) return alert(data.error);
    await logAdminAction('Изменил никнейм админа', email, `новый: ${clean}`);
    await loadSiteAdmins(); renderSiteAdminsAdmin();
}
on('addSiteAdminBtn', 'click', () => {
    addSiteAdmin(val('newSiteAdminEmail'), val('newSiteAdminPassword'), val('newSiteAdminRole'), val('newSiteAdminNickname'));
});
on('newSiteAdminPassword', 'keydown', e => { if (e.key === 'Enter') $('addSiteAdminBtn').click(); });
on('changeMyPassBtn', 'click', async () => {
    const pass = val('myNewPassword'); const msg = $('myPassMsg');
    msg.textContent = ''; msg.style.color = '';
    if (!pass || pass.length < 6) { msg.textContent = 'Пароль от 6 символов'; msg.style.color = '#ff7a7a'; return; }
    const myEmail = (currentSession?.user?.email || '').toLowerCase();
    if (!myEmail) { msg.textContent = 'Нет сессии'; msg.style.color = '#ff7a7a'; return; }
    const { data, error } = await supabase.rpc('change_admin_password', { target_email: myEmail, new_password: pass });
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    if (data?.error) { msg.textContent = data.error; msg.style.color = '#ff7a7a'; return; }
    $('myNewPassword').value = '';
    msg.textContent = '✔ Пароль изменён'; msg.style.color = '#6ee7a7';
    await logAdminAction('Сменил свой пароль');
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   10.  🟢  ОНЛАЙН-ХАБ                                                ║
   ║                                                                      ║
   ║   • 10.1  sendHeartbeat — «я живой» каждые 30 секунд                ║
   ║   • 10.2  updateOnlineCount — счётчик                                ║
   ║   • 10.3  startHeartbeat — запуск                                    ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function sendHeartbeat() {
    let nickname = getViewerNick();
    if (!nickname) {
        let gid = sessionStorage.getItem('guest_id');
        if (!gid) { gid = 'guest_' + Math.random().toString(36).slice(2, 10); sessionStorage.setItem('guest_id', gid); }
        nickname = gid;
    }
    const nowIso = new Date().toISOString();
    const clanId = currentClan || null;
    try {
        const { data: updated } = await supabase.from('online_users')
            .update({ last_seen: nowIso, clan_id: clanId }).eq('nickname', nickname).select('nickname');
        if (!updated || !updated.length) {
            await supabase.from('online_users').insert({ nickname, clan_id: clanId, last_seen: nowIso });
        }
    } catch (e) { }
    updateOnlineCount();
}
async function updateOnlineCount() {
    const threshold = new Date(Date.now() - ONLINE_WINDOW_MS).toISOString();
    const { count, error } = await supabase.from('online_users').select('*', { count: 'exact', head: true }).gte('last_seen', threshold);
    if (error) return;
    const el = $('onlineCount'); if (el) el.textContent = count || 0;
}
function startHeartbeat() {
    sendHeartbeat();
    clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_MS);
    setInterval(updateOnlineCount, 20000);
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   11.  🎨  ФОНЫ ГИЛЬДИЙ                                              ║
   ║                                                                      ║
   ║   • 11.1  getOverrides / setOverride                                 ║
   ║   • 11.2  applyBg — применение фона                                  ║
   ║   • 11.3  Обработчики кнопок смены фона                              ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function getOverrides() { try { return JSON.parse(localStorage.getItem(BG_STORAGE_KEY) || '{}'); } catch { return {}; } }
function setOverride(key, dataUrl) {
    const all = getOverrides();
    if (dataUrl) all[key] = dataUrl; else delete all[key];
    try { localStorage.setItem(BG_STORAGE_KEY, JSON.stringify(all)); return true; }
    catch { alert('Фон слишком большой.'); return false; }
}
function currentBgKey() { return currentClan ? currentClan : 'main'; }
function currentBgFallback() { return currentClan && clansCache[currentClan]?.bg ? clansCache[currentClan].bg : null; }
function applyBg() {
    const url = getOverrides()[currentBgKey()] || currentBgFallback();
    if (url) document.body.style.backgroundImage = `url('${url}')`;
    else document.body.style.backgroundImage = '';
}
const bgFileInput = $('bgFileInput');
on('bgChangeBtn', 'click', () => { if (!canEditClan(currentClan)) return; if (bgFileInput) { bgFileInput.value = ''; bgFileInput.click(); } });
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
    if (!getOverrides()[key]) return alert('Уже стандартный фон.');
    if (!confirm('Вернуть стандартный фон?')) return;
    setOverride(key, null); applyBg();
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   12.  🎮  ИГРЫ                                                       ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadGames() {
    const { data, error } = await supabase.from('games').select('*')
        .order('sort_order', { ascending: true }).order('created_at', { ascending: true });
    if (error) { console.error('Games load error:', error); return; }
    gamesCache = {};
    (data || []).forEach(g => { gamesCache[g.id] = g; });
    const saved = localStorage.getItem(GAME_STORAGE_KEY);
    if (saved && gamesCache[saved]) currentGame = saved;
    else currentGame = Object.keys(gamesCache)[0] || null;
    if (PAGE === 'admin') { renderGamesAdmin(); renderNewClanGameSelect(); }
    if (PAGE === 'home') renderClanRequestGameSelect();
    applyBg();
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   13.  🤝  СОЮЗЫ                                                      ║
   ║                                                                      ║
   ║   • 13.1  loadAlliances — загрузка                                   ║
   ║   • 13.2  renderAllianceSelects — селекты                            ║
   ║   • 13.3  renderAlliancesAdmin — список в админке                    ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadAlliances() {
    try {
        const { data, error } = await supabase.from('alliances').select('*').order('name');
        if (error) { alliancesCache = {}; return; }
        alliancesCache = {};
        (data || []).forEach(a => { alliancesCache[a.id] = a; });
        if (PAGE === 'admin') { renderAlliancesAdmin(); renderAllianceSelects(); }
    } catch (e) { alliancesCache = {}; }
}
function renderAllianceSelects() {
    ['adminClanAlliance', 'newClanAlliance'].forEach(id => {
        const sel = $(id); if (!sel) return;
        const cur = sel.value; sel.innerHTML = '';
        const optEmpty = document.createElement('option');
        optEmpty.value = ''; optEmpty.textContent = '— Без союза —';
        sel.appendChild(optEmpty);
        Object.values(alliancesCache).forEach(a => {
            const o = document.createElement('option');
            o.value = a.id; o.textContent = a.name; sel.appendChild(o);
        });
        if (cur && (cur === '' || alliancesCache[cur])) sel.value = cur;
    });
}
function renderAlliancesAdmin() {
    const container = $('alliancesAdminList'); if (!container) return;
    container.innerHTML = '';
    const list = Object.values(alliancesCache);
    if (!list.length) { container.innerHTML = '<div class="empty">Пока нет союзов</div>'; return; }
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
            </div>`;
        el.querySelector('.edit').addEventListener('click', () => openAllianceEdit(a));
        el.querySelector('.delete').addEventListener('click', () => deleteAlliance(a.id, a.name));
        container.appendChild(el);
    });
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   14.  🏰  ГИЛЬДИИ — ЗАГРУЗКА И КАРТОЧКИ НА ГЛАВНОЙ                  ║
   ║                                                                      ║
   ║   • 14.1  loadClans — общая загрузка                                 ║
   ║   • 14.2  getClansForGame                                            ║
   ║   • 14.3  renderHomeCards — карточки на главной                      ║
   ║   • 14.4  handleClanClick / openClanInNewTab                         ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadClans() {
    const source = isAdmin ? 'clans' : 'clans_public';
    const { data, error } = await supabase.from(source).select('*');
    if (error) { console.error('loadClans error:', error); return; }
    clansCache = {};
    (data || []).forEach(c => { clansCache[c.id] = c; });

    if (PAGE === 'home') { renderHomeCards(); renderApplyClanSelect(); }
    if (PAGE === 'clan') {
        updateAllianceBar();
        if (currentClan) {
            const titleEl = $('clanTitle'); if (titleEl) titleEl.textContent = clansCache[currentClan]?.name || '';
            const iconWrap = $('clanIconWrap');
            if (iconWrap && clansCache[currentClan]) iconWrap.innerHTML = renderClanLogoHtml(clansCache[currentClan], 'icon');
            renderMembers(); renderAdmins(); renderContacts();
        }
    }
    if (PAGE === 'admin') {
        renderAdminClanSelect(); renderScopeSelects();
    }
    if (currentClan) updateAllianceBar();
}
function getClansForGame(gameId) {
    return Object.values(clansCache).filter(c => (c.game_id || 'wosb') === gameId);
}
function renderHomeCards() {
    const grid = $('clanGrid'); if (!grid) return;
    grid.innerHTML = '';
    const list = currentGame ? getClansForGame(currentGame) : Object.values(clansCache);
    if (!list.length) { grid.innerHTML = '<div class="empty">В этой игре пока нет гильдий</div>'; return; }
    const myClan = getMyClanId();
    list.forEach(clan => {
        const btn = document.createElement('button');
        btn.className = 'clan-card';
        let accessible = true;
        if (isOwner) accessible = true;
        else if (isAdmin && myAdminClanId) accessible = canAccessClan(clan.id);
        else if (isMod && !myAdminClanId) accessible = false;
        else if (isAdmin) accessible = true;
        else accessible = !myClan || canAccessClan(clan.id);
        if (!accessible) btn.classList.add('locked');
        btn.dataset.clan = clan.id;
        btn.innerHTML = `
            ${accessible ? '' : '<span class="clan-lock">🔒</span>'}
            ${renderClanLogoHtml(clan, 'card')}
            <span class="clan-name">${escapeHtml(clan.name)}</span>
            <span class="clan-desc">${escapeHtml(clan.description || '')}</span>
            <span class="clan-more">${accessible ? 'Подробнее →' : 'Только описание →'}</span>`;
        btn.addEventListener('click', () => handleClanClick(clan.id));
        grid.appendChild(btn);
    });
}
function handleClanClick(id) {
    const myClan = getMyClanId();
    const loggedInSomewhere = isUnlocked();

    if (isOwner) { openClanInNewTab(id); return; }
    if (isMod && !myAdminClanId) { openClanInfoInNewTab(id, { locked: true }); return; }
    if (isAdmin && myAdminClanId) {
        if (canAccessClan(id)) { openClanInNewTab(id); return; }
        openClanInfoInNewTab(id, { locked: true }); return;
    }
    if (isAdmin) { openClanInNewTab(id); return; }

    if (!myClan) { openClanInfoInNewTab(id, { locked: false }); return; }
    if (id === myClan) { openClanInNewTab(id); return; }
    if (canAccessClan(id)) { openClanInNewTab(id); return; }
    openClanInfoInNewTab(id, { locked: true });
}
function openClanInNewTab(id) {
    localStorage.setItem(LAST_CLAN_KEY, id);
    location.href = 'clan.html?clan=' + encodeURIComponent(id);
}
function openClanInfoInNewTab(id, opts = {}) {
    sessionStorage.setItem('clan_info_locked_' + id, opts.locked ? '1' : '0');
    location.href = 'clan.html?info=' + encodeURIComponent(id);
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   15.  🔐  ВХОД В ГИЛЬДИЮ                                            ║
   ║                                                                      ║
   ║   • 15.1  normalizeNickList                                          ║
   ║   • 15.2  Открытие модалки                                           ║
   ║   • 15.3  doClanLogin — основная проверка                            ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function normalizeNickList(raw) {
    if (!raw) return [];
    return String(raw).split('\n').map(s => s.trim().replace(/^\d+\s*[-.)\]]?\s*/, '').trim()).filter(Boolean).map(s => s.toLowerCase());
}
on('clanLoginBtn', 'click', () => {
    const params = new URLSearchParams(location.search);
    const cid = params.get('clan') || params.get('info');
    if (!cid) return;
    pendingClanId = cid;
    const clan = clansCache[cid]; if (!clan) return;
    const nameEl = $('clanPassName'); if (nameEl) nameEl.textContent = clan.name;
    $('clanNickname').value = localStorage.getItem(VIEWER_NICK_KEY) || '';
    $('clanPassword').value = '';
    $('clanPassError').textContent = '';
    $('clanPassModal').hidden = false;
    ($('clanNickname').value ? $('clanPassword') : $('clanNickname')).focus();
});
on('cancelClanLogin', 'click', () => { $('clanPassModal').hidden = true; });
on('doClanLogin', 'click', async () => {
    const nick = val('clanNickname').trim();
    const entered = val('clanPassword');
    const clan = clansCache[pendingClanId]; if (!clan) return;
    if (!nick) { $('clanPassError').textContent = 'Введите ваш ник'; return; }
    if (nick.length < 2) { $('clanPassError').textContent = 'Ник слишком короткий'; return; }
    if (!entered) { $('clanPassError').textContent = 'Введите пароль'; return; }
    const { data: ok, error: rpcErr } = await supabase.rpc('verify_clan_password', { clan_id: pendingClanId, entered_password: entered });
    let isClanAdminLogin = false;
    if (rpcErr || !ok) {
        const { data: okAdmin, error: admErr } = await supabase.rpc('verify_clan_admin_password', { cid: pendingClanId, entered: entered });
        if (admErr || !okAdmin) { $('clanPassError').textContent = 'Неверный пароль'; return; }
        isClanAdminLogin = true;
    }
    const adminNicks = normalizeNickList(clan.admin_nicks);
    if (adminNicks.includes(nick.toLowerCase())) isClanAdminLogin = true;
    const memberNicks = normalizeNickList(clan.members_list);
    if (memberNicks.length > 0) {
        const isKnownAdmin = isClanAdminLogin || adminNicks.includes(nick.toLowerCase());
        if (!isKnownAdmin && !memberNicks.includes(nick.toLowerCase())) { $('clanPassError').textContent = 'Вашего ника нет в списке участников'; return; }
    }
    localStorage.setItem(VIEWER_NICK_KEY, nick);
    localStorage.setItem(UNLOCK_KEY, '1');
    localStorage.setItem(CLAN_PASS_KEY, entered);
    localStorage.setItem(CLAN_ADMIN_PASS_KEY, isClanAdminLogin ? '1' : '0');
    localStorage.setItem(MY_CLAN_KEY, pendingClanId);
    $('clanPassModal').hidden = true;
    sendHeartbeat();
    location.href = 'clan.html?clan=' + encodeURIComponent(pendingClanId);
});
on('clanNickname', 'keydown', e => { if (e.key === 'Enter') $('clanPassword').focus(); });
on('clanPassword', 'keydown', e => { if (e.key === 'Enter') $('doClanLogin').click(); });

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   16.  🧭  КЛАН — РОУТИНГ URL                                        ║
   ║                                                                      ║
   ║   • 16.1  bootClanPage — что делать при загрузке clan.html          ║
   ║   • 16.2  renderClanInfoPage — публичная страница гильдии            ║
   ║   • 16.3  openClanView — внутренний интерфейс                        ║
   ║   • 16.4  applyClanPageUI — права и UI                                ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function bootClanPage() {
    const params = new URLSearchParams(location.search);
    const cid = params.get('clan');
    const infoId = params.get('info');

    await Promise.all([
        loadShips(),
        loadResourcePrices(),
        loadFactions(),
        loadPorts(),
        loadRanks(),
        loadRecipes(),
        loadDiscounts(),
        loadMapSettings(),
        loadTactics()
    ]);
    fillScShipSelect();
    fillScFactionSelect();
    fillScCities();

    if (infoId && clansCache[infoId]) {
        const locked = sessionStorage.getItem('clan_info_locked_' + infoId) === '1';
        sessionStorage.removeItem('clan_info_locked_' + infoId);
        renderClanInfoPage(infoId, locked);
        return;
    }
    if (cid && clansCache[cid]) {
        const myClan = getMyClanId();
        const loggedIn = isUnlocked();
        let allow = false;
        if (isOwner) allow = true;
        else if (isAdmin && myAdminClanId) allow = (cid === myAdminClanId) || canAccessClan(cid);
        else if (isAdmin) allow = true;
        else if (loggedIn && myClan) allow = (cid === myClan) || canAccessClan(cid);

        if (!allow) { renderClanInfoPage(cid, true); return; }
        openClanView(cid, localStorage.getItem(CLAN_ADMIN_PASS_KEY) === '1');
        return;
    }
    location.href = 'index.html';
}
function renderClanInfoPage(id, locked) {
    const clan = clansCache[id]; if (!clan) { location.href = 'index.html'; return; }
    const infoWrap = $('clanInfoWrap');
    const viewWrap = $('clanView');
    if (infoWrap) infoWrap.hidden = false;
    if (viewWrap) viewWrap.hidden = true;

    const setText = (elId, txt) => { const el = $(elId); if (el) el.textContent = txt; };
    setText('clanInfoName', clan.name);
    setText('clanInfoDesc', clan.description || '');
    setText('clanInfoRules', clan.rules || 'Правила не заданы.');

    const leaderEl = $('clanInfoLeader');
    if (leaderEl) {
        if (clan.leader_nick && clan.leader_nick.trim()) { leaderEl.textContent = '👑 Глава гильдии: ' + clan.leader_nick; leaderEl.hidden = false; }
        else leaderEl.hidden = true;
    }
    const logoWrap = $('clanInfoLogoWrap');
    if (logoWrap) logoWrap.innerHTML = renderClanLogoHtml(clan, 'info');

    const newsWrap = $('clanInfoNewsWrap');
    if (clan.news && clan.news.trim()) { if (newsWrap) newsWrap.hidden = false; setText('clanInfoNews', clan.news); }
    else { if (newsWrap) newsWrap.hidden = true; }

    const allyWrap = $('clanInfoAllianceWrap');
    if (clan.alliance_id && alliancesCache[clan.alliance_id]) {
        const ally = alliancesCache[clan.alliance_id];
        const members = Object.values(clansCache).filter(c => c.alliance_id === ally.id && c.id !== clan.id);
        if (allyWrap) allyWrap.hidden = false;
        setText('clanInfoAlliance', `${ally.name}${ally.description ? ' — ' + ally.description : ''}\nСостоят: ${members.length ? members.map(c => c.name).join(', ') : 'только эта гильдия'}`);
    } else { if (allyWrap) allyWrap.hidden = true; }

    const loginBtn = $('clanLoginBtn');
    if (loginBtn) loginBtn.hidden = locked;
}
function openClanView(id, isClanAdminLogin) {
    const clan = clansCache[id]; if (!clan) return;
    currentClan = id;
    localStorage.setItem(LAST_CLAN_KEY, id);
    const myClan = getMyClanId();
    const hasAdminPass = localStorage.getItem(CLAN_ADMIN_PASS_KEY) === '1';
    currentClanIsAdmin = isOwner
        || (isAdmin && !myAdminClanId && !isMod)
        || (isAdmin && myAdminClanId === id)
        || isClanAdminLogin
        || (id === myClan && hasAdminPass);
    currentClanPass = localStorage.getItem(CLAN_PASS_KEY) || null;
    if (!currentClanIsAdmin) currentClanPass = null;

    const infoWrap = $('clanInfoWrap');
    const viewWrap = $('clanView');
    if (infoWrap) infoWrap.hidden = true;
    if (viewWrap) viewWrap.hidden = false;

    const titleEl = $('clanTitle'); if (titleEl) titleEl.textContent = clan.name;
    const iconWrap = $('clanIconWrap');
    if (iconWrap) iconWrap.innerHTML = renderClanLogoHtml(clan, 'icon');

    currentTab = 'enemies';
    document.querySelectorAll('.side-item').forEach(b => b.classList.toggle('active', b.dataset.section === 'lists'));
    document.querySelectorAll('.clan-section').forEach(s => s.classList.toggle('active', s.id === 'section-lists'));

    applyClanPageUI();
    updateAllianceBar();
    renderAll(); renderBuilds('pvp'); renderBuilds('pb'); renderContacts();
    renderEvents(); renderTreasury(); renderApplications();
    renderMembers(); renderAdmins();
    renderShipCostPublic();
    sendHeartbeat(); initRealtime();
}
function applyClanPageUI() {
    const clearBtn = $('chatClear'); if (clearBtn) clearBtn.hidden = !isAdmin;
    document.querySelectorAll('.clan-admin-only').forEach(el => {
        const show = canEditClan(currentClan);
        el.hidden = !show; if (!show) el.style.display = '';
    });
    document.querySelectorAll('.add-form.clan-admin-only').forEach(el => {
        el.style.display = canEditClan(currentClan) ? 'flex' : 'none';
    });
    const label = isAdmin ? (isOwner ? '👑 Владелец' : siteAdminRole === 'mod' ? '🎖 Глава Клана' : '⚙️ Админ') : '';
    ['adminInfo2','adminInfo3'].forEach(id => { const el = $(id); if (el) el.textContent = label; });
    const setHidden = (id, hidden) => { const el = $(id); if (el) el.hidden = hidden; };
    const canAccessPanel = isAdmin && !isMod;
    setHidden('adminPanelBtn2', !canAccessPanel);
    setHidden('adminPanelBtn3', !canAccessPanel);
    setHidden('adminLogoutBtn2', !isAdmin);
    updateLeaderButtonsVisibility();
    const placeToggle = $('clanMapPlaceMode');
    if (placeToggle) placeToggle.parentElement.style.display = canEditClan(currentClan) ? 'inline-flex' : 'none';
}
on('backToHomeBtn', 'click', () => { location.href = 'index.html'; });
on('clanLeaveBtn', 'click', () => {
    if (!confirm('Заблокировать просмотр? Пароль потребуется ввести снова.')) return;
    ['guild_unlocked','guild_last_clan','clan_pass','clan_admin_pass','guild_my_clan'].forEach(k => localStorage.removeItem(k));
    location.href = 'index.html';
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   17.  📋  КЛАН — САЙДБАР                                            ║
   ║                                                                      ║
   ║   Переключение разделов внутреннего интерфейса гильдии.             ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
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
        else if (section === 'map') loadClanMarkers();
        else if (section === 'events') renderEvents();
        else if (section === 'treasury') renderTreasury();
        else if (section === 'pvp') renderBuilds('pvp');
        else if (section === 'pb') renderBuilds('pb');
        else if (section === 'ships') loadShips();
        else if (section === 'cost') { renderShipCostPublic(); }
        else if (section === 'builder') { if (builderClanCtrl) builderClanCtrl.refresh(); }
        else if (section === 'contacts') renderContacts();
        else if (section === 'members') { renderMembers(); renderAdmins(); }
        else if (section === 'applications') renderApplications();
        else if (section === 'online') renderClanOnlineList();
    });
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   18.  📋  КЛАН — СПИСКИ                                             ║
   ║                                                                      ║
   ║   Враги / Друзья / Нейтралитет / Не трогать                         ║
   ║                                                                      ║
   ║   • 18.1  Табы и поиск                                              ║
   ║   • 18.2  loadList — загрузка одного списка                          ║
   ║   • 18.3  applySearchFilter                                          ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
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
on('searchInput', 'input', applySearchFilter);
function applySearchFilter() {
    const input = $('searchInput'); if (!input) return;
    const q = input.value.toLowerCase().trim();
    document.querySelectorAll('.tab-content.active .player-list li').forEach(li => {
        if (!q) { li.style.display = ''; return; }
        li.style.display = li.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
}
function renderAll() { if (currentClan) TABS.forEach(loadList); }
async function loadList(tab) {
    if (!currentClan) return;
    const ul = document.querySelector(`[data-list="${tab}"]`); if (!ul) return;
    ul.innerHTML = '<li class="empty">Загрузка…</li>';
    const { data, error } = await supabase.from(tab).select('*').eq('clan', currentClan).order('created_at', { ascending: false });
    ul.innerHTML = '';
    if (error) { ul.innerHTML = `<li class="empty">Ошибка: ${error.message}</li>`; return; }
    if (!data?.length) { ul.innerHTML = '<li class="empty">Список пуст</li>'; return; }
    data.forEach(item => {
        const li = document.createElement('li');
        const parts = [];
        if (item.nickname) parts.push(`<span class="nick" data-nick="${escapeHtml(item.nickname)}">${escapeHtml(item.nickname)}</span>`);
        if (item.player_guild) parts.push(`<span class="guild">${escapeHtml(item.player_guild)}</span>`);
        if (item.faction) parts.push(`<span class="faction">${escapeHtml(item.faction)}</span>`);
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
/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   19.  🗺️  КЛАН — КАРТА С МАРКЕРАМИ                         ⭐        ║
   ║                                                                      ║
   ║   • 19.1  Загрузка маркеров из БД                                    ║
   ║   • 19.2  Отрисовка маркеров на карте                                ║
   ║   • 19.3  Список маркеров под картой                                 ║
   ║   • 19.4  Модалка создания / редактирования                          ║
   ║   • 19.5  Привязка маркера к событию                                 ║
   ║   • 19.6  Полноэкранный режим (зум, drag)                            ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */

// ── 19.1. Загрузка маркеров из БД ────────────────────────
async function loadClanMarkers() {
    if (!currentClan) return;
    const stage = $('clanMapStage'); if (!stage) return;

    const urls = getMapUrls();
    const mapImg = $('clanMapImg');
    if (mapImg) {
        const src = clanMapCurrentView === 'clean' ? urls.clean : urls.detailed;
        mapImg.src = src || '';
        mapImg.onerror = () => { mapImg.src = clanMapCurrentView === 'clean' ? urls.detailed : urls.clean; };
    }
    const titleEl = $('clanMapFsTitle');
    if (titleEl) titleEl.textContent = (clansCache[currentClan]?.name || 'Гильдия') + ' — Карта';

    const { data, error } = await supabase.from('clan_map_markers').select('*').eq('clan_id', currentClan);
    if (error) { console.warn('markers load error:', error.message); clanMarkers = []; }
    else clanMarkers = data || [];

    renderClanMarkers();
    renderClanMarkerList();
    updateClanMapCount();
    fillMarkerEventSelect();
}

// ── 19.2. Отрисовка маркеров на карте ────────────────────
function renderClanMarkers() {
    const layer = $('clanMapMarkers');
    if (!layer) return;
    layer.innerHTML = '';
    clanMarkers.forEach(m => {
        const el = document.createElement('div');
        el.className = 'clan-map-marker' + (m.event_id ? ' has-event' : '');
        el.style.left = m.x + '%';
        el.style.top  = m.y + '%';
        el.style.background = m.color || '#3b82f6';
        el.textContent = m.icon || '📍';
        el.title = m.title;
        el.addEventListener('click', e => {
            e.stopPropagation();
            if (canEditClan(currentClan)) openMarkerEditModal(m);
            else openMarkerViewModal(m);
        });
        layer.appendChild(el);
    });
    renderClanMarkersFs();
}
function renderClanMarkersFs() {
    const layer = $('clanMapFsMarkers');
    if (!layer) return;
    layer.innerHTML = '';
    clanMarkers.forEach(m => {
        const el = document.createElement('div');
        el.className = 'clan-map-marker' + (m.event_id ? ' has-event' : '');
        el.style.left = m.x + '%';
        el.style.top  = m.y + '%';
        el.style.background = m.color || '#3b82f6';
        el.textContent = m.icon || '📍';
        el.title = m.title;
        el.addEventListener('click', e => {
            e.stopPropagation();
            if (canEditClan(currentClan)) openMarkerEditModal(m);
            else openMarkerViewModal(m);
        });
        layer.appendChild(el);
    });
}

// ── 19.3. Список маркеров под картой ─────────────────────
function renderClanMarkerList() {
    const list = $('clanMapMarkerList'); if (!list) return;
    list.innerHTML = '';
    if (!clanMarkers.length) {
        list.innerHTML = '<div class="empty">Пока нет меток. Включите режим добавления и кликните по карте.</div>';
        return;
    }
    const canEdit = canEditClan(currentClan);
    clanMarkers.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).forEach(m => {
        const ev = m.event_id ? (eventsCache[m.event_id] || null) : null;
        const el = document.createElement('div');
        el.className = 'clan-map-marker-item';
        el.innerHTML = `
            <span class="mi-icon" style="background:${escapeHtml(m.color || '#3b82f6')}">${escapeHtml(m.icon || '📍')}</span>
            <div class="mi-info">
                <div class="mi-title">${escapeHtml(m.title)}</div>
                ${m.description ? `<div class="mi-meta">${escapeHtml(m.description)}</div>` : ''}
                ${ev ? `<div class="mi-event">📅 ${escapeHtml(ev.title || '')}</div>` : ''}
            </div>
            ${canEdit ? `<div class="mi-actions">
                <button class="edit" title="Редактировать">✏️</button>
                <button class="del" title="Удалить">🗑</button>
            </div>` : ''}`;
        if (canEdit) {
            el.querySelector('.edit').addEventListener('click', () => openMarkerEditModal(m));
            el.querySelector('.del').addEventListener('click', () => deleteClanMarker(m.id));
        }
        list.appendChild(el);
    });
}
function updateClanMapCount() {
    const el = $('clanMapCount'); if (el) el.textContent = '📍 ' + clanMarkers.length + ' меток';
}

// ── 19.4. Модалка создания / редактирования ──────────────
on('clanMapStage', 'click', e => {
    if (!canEditClan(currentClan)) return;
    if (!clanMapPlaceMode) return;
    const img = $('clanMapImg'); if (!img) return;
    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (x < 0 || x > 100 || y < 0 || y > 100) return;
    pendingMarkerXY = { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
    openMarkerEditModal(null);
});
on('clanMapPlaceMode', 'change', e => {
    clanMapPlaceMode = e.target.checked;
    const stage = $('clanMapStage');
    if (stage) stage.classList.toggle('place-mode', clanMapPlaceMode);
});
document.querySelectorAll('.clan-map-view').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.clan-map-view').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        clanMapCurrentView = btn.dataset.view;
        const urls = getMapUrls();
        const img = $('clanMapImg');
        if (img) img.src = clanMapCurrentView === 'clean' ? urls.clean : urls.detailed;
        const layer = $('clanMapMarkers');
        if (layer) layer.style.display = clanMapCurrentView === 'clean' ? 'none' : '';
    });
});

function openMarkerEditModal(marker) {
    if (!canEditClan(currentClan)) return;
    editingMarkerId = marker ? marker.id : null;
    $('markerEditTitle').textContent = marker ? '✏️ Редактировать маркер' : '📍 Новый маркер';
    $('me-id').value = marker?.id || '';
    $('me-x').value = marker?.x ?? (pendingMarkerXY?.x ?? '');
    $('me-y').value = marker?.y ?? (pendingMarkerXY?.y ?? '');
    $('me-title').value = marker?.title || '';
    $('me-desc').value = marker?.description || '';
    $('me-icon').value = marker?.icon || '📍';
    $('me-color').value = marker?.color || '#3b82f6';
    fillMarkerEventSelect();
    $('me-event').value = marker?.event_id || '';
    $('me-msg').textContent = '';
    $('markerEditModal').hidden = false;
    $('me-title').focus();
}
on('me-cancel', 'click', () => { $('markerEditModal').hidden = true; editingMarkerId = null; pendingMarkerXY = null; });
on('markerEditModal', 'click', e => { if (e.target.id === 'markerEditModal') { $('markerEditModal').hidden = true; editingMarkerId = null; pendingMarkerXY = null; } });
on('me-save', 'click', async () => {
    if (!canEditClan(currentClan)) return;
    const title = val('me-title').trim();
    const desc = val('me-desc').trim() || null;
    const icon = val('me-icon').trim() || '📍';
    const color = val('me-color') || '#3b82f6';
    const eventId = val('me-event') || null;
    const x = parseFloat(val('me-x'));
    const y = parseFloat(val('me-y'));
    const msg = $('me-msg'); msg.textContent = '';

    if (!title) { msg.textContent = 'Укажите название'; msg.style.color = '#ff7a7a'; return; }
    if (isNaN(x) || isNaN(y)) { msg.textContent = 'Не заданы координаты'; msg.style.color = '#ff7a7a'; return; }

    const payload = {
        clan_id: currentClan,
        x, y, title, description: desc, icon, color,
        event_id: eventId,
        created_by: getViewerNick() || null
    };

    let error;
    if (editingMarkerId) {
        ({ error } = await supabase.from('clan_map_markers').update(payload).eq('id', editingMarkerId));
    } else {
        ({ error } = await supabase.from('clan_map_markers').insert(payload));
    }
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }

    $('markerEditModal').hidden = true;
    editingMarkerId = null;
    pendingMarkerXY = null;
    await logAdminAction(editingMarkerId ? 'Изменил маркер' : 'Добавил маркер', title);
    await loadClanMarkers();
});
async function deleteClanMarker(id) {
    if (!canEditClan(currentClan)) return;
    if (!confirm('Удалить маркер?')) return;
    const { error } = await supabase.from('clan_map_markers').delete().eq('id', id);
    if (error) return alert(error.message);
    await loadClanMarkers();
}
function openMarkerViewModal(m) {
    if (!m) return;
    $('mv-title').textContent = (m.icon || '📍') + ' ' + m.title;
    $('mv-desc').textContent = m.description || '';
    const ev = m.event_id ? eventsCache[m.event_id] : null;
    const evEl = $('mv-event');
    if (ev) {
        const d = new Date(ev.event_date);
        evEl.innerHTML = '📅 <b>' + escapeHtml(ev.title) + '</b><br>' + d.toLocaleDateString('ru-RU') + ' в ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
        evEl.hidden = false;
    } else { evEl.hidden = true; }
    $('markerViewModal').hidden = false;
}
on('mv-close', 'click', () => { $('markerViewModal').hidden = true; });
on('markerViewModal', 'click', e => { if (e.target.id === 'markerViewModal') $('markerViewModal').hidden = true; });

// ── 19.5. Привязка маркера к событию ─────────────────────
function fillMarkerEventSelect() {
    const sel = $('me-event'); if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = '<option value="">— Без привязки —</option>';
    const list = [];
    Object.values(eventsCache).forEach(ev => {
        if (ev.is_shared || ev.clan === currentClan) list.push(ev);
    });
    list.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
    list.forEach(ev => {
        const o = document.createElement('option');
        o.value = ev.id;
        const d = new Date(ev.event_date);
        o.textContent = `${d.toLocaleDateString('ru-RU')} — ${ev.title}`;
        sel.appendChild(o);
    });
    if (cur) sel.value = cur;
}

// ── 19.6. Полноэкранный режим (зум, drag) ────────────────
on('clanMapOpen', 'click', () => {
    const urls = getMapUrls();
    const fs = $('clanMapFullscreen'); if (!fs) return;
    const img = $('clanMapFsImg');
    const src = clanMapCurrentView === 'clean' ? urls.clean : urls.detailed;
    if (!src) { alert('Карта не настроена'); return; }
    img.src = src;
    img.onerror = () => { img.src = clanMapCurrentView === 'clean' ? urls.detailed : urls.clean; };
    clanMapFsZoom = 1; clanMapFsX = 0; clanMapFsY = 0;
    applyClanMapFsTransform();
    fs.hidden = false;
    document.body.style.overflow = 'hidden';
    renderClanMarkersFs();
});
function closeClanMapFs() {
    const fs = $('clanMapFullscreen'); if (!fs) return;
    fs.hidden = true;
    document.body.style.overflow = '';
}
function applyClanMapFsTransform() {
    const img = $('clanMapFsImg'); if (!img) return;
    img.style.transform = `translate(${clanMapFsX}px, ${clanMapFsY}px) scale(${clanMapFsZoom})`;
}
function setClanMapFsZoom(z) {
    clanMapFsZoom = Math.max(0.5, Math.min(6, z));
    if (clanMapFsZoom <= 1) { clanMapFsX = 0; clanMapFsY = 0; }
    applyClanMapFsTransform();
}
on('clanMapFsClose', 'click', closeClanMapFs);
on('clanMapFsZoomIn', 'click', () => setClanMapFsZoom(clanMapFsZoom + 0.25));
on('clanMapFsZoomOut', 'click', () => setClanMapFsZoom(clanMapFsZoom - 0.25));
on('clanMapFsReset', 'click', () => { clanMapFsZoom = 1; clanMapFsX = 0; clanMapFsY = 0; applyClanMapFsTransform(); });
on('clanMapFsStage', 'wheel', e => { e.preventDefault(); setClanMapFsZoom(clanMapFsZoom + (e.deltaY < 0 ? 0.15 : -0.15)); }, { passive: false });
on('clanMapFsStage', 'mousedown', e => {
    if (clanMapFsZoom <= 1) return;
    clanMapFsDragging = true;
    clanMapFsDragStart = { x: e.clientX - clanMapFsX, y: e.clientY - clanMapFsY };
    $('clanMapFsStage').classList.add('dragging');
});
document.addEventListener('mousemove', e => {
    if (!clanMapFsDragging) return;
    clanMapFsX = e.clientX - clanMapFsDragStart.x;
    clanMapFsY = e.clientY - clanMapFsDragStart.y;
    applyClanMapFsTransform();
});
document.addEventListener('mouseup', () => {
    if (!clanMapFsDragging) return;
    clanMapFsDragging = false;
    $('clanMapFsStage')?.classList.remove('dragging');
});
on('clanMapFsStage', 'mouseleave', () => { clanMapFsDragging = false; });
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        const fs = $('clanMapFullscreen');
        if (fs && !fs.hidden) closeClanMapFs();
    }
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   20.  📅  КЛАН — СОБЫТИЯ                                            ║
   ║                                                                      ║
   ║   • 20.1  renderEvents — рендер списка событий                       ║
   ║   • 20.2  evAddBtn — добавление события                              ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function renderEvents() {
    if (!currentClan) return;
    const container = $('eventsList'); if (!container) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    const { data, error } = await supabase.from('events').select('*')
        .or(`is_shared.eq.true,clan.eq.${currentClan}`).order('event_date', { ascending: true });
    if (error) { container.innerHTML = `<div class="empty">Ошибка: ${error.message}</div>`; return; }
    eventsCache = {};
    (data || []).forEach(ev => { eventsCache[ev.id] = ev; });
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
        const linkedMarkers = clanMarkers.filter(m => m.event_id === ev.id);
        const markerNote = linkedMarkers.length
            ? `<div style="font-size:12px;color:var(--gold);margin-top:4px;">📍 Метки на карте: ${linkedMarkers.map(m => escapeHtml(m.icon || '📍') + ' ' + escapeHtml(m.title)).join(', ')}</div>`
            : '';
        const canDel = canEditClan(ev.clan);
        const actions = canDel ? `<div class="event-actions"><button class="delete">🗑</button></div>` : '';
        card.innerHTML = `
            <div class="event-date-block"><div class="event-day">${day}</div><div class="event-month">${month}</div></div>
            <div class="event-info">
                <div class="event-title">${scopeBadge}${escapeHtml(ev.title)}</div>
                <div class="event-time">🕐 ${d.toLocaleDateString('ru-RU')} в ${time}</div>
                ${ev.description ? `<div class="event-desc">${escapeHtml(ev.description)}</div>` : ''}
                ${markerNote}
            </div>${actions}`;
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
                renderEvents();
            });
        }
        container.appendChild(card);
    });
    fillMarkerEventSelect();
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
    if (isShared && !isOwner) { flashStatusEl(statusEl, 'Общие события создаёт только владелец', '#ff7a7a'); return; }
    if (isAdmin) {
        const { error } = await supabase.from('events').insert({
            clan: clanVal, is_shared: isShared, title, event_date: new Date(dateStr).toISOString(), description: desc || null
        });
        if (error) { flashStatusEl(statusEl, 'Ошибка: ' + error.message, '#ff7a7a'); return; }
    } else {
        const { data: resp, error } = await supabase.rpc('clan_admin_action', {
            action: 'insert', target_table: 'events', target_clan: currentClan, entered_password: currentClanPass,
            data: { title, event_date: new Date(dateStr).toISOString(), description: desc || null }
        });
        if (error || resp?.error) { flashStatusEl(statusEl, 'Ошибка: ' + (resp?.error || error.message), '#ff7a7a'); return; }
    }
    await logAdminAction('Добавил событие', title);
    ['evTitle','evDate','evDesc'].forEach(id => { const el = $(id); if (el) el.value = ''; });
    flashStatusEl(statusEl, '✔ Добавлено', '#6ee7a7');
    renderEvents();
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   21.  💰  КЛАН — КАЗНА                                              ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function renderTreasury() {
    if (!currentClan) return;
    const container = $('treasuryList'); if (!container) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    const { data, error } = await supabase.from('treasury').select('*').eq('clan', currentClan).order('created_at', { ascending: false });
    if (error) { container.innerHTML = `<div class="empty">Ошибка: ${error.message}</div>`; return; }
    const list = data || [];
    let balance = 0;
    list.forEach(t => { const amt = Number(t.amount) || 0; balance += t.type === 'in' ? amt : -amt; });
    const balEl = $('treasuryBalance');
    if (balEl) { balEl.textContent = balance.toLocaleString('ru-RU'); balEl.classList.toggle('negative', balance < 0); }
    if (!list.length) { container.innerHTML = '<div class="empty">Операций пока нет</div>'; return; }
    container.innerHTML = '';
    list.forEach(t => {
        const amt = Number(t.amount) || 0;
        const d = new Date(t.created_at);
        const dateStr = d.toLocaleDateString('ru-RU') + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
        const item = document.createElement('div');
        item.className = 'treasury-item ' + (t.type === 'in' ? 'in' : 'out');
        const canDel = canEditClan(currentClan);
        item.innerHTML = `
            <div class="treasury-amount">${t.type === 'in' ? '+' : '−'}${amt.toLocaleString('ru-RU')}</div>
            <div class="treasury-info"><div class="treasury-desc">${escapeHtml(t.description || '—')}</div><div class="treasury-date">${dateStr}</div></div>
            ${canDel ? `<button title="Удалить">🗑</button>` : ''}`;
        if (canDel) item.querySelector('button').addEventListener('click', async () => {
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
            renderTreasury();
        });
        container.appendChild(item);
    });
}
on('trAddBtn', 'click', async () => {
    if (!canEditClan(currentClan)) return;
    const type = val('trType');
    const amount = Number(val('trAmount'));
    const desc = val('trDesc').trim();
    const statusEl = $('trStatus');
    if (!amount || amount <= 0) { flashStatusEl(statusEl, 'Сумма > 0', '#ff7a7a'); return; }
    if (!desc) { flashStatusEl(statusEl, 'Добавьте описание', '#ff7a7a'); return; }
    if (isAdmin) {
        const { error } = await supabase.from('treasury').insert({ clan: currentClan, type, amount, description: desc });
        if (error) { flashStatusEl(statusEl, 'Ошибка: ' + error.message, '#ff7a7a'); return; }
    } else {
        const { data: resp, error } = await supabase.rpc('clan_admin_action', {
            action: 'insert', target_table: 'treasury', target_clan: currentClan, entered_password: currentClanPass,
            data: { type, amount, description: desc }
        });
        if (error || resp?.error) { flashStatusEl(statusEl, 'Ошибка: ' + (resp?.error || error.message), '#ff7a7a'); return; }
    }
    $('trAmount').value = ''; $('trDesc').value = '';
    flashStatusEl(statusEl, '✔ Добавлено', '#6ee7a7');
    renderTreasury();
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   22.  👥  КЛАН — УЧАСТНИКИ И АДМИРАЛЫ                               ║
   ║                                                                      ║
   ║   • 22.1  parseMembersList                                           ║
   ║   • 22.2  renderMembers / renderAdmins                               ║
   ║   • 22.3  saveClanAdminNicks                                         ║
   ║   • 22.4  Загрузка участников из файла                               ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function parseMembersList(text) {
    if (!text) return [];
    return String(text).split('\n').map(line => {
        line = line.trim(); if (!line) return null;
        const m = line.match(/^(\d+)\s*[-.)\]]?\s+(.+)$/);
        if (m) return { num: m[1], name: m[2].trim() };
        return { num: '', name: line };
    }).filter(Boolean);
}
function renderMembers() {
    if (!currentClan) return;
    const container = $('membersList'); if (!container) return;
    const parsed = parseMembersList(clansCache[currentClan]?.members_list || '');
    if (!parsed.length) { container.innerHTML = '<div class="empty">Список участников пока пуст</div>'; return; }
    container.innerHTML = parsed.map(m => `<div class="member-row"><span class="member-num">${m.num || '•'}</span><span class="member-name">${escapeHtml(m.name)}</span></div>`).join('');
}
function renderAdmins() {
    if (!currentClan) return;
    const container = $('adminsList'); if (!container) return;
    const parsed = parseMembersList(clansCache[currentClan]?.admin_nicks || '');
    if (!parsed.length) { container.innerHTML = '<div class="empty">Список адмиралов пока пуст</div>'; return; }
    container.innerHTML = parsed.map(m => `<div class="member-row admin"><span class="member-num">👑</span><span class="member-name">${escapeHtml(m.name)}</span></div>`).join('');
    const editField = $('clanAdminNicksInput');
    if (editField) editField.value = clansCache[currentClan]?.admin_nicks || '';
}
async function saveClanAdminNicks() {
    if (!canEditClan(currentClan)) return;
    const nicks = val('clanAdminNicksInput');
    const statusEl = $('clanAdminNicksStatus');
    if (statusEl) { statusEl.textContent = '⏳ Сохранение…'; statusEl.style.color = ''; }
    try {
        if (isAdmin && !isMod) {
            const { error } = await supabase.from('clans').update({ admin_nicks: nicks || null }).eq('id', currentClan);
            if (error) throw new Error(error.message);
        } else {
            const { data: resp, error } = await supabase.rpc('clan_admin_action', {
                action: 'update', target_table: 'clans', target_clan: currentClan,
                entered_password: currentClanPass, record_id: currentClan, data: { admin_nicks: nicks || null }
            });
            if (error || resp?.error) throw new Error(resp?.error || error.message);
        }
        if (clansCache[currentClan]) clansCache[currentClan].admin_nicks = nicks || null;
        renderAdmins();
        if (statusEl) { statusEl.textContent = '✔ Сохранено'; statusEl.style.color = '#6ee7a7'; }
        await logAdminAction('Обновил список адмиралов', clansCache[currentClan]?.name || currentClan);
    } catch (err) { if (statusEl) { statusEl.textContent = 'Ошибка: ' + err.message; statusEl.style.color = '#ff7a7a'; } }
}
on('clanAdminNicksSave', 'click', saveClanAdminNicks);
on('membersUploadBtn', 'click', () => { if (!canEditClan(currentClan)) return; const fi = $('membersFileInput'); if (fi) { fi.value = ''; fi.click(); } });
on('membersFileInput', 'change', async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (!canEditClan(currentClan)) { alert('Нет прав'); return; }
    const statusEl = $('membersUploadStatus');
    if (statusEl) statusEl.textContent = '⏳ Чтение…';
    try {
        const text = await file.text();
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (!lines.length) { if (statusEl) statusEl.textContent = '⚠️ Файл пуст'; return; }
        const nicks = lines.map(line => { const m = line.match(/^\d+\s*[-.)\]]?\s*(.+)$/); return m ? m[1].trim() : line; }).filter(Boolean);
        const membersText = nicks.join('\n');
        if (isAdmin) {
            const { error } = await supabase.from('clans').update({ members_list: membersText }).eq('id', currentClan);
            if (error) throw new Error(error.message);
        } else {
            const { data: resp, error } = await supabase.rpc('clan_admin_action', {
                action: 'update', target_table: 'clans', target_clan: currentClan,
                entered_password: currentClanPass, record_id: currentClan, data: { members_list: membersText }
            });
            if (error || resp?.error) throw new Error(resp?.error || error.message);
        }
        if (clansCache[currentClan]) clansCache[currentClan].members_list = membersText;
        if (statusEl) statusEl.textContent = `✔ Загружено ${nicks.length} участников`;
        renderMembers();
    } catch (err) { if (statusEl) statusEl.textContent = '❌ Ошибка: ' + err.message; }
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   23.  💬  КЛАН — КОНТАКТЫ ГИЛЬДИЙ                                   ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function renderContacts() {
    const container = $('contactsList'); if (!container) return;
    container.innerHTML = '';
    let clans = [];
    if (isOwner) clans = Object.values(clansCache);
    else if (isAdmin && myAdminClanId) {
        const my = clansCache[myAdminClanId];
        if (my) clans = Object.values(clansCache).filter(c => c.id === myAdminClanId || (my.alliance_id && c.alliance_id === my.alliance_id));
    } else if (isAdmin) clans = Object.values(clansCache);
    else if (currentClan && clansCache[currentClan]?.alliance_id) {
        const ally = clansCache[currentClan].alliance_id;
        clans = Object.values(clansCache).filter(c => c.alliance_id === ally);
    } else if (currentClan) clans = [clansCache[currentClan]].filter(Boolean);
    if (!clans.length) { container.innerHTML = '<div class="empty">Гильдий пока нет</div>'; return; }
    clans.forEach(clan => {
        const card = document.createElement('div');
        card.className = 'contact-card';
        const hasLink = clan.discord && clan.discord.trim();
        const hasPhone = clan.phone && clan.phone.trim();
        const hasLeader = clan.leader_nick && clan.leader_nick.trim();
        card.innerHTML = `
            ${renderClanLogoHtml(clan, 'contact')}
            <div class="contact-info">
                <div class="contact-name">${escapeHtml(clan.name)}</div>
                ${hasLeader ? `<div class="contact-leader">👑 ${escapeHtml(clan.leader_nick)}</div>` : ''}
                ${hasPhone ? `<div class="contact-phone">${escapeHtml(clan.phone)}</div>` : ''}
                <div class="contact-discord">${hasLink ? escapeHtml(clan.discord) : 'Ссылка не указана'}</div>
            </div>
            <div class="contact-actions">
                ${hasLink ? `<a class="contact-btn" href="${escapeHtml(clan.discord)}" target="_blank" rel="noopener">💬 Discord</a>` : `<span class="contact-btn disabled">💬 Нет ссылки</span>`}
                ${hasLeader ? `<button class="contact-msg-btn" data-nick="${escapeHtml(clan.leader_nick)}">✉️ Написать</button>` : `<span class="contact-msg-btn disabled">✉️ Нет ника</span>`}
            </div>`;
        const msgBtn = card.querySelector('.contact-msg-btn');
        if (msgBtn && hasLeader) msgBtn.addEventListener('click', () => openPrivateChat(msgBtn.dataset.nick));
        container.appendChild(card);
    });
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   24.  ⚔️  КЛАН — БИЛДЫ ПВП / ПБ                                     ║
   ║                                                                      ║
   ║   • 24.1  Парсеры (parseLines, parseBonus, parseSpecialists)         ║
   ║   • 24.2  renderBuilds — загрузка и группировка                      ║
   ║   • 24.3  createBuildCard — карточка билда                           ║
   ║   • 24.4  addBuild — добавление                                      ║
   ║   • 24.5  Редактирование / дублирование / удаление                   ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function parseLines(text) { if (!text) return []; return String(text).split('\n').map(s => s.trim()).filter(Boolean); }
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
    const container = $(type === 'pvp' ? 'pvpList' : 'pbList'); if (!container) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    const { data, error } = await supabase.from('builds').select('*')
        .eq('type', type).or(`is_shared.eq.true,clan.eq.${currentClan}`)
        .order('created_at', { ascending: false });
    if (error) { container.innerHTML = `<div class="empty">Ошибка: ${error.message}</div>`; return; }
    if (!data?.length) { container.innerHTML = '<div class="empty">Билды пока не добавлены</div>'; return; }
    container.innerHTML = '';
    if (type === 'pb') {
        const groups = {};
        data.forEach(b => { const r = b.rank || '—'; (groups[r] ||= []).push(b); });
        const ranks = Object.keys(groups).sort((a, b) => {
            const na = parseInt(a, 10), nb = parseInt(b, 10);
            if (isNaN(na) && isNaN(nb)) return a.localeCompare(b);
            if (isNaN(na)) return 1; if (isNaN(nb)) return -1;
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
    const rankBadge = (item.type === 'pb' && item.rank) ? `<span class="build-rank">Ранг ${escapeHtml(item.rank)}</span>` : '';
    const canEditThis = canEditClan(item.clan) || isAdmin;
    const actions = `<div class="build-actions">
        <button class="share" title="Скопировать ссылку">🔗</button>
        ${canEditThis ? `<button class="edit" title="Редактировать">✏️</button>
        <button class="copy" title="Дублировать">📋</button>
        <button class="delete" title="Удалить">🗑</button>` : ''}
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
        ${specs.length ? `<div class="build-section"><div class="build-section-label">👤 Специалисты</div><div class="spec-list">${specs.map(s => `<div class="spec-item"><div class="spec-name">${escapeHtml(s.name)}</div>${s.bonuses.length ? `<div class="spec-bonuses">${s.bonuses.map(b => { const cls = b.value === null ? 'neutral' : (b.value > 0 ? 'plus' : 'minus'); const val = b.value === null ? '' : ` ${b.value > 0 ? '+' : ''}${b.value}`; return `<span class="spec-bonus ${cls}">${escapeHtml(b.stat)}${val}</span>`; }).join('')}</div>` : ''}</div>`).join('')}</div></div>` : ''}`;
    card.querySelector('.share').addEventListener('click', () => {
        const url = `${location.origin}${location.pathname}#build=${item.id}`;
        navigator.clipboard.writeText(url).then(() => alert('🔗 Ссылка скопирована!'), () => prompt('Скопируйте ссылку:', url));
    });
    if (canEditThis) {
        card.querySelector('.edit')?.addEventListener('click', () => openBuildEdit(item));
        card.querySelector('.copy')?.addEventListener('click', () => openBuildDup(item));
        card.querySelector('.delete')?.addEventListener('click', () => deleteBuild(item.id, item.type));
    }
    return card;
}
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
    if (!ship) { flashStatusEl(statusEl, 'Выберите корабль', '#ff7a7a'); return; }
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
        const { error } = await supabase.from('builds').insert({ clan: clanValue, is_shared: isShared, ...data });
        if (error) { flashStatusEl(statusEl, 'Ошибка: ' + error.message, '#ff7a7a'); return; }
    } else {
        const { data: resp, error } = await supabase.rpc('clan_admin_action', {
            action: 'insert', target_table: 'builds', target_clan: currentClan,
            entered_password: currentClanPass, data: { ...data, is_shared: false }
        });
        if (error || resp?.error) { flashStatusEl(statusEl, 'Ошибка: ' + (resp?.error || error.message), '#ff7a7a'); return; }
    }
    await logAdminAction(`Добавил билд ${type.toUpperCase()}`, ship);
    ['Rank','Upgrades','WeapS','WeapM','WeapL','Cons1','Cons2','Cons3','Cargo','Specs'].forEach(s => { const el = $(`${type}${s}`); if (el) el.value = ''; });
    const shipSel = $(`${type}Ship`); if (shipSel) shipSel.value = '';
    const preview = $(`${type}ShipPreview`); if (preview) preview.hidden = true;
    flashStatusEl(statusEl, '✔ Добавлено', '#6ee7a7');
    renderBuilds(type);
}
on('pvpAddBtn', 'click', () => addBuild('pvp'));
on('pbAddBtn', 'click', () => addBuild('pb'));
function openBuildEdit(item) {
    editingBuild = { id: item.id, type: item.type, clan: item.clan };
    const titleEl = $('buildEditTitle');
    if (titleEl) titleEl.textContent = item.type === 'pvp' ? '✏️ Редактировать ПВП-билд' : '✏️ Редактировать ПБ-билд';
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
on('cancelBuildEdit', 'click', () => { $('buildEditModal').hidden = true; editingBuild = null; });
on('saveBuildEdit', 'click', async () => {
    if (!editingBuild) return;
    const scopeVal = val('buildEditScope');
    const isShared = scopeVal === SHARED;
    const clanValue = isShared ? null : scopeVal;
    const rank = val('buildEditRank').trim();
    const ship = val('buildEditShip').trim();
    if (!ship) { $('buildEditError').textContent = 'Введите название'; return; }
    if (editingBuild.type === 'pb' && !rank) { $('buildEditError').textContent = 'Укажите ранг'; return; }
    const data = {
        rank: editingBuild.type === 'pb' ? rank : null, ship_name: ship,
        upgrades: val('buildEditUpgrades') || null, weapons_small: val('buildEditWeapS') || null,
        weapons_medium: val('buildEditWeapM') || null, weapons_large: val('buildEditWeapL') || null,
        consumable1: val('buildEditCons1').trim() || null, consumable2: val('buildEditCons2').trim() || null,
        consumable3: val('buildEditCons3').trim() || null, cargo: val('buildEditCargo') || null,
        specialists: val('buildEditSpecs') || null
    };
    if (isAdmin) {
        const { error } = await supabase.from('builds').update({ clan: clanValue, is_shared: isShared, ...data }).eq('id', editingBuild.id);
        if (error) { $('buildEditError').textContent = 'Ошибка: ' + error.message; return; }
    } else {
        const { data: resp, error } = await supabase.rpc('clan_admin_action', {
            action: 'update', target_table: 'builds', target_clan: currentClan,
            entered_password: currentClanPass, record_id: editingBuild.id, data
        });
        if (error || resp?.error) { $('buildEditError').textContent = 'Ошибка: ' + (resp?.error || error.message); return; }
    }
    await logAdminAction(`Изменил билд ${editingBuild.type.toUpperCase()}`, ship);
    const type = editingBuild.type;
    $('buildEditModal').hidden = true; editingBuild = null;
    renderBuilds(type);
});
function openBuildDup(item) {
    duplicatingBuild = item;
    $('buildDupName').textContent = item.ship_name;
    renderScopeSelects();
    $('buildDupScope').value = SHARED;
    $('buildDupMsg').textContent = '';
    $('buildDupModal').hidden = false;
}
on('cancelBuildDup', 'click', () => { $('buildDupModal').hidden = true; duplicatingBuild = null; });
on('doBuildDup', 'click', async () => {
    if (!duplicatingBuild) return;
    const scopeVal = val('buildDupScope');
    const isShared = scopeVal === SHARED;
    const clanValue = isShared ? null : scopeVal;
    const msg = $('buildDupMsg'); msg.style.color = '';
    const item = duplicatingBuild;
    if (!canEditClan(currentClan)) { msg.textContent = 'Нет прав'; msg.style.color = '#ff7a7a'; return; }
    const { error } = await supabase.from('builds').insert({
        clan: clanValue, is_shared: isShared, type: item.type, rank: item.rank || null, ship_name: item.ship_name,
        upgrades: item.upgrades || null, weapons_small: item.weapons_small || null, weapons_medium: item.weapons_medium || null,
        weapons_large: item.weapons_large || null, consumable1: item.consumable1 || null, consumable2: item.consumable2 || null,
        consumable3: item.consumable3 || null, cargo: item.cargo || null, specialists: item.specialists || null
    });
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    await logAdminAction('Дублировал билд', item.ship_name);
    msg.textContent = '✔ Копия создана'; msg.style.color = '#6ee7a7';
    setTimeout(() => { $('buildDupModal').hidden = true; duplicatingBuild = null; renderBuilds(item.type); }, 700);
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

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   25.  📝  КЛАН — ЗАЯВКИ В ГИЛЬДИЮ                                   ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function renderApplications() {
    const container = $('applicationsList'); if (!container) return;
    if (!canEditClan(currentClan)) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    const { data } = await supabase.from('applications').select('*').order('created_at', { ascending: false });
    if (!data?.length) { container.innerHTML = '<div class="empty">Заявок нет</div>'; return; }
    container.innerHTML = '';
    data.forEach(app => {
        const card = document.createElement('div');
        card.className = 'application-card ' + (app.status || 'new');
        card.innerHTML = `<div class="application-head"><div class="application-nick">👤 ${escapeHtml(app.nickname)}</div></div>
            <div class="application-grid"><div><b>Возраст</b>${escapeHtml(app.age || '—')}</div>
            <div><b>Опыт</b>${escapeHtml(app.experience || '—')}</div>
            <div><b>Контакт</b>${escapeHtml(app.contact || '—')}</div></div>
            ${app.why ? `<div class="application-why">${escapeHtml(app.why)}</div>` : ''}
            <div class="application-actions">
                <button class="approve">✅ Принять</button><button class="reject">❌ Отклонить</button><button class="delete">🗑 Удалить</button>
            </div>`;
        card.querySelector('.approve').addEventListener('click', async () => { await supabase.from('applications').update({ status: 'approved' }).eq('id', app.id); renderApplications(); });
        card.querySelector('.reject').addEventListener('click', async () => { await supabase.from('applications').update({ status: 'rejected' }).eq('id', app.id); renderApplications(); });
        card.querySelector('.delete').addEventListener('click', async () => { await supabase.from('applications').delete().eq('id', app.id); renderApplications(); });
        container.appendChild(card);
    });
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   26.  🟢  КЛАН — ОНЛАЙН                                             ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function renderClanOnlineList() {
    const container = $('clanOnlineList'); if (!container) return;
    if (!canEditClan(currentClan)) { container.innerHTML = '<div class="empty">Нет доступа</div>'; return; }
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    const threshold = new Date(Date.now() - ONLINE_WINDOW_MS).toISOString();
    const { data, error } = await supabase.from('online_users').select('*').gte('last_seen', threshold).order('last_seen', { ascending: false });
    if (error) { container.innerHTML = `<div class="empty">Ошибка: ${error.message}</div>`; return; }
    if (!data?.length) { container.innerHTML = '<div class="empty">Сейчас никого нет</div>'; return; }
    const me = getViewerNick().toLowerCase();
    container.innerHTML = '';
    data.forEach(u => {
        const nick = u.nickname || '—';
        const isGuest = nick.startsWith('guest_');
        const isMe = nick.toLowerCase() === me;
        const el = document.createElement('div');
        el.className = 'online-item' + (isGuest ? ' guest' : '') + (isMe ? ' me' : '');
        el.innerHTML = `
            <div class="online-icon">${isGuest ? '👤' : isMe ? '⭐' : '🟢'}</div>
            <div class="online-info">
                <div class="online-nick">${escapeHtml(nick)}${isMe ? ' <span class="online-me">— вы</span>' : ''}</div>
                <div class="online-meta">был в сети ${new Date(u.last_seen).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div class="online-actions">
                ${!isGuest && !isMe ? `<button class="online-msg-btn" data-nick="${escapeHtml(nick)}">✉️ Написать</button>` : isGuest ? `<span class="online-hint">гость</span>` : ''}
            </div>`;
        const msgBtn = el.querySelector('.online-msg-btn');
        if (msgBtn) msgBtn.addEventListener('click', () => openPrivateChat(msgBtn.dataset.nick));
        container.appendChild(el);
    });
}
on('clanOnlineRefresh', 'click', renderClanOnlineList);

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   27.  🪙  ТОРГОВЛЯ (биржа заявок)                                   ║
   ║                                                                      ║
   ║   • 27.1  Категории и утилиты                                        ║
   ║   • 27.2  renderTrades — загрузка                                    ║
   ║   • 27.3  renderTradeListings — отрисовка карточек                   ║
   ║   • 27.4  Форма новой заявки                                         ║
   ║   • 27.5  Принятие / подтверждение / редактирование                  ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
const TRADE_CATEGORIES = [
    { id: 'resource', name: 'Ресурс', icon: '🪵' }, { id: 'ship', name: 'Корабль', icon: '⛵' },
    { id: 'module', name: 'Модуль', icon: '⚙️' }, { id: 'weapon', name: 'Оружие', icon: '⚔️' },
    { id: 'ammo', name: 'Боеприпас', icon: '💣' }, { id: 'blueprint', name: 'Чертёж', icon: '📜' },
    { id: 'consum', name: 'Расходник', icon: '🧪' }, { id: 'other', name: 'Прочее', icon: '📦' }
];
function tradeCatById(id) { return TRADE_CATEGORIES.find(c => c.id === id) || TRADE_CATEGORIES[TRADE_CATEGORIES.length - 1]; }
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
    const sel = $('tm-category'); if (!sel) return;
    sel.innerHTML = TRADE_CATEGORIES.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
}
function initTradeCategoryFilters() {
    const wrap = $('tm-cat-filters'); if (!wrap) return;
    wrap.innerHTML = `<span class="tm-chip active" data-cat="all">Все категории</span>` +
        TRADE_CATEGORIES.map(c => `<span class="tm-chip" data-cat="${c.id}">${c.icon} ${c.name}</span>`).join('');
}
function renderTradeClanSelect() {
    const sel = $('tm-clan'); if (!sel) return;
    const cur = sel.value; sel.innerHTML = '';
    const list = currentGame ? getClansForGame(currentGame) : Object.values(clansCache);
    list.forEach(c => { const o = document.createElement('option'); o.value = c.id; o.textContent = c.name; sel.appendChild(o); });
    if (cur && clansCache[cur]) sel.value = cur;
}
function renderTradeClanFilters() {
    const wrap = $('tm-clan-filters'); if (!wrap) return;
    wrap.innerHTML = `<span class="tm-chip active" data-clan="all">Все гильдии</span>` +
        Object.values(clansCache).map(c => `<span class="tm-chip" data-clan="${c.id}">🏰 ${escapeHtml(c.name)}</span>`).join('');
    if (tradeFilterClan !== 'all' && !clansCache[tradeFilterClan]) tradeFilterClan = 'all';
    wrap.querySelectorAll('.tm-chip').forEach(chip => {
        if (chip.dataset.clan === tradeFilterClan) chip.classList.add('active');
        else chip.classList.remove('active');
    });
}
async function renderTrades() {
    const container = $('tm-listings'); if (!container) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    const { data, error } = await supabase.from('trades').select('*').order('created_at', { ascending: false }).limit(500);
    if (error) { container.innerHTML = `<div class="empty">Ошибка: ${error.message}</div>`; return; }
    tradesCache = data || [];
    renderTradeCounters(); renderTradeListings();
    renderResourcePricesHome();
}
function renderTradeCounters() {
    let buyGold = 0, sellGold = 0, buyN = 0, sellN = 0;
    tradesCache.forEach(t => {
        if (t.status === 'done') return;
        const total = Number(t.price) * Number(t.qty);
        if (t.type === 'buy') { buyGold += total; buyN++; } else { sellGold += total; sellN++; }
    });
    const elBuy = $('tm-counter-buy-gold'), elSell = $('tm-counter-sell-gold');
    const elBuySub = $('tm-counter-buy-sub'), elSellSub = $('tm-counter-sell-sub');
    if (elBuy) elBuy.textContent = tradeFmtGold(buyGold);
    if (elSell) elSell.textContent = tradeFmtGold(sellGold);
    if (elBuySub) elBuySub.textContent = buyN + ' ' + tradePlural(buyN, 'заявка', 'заявки', 'заявок');
    if (elSellSub) elSellSub.textContent = sellN + ' ' + tradePlural(sellN, 'заявка', 'заявки', 'заявок');
    renderTradeMyCounter();
}
function renderTradeMyCounter() {
    const el = $('tm-my-counter'); if (!el) return;
    const myNick = getViewerNick().toLowerCase();
    if (!myNick) { el.innerHTML = '👤 Мои: <b>0</b>'; el.classList.remove('has-active'); return; }
    const count = tradesCache.filter(t => (t.nickname || '').toLowerCase() === myNick && t.status !== 'done').length;
    el.innerHTML = `👤 Мои: <b>${count}</b>`;
    el.classList.toggle('has-active', count > 0);
}
function tradeVisibleListings() {
    const q = ($('tm-search')?.value || '').trim().toLowerCase();
    const onlyMine = $('tm-only-mine')?.checked;
    const myNick = getViewerNick().toLowerCase();
    let list = tradesCache.filter(t => {
        if (tradeStatusFilter === 'active' && t.status === 'done') return false;
        if (tradeStatusFilter === 'done' && t.status !== 'done') return false;
        if (tradeFilterType !== 'all' && t.type !== tradeFilterType) return false;
        if (tradeFilterCat !== 'all' && t.category !== tradeFilterCat) return false;
        if (tradeOnlyShips && t.category !== 'ship') return false;
        if (tradeFilterClan !== 'all' && t.clan !== tradeFilterClan) return false;
        if (q) {
            const hay = `${t.name || ''} ${t.nickname || ''} ${t.port || ''}`.toLowerCase();
            if (!hay.includes(q)) return false;
        }
        if (onlyMine && (t.nickname || '').toLowerCase() !== myNick) return false;
        return true;
    });
    list = list.slice();
    switch (tradeSort) {
        case 'price-asc': list.sort((a, b) => Number(a.price) - Number(b.price)); break;
        case 'price-desc': list.sort((a, b) => Number(b.price) - Number(a.price)); break;
        case 'qty-desc': list.sort((a, b) => Number(b.qty) - Number(a.qty)); break;
        case 'my-first': list.sort((a, b) => {
            const aMine = (a.nickname || '').toLowerCase() === myNick ? 0 : 1;
            const bMine = (b.nickname || '').toLowerCase() === myNick ? 0 : 1;
            if (aMine !== bMine) return aMine - bMine;
            return new Date(b.created_at) - new Date(a.created_at);
        }); break;
        default: list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    return list;
}
function renderTradeListings() {
    const container = $('tm-listings'); if (!container) return;
    const items = tradeVisibleListings();
    if (!items.length) { container.innerHTML = '<p class="empty">Заявок пока нет.</p>'; return; }
    const myNick = getViewerNick().toLowerCase();
    container.innerHTML = '';
    items.forEach(t => {
        const cat = tradeCatById(t.category);
        const total = Number(t.price) * Number(t.qty);
        const isMine = myNick && (t.nickname || '').toLowerCase() === myNick;
        const isDone = t.status === 'done';
        const isAccepted = !isDone && !!t.accepted_by;
        const iAmAccepter = myNick && isAccepted && (t.accepted_by || '').toLowerCase() === myNick;
        const canDelete = isAdmin || (isMine && !isAccepted && !isDone);
        const canEdit = isMine && !isAccepted && !isDone;
        const canRepeat = isDone && isMine;
        const typeLabel = t.type === 'buy' ? '🛒 Куплю' : '💰 Продам';
        const clanName = clansCache[t.clan]?.name || t.clan;
        const authorCompleted = tradesCache.filter(x =>
            x.status === 'done' &&
            ((x.nickname || '').toLowerCase() === (t.nickname || '').toLowerCase() ||
             (x.accepted_by || '').toLowerCase() === (t.nickname || '').toLowerCase())
        ).length;
        const ratingHtml = authorCompleted > 0
            ? `<span class="author-rating">⭐ ${authorCompleted}</span>`
            : `<span class="author-rating new">🆕</span>`;
        let statusBadge = '';
        if (isDone) statusBadge = `<span class="tm-badge done">✅ Завершено</span>`;
        else if (isAccepted) statusBadge = `<span class="tm-badge progress">⏳ В работе</span>`;
        else statusBadge = `<span class="tm-badge free">🔵 Свободна</span>`;
        let actionsHtml = '';
        if (!isDone && !isAccepted && !isMine) actionsHtml = `<div class="tm-listing-actions"><button class="tm-accept" data-id="${t.id}">🤝 Принять</button></div>`;
        else if (!isDone && isAccepted && isMine) actionsHtml = `<div class="tm-listing-actions"><button class="tm-confirm" data-id="${t.id}">✅ Подтвердить</button><button class="tm-cancel" data-id="${t.id}">✖ Отменить</button></div>`;
        else if (canEdit) actionsHtml = `<div class="tm-listing-actions"><button class="tm-edit" data-id="${t.id}">✏️ Редактировать</button></div>`;
        else if (canRepeat) actionsHtml = `<div class="tm-listing-actions"><button class="tm-repeat" data-id="${t.id}">🔁 Повторить заявку</button></div>`;
        let acceptedNote = '';
        if (isAccepted) acceptedNote = `<div class="tm-accepted-note">🤝 Принял: <b>${escapeHtml(t.accepted_by)}</b>${iAmAccepter ? ' — ждём подтверждения' : ''}</div>`;
        else if (isDone) acceptedNote = `<div class="tm-accepted-note">✅ Сделка завершена${t.accepted_by ? ` — с <b>${escapeHtml(t.accepted_by)}</b>` : ''}</div>`;
        const el = document.createElement('article');
        el.className = 'tm-listing ' + t.type + (isMine ? ' mine' : '') + (isDone ? ' done' : '');
        el.dataset.id = t.id;
        let shipThumbHtml = '';
        if (t.category === 'ship') {
            const shipObj = shipsCache.find(s => s.name.toLowerCase() === (t.name || '').toLowerCase());
            if (shipObj?.image_url) { el.classList.add('has-ship-thumb'); shipThumbHtml = `<img class="tm-ship-thumb" src="${escapeHtml(shipObj.image_url)}" alt="" onerror="this.style.display='none'">`; }
        } else if (t.category === 'resource') {
            const resObj = resourcesCache.find(r => (r.name || '').trim().toLowerCase() === (t.name || '').trim().toLowerCase());
            if (resObj?.image_url) { el.classList.add('has-ship-thumb'); shipThumbHtml = `<img class="tm-ship-thumb tm-res-thumb" src="${escapeHtml(resObj.image_url)}" alt="" onerror="this.style.display='none'">`; }
        }
        el.innerHTML = `
            <div class="tm-listing-head">
                ${shipThumbHtml}
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
            ${acceptedNote}${actionsHtml}
            <div class="tm-listing-foot">
                <span class="author" data-nick="${escapeHtml(t.nickname)}">👤 ${escapeHtml(t.nickname)} ${ratingHtml}</span>
                <span class="time">${tradeTimeAgo(t.created_at)}</span>
                ${canDelete ? `<button class="tm-delete" data-id="${t.id}" title="Удалить">✕</button>` : ''}
            </div>`;
        el.querySelector('.author')?.addEventListener('click', () => openProfile(t.nickname));
        container.appendChild(el);
    });
}
function updateTradeFormTotal() {
    const p = parseInt(val('tm-price')) || 0;
    const q = parseInt(val('tm-qty')) || 0;
    const el = $('tm-total'); if (el) el.value = tradeFmtGold(p * q);
}
function setTradeStatus(msg, type = '') {
    const el = $('tm-status'); if (!el) return;
    el.textContent = msg; el.className = 'tm-status ' + type;
    if (msg) setTimeout(() => { if (el.textContent === msg) el.textContent = ''; }, 3500);
}
function updateShipPickerVisibility() {
    const cat = $('tm-category')?.value;
    const picker = $('tm-ship-picker');
    if (!picker) return;
    picker.hidden = cat !== 'ship';
    if (cat !== 'ship') {
        const sel = $('tm-ship-select'); if (sel) sel.value = '';
        const preview = $('tm-ship-preview'); if (preview) preview.hidden = true;
    }
}
document.querySelectorAll('.tm-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tm-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active'); tradeFormType = btn.dataset.type;
    });
});
on('tm-price', 'input', updateTradeFormTotal);
on('tm-qty', 'input', updateTradeFormTotal);
on('tm-search', 'input', renderTradeListings);
on('tm-only-mine', 'change', renderTradeListings);
on('tm-only-ships', 'change', e => { tradeOnlyShips = e.target.checked; renderTradeListings(); });
on('tm-category', 'change', updateShipPickerVisibility);
on('tm-ship-select', 'change', e => {
    const opt = e.target.selectedOptions[0];
    const preview = $('tm-ship-preview');
    const img = $('tm-ship-preview-img');
    const info = $('tm-ship-preview-info');
    if (!opt || !opt.value) { if (preview) preview.hidden = true; return; }
    if (preview) preview.hidden = false;
    if (img) img.src = opt.dataset.image || '';
    if (info) info.innerHTML = `<b>${escapeHtml(opt.value)}</b><br>Уровень: ${ROMAN[opt.dataset.level] || opt.dataset.level || '—'} · ${escapeHtml(opt.dataset.type || '')}<br>💪 Прочность: ${opt.dataset.durability || '—'} · 🔫 Орудия: ${opt.dataset.guns || '—'}`;
    const nameField = $('tm-name');
    if (nameField) {
        const prevOpt = nameField.dataset.previousShip;
        if (!nameField.value || nameField.value === prevOpt) {
            nameField.value = opt.value;
            nameField.dataset.previousShip = opt.value;
        }
    }
});
on('tm-sort', 'change', e => { tradeSort = e.target.value; renderTradeListings(); });
on('tm-status-filters', 'click', e => {
    const chip = e.target.closest('.tm-chip'); if (!chip) return;
    document.querySelectorAll('#tm-status-filters .tm-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active'); tradeStatusFilter = chip.dataset.status; renderTradeListings();
});
on('tm-type-filters', 'click', e => {
    const chip = e.target.closest('.tm-chip'); if (!chip) return;
    document.querySelectorAll('#tm-type-filters .tm-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active'); tradeFilterType = chip.dataset.type; renderTradeListings();
});
on('tm-cat-filters', 'click', e => {
    const chip = e.target.closest('.tm-chip'); if (!chip) return;
    document.querySelectorAll('#tm-cat-filters .tm-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active'); tradeFilterCat = chip.dataset.cat; renderTradeListings();
});
on('tm-clan-filters', 'click', e => {
    const chip = e.target.closest('.tm-chip'); if (!chip) return;
    document.querySelectorAll('#tm-clan-filters .tm-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active'); tradeFilterClan = chip.dataset.clan; renderTradeListings();
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
        renderTrades(); return;
    }
    const acceptBtn = e.target.closest('.tm-accept');
    if (acceptBtn) {
        const id = acceptBtn.dataset.id;
        const t = tradesCache.find(x => String(x.id) === String(id));
        if (!t) return;
        openAcceptTradeModal(t); return;
    }
    const confirmBtn = e.target.closest('.tm-confirm');
    if (confirmBtn) {
        const id = confirmBtn.dataset.id;
        const t = tradesCache.find(x => String(x.id) === String(id));
        if (!t) return;
        if (!confirm(`Подтвердить сделку с «${t.accepted_by}»?`)) return;
        const { error } = await supabase.from('trades').update({ status: 'done' }).eq('id', id);
        if (error) return alert(error.message);
        await createNotification(t.accepted_by, 'trade', '✅ Сделка завершена', `Сделка «${t.name}» подтверждена.`, null);
        renderTrades(); return;
    }
    const cancelBtn = e.target.closest('.tm-cancel');
    if (cancelBtn) {
        const id = cancelBtn.dataset.id;
        const t = tradesCache.find(x => String(x.id) === String(id));
        if (!t) return;
        if (!confirm(`Отменить принятие от «${t.accepted_by}»?`)) return;
        const { error } = await supabase.from('trades').update({ accepted_by: null, accepted_at: null }).eq('id', id);
        if (error) return alert(error.message);
        renderTrades(); return;
    }
    const editBtn = e.target.closest('.tm-edit');
    if (editBtn) {
        const id = editBtn.dataset.id;
        const t = tradesCache.find(x => String(x.id) === String(id));
        if (!t) return;
        openTradeEditModal(t); return;
    }
    const repeatBtn = e.target.closest('.tm-repeat');
    if (repeatBtn) {
        const id = repeatBtn.dataset.id;
        const t = tradesCache.find(x => String(x.id) === String(id));
        if (!t) return;
        repeatTrade(t); return;
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
    if (!nickname || nickname.length < 2) return setTradeStatus('Укажите ваш ник.', 'error');
    const { error } = await supabase.from('trades').insert({
        clan, type: tradeFormType, category, name, price, qty,
        port: port || null, nickname, note: note || null, status: 'active'
    });
    if (error) return setTradeStatus('Ошибка: ' + error.message, 'error');
    localStorage.setItem(VIEWER_NICK_KEY, nickname);
    sendHeartbeat();
    ['tm-name','tm-price','tm-port','tm-note'].forEach(id => { const el = $(id); if (el) el.value = ''; });
    $('tm-qty').value = 1;
    updateTradeFormTotal();
    setTradeStatus('✅ Заявка опубликована!', 'success');
    renderTrades();
});
function openTradeEditModal(t) {
    if (!t) return;
    editingTradeId = t.id;
    $('tradeEditName').textContent = t.name;
    $('tradeEditItemName').value = t.name;
    $('tradeEditPrice').value = t.price;
    $('tradeEditQty').value = t.qty;
    $('tradeEditPort').value = t.port || '';
    $('tradeEditNote').value = t.note || '';
    $('tradeEditError').textContent = '';
    $('tradeEditModal').hidden = false;
}
on('tradeEditCancel', 'click', () => { $('tradeEditModal').hidden = true; editingTradeId = null; });
on('tradeEditSave', 'click', async () => {
    if (!editingTradeId) return;
    const name = val('tradeEditItemName').trim();
    const price = parseInt(val('tradeEditPrice'));
    const qty = parseInt(val('tradeEditQty'));
    const port = val('tradeEditPort').trim();
    const note = val('tradeEditNote').trim();
    const err = $('tradeEditError'); err.textContent = '';
    if (!name) { err.textContent = 'Укажите название'; return; }
    if (!price || price <= 0) { err.textContent = 'Некорректная цена'; return; }
    if (!qty || qty <= 0) { err.textContent = 'Некорректное количество'; return; }
    const { error } = await supabase.from('trades').update({ name, price, qty, port: port || null, note: note || null }).eq('id', editingTradeId);
    if (error) { err.textContent = 'Ошибка: ' + error.message; return; }
    $('tradeEditModal').hidden = true; editingTradeId = null; renderTrades();
});
function repeatTrade(t) {
    if (!t) return;
    const clanSel = $('tm-clan'); if (clanSel && clansCache[t.clan]) clanSel.value = t.clan;
    const catSel = $('tm-category'); if (catSel) catSel.value = t.category;
    tradeFormType = t.type;
    document.querySelectorAll('.tm-type-btn').forEach(b => b.classList.toggle('active', b.dataset.type === t.type));
    $('tm-name').value = t.name;
    $('tm-price').value = t.price;
    $('tm-qty').value = t.qty;
    $('tm-port').value = t.port || '';
    $('tm-note').value = t.note || '';
    updateTradeFormTotal();
    setTradeStatus('🔁 Данные перенесены.', 'success');
}
function openAcceptTradeModal(t) {
    acceptingTrade = t;
    $('acceptTradeName').textContent = t.name;
    $('acceptTradeInfo').textContent = `${t.type === 'buy' ? 'Покупка' : 'Продажа'} · ${Number(t.price).toLocaleString('ru-RU')} 🪙/шт · ${t.qty} шт`;
    const savedNick = getViewerNick();
    $('acceptTradeNickname').value = savedNick || '';
    $('acceptTradeError').textContent = '';
    $('acceptTradeModal').hidden = false;
}
function closeAcceptTradeModal() { $('acceptTradeModal').hidden = true; acceptingTrade = null; }
on('cancelAcceptTrade', 'click', closeAcceptTradeModal);
on('doAcceptTrade', 'click', async () => {
    if (!acceptingTrade) return;
    const nick = val('acceptTradeNickname').trim();
    const err = $('acceptTradeError'); err.textContent = '';
    if (!nick || nick.length < 2) { err.textContent = 'Укажите ваш ник'; return; }
    if (nick.toLowerCase() === (acceptingTrade.nickname || '').toLowerCase()) { err.textContent = 'Нельзя принять свою заявку'; return; }
    $('doAcceptTrade').disabled = true;
    const { error } = await supabase.from('trades').update({ accepted_by: nick, accepted_at: new Date().toISOString() }).eq('id', acceptingTrade.id);
    $('doAcceptTrade').disabled = false;
    if (error) { err.textContent = 'Ошибка: ' + error.message; return; }
    localStorage.setItem(VIEWER_NICK_KEY, nick);
    sendHeartbeat();
    await createNotification(acceptingTrade.nickname, 'trade', '🤝 Вашу заявку приняли', `${nick} принял заявку «${acceptingTrade.name}».`, null);
    closeAcceptTradeModal(); renderTrades();
    setTradeStatus('✅ Вы приняли заявку.', 'success');
});
