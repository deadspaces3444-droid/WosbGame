/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   1.  📦  ИМПОРТЫ И КОНСТАНТЫ                                        ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
import { supabase } from './supabase.js';

console.log('🚀 app.js v2.5.0');

const APP_VERSION = '2.5.0';
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

const UNLOCK_KEY          = 'guild_unlocked';
const LAST_CLAN_KEY       = 'guild_last_clan';
const MY_CLAN_KEY         = 'guild_my_clan';
const BG_STORAGE_KEY      = 'guild_bg_overrides';
const GAME_STORAGE_KEY    = 'selected_game_id';
const VIEWER_NICK_KEY     = 'viewer_nickname';
const CLAN_PASS_KEY       = 'clan_pass';
const CLAN_ADMIN_PASS_KEY = 'clan_admin_pass';
const THEME_KEY           = 'app_theme';

const SHARED           = '__shared__';
const HEARTBEAT_MS     = 30000;
const ONLINE_WINDOW_MS = 90000;

const VK_DOMAIN      = 'worldofseabattle';
const VK_API_VERSION = '5.131';
const VK_POSTS_COUNT = 10;

const MAP_DEFAULT_DETAILED = 'images/map/detailed.jpg';
const MAP_DEFAULT_CLEAN    = 'images/map/clean.jpg';

const TRADE_CATEGORIES = [
    { id: 'resource',  name: 'Ресурс',    icon: '🪵' },
    { id: 'ship',      name: 'Корабль',   icon: '⛵' },
    { id: 'module',    name: 'Модуль',    icon: '⚙️' },
    { id: 'weapon',    name: 'Оружие',    icon: '⚔️' },
    { id: 'ammo',      name: 'Боеприпас', icon: '💣' },
    { id: 'blueprint', name: 'Чертёж',    icon: '📜' },
    { id: 'consum',    name: 'Расходник', icon: '🧪' },
    { id: 'other',     name: 'Прочее',    icon: '📦' }
];

const BUILD_ITEM_TYPES = {
    upgrade:       { label: 'Апгрейд',        icon: '🔧' },
    weapon_small:  { label: 'Малая пушка',    icon: '🟢' },
    weapon_medium: { label: 'Средняя пушка',  icon: '🟡' },
    weapon_large:  { label: 'Большая пушка',  icon: '🔴' },
    specialist:    { label: 'Специалист',     icon: '👤' },
    consum:        { label: 'Расходник',      icon: '⚗️' },
    cargo:         { label: 'Трюм',           icon: '📦' }
};

const EVENT_MARKER_TYPES = {
    target:  { label: 'Цель',      icon: '🎯', color: '#ff7a7a' },
    regroup: { label: 'Регруп',    icon: '🤝', color: '#6ee7a7' },
    battle:  { label: 'Бой',       icon: '⚔️', color: '#fbbf24' },
    point:   { label: 'Точка',     icon: '📍', color: '#7db9ff' },
    danger:  { label: 'Опасность', icon: '☠️', color: '#dc2626' },
    loot:    { label: 'Добыча',    icon: '🏆', color: '#ffd479' }
};

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   2.  🗂️  ГЛОБАЛЬНОЕ СОСТОЯНИЕ                                       ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
let gamesCache = {}, clansCache = {}, alliancesCache = {};
let settingsCache = null, faqCache = [], partnersCache = [], tacticsCache = [], tradesCache = [];
let shipsCache = [];
let buildItemsCache = [];
let resourcesCache = [];
let recipesCache = [], discountsCache = [];
let factionsCache = [], portsCache = [], ranksCache = [];
let siteAdminsCache = [];

let currentSession = null;
let isOwner = false, isMod = false, isAdmin = false;
let siteAdminRole = null, myAdminClanId = null;

let currentGame = null, currentClan = null;
let currentClanIsAdmin = false, currentClanPass = null;
let pendingClanId = null, currentTab = 'enemies';

let editingItem = null, editingBuild = null, editingGame = null;
let duplicatingBuild = null, editingTactic = null, editingAlliance = null;
let acceptingTrade = null, editingTradeId = null, editingResourceId = null;

let tradeFormType = 'buy';
let tradeFilterType = 'all', tradeFilterCat = 'all', tradeFilterClan = 'all';
let tradeFilterStatus = 'active';
let tradeSort = 'new';
let tradeOnlyShips = false;

let shipsFilterLevel = 'all', shipsFilterType = 'all';
let shipsSearch = '', shipsSort = 'level-desc';

let heartbeatTimer = null;
let chatChannel = null, onlineChannel = null, notifChannel = null;
let chatMessages = [], notifications = [];
let chatMode = 'guild', chatPrivateWith = null;
let jitsiApi = null, jitsiLoading = false;

let mapSettings = null;
let mapFullscreenZoom = 1, mapFullscreenX = 0, mapFullscreenY = 0;
let mapFullscreenDragging = false, mapFullscreenDragStart = null;

let pricingSaveTimers = {};
let pricingAutoMode = false;

let mapDetailedData = null, mapCleanData = null;

/* v2.5.0: редактор меток */
let evMapMarkers = [];
let evMapCurrentType = 'target';

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   3.  🧰  DOM И УТИЛИТЫ                                              ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
const $ = id => document.getElementById(id);

function on(id, event, handler) {
    const el = document.getElementById(id);
    if (!el) return false;
    el.addEventListener(event, handler);
    return true;
}
function val(id) { const el = $(id); return el ? el.value : ''; }

function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}
function flashStatusEl(el, text, color) {
    if (!el) return;
    el.textContent = text; el.style.color = color;
    clearTimeout(el._t);
    el._t = setTimeout(() => el.textContent = '', 2500);
}
function flashStatus(text, color) {
    const el = $('status'); if (!el) return;
    el.textContent = text; el.style.color = color;
    clearTimeout(flashStatus._t);
    flashStatus._t = setTimeout(() => el.textContent = '', 2500);
}
function colorFromString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    const hue = Math.abs(h) % 360;
    return `linear-gradient(135deg, hsl(${hue}, 55%, 45%), hsl(${hue}, 55%, 30%))`;
}
function getClanImage(clan) {
    if (clan && clan.image && String(clan.image).trim()) return clan.image;
    const flag = clan?.flag || 'neutral';
    return CLAN_FLAGS[flag] || CLAN_FLAGS.neutral;
}
function isClanUsingFlag(clan) {
    return !(clan && clan.image && String(clan.image).trim());
}
function isVideoUrl(url) {
    if (!url) return false;
    const s = String(url).toLowerCase();
    if (s.startsWith('data:video/')) return true;
    const c = s.split('?')[0].split('#')[0];
    return c.endsWith('.mp4') || c.endsWith('.webm');
}
function renderLogoTag(clan, size = 'card') {
    const url = getClanImage(clan);
    const useFlag = isClanUsingFlag(clan);
    const flagClass = useFlag ? ' clan-flag' : '';
    if (isVideoUrl(url) && !useFlag) {
        return `<video autoplay muted loop playsinline preload="metadata" class="${flagClass}"><source src="${escapeHtml(url)}" type="video/mp4"><source src="${escapeHtml(url)}" type="video/webm"></video>`;
    }
    return `<img src="${escapeHtml(url)}" alt="${escapeHtml(clan?.name || '')}" class="${flagClass}" onerror="this.style.display='none'">`;
}

function parseLines(text) {
    if (!text) return [];
    return String(text).split('\n').map(s => s.trim()).filter(Boolean);
}
function parseBonus(text) {
    const m = String(text).match(/^(.+?)\s*([+-]\s*\d+)\s*$/);
    if (!m) return { stat: String(text).trim(), value: null };
    return { stat: m[1].trim(), value: parseInt(m[2].replace(/\s/g, ''), 10) };
}
function parseSpecialists(text) {
    return parseLines(text).map(line => {
        const parts = line.split('|').map(p => p.trim()).filter(Boolean);
        if (!parts.length) return null;
        return { name: parts[0], bonuses: parts.slice(1).map(parseBonus) };
    }).filter(Boolean);
}
function parseMembersList(text) {
    if (!text) return [];
    return String(text).split('\n').map(line => {
        line = line.trim(); if (!line) return null;
        const m = line.match(/^(\d+)\s*[-.)\]]?\s+(.+)$/);
        if (m) return { num: m[1], name: m[2].trim() };
        return { num: '', name: line };
    }).filter(Boolean);
}
function normalizeNickList(raw) {
    if (!raw) return [];
    return String(raw).split('\n')
        .map(s => s.trim().replace(/^\d+\s*[-.)\]]?\s*/, '').trim())
        .filter(Boolean).map(s => s.toLowerCase());
}

function compressImage(file, maxW = 1920, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = e => {
            const img = new Image();
            img.onload = () => {
                const scale = img.width > maxW ? maxW / img.width : 1;
                const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
                const c = document.createElement('canvas');
                c.width = w; c.height = h;
                c.getContext('2d').drawImage(img, 0, 0, w, h);
                resolve(c.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject; img.src = e.target.result;
        };
        r.onerror = reject; r.readAsDataURL(file);
    });
}
function compressSquare(file, maxSize = 256, quality = 0.9) {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = e => {
            const img = new Image();
            img.onload = () => {
                const c = document.createElement('canvas');
                c.width = maxSize; c.height = maxSize;
                const ctx = c.getContext('2d');
                const minSide = Math.min(img.width, img.height);
                ctx.drawImage(img, (img.width - minSide) / 2, (img.height - minSide) / 2, minSide, minSide, 0, 0, maxSize, maxSize);
                resolve(c.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject; img.src = e.target.result;
        };
        r.onerror = reject; r.readAsDataURL(file);
    });
}

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

function getViewerNick() { return (localStorage.getItem(VIEWER_NICK_KEY) || '').trim(); }
function getMyClanId() { return localStorage.getItem(MY_CLAN_KEY) || null; }
function isUnlocked() { return isAdmin || localStorage.getItem(UNLOCK_KEY) === '1'; }
function getLeaderClanId() { return myAdminClanId || getMyClanId() || currentClan || null; }
function canEditBindings() {
    const e = (currentSession?.user?.email || '').toLowerCase();
    return BINDING_OWNERS.map(x => x.toLowerCase()).includes(e);
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   4.  🔐  ПРАВА ДОСТУПА                                              ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function canEditClan(clanId) {
    if (!clanId) return false;
    if (isOwner) return true;
    if (isAdmin) {
        if (myAdminClanId) return clanId === myAdminClanId;
        if (isMod) return false;
        return true;
    }
    if (clanId === currentClan && currentClanIsAdmin) return true;
    return false;
}
function canAccessClan(clanId) {
    if (isOwner) return true;
    if (isAdmin && myAdminClanId) {
        if (clanId === myAdminClanId) return true;
        const my = clansCache[myAdminClanId], target = clansCache[clanId];
        if (!my || !target || !my.alliance_id) return false;
        return target.alliance_id === my.alliance_id;
    }
    if (isAdmin) return true;
    const myClan = getMyClanId();
    if (!myClan) return false;
    if (clanId === myClan) return true;
    const my = clansCache[myClan], target = clansCache[clanId];
    if (!my || !target || !my.alliance_id) return false;
    return target.alliance_id === my.alliance_id;
}
function isClanLeader() {
    if (isOwner && getLeaderClanId()) return true;
    if ((isAdmin || isMod) && myAdminClanId) return true;
    return !!(currentClanIsAdmin && getMyClanId());
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   5.  🎨  ТЕМА                                                       ║
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
   ║   6.  🖼️  ФОНЫ                                                       ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
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
function currentBgFallback() { return currentClan && clansCache[currentClan]?.bg ? clansCache[currentClan].bg : null; }
function applyBg() {
    const url = getOverrides()[currentBgKey()] || currentBgFallback();
    if (url) document.body.style.backgroundImage = `url('${url}')`;
    else document.body.style.backgroundImage = '';
}
const bgFileInput = $('bgFileInput');
on('bgChangeBtn', 'click', () => {
    if (!canEditClan(currentClan)) return;
    if (!bgFileInput) return;
    bgFileInput.value = '';
    bgFileInput.click();
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
    if (!getOverrides()[key]) return alert('Уже стандартный фон.');
    if (!confirm('Вернуть стандартный фон?')) return;
    setOverride(key, null); applyBg();
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   7.  📝  ЛОГИ                                                       ║
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
   ║   8.  👑  АДМИНЫ САЙТА                                              ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
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
    renderSiteAdminsAdmin();
}
function recalcIsAdmin() {
    const email = (currentSession?.user?.email || '').toLowerCase();
    const me = siteAdminsCache.find(r => (r.email || '').toLowerCase() === email);
    isAdmin = !!me;
    isOwner = me?.role === 'owner';
    isMod   = me?.role === 'mod';
    siteAdminRole = me?.role || null;
    myAdminClanId = me?.clan_id || null;
}
async function renderSiteAdminsAdmin() {
    const container = $('siteAdminsList'); if (!container) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    if (!siteAdminsCache.length) { container.innerHTML = '<div class="empty">Пока нет админов</div>'; return; }

    let clansList = Object.values(clansCache);
    if (!clansList.length) {
        try { const { data } = await supabase.from('clans').select('id, name').order('name'); clansList = data || []; }
        catch (e) { }
    }
    const roleLabels = { owner: '👑 Владелец', admin: '⚙️ Админ', mod: '🎖 Глава Клана' };
    const roleIcons  = { owner: '👑', admin: '⚙️', mod: '🎖' };
    const clanOptionsHtml = (selectedId) => {
        const sorted = clansList.slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        return ['<option value="">— Без привязки —</option>']
            .concat(sorted.map(c => `<option value="${escapeHtml(c.id)}" ${c.id === selectedId ? 'selected' : ''}>🏰 ${escapeHtml(c.name)}</option>`))
            .join('');
    };
    const canBind = canEditBindings();
    const myEmail = (currentSession?.user?.email || '').toLowerCase();
    const order = { owner: 0, admin: 1, mod: 2 };
    const list = siteAdminsCache.slice().sort((a, b) => (order[a.role] ?? 9) - (order[b.role] ?? 9));

    container.innerHTML = '';
    list.forEach(item => {
        const email = (item.email || '').toLowerCase();
        const role = item.role || 'admin';
        const nick = item.nickname || '—';
        const clanId = item.clan_id || '';
        const isMe = email === myEmail;
        const el = document.createElement('div');
        el.className = 'partners-admin-item';

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
                <div><span class="admin-nick">${escapeHtml(nick)}</span>${isMe ? ' <span style="color:var(--gold);font-size:11px;">— вы</span>' : ''}</div>
                <div class="admin-row">
                    <span class="admin-email">${escapeHtml(email)}</span>
                    ${roleHtml}
                </div>
                <div class="admin-row"><span class="admin-email-label">Гильдия:</span>${clanHtml}</div>
            </div>
            <div class="actions">
                ${(isOwner || isMe) ? `<button class="edit" title="Сменить пароль">🔑</button>` : ''}
                ${(isOwner && !isMe) ? `<button class="nick-btn" title="Сменить никнейм">✏️</button>` : ''}
                ${(isOwner && !isMe) ? `<button class="delete" title="Удалить">🗑</button>` : ''}
            </div>`;
        el.querySelector('.role-select')?.addEventListener('change', e => setAdminRole(email, e.target.value));
        el.querySelector('.clan-select')?.addEventListener('change', e => setAdminClanId(email, e.target.value));
        el.querySelector('.edit')?.addEventListener('click', () => changeAdminPassword(email));
        el.querySelector('.nick-btn')?.addEventListener('click', () => changeAdminNickname(email, nick));
        el.querySelector('.delete')?.addEventListener('click', () => deleteSiteAdmin(email));
        container.appendChild(el);
    });
    document.querySelectorAll('.owner-only').forEach(x => { x.hidden = !isOwner; });
}
async function addSiteAdmin(email, password, role, nickname) {
    const msg = $('siteAdminsMsg'); if (msg) { msg.textContent = ''; msg.style.color = ''; }
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanNick = String(nickname || '').trim();
    if (!cleanNick) { msg.textContent = 'Укажи никнейм'; msg.style.color = '#ff7a7a'; return; }
    if (!cleanEmail) { msg.textContent = 'Укажи email'; msg.style.color = '#ff7a7a'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) { msg.textContent = 'Некорректный email'; msg.style.color = '#ff7a7a'; return; }
    if (!password || password.length < 6) { msg.textContent = 'Пароль от 6 символов'; msg.style.color = '#ff7a7a'; return; }
    const btn = $('addSiteAdminBtn');
    btn.disabled = true; const old = btn.textContent; btn.textContent = '⏳…';
    const { data, error } = await supabase.rpc('create_site_admin', {
        new_email: cleanEmail, new_password: password, new_role: role, new_nickname: cleanNick
    });
    btn.disabled = false; btn.textContent = old;
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    if (data?.error) { msg.textContent = data.error; msg.style.color = '#ff7a7a'; return; }
    await logAdminAction('Добавил админа сайта', cleanEmail, `ник: ${cleanNick}, роль: ${role}`);
    msg.textContent = '✔ Админ создан'; msg.style.color = '#6ee7a7';
    ['newSiteAdminNickname','newSiteAdminEmail','newSiteAdminPassword'].forEach(id => { const el = $(id); if (el) el.value = ''; });
    if ($('newSiteAdminRole')) $('newSiteAdminRole').value = 'admin';
    await loadSiteAdmins();
}
async function deleteSiteAdmin(email) {
    if (!isOwner) return alert('Только владелец может удалять админов');
    if (!confirm(`Удалить админа «${email}»?`)) return;
    const { data, error } = await supabase.rpc('delete_site_admin', { target_email: email });
    if (error) return alert('Ошибка: ' + error.message);
    if (data?.error) return alert(data.error);
    await logAdminAction('Удалил админа сайта', email);
    await loadSiteAdmins();
}
async function setAdminRole(email, newRole) {
    if (!isOwner) { alert('Только владелец'); renderSiteAdminsAdmin(); return; }
    const { data, error } = await supabase.rpc('set_admin_role', { target_email: email, new_role: newRole });
    if (error) { alert('Ошибка: ' + error.message); renderSiteAdminsAdmin(); return; }
    if (data?.error) { alert(data.error); renderSiteAdminsAdmin(); return; }
    await loadSiteAdmins();
}
async function setAdminClanId(email, clanId) {
    if (!canEditBindings()) { alert('Менять привязку может только владелец'); renderSiteAdminsAdmin(); return; }
    const { data, error } = await supabase.rpc('set_admin_clan_id', { target_email: email, new_clan_id: clanId || '' });
    if (error) { alert('Ошибка: ' + error.message); renderSiteAdminsAdmin(); return; }
    if (data?.error) { alert(data.error); renderSiteAdminsAdmin(); return; }
    await loadSiteAdmins();
}
async function changeAdminPassword(email) {
    const target = prompt(`Новый пароль для «${email}» (от 6 символов):`, '');
    if (!target) return;
    if (target.length < 6) return alert('Пароль от 6 символов');
    const { data, error } = await supabase.rpc('change_admin_password', { target_email: email, new_password: target });
    if (error) return alert('Ошибка: ' + error.message);
    if (data?.error) return alert(data.error);
    await logAdminAction('Сменил пароль админа', email);
    alert('✔ Пароль изменён');
}
async function changeAdminNickname(email, current) {
    const t = prompt(`Новый никнейм для «${email}»:`, current && current !== '—' ? current : '');
    if (!t) return;
    const clean = t.trim(); if (!clean) return alert('Никнейм не может быть пустым');
    const { data, error } = await supabase.rpc('set_admin_nickname', { target_email: email, new_nickname: clean });
    if (error) return alert('Ошибка: ' + error.message);
    if (data?.error) return alert(data.error);
    await loadSiteAdmins();
}
on('addSiteAdminBtn', 'click', () => {
    addSiteAdmin(val('newSiteAdminEmail'), val('newSiteAdminPassword'), val('newSiteAdminRole'), val('newSiteAdminNickname'));
});
on('newSiteAdminPassword', 'keydown', e => { if (e.key === 'Enter') $('addSiteAdminBtn').click(); });
on('changeMyPassBtn', 'click', async () => {
    const pass = val('myNewPassword'), msg = $('myPassMsg');
    msg.textContent = ''; msg.style.color = '';
    if (!pass || pass.length < 6) { msg.textContent = 'Пароль от 6 символов'; msg.style.color = '#ff7a7a'; return; }
    const email = (currentSession?.user?.email || '').toLowerCase();
    if (!email) { msg.textContent = 'Нет сессии'; msg.style.color = '#ff7a7a'; return; }
    const { data, error } = await supabase.rpc('change_admin_password', { target_email: email, new_password: pass });
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    if (data?.error) { msg.textContent = data.error; msg.style.color = '#ff7a7a'; return; }
    $('myNewPassword').value = '';
    msg.textContent = '✔ Пароль изменён'; msg.style.color = '#6ee7a7';
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   9.  🟢  ОНЛАЙН + REALTIME                                          ║
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
function initRealtime() {
    closeRealtime();
    onlineChannel = supabase.channel('online')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'online_users' }, () => updateOnlineCount())
        .subscribe();
    const nick = getViewerNick();
    if (nick) {
        notifChannel = supabase.channel('notif_' + nick)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_nickname=eq.${nick}` }, payload => {
                notifications.unshift(payload.new);
                if (notifications.length > 50) notifications.pop();
                renderNotifications();
                ['notifBell','notifBell2'].forEach(id => { const b = $(id); if (!b) return; b.style.transform = 'scale(1.15)'; setTimeout(() => b.style.transform = '', 300); });
            }).subscribe();
    }
}
function closeRealtime() {
    if (onlineChannel) { supabase.removeChannel(onlineChannel); onlineChannel = null; }
    if (notifChannel)  { supabase.removeChannel(notifChannel);  notifChannel  = null; }
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   10.  🖥️  ЭКРАНЫ                                                    ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function showScreen(name) {
    const sh = $('screen-home'); if (sh) sh.hidden = name !== 'home';
    const sc = $('screen-clan'); if (sc) sc.hidden = name !== 'clan';
    const cv = $('clanView');    if (cv) cv.hidden = name !== 'lists';
    const sa = $('screen-admin');if (sa) sa.hidden = name !== 'admin';
    const sl = $('screen-leader');if (sl) sl.hidden = name !== 'leader';
    window.scrollTo(0, 0);
    applyBg();
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   11.  🎮  ИГРЫ                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadGames() {
    const { data, error } = await supabase.from('games').select('*')
        .order('sort_order', { ascending: true }).order('created_at', { ascending: true });
    if (error) return console.error('Games load error:', error);
    gamesCache = {};
    (data || []).forEach(g => { gamesCache[g.id] = g; });
    const saved = localStorage.getItem(GAME_STORAGE_KEY);
    if (saved && gamesCache[saved]) currentGame = saved;
    else currentGame = Object.keys(gamesCache)[0] || null;
    renderGamesAdmin();
    renderNewClanGameSelect();
    renderClanRequestGameSelect();
    applyBg();
}
function renderGamesAdmin() {
    const c = $('gamesAdminList'); if (!c) return;
    c.innerHTML = '';
    const list = Object.values(gamesCache);
    if (!list.length) { c.innerHTML = '<div class="empty">Пока нет игр</div>'; return; }
    list.forEach(g => {
        const el = document.createElement('div');
        el.className = 'games-admin-item';
        const logo = g.image ? `<img src="${escapeHtml(g.image)}" onerror="this.outerHTML='<span>🎮</span>'">` : `<span>🎮</span>`;
        el.innerHTML = `
            <div class="logo-mini">${logo}</div>
            <div class="txt"><b>${escapeHtml(g.name)}</b><span>ID: ${escapeHtml(g.id)}${g.bg ? ' · 🎨' : ''}</span></div>
            <div class="actions"><button class="edit">✏️</button><button class="delete">🗑</button></div>`;
        el.querySelector('.edit').addEventListener('click', () => openGameEdit(g));
        el.querySelector('.delete').addEventListener('click', () => deleteGame(g.id, g.name));
        c.appendChild(el);
    });
}
on('gameAddBtn', 'click', async () => {
    const id = val('gameId').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const name = val('gameName').trim(), image = val('gameImage').trim(), bg = val('gameBg').trim();
    const st = $('gameStatus');
    if (!id) return flashStatusEl(st, 'Укажи ID', '#ff7a7a');
    if (!name) return flashStatusEl(st, 'Укажи название', '#ff7a7a');
    if (gamesCache[id]) return flashStatusEl(st, 'ID существует', '#ff7a7a');
    const { error } = await supabase.from('games').insert({ id, name, image: image || null, bg: bg || null, sort_order: Object.keys(gamesCache).length });
    if (error) return flashStatusEl(st, 'Ошибка: ' + error.message, '#ff7a7a');
    ['gameId','gameName','gameImage','gameBg'].forEach(i => { const el = $(i); if (el) el.value = ''; });
    flashStatusEl(st, '✔ Добавлено', '#6ee7a7');
    await loadGames();
});
function openGameEdit(g) {
    editingGame = g;
    $('gameEditId').value = g.id; $('gameEditName').value = g.name;
    $('gameEditImage').value = g.image || ''; $('gameEditBg').value = g.bg || '';
    $('gameEditMsg').textContent = '';
    $('gameEditModal').hidden = false;
    $('gameEditName').focus();
}
on('cancelGameEdit', 'click', () => { $('gameEditModal').hidden = true; editingGame = null; });
on('saveGameEdit', 'click', async () => {
    if (!editingGame) return;
    const name = val('gameEditName').trim(), image = val('gameEditImage').trim(), bg = val('gameEditBg').trim();
    const msg = $('gameEditMsg');
    if (!name) { msg.textContent = 'Укажи название'; msg.style.color = '#ff7a7a'; return; }
    const { error } = await supabase.from('games').update({ name, image: image || null, bg: bg || null }).eq('id', editingGame.id);
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    $('gameEditModal').hidden = true; editingGame = null;
    await loadGames();
});
async function deleteGame(id, name) {
    if (!confirm(`Удалить игру «${name}»?`)) return;
    const { error } = await supabase.from('games').delete().eq('id', id);
    if (error) return alert('Ошибка: ' + error.message);
    if (currentGame === id) { currentGame = null; localStorage.removeItem(GAME_STORAGE_KEY); }
    await loadGames(); await loadClans();
}
function renderNewClanGameSelect() {
    const sel = $('newClanGame'); if (!sel) return;
    const cur = sel.value; sel.innerHTML = '';
    Object.values(gamesCache).forEach(g => { const o = document.createElement('option'); o.value = g.id; o.textContent = g.name; sel.appendChild(o); });
    if (cur && gamesCache[cur]) sel.value = cur;
    else if (currentGame && gamesCache[currentGame]) sel.value = currentGame;
}
function renderClanRequestGameSelect() {
    const sel = $('crGameId'); if (!sel) return;
    sel.innerHTML = '';
    Object.values(gamesCache).forEach(g => { const o = document.createElement('option'); o.value = g.id; o.textContent = g.name; sel.appendChild(o); });
    if (currentGame && gamesCache[currentGame]) sel.value = currentGame;
}
function renderGameSelectForClanAdmin() {
    const sel = $('adminClanGame'); if (!sel) return;
    const cur = sel.value; sel.innerHTML = '';
    Object.values(gamesCache).forEach(g => { const o = document.createElement('option'); o.value = g.id; o.textContent = g.name; sel.appendChild(o); });
    if (cur && gamesCache[cur]) sel.value = cur;
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   12.  🤝  СОЮЗЫ                                                     ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadAlliances() {
    try {
        const { data, error } = await supabase.from('alliances').select('*').order('name');
        if (error) { alliancesCache = {}; return; }
        alliancesCache = {};
        (data || []).forEach(a => { alliancesCache[a.id] = a; });
        renderAlliancesAdmin();
        renderAllianceSelects();
    } catch (e) { alliancesCache = {}; }
}
function renderAllianceSelects() {
    ['adminClanAlliance', 'newClanAlliance'].forEach(id => {
        const sel = $(id); if (!sel) return;
        const cur = sel.value; sel.innerHTML = '';
        const empty = document.createElement('option');
        empty.value = ''; empty.textContent = '— Без союза —';
        sel.appendChild(empty);
        Object.values(alliancesCache).forEach(a => {
            const o = document.createElement('option'); o.value = a.id; o.textContent = a.name; sel.appendChild(o);
        });
        if (cur && (cur === '' || alliancesCache[cur])) sel.value = cur;
    });
}
function renderAlliancesAdmin() {
    const c = $('alliancesAdminList'); if (!c) return;
    c.innerHTML = '';
    const list = Object.values(alliancesCache);
    if (!list.length) { c.innerHTML = '<div class="empty">Пока нет союзов</div>'; return; }
    list.forEach(a => {
        const memberClans = Object.values(clansCache).filter(x => x.alliance_id === a.id);
        const el = document.createElement('div');
        el.className = 'alliance-admin-item';
        el.innerHTML = `
            <div class="alliance-header">
                <div class="alliance-title">🤝 <b>${escapeHtml(a.name)}</b> <span class="alliance-id">[${escapeHtml(a.id)}]</span></div>
                <div class="alliance-actions">
                    <button class="edit">✏️</button>
                    <button class="delete">🗑</button>
                </div>
            </div>
            ${a.description ? `<div class="alliance-desc">${escapeHtml(a.description)}</div>` : ''}
            <div class="alliance-clans">
                <b>Гильдии в союзе (${memberClans.length}):</b>
                ${memberClans.length ? memberClans.map(x => `<span class="alliance-clan-chip">🏰 ${escapeHtml(x.name)}</span>`).join('') : '<span style="color:var(--muted)">— никого —</span>'}
            </div>`;
        el.querySelector('.edit').addEventListener('click', () => openAllianceEdit(a));
        el.querySelector('.delete').addEventListener('click', () => deleteAlliance(a.id, a.name));
        c.appendChild(el);
    });
}
on('allyAddBtn', 'click', async () => {
    const id = val('allyId').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const name = val('allyName').trim(), desc = val('allyDesc').trim();
    const msg = $('allyMsg'); msg.textContent = '';
    if (!id || !name) { msg.textContent = 'ID и название обязательны'; msg.style.color = '#ff7a7a'; return; }
    if (alliancesCache[id]) { msg.textContent = 'ID занят'; msg.style.color = '#ff7a7a'; return; }
    const { error } = await supabase.from('alliances').insert({ id, name, description: desc || null });
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    ['allyId','allyName','allyDesc'].forEach(i => { const el = $(i); if (el) el.value = ''; });
    msg.textContent = '✔ Союз создан'; msg.style.color = '#6ee7a7';
    await loadAlliances();
});
function openAllianceEdit(a) {
    editingAlliance = a;
    $('allyEditId').value = a.id; $('allyEditName').value = a.name || '';
    $('allyEditDesc').value = a.description || '';
    $('allyEditMsg').textContent = '';
    $('allyEditModal').hidden = false;
    $('allyEditName').focus();
}
on('cancelAllyEdit', 'click', () => { $('allyEditModal').hidden = true; editingAlliance = null; });
on('saveAllyEdit', 'click', async () => {
    if (!editingAlliance) return;
    const name = val('allyEditName').trim(), desc = val('allyEditDesc').trim();
    const msg = $('allyEditMsg');
    if (!name) { msg.textContent = 'Укажи название'; msg.style.color = '#ff7a7a'; return; }
    const { error } = await supabase.from('alliances').update({ name, description: desc || null }).eq('id', editingAlliance.id);
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    $('allyEditModal').hidden = true; editingAlliance = null;
    await loadAlliances();
});
async function deleteAlliance(id, name) {
    if (!confirm(`Удалить союз «${name}»?`)) return;
    await supabase.from('alliances').delete().eq('id', id);
    await loadAlliances(); await loadClans();
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   13.  📚  САЙДБАРЫ С АККОРДЕОНОМ                                    ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
document.querySelectorAll('.side-group-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const g = btn.closest('.side-group');
        if (g) g.classList.toggle('open');
    });
});
document.querySelectorAll('.side-item').forEach(btn => {
    btn.addEventListener('click', () => {
        const section = btn.dataset.section;
        if (!section) return;
        document.querySelectorAll('.side-item').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.clan-section').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        const group = btn.closest('.side-group');
        if (group) group.classList.add('open');
        const target = document.getElementById('section-' + section);
        if (target) target.classList.add('active');

        if (section === 'lists') TABS.forEach(loadList);
        else if (section === 'events') renderEvents();
        else if (section === 'treasury') renderTreasury();
        else if (section === 'pvp') renderBuilds('pvp');
        else if (section === 'pb') renderBuilds('pb');
        else if (section === 'ships') renderShips();
        else if (section === 'contacts') renderContacts();
        else if (section === 'members') { renderMembers(); renderAdmins(); }
        else if (section === 'applications') renderApplications();
        else if (section === 'online') renderClanOnlineList();
        else if (section === 'map') renderMapPreview();
        else if (section === 'resources') renderResourcesPublic();
        else if (section === 'shipcost') renderShipCost();
        else if (section === 'builder') renderBuilder();
    });
});
document.querySelectorAll('.admin-nav-group-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const g = btn.closest('.admin-nav-group');
        if (g) g.classList.toggle('open');
    });
});
document.querySelectorAll('.admin-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
        const panel = btn.dataset.apanel;
        if (!panel) return;
        document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        const group = btn.closest('.admin-nav-group');
        if (group) group.classList.add('open');
        const section = document.querySelector(`.admin-section[data-apanel="${panel}"]`);
        if (section) section.classList.add('active');

        if (panel === 'clans') renderAdminClanSelect();
        if (panel === 'alliances') renderAlliancesAdmin();
        if (panel === 'games') renderGamesAdmin();
        if (panel === 'ships') renderAdminShips();
        if (panel === 'builditems') renderBuildItemsAdmin();
        if (panel === 'partners') renderPartnersAdmin();
        if (panel === 'faq') renderFaqAdmin();
        if (panel === 'tactics') renderTacticsAdmin();
        if (panel === 'online') renderAdminOnlineList();
        if (panel === 'admins') renderSiteAdminsAdmin();
        if (panel === 'clanRequests') renderClanRequestsAdmin();
        if (panel === 'settings') renderSiteFields();
        if (panel === 'resources') renderPricingGrid();
        if (panel === 'shipcost') { renderRecipeShipSelect(); renderRecipeRows(); renderDiscountsAdmin(); }
        if (panel === 'map') renderMapAdmin();
        if (panel === 'ports') { renderFactionsAdmin(); renderPortsAdmin(); renderRanksAdmin(); fillPortFactionSelect(); }
    });
});
on('adminBackHome', 'click', () => { currentClan = null; showScreen('home'); });
/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   14.  🔑  ВХОД АДМИНА + APPLYADMINUI                                ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
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
    const err = $('adminAuthError');
    err.textContent = '';
    if (!email || !password) { err.textContent = 'Заполни email и пароль'; return; }
    if (!nickname) { err.textContent = 'Укажи ваш игровой ник'; return; }
    if (nickname.length < 2) { err.textContent = 'Ник слишком короткий'; return; }
    $('doAdminLogin').disabled = true;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    $('doAdminLogin').disabled = false;
    if (error) { err.textContent = error.message; return; }
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
    applyAdminUI();
});
on('adminPassword', 'keydown', e => { if (e.key === 'Enter') $('doAdminLogin').click(); });

async function adminLogout() {
    await supabase.auth.signOut();
    isAdmin = isOwner = isMod = false;
    siteAdminRole = myAdminClanId = null;
    currentSession = null;
    applyAdminUI();
    showScreen('home');
}
on('adminLogoutBtn',  'click', adminLogout);
on('adminLogoutBtn2', 'click', adminLogout);

supabase.auth.onAuthStateChange(async (_e, session) => {
    currentSession = session;
    await loadSiteAdmins();
    await loadClans();
    applyAdminUI();
});

function applyAdminUI() {
    const setH = (id, hidden) => { const el = $(id); if (el) el.hidden = hidden; };
    setH('adminLoginBtn',   isAdmin);
    setH('adminLogoutBtn',  !isAdmin);
    setH('adminPanelBtn',   !isAdmin);
    setH('adminLogoutBtn2', !isAdmin);
    setH('adminPanelBtn2',  !isAdmin);
    setH('adminPanelBtn3',  !isAdmin);
    setH('leaderPanelBtn',  !isClanLeader());
    setH('leaderPanelBtn2', !isClanLeader());
    setH('leaderPanelBtn3', !isClanLeader());

    const sideGroupAdmin = $('sideGroupAdmin');
    if (sideGroupAdmin) sideGroupAdmin.hidden = !canEditClan(currentClan);

    const label = isAdmin ? (isOwner ? '👑 Владелец' : siteAdminRole === 'mod' ? '🎖 Глава' : '⚙️ Админ') : '';
    ['adminInfo','adminInfo2','adminInfo3'].forEach(id => { const el = $(id); if (el) el.textContent = label; });

    document.querySelectorAll('.admin-only').forEach(el => { el.hidden = !isAdmin; if (!isAdmin) el.style.display = ''; });
    document.querySelectorAll('.add-form.admin-only').forEach(el => { el.style.display = isAdmin ? 'flex' : 'none'; });

    document.querySelectorAll('.clan-admin-only').forEach(el => {
        const show = canEditClan(currentClan);
        el.hidden = !show; if (!show) el.style.display = '';
    });
    document.querySelectorAll('.add-form.clan-admin-only').forEach(el => {
        el.style.display = canEditClan(currentClan) ? 'flex' : 'none';
    });
    document.querySelectorAll('.owner-only').forEach(el => { el.hidden = !isOwner; });

    const clearBtn = $('chatClear'); if (clearBtn) clearBtn.hidden = !isAdmin;
    renderAll();
}

function openAdminPage() {
    if (!isAdmin) return;
    const first = document.querySelector('.admin-nav-item[data-apanel="clans"]');
    if (first) first.click();
    renderAdminClanSelect();
    renderSiteFields();
    renderFaqAdmin();
    renderPartnersAdmin();
    renderGamesAdmin();
    renderTacticsAdmin();
    renderAlliancesAdmin();
    renderSiteAdminsAdmin();
    renderClanRequestsAdmin();
    showScreen('admin');
}
on('adminPanelBtn',  'click', openAdminPage);
on('adminPanelBtn2', 'click', openAdminPage);
on('adminPanelBtn3', 'click', openAdminPage);

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   15.  🏰  ГИЛЬДИИ                                                   ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
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
    renderSiteAdminsAdmin();
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
        else if (isAdmin) accessible = true;
        else accessible = !myClan || canAccessClan(clan.id);
        if (!accessible) btn.classList.add('locked');
        const imgSrc = getClanImage(clan);
        const useFlag = isClanUsingFlag(clan);
        btn.dataset.clan = clan.id;
        btn.innerHTML = `
            ${accessible ? '' : '<span class="clan-lock">🔒</span>'}
            <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(clan.name)}" class="${useFlag ? 'clan-flag' : ''}" onerror="this.style.display='none'">
            <span class="clan-name">${escapeHtml(clan.name)}</span>
            <span class="clan-desc">${escapeHtml(clan.description || '')}</span>
            <span class="clan-more">${accessible ? 'Подробнее →' : 'Только описание →'}</span>`;
        btn.addEventListener('click', () => handleClanClick(clan.id));
        grid.appendChild(btn);
    });
}
function handleClanClick(id) {
    if (isOwner) return openClan(id);
    if (isAdmin && myAdminClanId) {
        if (canAccessClan(id)) return openClan(id);
        return openClanInfo(id, { locked: true });
    }
    if (isAdmin) return openClan(id);
    const myClan = getMyClanId();
    if (!myClan) return openClanInfo(id, { locked: false });
    if (id === myClan) return openClan(id);
    if (canAccessClan(id)) return openClan(id);
    openClanInfo(id, { locked: true });
}
function renderScopeSelects() {
    const clans = Object.values(clansCache);
    ['pvpScope','pbScope','buildEditScope','buildDupScope','evScope'].forEach(id => {
        const sel = $(id); if (!sel) return;
        const current = sel.value; sel.innerHTML = '';
        const hideShared = (id === 'evScope' && !isOwner);
        if (!hideShared) {
            const opt = document.createElement('option');
            opt.value = SHARED; opt.textContent = '🌐 Общий';
            sel.appendChild(opt);
        }
        clans.forEach(c => {
            const o = document.createElement('option');
            o.value = c.id; o.textContent = '🏰 ' + c.name;
            sel.appendChild(o);
        });
        if (current && Array.from(sel.options).some(o => o.value === current)) sel.value = current;
        else if (currentClan && (id === 'pvpScope' || id === 'pbScope' || id === 'evScope')) sel.value = currentClan;
    });
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   16.  📄  ОПИСАНИЕ ГИЛЬДИИ                                           ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function openClanInfo(id, opts = {}) {
    const clan = clansCache[id]; if (!clan) return;
    pendingClanId = id;
    const locked = opts.locked === true;
    const loggedInSomewhere = isUnlocked();
    const setT = (elId, txt) => { const el = $(elId); if (el) el.textContent = txt; };

    setT('clanInfoName', clan.name);
    setT('clanInfoDesc', clan.description || '');
    setT('clanInfoRules', clan.rules || 'Правила не заданы.');

    const logoWrap = $('clanInfoLogoWrap');
    if (logoWrap) {
        const src = getClanImage(clan);
        const flag = isClanUsingFlag(clan);
        logoWrap.innerHTML = isVideoUrl(src) && !flag
            ? `<video autoplay muted loop playsinline class="${flag ? 'clan-flag' : ''}"><source src="${escapeHtml(src)}" type="video/mp4"></video>`
            : `<img src="${escapeHtml(src)}" alt="" class="${flag ? 'clan-flag' : ''}" onerror="this.style.display='none'">`;
    }
    const leaderEl = $('clanInfoLeader');
    if (leaderEl) {
        const leader = clan.leader_nick || clan.leader || '';
        if (leader) { leaderEl.hidden = false; leaderEl.textContent = '👑 Глава: ' + leader; }
        else { leaderEl.hidden = true; }
    }
    const newsWrap = $('clanInfoNewsWrap');
    if (clan.news && clan.news.trim()) { if (newsWrap) newsWrap.hidden = false; setT('clanInfoNews', clan.news); }
    else { if (newsWrap) newsWrap.hidden = true; }

    const allyWrap = $('clanInfoAllianceWrap');
    if (clan.alliance_id && alliancesCache[clan.alliance_id]) {
        const ally = alliancesCache[clan.alliance_id];
        const members = Object.values(clansCache).filter(c => c.alliance_id === ally.id && c.id !== clan.id);
        if (allyWrap) allyWrap.hidden = false;
        setT('clanInfoAlliance', `${ally.name}${ally.description ? ' — ' + ally.description : ''}\nСостоят: ${members.length ? members.map(c => c.name).join(', ') : 'только эта гильдия'}`);
    } else { if (allyWrap) allyWrap.hidden = true; }

    const loginBtn = $('clanLoginBtn'), viewBtn = $('clanViewBtn');
    if (loginBtn) loginBtn.hidden = loggedInSomewhere || locked;
    if (viewBtn) viewBtn.hidden = !loggedInSomewhere || locked;

    let lockMsg = document.getElementById('clanLockMsg');
    if (locked) {
        if (!lockMsg) {
            lockMsg = document.createElement('div');
            lockMsg.id = 'clanLockMsg';
            lockMsg.className = 'clan-info-news-wrap';
            lockMsg.style.borderColor = 'rgba(255,122,122,.5)';
            lockMsg.style.background = 'rgba(255,122,122,.08)';
            lockMsg.innerHTML = `<h3 style="color:var(--red)">🔒 Доступ ограничен</h3>
                <p class="clan-info-news">Вы уже вошли в другую гильдию. Просматривать можно только свою гильдию и гильдии из своего союза.</p>`;
            const actions = document.querySelector('.clan-info-actions');
            if (actions) actions.parentNode.insertBefore(lockMsg, actions);
        }
        lockMsg.hidden = false;
    } else if (lockMsg) lockMsg.hidden = true;

    showScreen('clan');
}
on('backToHomeBtn', 'click', () => { pendingClanId = null; showScreen('home'); });
on('clanViewBtn', 'click', () => { if (pendingClanId) openClan(pendingClanId); });

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   17.  🔐  ВХОД В ГИЛЬДИЮ                                            ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
on('clanLoginBtn', 'click', () => {
    if (!pendingClanId) return;
    const clan = clansCache[pendingClanId]; if (!clan) return;
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
        const { data: okA, error: admErr } = await supabase.rpc('verify_clan_admin_password', { cid: pendingClanId, entered });
        if (admErr || !okA) { $('clanPassError').textContent = 'Неверный пароль'; return; }
        isClanAdminLogin = true;
    }
    const adminNicks = normalizeNickList(clan.admin_nicks);
    if (adminNicks.includes(nick.toLowerCase())) isClanAdminLogin = true;
    const memberNicks = normalizeNickList(clan.members_list);
    if (memberNicks.length > 0) {
        const isKnown = isClanAdminLogin || adminNicks.includes(nick.toLowerCase());
        if (!isKnown && !memberNicks.includes(nick.toLowerCase())) {
            $('clanPassError').textContent = 'Вашего ника нет в списке участников';
            return;
        }
    }
    localStorage.setItem(VIEWER_NICK_KEY, nick);
    localStorage.setItem(UNLOCK_KEY, '1');
    localStorage.setItem(CLAN_PASS_KEY, entered);
    localStorage.setItem(CLAN_ADMIN_PASS_KEY, isClanAdminLogin ? '1' : '0');
    localStorage.setItem(MY_CLAN_KEY, pendingClanId);
    $('clanPassModal').hidden = true;
    await logView(nick, pendingClanId, isClanAdminLogin ? 'вход (админ)' : 'вход');
    sendHeartbeat();
    const tn = $('tm-nickname'); if (tn && !tn.value) tn.value = nick;
    const cid = pendingClanId; pendingClanId = null;
    openClan(cid, isClanAdminLogin);
});
on('clanNickname', 'keydown', e => { if (e.key === 'Enter') $('clanPassword').focus(); });
on('clanPassword', 'keydown', e => { if (e.key === 'Enter') $('doClanLogin').click(); });

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   18.  🤝  ПОЛОСА СОЮЗА                                              ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function updateAllianceBar() {
    const bar = $('allianceBar'), list = $('allianceBarList');
    if (!bar || !list) return;
    const my = clansCache[currentClan];
    if (!my || !my.alliance_id) { bar.hidden = true; return; }
    const ally = alliancesCache[my.alliance_id];
    const members = Object.values(clansCache).filter(c => c.alliance_id === my.alliance_id && c.id !== currentClan);
    if (!members.length) { bar.hidden = true; return; }
    bar.hidden = false;
    const lbl = bar.querySelector('.alliance-bar-label');
    if (lbl) lbl.textContent = `🤝 ${ally ? ally.name : 'Союз'}:`;
    list.innerHTML = '';
    members.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'alliance-chip';
        const src = getClanImage(c);
        const flag = isClanUsingFlag(c);
        btn.innerHTML = `<img src="${escapeHtml(src)}" class="${flag ? 'clan-flag' : ''}" onerror="this.style.display='none'"> ${escapeHtml(c.name)}`;
        btn.addEventListener('click', () => openClan(c.id, false));
        list.appendChild(btn);
    });
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   19.  🚪  ОТКРЫТИЕ ГИЛЬДИИ + ВКЛАДКИ + ПОИСК                        ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function openClan(id, isClanAdminLogin = false) {
    const clan = clansCache[id]; if (!clan) return;
    if (!isOwner) {
        if (isAdmin && myAdminClanId) { if (!canAccessClan(id)) return openClanInfo(id, { locked: true }); }
        else if (!isAdmin) {
            if (!isUnlocked()) return openClanInfo(id, { locked: false });
            const myClan = getMyClanId();
            if (!myClan) return openClanInfo(id, { locked: false });
            if (id !== myClan && !canAccessClan(id)) return openClanInfo(id, { locked: true });
        }
    }
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

    const t = $('clanTitle'); if (t) t.textContent = clan.name;
    const iconWrap = $('clanIconWrap');
    if (iconWrap) {
        const src = getClanImage(clan);
        const flag = isClanUsingFlag(clan);
        iconWrap.innerHTML = `<img src="${escapeHtml(src)}" class="${flag ? 'clan-flag' : ''}" onerror="this.style.display='none'">`;
    }
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
    renderBuilds('pvp'); renderBuilds('pb');
    renderContacts();
    renderEvents();
    renderTreasury();
    renderApplications();
    renderMembers(); renderAdmins();
    renderShips();
    renderResourcesPublic();
    sendHeartbeat();
    initRealtime();
}
on('backBtn', 'click', () => {
    currentClan = null; currentClanIsAdmin = false; currentClanPass = null;
    closeChat(); showScreen('home'); sendHeartbeat(); closeRealtime(); renderHomeCards();
});
on('clanLeaveBtn', 'click', () => {
    if (!confirm('Заблокировать просмотр? Пароль потребуется ввести снова.')) return;
    ['guild_unlocked','guild_last_clan','clan_pass','clan_admin_pass','guild_my_clan'].forEach(k => localStorage.removeItem(k));
    currentClan = null; currentClanIsAdmin = false; currentClanPass = null;
    closeChat(); closeRealtime(); showScreen('home'); sendHeartbeat(); renderHomeCards();
});
document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        currentTab = btn.dataset.tab;
        const tc = $('tab-' + currentTab); if (tc) tc.classList.add('active');
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

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   20.  📋  СПИСКИ                                                    ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
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
on('addBtn', 'click', async () => {
    if (!canEditClan(currentClan)) return;
    const pg = val('playerGuild').trim(), nick = val('nickname').trim();
    if (!pg && !nick) return flashStatus('Заполни Гильдию или Ник', '#ff7a7a');
    const data = {
        nickname: nick || null, player_guild: pg || null,
        faction: val('faction').trim() || null, note: val('note').trim() || null
    };
    if (isAdmin) {
        const { error } = await supabase.from(currentTab).insert({ ...data, clan: currentClan });
        if (error) return flashStatus('Ошибка: ' + error.message, '#ff7a7a');
    } else {
        const { data: resp, error } = await supabase.rpc('clan_admin_action', {
            action: 'insert', target_table: currentTab, target_clan: currentClan,
            entered_password: currentClanPass, data
        });
        if (error || resp?.error) return flashStatus('Ошибка: ' + (resp?.error || error.message), '#ff7a7a');
    }
    ['playerGuild','nickname','faction','note'].forEach(id => { const el = $(id); if (el) el.value = ''; });
    $('playerGuild').focus();
    flashStatus('✔ Добавлено', '#6ee7a7');
    loadList(currentTab);
});
['playerGuild','nickname','faction','note'].forEach(id => {
    on(id, 'keydown', e => { if (e.key === 'Enter') $('addBtn').click(); });
});
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
    const pg = val('editPlayerGuild').trim(), nick = val('editNickname').trim();
    if (!pg && !nick) { $('editError').textContent = 'Заполни Гильдию или Ник'; return; }
    const { tab, id } = editingItem;
    const data = {
        nickname: nick || null, player_guild: pg || null,
        faction: val('editFaction').trim() || null, note: val('editNote').trim() || null
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
    $('editModal').hidden = true; editingItem = null;
    loadList(tab);
});
['editPlayerGuild','editNickname','editFaction','editNote'].forEach(id => {
    on(id, 'keydown', e => { if (e.key === 'Enter') $('saveEdit').click(); });
});
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
    loadList(tab);
}
function openMoveModal(fromTab, id) { movingItem = { fromTab, id }; $('moveModal').hidden = false; }
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
            const { error: e1 } = await supabase.from(toTab).insert({
                nickname: data.nickname, player_guild: data.player_guild,
                faction: data.faction, note: data.note, clan: currentClan
            });
            if (e1) return alert(e1.message);
            await supabase.from(fromTab).delete().eq('id', id);
        } else {
            const { data: r1, error: e1 } = await supabase.rpc('clan_admin_action', {
                action: 'insert', target_table: toTab, target_clan: currentClan,
                entered_password: currentClanPass,
                data: { nickname: data.nickname, player_guild: data.player_guild, faction: data.faction, note: data.note }
            });
            if (e1 || r1?.error) return alert('Ошибка: ' + (r1?.error || e1.message));
            const { data: r2, error: e2 } = await supabase.rpc('clan_admin_action', {
                action: 'delete', target_table: fromTab, target_clan: currentClan,
                entered_password: currentClanPass, record_id: id
            });
            if (e2 || r2?.error) return alert('Ошибка: ' + (r2?.error || e2.message));
        }
        loadList(fromTab); loadList(toTab);
    });
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   21.  ⚔️  БИЛДЫ                                                     ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function renderBuilds(type) {
    if (!currentClan) return;
    const c = $(type === 'pvp' ? 'pvpList' : 'pbList'); if (!c) return;
    c.innerHTML = '<div class="empty">Загрузка…</div>';
    const { data, error } = await supabase.from('builds').select('*')
        .eq('type', type).or(`is_shared.eq.true,clan.eq.${currentClan}`)
        .order('created_at', { ascending: false });
    if (error) { c.innerHTML = `<div class="empty">Ошибка: ${error.message}</div>`; return; }
    if (!data?.length) { c.innerHTML = '<div class="empty">Билды пока не добавлены</div>'; return; }
    c.innerHTML = '';
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
            c.appendChild(g);
        });
    } else {
        data.forEach(item => c.appendChild(createBuildCard(item)));
    }
}
function createBuildCard(item) {
    const card = document.createElement('div');
    card.className = 'build-card';
    const up = parseLines(item.upgrades);
    const ws = parseLines(item.weapons_small);
    const wm = parseLines(item.weapons_medium);
    const wl = parseLines(item.weapons_large);
    const cons = [item.consumable1, item.consumable2, item.consumable3].filter(Boolean);
    const cargo = item.cargo ? parseLines(item.cargo) : [];
    const specs = parseSpecialists(item.specialists);
    const scope = item.is_shared
        ? `<span class="build-scope shared">🌐 Общий</span>`
        : `<span class="build-scope clan">🏰 ${escapeHtml(clansCache[item.clan]?.name || item.clan || '?')}</span>`;
    const rank = (item.type === 'pb' && item.rank) ? `<span class="build-rank">Ранг ${escapeHtml(item.rank)}</span>` : '';
    const canEdit = canEditClan(item.clan) || isAdmin;
    const actions = `<div class="build-actions">
        <button class="share" title="Скопировать ссылку">🔗</button>
        ${canEdit ? `<button class="edit">✏️</button><button class="copy">📋</button><button class="delete">🗑</button>` : ''}
    </div>`;
    card.innerHTML = `
        <div class="build-header">
            <h3 class="build-ship">${escapeHtml(item.ship_name)}</h3>
            ${rank}${scope}${actions}
        </div>
        ${up.length ? `<div class="build-section"><div class="build-section-label">🔧 Апгрейды</div><div class="build-chips">${up.map(u => `<span class="chip chip-upgrade">${escapeHtml(u)}</span>`).join('')}</div></div>` : ''}
        ${ws.length ? `<div class="build-section"><div class="build-section-label">🟢 Малые пушки (до 12ф)</div><div class="build-chips">${ws.map(w => `<span class="chip chip-weap-small">${escapeHtml(w)}</span>`).join('')}</div></div>` : ''}
        ${wm.length ? `<div class="build-section"><div class="build-section-label">🟡 Средние пушки (до 24ф)</div><div class="build-chips">${wm.map(w => `<span class="chip chip-weap-medium">${escapeHtml(w)}</span>`).join('')}</div></div>` : ''}
        ${wl.length ? `<div class="build-section"><div class="build-section-label">🔴 Большие пушки (до 48ф)</div><div class="build-chips">${wl.map(w => `<span class="chip chip-weap-large">${escapeHtml(w)}</span>`).join('')}</div></div>` : ''}
        ${cons.length ? `<div class="build-section"><div class="build-section-label">⚗️ Расходники</div><div class="build-chips">${cons.map(cc => `<span class="chip chip-cons">${escapeHtml(cc)}</span>`).join('')}</div></div>` : ''}
        ${cargo.length ? `<div class="build-section"><div class="build-section-label">📦 Трюм</div><div class="build-chips">${cargo.map(cc => `<span class="chip chip-cargo">${escapeHtml(cc)}</span>`).join('')}</div></div>` : ''}
        ${specs.length ? `<div class="build-section"><div class="build-section-label">👤 Специалисты</div><div class="spec-list">${specs.map(s => `<div class="spec-item"><div class="spec-name">${escapeHtml(s.name)}</div>${s.bonuses.length ? `<div class="spec-bonuses">${s.bonuses.map(b => { const cls = b.value === null ? 'neutral' : (b.value > 0 ? 'plus' : 'minus'); const v = b.value === null ? '' : ` ${b.value > 0 ? '+' : ''}${b.value}`; return `<span class="spec-bonus ${cls}">${escapeHtml(b.stat)}${v}</span>`; }).join('')}</div>` : ''}</div>`).join('')}</div></div>` : ''}`;
    card.querySelector('.share').addEventListener('click', () => {
        const url = `${location.origin}${location.pathname}#build=${item.id}`;
        navigator.clipboard.writeText(url).then(() => alert('🔗 Ссылка скопирована!'), () => prompt('Скопируйте:', url));
    });
    if (canEdit) {
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
    const st = $(`${type}Status`);
    if (!ship) return flashStatusEl(st, 'Введите название корабля', '#ff7a7a');
    if (!isPvp && !rank) return flashStatusEl(st, 'Укажите ранг', '#ff7a7a');
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
        if (error) return flashStatusEl(st, 'Ошибка: ' + error.message, '#ff7a7a');
    } else {
        const { data: resp, error } = await supabase.rpc('clan_admin_action', {
            action: 'insert', target_table: 'builds', target_clan: currentClan,
            entered_password: currentClanPass, data: { ...data, is_shared: false }
        });
        if (error || resp?.error) return flashStatusEl(st, 'Ошибка: ' + (resp?.error || error.message), '#ff7a7a');
    }
    await logAdminAction(`Добавил билд ${type.toUpperCase()}`, ship);
    ['Rank','Ship','Upgrades','WeapS','WeapM','WeapL','Cons1','Cons2','Cons3','Cargo','Specs'].forEach(s => { const el = $(`${type}${s}`); if (el) el.value = ''; });
    flashStatusEl(st, '✔ Добавлено', '#6ee7a7');
    renderBuilds(type);
}
on('pvpAddBtn', 'click', () => addBuild('pvp'));
on('pbAddBtn', 'click', () => addBuild('pb'));
function openBuildEdit(item) {
    editingBuild = { id: item.id, type: item.type, clan: item.clan };
    const t = $('buildEditTitle');
    if (t) t.textContent = item.type === 'pvp' ? '✏️ Редактировать ПВП-билд' : '✏️ Редактировать ПБ-билд';
    const rf = $('buildEditRankField');
    if (item.type === 'pb') { if (rf) rf.hidden = false; $('buildEditRank').value = item.rank || ''; }
    else { if (rf) rf.hidden = true; $('buildEditRank').value = ''; }
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
    const it = duplicatingBuild;
    if (!isAdmin) { msg.textContent = 'Только админ сайта'; msg.style.color = '#ff7a7a'; return; }
    const { error } = await supabase.from('builds').insert({
        clan: clanValue, is_shared: isShared, type: it.type, rank: it.rank || null, ship_name: it.ship_name,
        upgrades: it.upgrades || null, weapons_small: it.weapons_small || null, weapons_medium: it.weapons_medium || null,
        weapons_large: it.weapons_large || null, consumable1: it.consumable1 || null, consumable2: it.consumable2 || null,
        consumable3: it.consumable3 || null, cargo: it.cargo || null, specialists: it.specialists || null
    });
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    msg.textContent = '✔ Копия создана'; msg.style.color = '#6ee7a7';
    setTimeout(() => { $('buildDupModal').hidden = true; duplicatingBuild = null; renderBuilds(it.type); }, 700);
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
    renderBuilds(type);
}
async function handleBuildHash() {
    const m = location.hash.match(/^#build=([a-f0-9-]+)$/i); if (!m) return;
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

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   22.  📅  СОБЫТИЯ                                                   ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function renderEvents() {
    if (!currentClan) return;
    const c = $('eventsList'); if (!c) return;
    c.innerHTML = '<div class="empty">Загрузка…</div>';
    const { data, error } = await supabase.from('events').select('*')
        .or(`is_shared.eq.true,clan.eq.${currentClan}`).order('event_date', { ascending: true });
    if (error) { c.innerHTML = `<div class="empty">Ошибка: ${error.message}</div>`; return; }
    if (!data?.length) { c.innerHTML = '<div class="empty">Событий пока нет</div>'; return; }
    c.innerHTML = '';
    const now = Date.now();
    const months = ['ЯНВ','ФЕВ','МАР','АПР','МАЯ','ИЮН','ИЮЛ','АВГ','СЕН','ОКТ','НОЯ','ДЕК'];
    data.forEach(ev => {
        const d = new Date(ev.event_date);
        const isPast = d.getTime() < now;
        const day = String(d.getDate()).padStart(2, '0');
        const mon = months[d.getMonth()];
        const time = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
        const card = document.createElement('div');
        card.className = 'event-card' + (isPast ? ' past' : '');
        const scope = ev.is_shared
            ? `<span class="event-badge shared">🌐 Общий</span>`
            : `<span class="event-badge clan">🏰 ${escapeHtml(clansCache[ev.clan]?.name || ev.clan)}</span>`;
        const canDel = canEditClan(ev.clan);
        const hasMap = Array.isArray(ev.map_markers) && ev.map_markers.length;
        const mapBtn = hasMap ? `<button type="button" class="event-map-btn">🗺 Карта</button>` : '';
        const actions = `<div class="event-actions">${mapBtn}${canDel ? `<button class="delete">🗑</button>` : ''}</div>`;
        card.innerHTML = `
            <div class="event-date-block"><div class="event-day">${day}</div><div class="event-month">${mon}</div></div>
            <div class="event-info">
                <div class="event-title">${scope}${escapeHtml(ev.title)}</div>
                <div class="event-time">🕐 ${d.toLocaleDateString('ru-RU')} в ${time}</div>
                ${ev.description ? `<div class="event-desc">${escapeHtml(ev.description)}</div>` : ''}
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
        const mb = card.querySelector('.event-map-btn');
        if (mb) mb.addEventListener('click', e => { e.stopPropagation(); openEventMapView(ev.map_markers || [], ev.title || 'Событие'); });
        c.appendChild(card);
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
    const st = $('evStatus');
    if (!title) return flashStatusEl(st, 'Введите название', '#ff7a7a');
    if (!dateStr) return flashStatusEl(st, 'Укажите дату', '#ff7a7a');
    if (isShared && !isOwner) return flashStatusEl(st, 'Общие события создаёт только владелец', '#ff7a7a');

    let markers = [];
    try { markers = JSON.parse(val('evMapData') || '[]'); } catch (e) { markers = []; }

    if (isAdmin) {
        const { error } = await supabase.from('events').insert({
            clan: clanVal, is_shared: isShared, title,
            event_date: new Date(dateStr).toISOString(),
            description: desc || null, map_markers: markers.length ? markers : null
        });
        if (error) return flashStatusEl(st, 'Ошибка: ' + error.message, '#ff7a7a');
    } else {
        const { data: resp, error } = await supabase.rpc('clan_admin_action', {
            action: 'insert', target_table: 'events', target_clan: currentClan,
            entered_password: currentClanPass,
            data: { title, event_date: new Date(dateStr).toISOString(), description: desc || null, map_markers: markers.length ? markers : null }
        });
        if (error || resp?.error) return flashStatusEl(st, 'Ошибка: ' + (resp?.error || error.message), '#ff7a7a');
    }
    await logAdminAction('Добавил событие', title, markers.length ? `меток: ${markers.length}` : null);
    ['evTitle','evDate','evDesc'].forEach(id => { const el = $(id); if (el) el.value = ''; });
    const md = $('evMapData'); if (md) md.value = '';
    updateEvMapInfo();
    flashStatusEl(st, '✔ Добавлено', '#6ee7a7');
    renderEvents();
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   23.  🗺️  КАРТА СОБЫТИЙ (v2.5.0)                                    ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function getMarkerMeta(type) { return EVENT_MARKER_TYPES[type] || EVENT_MARKER_TYPES.point; }
function getMapUrls() {
    const s = settingsCache || {};
    return {
        detailed: s.map_detailed_url || MAP_DEFAULT_DETAILED,
        clean:    s.map_clean_url    || MAP_DEFAULT_CLEAN
    };
}
function renderEventMapMarkers() {
    const layer = $('eventMapMarkers'); if (!layer) return;
    layer.innerHTML = '';
    evMapMarkers.forEach(m => {
        const meta = getMarkerMeta(m.type);
        const el = document.createElement('div');
        el.className = 'event-map-marker';
        el.style.left = m.x + '%';
        el.style.top = m.y + '%';
        el.style.background = meta.color;
        el.innerHTML = `${meta.icon}<span class="eml-label">${escapeHtml(meta.label)}</span>`;
        el.addEventListener('click', e => {
            e.stopPropagation();
            if (!confirm(`Удалить метку «${meta.label}»?`)) return;
            evMapMarkers = evMapMarkers.filter(x => x.id !== m.id);
            renderEventMapMarkers(); renderEventMapMarkerList();
        });
        layer.appendChild(el);
    });
}
function renderEventMapMarkerList() {
    const c = $('eventMapMarkerList'); if (!c) return;
    c.innerHTML = '';
    if (!evMapMarkers.length) return;
    evMapMarkers.forEach(m => {
        const meta = getMarkerMeta(m.type);
        const chip = document.createElement('span');
        chip.className = 'event-map-marker-chip';
        chip.innerHTML = `<span class="emc-ico">${meta.icon}</span><span>${escapeHtml(meta.label)}</span><button class="emc-del" type="button">✕</button>`;
        chip.querySelector('.emc-del').addEventListener('click', () => {
            evMapMarkers = evMapMarkers.filter(x => x.id !== m.id);
            renderEventMapMarkers(); renderEventMapMarkerList();
        });
        c.appendChild(chip);
    });
}
function openEventMapEditor(existing) {
    evMapMarkers = Array.isArray(existing) ? JSON.parse(JSON.stringify(existing)) : [];
    evMapCurrentType = 'target';
    document.querySelectorAll('#eventMapMarkerTypes .marker-type-chip').forEach(ch => {
        ch.classList.toggle('active', ch.dataset.mtype === 'target');
    });
    const urls = getMapUrls();
    const img = $('eventMapImg');
    const view = val('evMapType') || 'detailed';
    if (img) img.src = view === 'clean' ? urls.clean : urls.detailed;
    const msg = $('eventMapMsg'); if (msg) msg.textContent = '';
    $('eventMapEditorModal').hidden = false;
    renderEventMapMarkers();
    renderEventMapMarkerList();
}
function closeEventMapEditor() { const m = $('eventMapEditorModal'); if (m) m.hidden = true; }
on('eventMapInner', 'click', e => {
    if (e.target.closest('.event-map-marker')) return;
    const inner = $('eventMapInner'); if (!inner) return;
    const rect = inner.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (x < 0 || x > 100 || y < 0 || y > 100) return;
    const meta = getMarkerMeta(evMapCurrentType);
    evMapMarkers.push({
        id: 'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        x: +x.toFixed(2), y: +y.toFixed(2),
        type: evMapCurrentType, label: meta.label
    });
    renderEventMapMarkers();
    renderEventMapMarkerList();
});
document.querySelectorAll('#eventMapMarkerTypes .marker-type-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        document.querySelectorAll('#eventMapMarkerTypes .marker-type-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        evMapCurrentType = chip.dataset.mtype;
    });
});
on('evMapType', 'change', e => {
    const urls = getMapUrls();
    const img = $('eventMapImg');
    if (img) img.src = e.target.value === 'clean' ? urls.clean : urls.detailed;
});
on('eventMapSave', 'click', () => {
    const payload = evMapMarkers.length ? JSON.stringify(evMapMarkers) : '';
    const hidden = $('evMapData'); if (hidden) hidden.value = payload;
    updateEvMapInfo();
    closeEventMapEditor();
});
on('eventMapClear', 'click', () => {
    if (!evMapMarkers.length) return;
    if (!confirm('Удалить все метки?')) return;
    evMapMarkers = [];
    renderEventMapMarkers(); renderEventMapMarkerList();
});
on('eventMapCancel', 'click', closeEventMapEditor);
on('eventMapEditorModal', 'click', e => { if (e.target.id === 'eventMapEditorModal') closeEventMapEditor(); });
on('evMapBtn', 'click', () => {
    let existing = [];
    try { existing = JSON.parse(val('evMapData') || '[]'); } catch (e) { existing = []; }
    openEventMapEditor(existing);
});
function updateEvMapInfo() {
    const info = $('evMapInfo'); if (!info) return;
    let n = 0;
    try { n = (JSON.parse(val('evMapData') || '[]') || []).length; } catch (e) { n = 0; }
    info.textContent = n ? `🗺 ${n} метк${n === 1 ? 'а' : 'и'}` : '';
}
function openEventMapView(markers, title) {
    const modal = $('eventMapViewModal'); if (!modal) return;
    $('eventMapViewTitle').textContent = `🗺 ${title || 'Карта события'}`;
    const urls = getMapUrls();
    const img = $('eventMapViewImg'); if (img) img.src = urls.detailed;
    const layer = $('eventMapViewMarkers'); if (layer) layer.innerHTML = '';
    const listEl = $('eventMapViewList'); if (listEl) listEl.innerHTML = '';
    (markers || []).forEach(m => {
        const meta = getMarkerMeta(m.type);
        if (layer) {
            const el = document.createElement('div');
            el.className = 'event-map-marker';
            el.style.left = m.x + '%'; el.style.top = m.y + '%';
            el.style.background = meta.color;
            el.innerHTML = `${meta.icon}<span class="eml-label">${escapeHtml(meta.label)}</span>`;
            layer.appendChild(el);
        }
        if (listEl) {
            const chip = document.createElement('span');
            chip.className = 'event-map-marker-chip';
            chip.innerHTML = `<span class="emc-ico">${meta.icon}</span><span>${escapeHtml(meta.label)}</span>`;
            listEl.appendChild(chip);
        }
    });
    modal.hidden = false;
}
on('eventMapViewClose', 'click', () => { const m = $('eventMapViewModal'); if (m) m.hidden = true; });
on('eventMapViewModal', 'click', e => { if (e.target.id === 'eventMapViewModal') $('eventMapViewModal').hidden = true; });

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   24.  💰  КАЗНА                                                     ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function renderTreasury() {
    if (!currentClan) return;
    const c = $('treasuryList'); if (!c) return;
    c.innerHTML = '<div class="empty">Загрузка…</div>';
    const { data, error } = await supabase.from('treasury').select('*').eq('clan', currentClan).order('created_at', { ascending: false });
    if (error) { c.innerHTML = `<div class="empty">Ошибка: ${error.message}</div>`; return; }
    const list = data || [];
    let balance = 0;
    list.forEach(t => { const a = Number(t.amount) || 0; balance += t.type === 'in' ? a : -a; });
    const balEl = $('treasuryBalance');
    if (balEl) { balEl.textContent = balance.toLocaleString('ru-RU'); balEl.classList.toggle('negative', balance < 0); }
    if (!list.length) { c.innerHTML = '<div class="empty">Операций пока нет</div>'; return; }
    c.innerHTML = '';
    list.forEach(t => {
        const a = Number(t.amount) || 0;
        const d = new Date(t.created_at);
        const ds = d.toLocaleDateString('ru-RU') + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
        const item = document.createElement('div');
        item.className = 'treasury-item ' + (t.type === 'in' ? 'in' : 'out');
        const canDel = canEditClan(currentClan);
        item.innerHTML = `
            <div class="treasury-amount">${t.type === 'in' ? '+' : '−'}${a.toLocaleString('ru-RU')}</div>
            <div class="treasury-info"><div class="treasury-desc">${escapeHtml(t.description || '—')}</div><div class="treasury-date">${ds}</div></div>
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
        c.appendChild(item);
    });
}
on('trAddBtn', 'click', async () => {
    if (!canEditClan(currentClan)) return;
    const type = val('trType');
    const amount = Number(val('trAmount'));
    const desc = val('trDesc').trim();
    const st = $('trStatus');
    if (!amount || amount <= 0) return flashStatusEl(st, 'Сумма > 0', '#ff7a7a');
    if (!desc) return flashStatusEl(st, 'Добавьте описание', '#ff7a7a');
    if (isAdmin) {
        const { error } = await supabase.from('treasury').insert({ clan: currentClan, type, amount, description: desc });
        if (error) return flashStatusEl(st, 'Ошибка: ' + error.message, '#ff7a7a');
    } else {
        const { data: resp, error } = await supabase.rpc('clan_admin_action', {
            action: 'insert', target_table: 'treasury', target_clan: currentClan,
            entered_password: currentClanPass, data: { type, amount, description: desc }
        });
        if (error || resp?.error) return flashStatusEl(st, 'Ошибка: ' + (resp?.error || error.message), '#ff7a7a');
    }
    $('trAmount').value = ''; $('trDesc').value = '';
    flashStatusEl(st, '✔ Добавлено', '#6ee7a7');
    renderTreasury();
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   25.  👥  УЧАСТНИКИ И АДМИНЫ ГИЛЬДИИ                                ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function renderMembers() {
    if (!currentClan) return;
    const c = $('membersList'); if (!c) return;
    const parsed = parseMembersList(clansCache[currentClan]?.members_list || '');
    if (!parsed.length) { c.innerHTML = '<div class="empty">Список участников пока пуст</div>'; return; }
    c.innerHTML = parsed.map(m => `
        <div class="member-row"><span class="member-num">${m.num || '•'}</span><span class="member-name">${escapeHtml(m.name)}</span></div>
    `).join('');
}
function renderAdmins() {
    if (!currentClan) return;
    const c = $('adminsList'); if (!c) return;
    const parsed = parseMembersList(clansCache[currentClan]?.admin_nicks || '');
    if (!parsed.length) { c.innerHTML = '<div class="empty">Список адмиралов пока пуст</div>'; return; }
    c.innerHTML = parsed.map(m => `
        <div class="member-row admin"><span class="member-num">👑</span><span class="member-name">${escapeHtml(m.name)}</span></div>
    `).join('');
}
on('membersUploadBtn', 'click', () => {
    if (!canEditClan(currentClan)) return;
    const fi = $('membersFileInput'); if (fi) { fi.value = ''; fi.click(); }
});
on('membersFileInput', 'change', async e => {
    const file = e.target.files[0]; if (!file) return;
    if (!canEditClan(currentClan)) { alert('Нет прав'); return; }
    const st = $('membersUploadStatus');
    if (st) st.textContent = '⏳ Чтение…';
    try {
        const text = await file.text();
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (!lines.length) { if (st) st.textContent = '⚠️ Файл пуст'; return; }
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
        if (st) st.textContent = `✔ Загружено ${nicks.length} участников`;
        renderMembers();
    } catch (err) { if (st) st.textContent = '❌ Ошибка: ' + err.message; }
});
on('clanAdminNicksSave', 'click', async () => {
    if (!canEditClan(currentClan)) return;
    const val_ = val('clanAdminNicksInput').trim();
    const st = $('clanAdminNicksStatus');
    try {
        if (isAdmin) {
            const { error } = await supabase.from('clans').update({ admin_nicks: val_ }).eq('id', currentClan);
            if (error) throw new Error(error.message);
        } else {
            const { data: resp, error } = await supabase.rpc('clan_admin_action', {
                action: 'update', target_table: 'clans', target_clan: currentClan,
                entered_password: currentClanPass, record_id: currentClan, data: { admin_nicks: val_ }
            });
            if (error || resp?.error) throw new Error(resp?.error || error.message);
        }
        if (clansCache[currentClan]) clansCache[currentClan].admin_nicks = val_;
        if (st) { st.textContent = '✔ Сохранено'; st.style.color = 'var(--green)'; }
        renderAdmins();
    } catch (err) { if (st) { st.textContent = '❌ ' + err.message; st.style.color = 'var(--red)'; } }
});
/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   26.  💬  КОНТАКТЫ                                                  ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function renderContacts() {
    const c = $('contactsList'); if (!c) return;
    c.innerHTML = '';
    let clans = [];
    if (isOwner) clans = Object.values(clansCache);
    else if (isAdmin && myAdminClanId) {
        const my = clansCache[myAdminClanId];
        if (my) clans = Object.values(clansCache).filter(x => x.id === myAdminClanId || (my.alliance_id && x.alliance_id === my.alliance_id));
    } else if (isAdmin) clans = Object.values(clansCache);
    else if (currentClan && clansCache[currentClan]?.alliance_id) {
        const ally = clansCache[currentClan].alliance_id;
        clans = Object.values(clansCache).filter(x => x.alliance_id === ally);
    } else if (currentClan) clans = [clansCache[currentClan]].filter(Boolean);

    if (!clans.length) { c.innerHTML = '<div class="empty">Гильдий пока нет</div>'; return; }
    clans.forEach(clan => {
        const card = document.createElement('div');
        card.className = 'contact-card';
        const hasLink = clan.discord && clan.discord.trim();
        card.innerHTML = `
            <img src="${escapeHtml(getClanImage(clan))}" class="${isClanUsingFlag(clan) ? 'clan-flag' : ''}" onerror="this.style.display='none'">
            <div class="contact-info">
                <div class="contact-name">${escapeHtml(clan.name)}</div>
                <div class="contact-discord">${hasLink ? escapeHtml(clan.discord) : 'Ссылка не указана'}</div>
            </div>
            ${hasLink ? `<a class="contact-btn" href="${escapeHtml(clan.discord)}" target="_blank" rel="noopener">💬 Discord</a>` : `<span class="contact-btn disabled">💬 Нет ссылки</span>`}`;
        c.appendChild(card);
    });
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   27.  📝  ЗАЯВКИ В ГИЛЬДИЮ                                          ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function renderApplications() {
    const c = $('applicationsList');
    if (!c || !isAdmin) return;
    c.innerHTML = '<div class="empty">Загрузка…</div>';
    const { data, error } = await supabase.from('applications').select('*').order('created_at', { ascending: false });
    if (error) { c.innerHTML = `<div class="empty">Ошибка: ${error.message}</div>`; return; }
    if (!data?.length) { c.innerHTML = '<div class="empty">Заявок пока нет</div>'; return; }
    c.innerHTML = '';
    data.forEach(app => {
        const d = new Date(app.created_at);
        const ds = d.toLocaleDateString('ru-RU') + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
        const card = document.createElement('div');
        card.className = 'application-card ' + (app.status || 'new');
        const targetName = app.target_clan && clansCache[app.target_clan] ? clansCache[app.target_clan].name : (app.target_clan || '—');
        card.innerHTML = `
            <div class="application-head">
                <div class="application-nick">👤 ${escapeHtml(app.nickname)}</div>
                <div class="application-date">${ds}</div>
            </div>
            <div class="application-grid">
                <div><b>Возраст</b>${escapeHtml(app.age || '—')}</div>
                <div><b>Опыт</b>${escapeHtml(app.experience || '—')}</div>
                <div><b>Контакт</b>${escapeHtml(app.contact || '—')}</div>
                <div><b>Гильдия</b>${escapeHtml(targetName)}</div>
            </div>
            ${app.why ? `<div class="application-why">${escapeHtml(app.why)}</div>` : ''}
            <div class="application-actions">
                ${app.status !== 'approved' ? `<button class="approve">✅ Принять</button>` : ''}
                ${app.status !== 'rejected' ? `<button class="reject">❌ Отклонить</button>` : ''}
                <button class="delete">🗑 Удалить</button>
            </div>`;
        card.querySelector('.approve')?.addEventListener('click', () => updateAppStatus(app.id, 'approved'));
        card.querySelector('.reject')?.addEventListener('click', () => updateAppStatus(app.id, 'rejected'));
        card.querySelector('.delete')?.addEventListener('click', async () => {
            if (!confirm('Удалить заявку?')) return;
            await supabase.from('applications').delete().eq('id', app.id);
            renderApplications();
        });
        c.appendChild(card);
    });
}
async function updateAppStatus(id, status) {
    const { error } = await supabase.from('applications').update({ status }).eq('id', id);
    if (error) return alert(error.message);
    renderApplications();
}
function renderApplyClanSelect() {
    const sel = $('applyClan'); if (!sel) return;
    sel.innerHTML = '<option value="">— Не выбрано —</option>';
    const list = currentGame ? getClansForGame(currentGame) : Object.values(clansCache);
    list.forEach(x => { const o = document.createElement('option'); o.value = x.id; o.textContent = x.name; sel.appendChild(o); });
}
on('applyBtn', 'click', async () => {
    const nick = val('applyNick').trim(), why = val('applyWhy').trim();
    const msg = $('applyMsg'); msg.style.color = '';
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
    msg.textContent = '✔ Заявка отправлена!'; msg.style.color = '#6ee7a7';
    ['applyNick','applyAge','applyExp','applyContact','applyWhy'].forEach(id => { const el = $(id); if (el) el.value = ''; });
    $('applyClan').value = '';
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   28.  ❓  FAQ                                                       ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadFaq() {
    const { data, error } = await supabase.from('faq').select('*').order('sort_order');
    if (error) return;
    faqCache = data || [];
    renderFaq();
    renderFaqAdmin();
}
function renderFaq() {
    const c = $('faqList'); if (!c) return;
    c.innerHTML = '';
    if (!faqCache.length) { c.innerHTML = '<div class="empty">Пока нет вопросов</div>'; return; }
    faqCache.forEach(item => {
        const det = document.createElement('details');
        det.className = 'faq-item';
        det.innerHTML = `<summary class="faq-q">${escapeHtml(item.question)}</summary><div class="faq-a">${escapeHtml(item.answer)}</div>`;
        c.appendChild(det);
    });
}
function renderFaqAdmin() {
    const c = $('faqAdminList'); if (!c) return;
    c.innerHTML = '';
    if (!faqCache.length) { c.innerHTML = '<div class="empty">Пока нет</div>'; return; }
    faqCache.forEach(item => {
        const el = document.createElement('div');
        el.className = 'faq-admin-item';
        el.innerHTML = `<div class="txt"><b>${escapeHtml(item.question)}</b><span>${escapeHtml(item.answer)}</span></div><button>🗑</button>`;
        el.querySelector('button').addEventListener('click', async () => {
            if (!confirm('Удалить вопрос?')) return;
            await supabase.from('faq').delete().eq('id', item.id);
            loadFaq();
        });
        c.appendChild(el);
    });
}
on('faqAddBtn', 'click', async () => {
    const q = val('faqQ').trim(), a = val('faqA').trim();
    if (!q || !a) return alert('Заполни вопрос и ответ');
    const { error } = await supabase.from('faq').insert({ question: q, answer: a, sort_order: faqCache.length + 1 });
    if (error) return alert(error.message);
    $('faqQ').value = ''; $('faqA').value = '';
    loadFaq();
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   29.  🤝  ПАРТНЁРЫ                                                  ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadPartners() {
    const { data, error } = await supabase.from('partners').select('*').order('sort_order').order('created_at');
    if (error) return;
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
        const p = u.pathname.replace(/^\/+/, '').replace(/\/+$/, '');
        if (!p) return '';
        if (p.startsWith('@')) return p.split('/')[0];
        if (p.startsWith('channel/')) return p.replace('channel/', '').split('/')[0];
        if (p.startsWith('c/')) return p.replace('c/', '').split('/')[0];
        if (p.startsWith('user/')) return p.replace('user/', '').split('/')[0];
        return p.split('/')[0] || '';
    } catch { return ''; }
}
function getPartnerLogo(p) {
    if (p.logo_url && p.logo_url.startsWith('data:')) return p.logo_url;
    const h = extractYouTubeHandle(p.url);
    if (h) return `https://unavatar.io/youtube/${h}`;
    if (p.logo_url) return p.logo_url;
    return null;
}
function renderPartnersHome() {
    const section = $('partnersSection'), list = $('partnersList');
    if (!section || !list) return;
    list.innerHTML = '';
    if (!partnersCache.length) { section.hidden = true; return; }
    section.hidden = false;
    partnersCache.forEach(p => list.appendChild(isYouTubeUrl(p.url) ? createYouTubeCard(p) : createPartnerCard(p)));
}
function createYouTubeCard(p) {
    const a = document.createElement('a');
    a.className = 'yt-promo-card';
    a.href = p.url; a.target = '_blank'; a.rel = 'noopener';
    const img = document.createElement('img');
    img.className = 'yt-promo-logo'; img.alt = p.name;
    img.src = getPartnerLogo(p) || 'images/aov.png';
    img.onerror = () => { img.onerror = null; img.src = 'images/aov.png'; };
    const info = document.createElement('div');
    info.className = 'yt-promo-info';
    info.innerHTML = `<div class="yt-promo-name">${escapeHtml(p.name)}</div>${p.description ? `<div class="yt-promo-desc">${escapeHtml(p.description)}</div>` : ''}<div class="yt-promo-btn">Смотреть на YouTube</div>`;
    a.appendChild(img); a.appendChild(info); return a;
}
function createPartnerCard(p) {
    const a = document.createElement('a');
    a.className = 'partner-card';
    a.href = p.url; a.target = '_blank'; a.rel = 'noopener';
    const logoEl = document.createElement('div');
    logoEl.className = 'partner-logo';
    const src = getPartnerLogo(p);
    if (src) {
        const img = document.createElement('img');
        img.src = src; img.alt = '';
        img.onerror = () => img.replaceWith(makePartnerLetter(p.name));
        logoEl.appendChild(img);
    } else logoEl.appendChild(makePartnerLetter(p.name));
    const info = document.createElement('div');
    info.className = 'partner-info';
    info.innerHTML = `<div class="partner-name">${escapeHtml(p.name)}</div>${p.description ? `<div class="partner-desc">${escapeHtml(p.description)}</div>` : ''}<div class="partner-link">🔗 ${escapeHtml(p.url)}</div>`;
    a.appendChild(logoEl); a.appendChild(info); return a;
}
function makePartnerLetter(name) {
    const s = document.createElement('span');
    s.className = 'partner-letter';
    s.textContent = (name || '?').trim()[0]?.toUpperCase() || '?';
    s.style.background = colorFromString(name || '?');
    return s;
}
function renderPartnersAdmin() {
    const c = $('partnersAdminList'); if (!c) return;
    c.innerHTML = '';
    if (!partnersCache.length) { c.innerHTML = '<div class="empty">Пока нет партнёров</div>'; return; }
    partnersCache.forEach((p, idx) => {
        const el = document.createElement('div');
        el.className = 'partners-admin-item';
        const letter = (p.name || '?')[0].toUpperCase();
        const src = getPartnerLogo(p);
        const logoHtml = src ? `<img src="${escapeHtml(src)}" onerror="this.outerHTML='<span>${escapeHtml(letter)}</span>'">` : `<span>${escapeHtml(letter)}</span>`;
        el.innerHTML = `
            <div class="logo-mini">${logoHtml}</div>
            <div class="txt"><b>${escapeHtml(p.name)}</b><a href="${escapeHtml(p.url)}" target="_blank" rel="noopener">${escapeHtml(p.url)}</a></div>
            <div class="actions">
                <button class="up" ${idx === 0 ? 'disabled style="opacity:.3"' : ''}>▲</button>
                <button class="down" ${idx === partnersCache.length - 1 ? 'disabled style="opacity:.3"' : ''}>▼</button>
                <button class="delete">🗑</button>
            </div>`;
        el.querySelector('.up')?.addEventListener('click', () => movePartner(p.id, -1));
        el.querySelector('.down')?.addEventListener('click', () => movePartner(p.id, +1));
        el.querySelector('.delete').addEventListener('click', () => deletePartner(p.id));
        c.appendChild(el);
    });
}
async function movePartner(id, dir) {
    const idx = partnersCache.findIndex(p => p.id === id); if (idx === -1) return;
    const sw = idx + dir; if (sw < 0 || sw >= partnersCache.length) return;
    const a = partnersCache[idx], b = partnersCache[sw];
    await supabase.from('partners').update({ sort_order: sw }).eq('id', a.id);
    await supabase.from('partners').update({ sort_order: idx }).eq('id', b.id);
    await loadPartners();
}
async function deletePartner(id) {
    if (!confirm('Удалить партнёра?')) return;
    await supabase.from('partners').delete().eq('id', id);
    await loadPartners();
}
on('partnerLogoPick', 'click', () => $('partnerLogoFile').click());
on('partnerLogoFile', 'change', async e => {
    const file = e.target.files[0]; if (!file) return;
    try {
        const data = await compressSquare(file, 256, 0.9);
        window.__partnerLogoData = data;
        $('partnerLogoImg').src = data;
        $('partnerLogoPreview').hidden = false;
        $('partnerLogoName').textContent = file.name;
    } catch (err) { alert('Не удалось загрузить: ' + err.message); }
});
on('partnerLogoClear', 'click', () => {
    window.__partnerLogoData = null;
    $('partnerLogoFile').value = '';
    $('partnerLogoPreview').hidden = true;
    $('partnerLogoName').textContent = '';
});
on('partnerAddBtn', 'click', async () => {
    const name = val('partnerName').trim(), url = val('partnerUrl').trim(), desc = val('partnerDesc').trim();
    const st = $('partnerStatus');
    if (!name) return flashStatusEl(st, 'Укажи название', '#ff7a7a');
    if (!url) return flashStatusEl(st, 'Укажи ссылку', '#ff7a7a');
    if (!/^https?:\/\//i.test(url)) return flashStatusEl(st, 'Ссылка с http(s)://', '#ff7a7a');
    const { error } = await supabase.from('partners').insert({
        name, url, logo_url: window.__partnerLogoData || null, description: desc || null, sort_order: partnersCache.length
    });
    if (error) return flashStatusEl(st, 'Ошибка: ' + error.message, '#ff7a7a');
    ['partnerName','partnerUrl','partnerDesc'].forEach(id => { const el = $(id); if (el) el.value = ''; });
    window.__partnerLogoData = null;
    $('partnerLogoFile').value = '';
    $('partnerLogoPreview').hidden = true;
    $('partnerLogoName').textContent = '';
    flashStatusEl(st, '✔ Добавлено', '#6ee7a7');
    await loadPartners();
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   30.  📖  ТАКТИКА                                                   ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadTactics() {
    try {
        const { data, error } = await supabase.from('tactics').select('*').order('sort_order');
        tacticsCache = error ? [] : (data || []);
    } catch (e) { tacticsCache = []; }
    renderTacticsModal();
    renderTacticsAdmin();
}
function renderTacticsModal() {
    const body = $('tacticsBody'); if (!body) return;
    body.innerHTML = '';
    if (!tacticsCache.length) { body.innerHTML = '<p class="empty" style="text-align:center;padding:20px;">Разделы тактики пока не добавлены.</p>'; return; }
    tacticsCache.forEach(t => {
        const sec = document.createElement('section');
        sec.className = 'tactics-section';
        sec.innerHTML = `<h3>${escapeHtml(t.icon || '📖')} ${escapeHtml(t.title || '')}</h3><div class="tactics-text">${t.content || ''}</div>`;
        body.appendChild(sec);
    });
}
function openTacticsModal() { const m = $('tacticsModal'); if (m) { m.hidden = false; document.body.style.overflow = 'hidden'; } }
function closeTacticsModal() { const m = $('tacticsModal'); if (m) { m.hidden = true; document.body.style.overflow = ''; } }
on('openTacticsBtn', 'click', openTacticsModal);
on('closeTactics', 'click', closeTacticsModal);
on('tacticsModal', 'click', e => { if (e.target.id === 'tacticsModal') closeTacticsModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { const m = $('tacticsModal'); if (m && !m.hidden) closeTacticsModal(); } });
function renderTacticsAdmin() {
    const c = $('tacticsAdminList'); if (!c) return;
    c.innerHTML = '';
    if (!tacticsCache.length) { c.innerHTML = '<div class="empty">Пока нет разделов</div>'; return; }
    tacticsCache.forEach((t, idx) => {
        const el = document.createElement('div');
        el.className = 'partners-admin-item';
        el.innerHTML = `
            <div class="logo-mini"><span>${escapeHtml(t.icon || '📖')}</span></div>
            <div class="txt"><b>${escapeHtml(t.title || t.id)}</b><span style="color:var(--muted);font-size:11px">Порядок: ${t.sort_order ?? 0}</span></div>
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
        c.appendChild(el);
    });
}
async function moveTactic(id, dir) {
    const idx = tacticsCache.findIndex(t => t.id === id); if (idx === -1) return;
    const sw = idx + dir; if (sw < 0 || sw >= tacticsCache.length) return;
    const a = tacticsCache[idx], b = tacticsCache[sw];
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
on('cancelTacEdit', 'click', () => { $('tacticsEditModal').hidden = true; editingTactic = null; });
on('saveTacEdit', 'click', async () => {
    if (!editingTactic) return;
    const title = val('tacEditTitle').trim(), icon = val('tacEditIcon').trim();
    const content = val('tacEditContent'), order = parseInt(val('tacEditOrder')) || 0;
    const msg = $('tacEditMsg');
    if (!title) { msg.textContent = 'Укажи заголовок'; msg.style.color = '#ff7a7a'; return; }
    if (!content.trim()) { msg.textContent = 'Укажи содержимое'; msg.style.color = '#ff7a7a'; return; }
    const { error } = await supabase.from('tactics').update({ title, icon: icon || null, content, sort_order: order }).eq('id', editingTactic.id);
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    $('tacticsEditModal').hidden = true; editingTactic = null;
    await loadTactics();
});
async function deleteTactic(id, title) {
    if (!confirm(`Удалить раздел «${title}»?`)) return;
    await supabase.from('tactics').delete().eq('id', id);
    await loadTactics();
}
on('tacAddBtn', 'click', async () => {
    const id = val('tacId').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const title = val('tacTitle').trim(), icon = val('tacIcon').trim();
    const content = val('tacContent'), order = parseInt(val('tacOrder')) || 0;
    const st = $('tacStatus');
    if (!id) return flashStatusEl(st, 'Укажи ID', '#ff7a7a');
    if (!title) return flashStatusEl(st, 'Укажи заголовок', '#ff7a7a');
    if (!content.trim()) return flashStatusEl(st, 'Укажи содержимое', '#ff7a7a');
    const { error } = await supabase.from('tactics').insert({ id, title, icon: icon || null, content, sort_order: order });
    if (error) return flashStatusEl(st, 'Ошибка: ' + error.message, '#ff7a7a');
    ['tacId','tacTitle','tacIcon','tacContent'].forEach(i => { const el = $(i); if (el) el.value = ''; });
    $('tacOrder').value = 10;
    flashStatusEl(st, '✔ Добавлено', '#6ee7a7');
    await loadTactics();
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   31.  💱  ТОРГОВЛЯ                                                  ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
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
    wrap.querySelectorAll('.tm-chip').forEach(ch => ch.classList.toggle('active', ch.dataset.clan === tradeFilterClan));
}
async function renderTrades() {
    const c = $('tm-listings'); if (!c) return;
    c.innerHTML = '<div class="empty">Загрузка…</div>';
    const { data, error } = await supabase.from('trades').select('*').order('created_at', { ascending: false }).limit(500);
    if (error) { c.innerHTML = `<div class="empty">Ошибка: ${error.message}</div>`; return; }
    tradesCache = data || [];
    renderTradeCounters();
    renderTradeListings();
}
function renderTradeCounters() {
    let buyG = 0, sellG = 0, buyN = 0, sellN = 0;
    tradesCache.forEach(t => {
        if (t.status === 'done') return;
        const total = Number(t.price) * Number(t.qty);
        if (t.type === 'buy') { buyG += total; buyN++; } else { sellG += total; sellN++; }
    });
    const eb = $('tm-counter-buy-gold'), es = $('tm-counter-sell-gold');
    const ebs = $('tm-counter-buy-sub'), ess = $('tm-counter-sell-sub');
    if (eb) eb.textContent = tradeFmtGold(buyG);
    if (es) es.textContent = tradeFmtGold(sellG);
    if (ebs) ebs.textContent = buyN + ' ' + tradePlural(buyN, 'заявка', 'заявки', 'заявок');
    if (ess) ess.textContent = sellN + ' ' + tradePlural(sellN, 'заявка', 'заявки', 'заявок');
}
function tradeVisibleListings() {
    const q = ($('tm-search')?.value || '').trim().toLowerCase();
    const onlyMine = $('tm-only-mine')?.checked;
    const myNick = getViewerNick().toLowerCase();
    return tradesCache.filter(t => {
        if (tradeFilterStatus === 'active' && t.status === 'done') return false;
        if (tradeFilterStatus === 'done' && t.status !== 'done') return false;
        if (tradeFilterType !== 'all' && t.type !== tradeFilterType) return false;
        if (tradeFilterCat !== 'all' && t.category !== tradeFilterCat) return false;
        if (tradeFilterClan !== 'all' && t.clan !== tradeFilterClan) return false;
        if (tradeOnlyShips && t.category !== 'ship') return false;
        if (q && !(t.name || '').toLowerCase().includes(q)) return false;
        if (onlyMine && (t.nickname || '').toLowerCase() !== myNick) return false;
        return true;
    });
}
function renderTradeListings() {
    const c = $('tm-listings'); if (!c) return;
    const items = tradeVisibleListings();
    if (!items.length) { c.innerHTML = '<p class="empty">Заявок пока нет.</p>'; return; }
    const myNick = getViewerNick().toLowerCase();
    c.innerHTML = '';
    items.forEach(t => {
        const cat = tradeCatById(t.category);
        const total = Number(t.price) * Number(t.qty);
        const isMine = myNick && (t.nickname || '').toLowerCase() === myNick;
        const isDone = t.status === 'done';
        const isAcc = !isDone && !!t.accepted_by;
        const iAmAcc = myNick && isAcc && (t.accepted_by || '').toLowerCase() === myNick;
        const canDel = isAdmin || (isMine && !isAcc && !isDone);
        const typeLabel = t.type === 'buy' ? '🛒 Куплю' : '💰 Продам';
        const clanName = clansCache[t.clan]?.name || t.clan;
        let badge;
        if (isDone) badge = `<span class="tm-badge done">✅ Завершено</span>`;
        else if (isAcc) badge = `<span class="tm-badge progress">⏳ В работе</span>`;
        else badge = `<span class="tm-badge free">🔵 Свободна</span>`;
        let actions = '';
        if (!isDone && !isAcc && !isMine) actions = `<div class="tm-listing-actions"><button class="tm-accept" data-id="${t.id}">🤝 Принять</button></div>`;
        else if (!isDone && isAcc && isMine) actions = `<div class="tm-listing-actions"><button class="tm-confirm" data-id="${t.id}">✅ Подтвердить</button><button class="tm-cancel" data-id="${t.id}">✖ Отменить</button></div>`;
        let accNote = '';
        if (isAcc) accNote = `<div class="tm-accepted-note">🤝 Принял: <b>${escapeHtml(t.accepted_by)}</b>${iAmAcc ? ' — ждём подтверждения' : ''}</div>`;
        else if (isDone) accNote = `<div class="tm-accepted-note">✅ Сделка завершена${t.accepted_by ? ` — с <b>${escapeHtml(t.accepted_by)}</b>` : ''}</div>`;
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
                        ${badge}
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
            ${accNote}
            ${actions}
            <div class="tm-listing-foot">
                <span class="author" data-nick="${escapeHtml(t.nickname)}">👤 ${escapeHtml(t.nickname)}</span>
                <span class="time">${tradeTimeAgo(t.created_at)}</span>
                ${canDel ? `<button class="tm-delete" data-id="${t.id}">✕</button>` : ''}
            </div>`;
        el.querySelector('.author')?.addEventListener('click', () => openProfile(t.nickname));
        c.appendChild(el);
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
on('tm-only-ships', 'change', () => { tradeOnlyShips = $('tm-only-ships').checked; renderTradeListings(); });
on('tm-type-filters', 'click', e => {
    const ch = e.target.closest('.tm-chip'); if (!ch) return;
    document.querySelectorAll('#tm-type-filters .tm-chip').forEach(x => x.classList.remove('active'));
    ch.classList.add('active'); tradeFilterType = ch.dataset.type; renderTradeListings();
});
on('tm-cat-filters', 'click', e => {
    const ch = e.target.closest('.tm-chip'); if (!ch) return;
    document.querySelectorAll('#tm-cat-filters .tm-chip').forEach(x => x.classList.remove('active'));
    ch.classList.add('active'); tradeFilterCat = ch.dataset.cat; renderTradeListings();
});
on('tm-clan-filters', 'click', e => {
    const ch = e.target.closest('.tm-chip'); if (!ch) return;
    document.querySelectorAll('#tm-clan-filters .tm-chip').forEach(x => x.classList.remove('active'));
    ch.classList.add('active'); tradeFilterClan = ch.dataset.clan; renderTradeListings();
});
on('tm-status-filters', 'click', e => {
    const ch = e.target.closest('.tm-chip'); if (!ch) return;
    document.querySelectorAll('#tm-status-filters .tm-chip').forEach(x => x.classList.remove('active'));
    ch.classList.add('active'); tradeFilterStatus = ch.dataset.status; renderTradeListings();
});
on('tm-listings', 'click', async e => {
    const del = e.target.closest('.tm-delete');
    if (del) {
        const id = del.dataset.id;
        const t = tradesCache.find(x => String(x.id) === String(id)); if (!t) return;
        if (!confirm(`Удалить заявку «${t.name}»?`)) return;
        const { error } = await supabase.from('trades').delete().eq('id', id);
        if (error) return alert(error.message);
        await logAdminAction('Удалил торговую заявку', `${t.nickname} — ${t.name}`);
        renderTrades(); return;
    }
    const acc = e.target.closest('.tm-accept');
    if (acc) {
        const t = tradesCache.find(x => String(x.id) === String(acc.dataset.id)); if (!t) return;
        openAcceptTradeModal(t); return;
    }
    const cf = e.target.closest('.tm-confirm');
    if (cf) {
        const t = tradesCache.find(x => String(x.id) === String(cf.dataset.id)); if (!t) return;
        if (!confirm(`Подтвердить сделку с «${t.accepted_by}»?`)) return;
        const { error } = await supabase.from('trades').update({ status: 'done' }).eq('id', t.id);
        if (error) return alert(error.message);
        await createNotification(t.accepted_by, 'trade', 'Сделка завершена', `Сделка «${t.name}» подтверждена`, null);
        renderTrades(); return;
    }
    const cn = e.target.closest('.tm-cancel');
    if (cn) {
        const t = tradesCache.find(x => String(x.id) === String(cn.dataset.id)); if (!t) return;
        if (!confirm('Отменить принятие?')) return;
        const { error } = await supabase.from('trades').update({ accepted_by: null, accepted_at: null }).eq('id', t.id);
        if (error) return alert(error.message);
        renderTrades(); return;
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

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   32.  🤝  ПРИНЯТИЕ СДЕЛКИ                                           ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function openAcceptTradeModal(t) {
    acceptingTrade = t;
    $('acceptTradeName').textContent = t.name;
    $('acceptTradeInfo').textContent = `${t.type === 'buy' ? 'Покупка' : 'Продажа'} · ${Number(t.price).toLocaleString('ru-RU')} 🪙/шт · ${t.qty} шт`;
    const saved = getViewerNick();
    $('acceptTradeNickname').value = saved || '';
    $('acceptTradeError').textContent = '';
    $('acceptTradeModal').hidden = false;
    (saved ? $('doAcceptTrade') : $('acceptTradeNickname')).focus();
}
function closeAcceptTradeModal() { $('acceptTradeModal').hidden = true; acceptingTrade = null; }
on('cancelAcceptTrade', 'click', closeAcceptTradeModal);
on('acceptTradeModal', 'click', e => { if (e.target.id === 'acceptTradeModal') closeAcceptTradeModal(); });
on('doAcceptTrade', 'click', async () => {
    if (!acceptingTrade) return;
    const nick = val('acceptTradeNickname').trim();
    const err = $('acceptTradeError'); err.textContent = '';
    if (!nick) { err.textContent = 'Укажите ваш ник'; return; }
    if (nick.length < 2) { err.textContent = 'Ник слишком короткий'; return; }
    if (nick.toLowerCase() === (acceptingTrade.nickname || '').toLowerCase()) { err.textContent = 'Нельзя принять свою заявку'; return; }
    $('doAcceptTrade').disabled = true;
    const { error } = await supabase.from('trades').update({ accepted_by: nick, accepted_at: new Date().toISOString() }).eq('id', acceptingTrade.id);
    $('doAcceptTrade').disabled = false;
    if (error) { err.textContent = 'Ошибка: ' + error.message; return; }
    localStorage.setItem(VIEWER_NICK_KEY, nick);
    sendHeartbeat();
    await createNotification(acceptingTrade.nickname, 'trade', 'Вашу заявку приняли', `${nick} принял заявку «${acceptingTrade.name}»`, null);
    const tn = $('tm-nickname'); if (tn) tn.value = nick;
    closeAcceptTradeModal(); renderTrades();
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   33.  🟢  ОНЛАЙН СПИСКИ                                             ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function renderAdminOnlineList() {
    const c = $('adminOnlineList'); if (!c || !isAdmin) return;
    c.innerHTML = '<div class="empty">Загрузка…</div>';
    const th = new Date(Date.now() - ONLINE_WINDOW_MS).toISOString();
    const { data, error } = await supabase.from('online_users').select('*').gte('last_seen', th).order('last_seen', { ascending: false });
    if (error) { c.innerHTML = `<div class="empty">Ошибка: ${error.message}</div>`; return; }
    if (!data?.length) { c.innerHTML = '<div class="empty">Сейчас никого нет</div>'; return; }
    const me = getViewerNick().toLowerCase();
    c.innerHTML = '';
    data.forEach(u => {
        const nick = u.nickname || '—';
        const isGuest = nick.startsWith('guest_');
        const isMe = nick.toLowerCase() === me;
        const clanName = u.clan_id && clansCache[u.clan_id] ? clansCache[u.clan_id].name : (u.clan_id || null);
        const diff = Date.now() - new Date(u.last_seen).getTime();
        const timeL = diff < 60000 ? 'только что' : diff < 3600000 ? `${Math.floor(diff/60000)} мин назад` : `${Math.floor(diff/3600000)} ч назад`;
        const el = document.createElement('div');
        el.className = 'online-item' + (isGuest ? ' guest' : '') + (isMe ? ' me' : '');
        el.innerHTML = `
            <div class="online-icon">${isGuest ? '👤' : '🟢'}</div>
            <div class="online-info">
                <div class="online-nick">${escapeHtml(isGuest ? `Гость (${nick})` : nick)}${isMe ? ' <span class="online-me">— это вы</span>' : ''}</div>
                <div class="online-meta">${clanName ? `🏰 ${escapeHtml(clanName)} · ` : ''}⏱ ${timeL}</div>
            </div>
            <div class="online-actions">
                ${!isGuest && !isMe ? `<button class="online-msg-btn" data-nick="${escapeHtml(nick)}">✉️ Написать</button>` : isGuest ? '<span class="online-hint">гость</span>' : ''}
            </div>`;
        el.querySelector('.online-msg-btn')?.addEventListener('click', () => openPrivateChat(nick));
        c.appendChild(el);
    });
}
on('refreshOnlineList', 'click', renderAdminOnlineList);
async function renderClanOnlineList() {
    const c = $('clanOnlineList'); if (!c) return;
    c.innerHTML = '<div class="empty">Загрузка…</div>';
    const th = new Date(Date.now() - ONLINE_WINDOW_MS).toISOString();
    const { data, error } = await supabase.from('online_users').select('*').gte('last_seen', th).order('last_seen', { ascending: false });
    if (error) { c.innerHTML = `<div class="empty">Ошибка: ${error.message}</div>`; return; }
    if (!data?.length) { c.innerHTML = '<div class="empty">Сейчас никого нет</div>'; return; }
    const me = getViewerNick().toLowerCase();
    c.innerHTML = '';
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
                ${!isGuest && !isMe ? `<button class="online-msg-btn" data-nick="${escapeHtml(nick)}">✉️ Написать</button>` : isGuest ? '<span class="online-hint">гость</span>' : ''}
            </div>`;
        el.querySelector('.online-msg-btn')?.addEventListener('click', () => openPrivateChat(nick));
        c.appendChild(el);
    });
}
on('clanOnlineRefresh', 'click', renderClanOnlineList);

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   34.  🗺️  КАРТА (превью + фуллскрин)                                ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadMapSettings() {
    try {
        const { data } = await supabase.from('site_settings').select('*').eq('id', 'main').single();
        if (data) settingsCache = data;
    } catch (e) { }
    const s = settingsCache || {};
    mapSettings = {
        title: s.map_title || 'World of Sea Battle — Карта',
        detailed: s.map_detailed_url || MAP_DEFAULT_DETAILED,
        clean:    s.map_clean_url    || MAP_DEFAULT_CLEAN,
        defaultView: s.map_default_view || 'detailed',
        note: s.map_note || ''
    };
    renderMapPreview();
    renderMapAdmin();
}
let currentMapView = 'detailed';
function renderMapPreview() {
    const img = $('map-preview-img'); if (!img) return;
    const s = mapSettings || {};
    const urls = getMapUrls();
    img.src = currentMapView === 'clean' ? urls.clean : urls.detailed;
    const title = $('map-title'); if (title) title.textContent = s.title || 'World of Sea Battle — Карта';
    const note = $('map-note'); if (note) note.textContent = s.note || '';
    document.querySelectorAll('.map-view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === currentMapView));
}
document.querySelectorAll('.map-view-btn').forEach(b => {
    b.addEventListener('click', () => { currentMapView = b.dataset.view; renderMapPreview(); });
});
on('map-preview', 'click', () => openMapFullscreen());
on('map-open', 'click', () => openMapFullscreen());
function openMapFullscreen() {
    const wrap = $('mapFullscreen'); if (!wrap) return;
    const urls = getMapUrls();
    const img = $('map-fs-img');
    img.src = currentMapView === 'clean' ? urls.clean : urls.detailed;
    const t = $('map-fs-title'); if (t) t.textContent = (mapSettings?.title) || 'Карта';
    mapFullscreenZoom = 1; mapFullscreenX = 0; mapFullscreenY = 0;
    img.style.transform = `translate(${mapFullscreenX}px, ${mapFullscreenY}px) scale(${mapFullscreenZoom})`;
    wrap.hidden = false;
    document.body.style.overflow = 'hidden';
}
function closeMapFullscreen() {
    const w = $('mapFullscreen'); if (w) w.hidden = true;
    document.body.style.overflow = '';
}
on('map-fs-close', 'click', closeMapFullscreen);
on('map-fs-zoom-in', 'click', () => { mapFullscreenZoom = Math.min(6, mapFullscreenZoom * 1.25); updateMapFsTransform(); });
on('map-fs-zoom-out', 'click', () => { mapFullscreenZoom = Math.max(0.5, mapFullscreenZoom / 1.25); updateMapFsTransform(); });
on('map-fs-reset', 'click', () => { mapFullscreenZoom = 1; mapFullscreenX = 0; mapFullscreenY = 0; updateMapFsTransform(); });
function updateMapFsTransform() {
    const img = $('map-fs-img'); if (!img) return;
    img.style.transform = `translate(${mapFullscreenX}px, ${mapFullscreenY}px) scale(${mapFullscreenZoom})`;
}
const mapFsStage = $('map-fs-stage');
if (mapFsStage) {
    mapFsStage.addEventListener('wheel', e => {
        e.preventDefault();
        mapFullscreenZoom = Math.max(0.5, Math.min(6, mapFullscreenZoom * (e.deltaY < 0 ? 1.12 : 1/1.12)));
        updateMapFsTransform();
    }, { passive: false });
    mapFsStage.addEventListener('mousedown', e => {
        mapFullscreenDragging = true;
        mapFullscreenDragStart = { x: e.clientX - mapFullscreenX, y: e.clientY - mapFullscreenY };
        mapFsStage.classList.add('dragging');
    });
    window.addEventListener('mousemove', e => {
        if (!mapFullscreenDragging) return;
        mapFullscreenX = e.clientX - mapFullscreenDragStart.x;
        mapFullscreenY = e.clientY - mapFullscreenDragStart.y;
        updateMapFsTransform();
    });
    window.addEventListener('mouseup', () => { mapFullscreenDragging = false; mapFsStage.classList.remove('dragging'); });
}
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        const w = $('mapFullscreen');
        if (w && !w.hidden) closeMapFullscreen();
    }
});

/* ── Карта: админ ── */
function renderMapAdmin() {
    const s = settingsCache || {};
    const t = $('map-title-input'); if (t) t.value = s.map_title || '';
    const du = $('map-detailed-url'); if (du) du.value = s.map_detailed_url || '';
    const cu = $('map-clean-url'); if (cu) cu.value = s.map_clean_url || '';
    const dv = $('map-default-view'); if (dv) dv.value = s.map_default_view || 'detailed';
    const nt = $('map-note-input'); if (nt) nt.value = s.map_note || '';
}
on('map-detailed-pick', 'click', () => $('map-detailed-file').click());
on('map-detailed-file', 'change', async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
        mapDetailedData = await compressImage(f, 2400, 0.85);
        $('map-detailed-preview-img').src = mapDetailedData;
        $('map-detailed-preview').hidden = false;
        $('map-detailed-name').textContent = f.name;
    } catch (err) { alert(err.message); }
});
on('map-detailed-clear', 'click', () => {
    mapDetailedData = null;
    $('map-detailed-file').value = '';
    $('map-detailed-preview').hidden = true;
    $('map-detailed-name').textContent = '';
});
on('map-clean-pick', 'click', () => $('map-clean-file').click());
on('map-clean-file', 'change', async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
        mapCleanData = await compressImage(f, 2400, 0.85);
        $('map-clean-preview-img').src = mapCleanData;
        $('map-clean-preview').hidden = false;
        $('map-clean-name').textContent = f.name;
    } catch (err) { alert(err.message); }
});
on('map-clean-clear', 'click', () => {
    mapCleanData = null;
    $('map-clean-file').value = '';
    $('map-clean-preview').hidden = true;
    $('map-clean-name').textContent = '';
});
on('map-save', 'click', async () => {
    const msg = $('map-admin-msg');
    const payload = {
        map_title: val('map-title-input').trim() || null,
        map_detailed_url: mapDetailedData || val('map-detailed-url').trim() || null,
        map_clean_url: mapCleanData || val('map-clean-url').trim() || null,
        map_default_view: val('map-default-view') || 'detailed',
        map_note: val('map-note-input').trim() || null
    };
    const { error } = await supabase.from('site_settings').update(payload).eq('id', 'main');
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    settingsCache = Object.assign({ id: 'main' }, settingsCache || {}, payload);
    msg.textContent = '✔ Сохранено'; msg.style.color = '#6ee7a7';
    mapDetailedData = null; mapCleanData = null;
    await loadMapSettings();
});
on('map-reset-urls', 'click', async () => {
    if (!confirm('Сбросить пути картинок на стандартные?')) return;
    const payload = { map_detailed_url: null, map_clean_url: null };
    await supabase.from('site_settings').update(payload).eq('id', 'main');
    settingsCache = Object.assign({}, settingsCache || {}, payload);
    await loadMapSettings();
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   35.  🚢  КОРАБЛИ                                                   ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadShips() {
    const { data, error } = await supabase.from('ships').select('*').order('level').order('name');
    if (error) return console.error(error);
    shipsCache = data || [];
    renderShips();
    renderAdminShips();
    fillShipSelects();
}
function shipLevelRoman(l) { return ({1:'I',2:'II',3:'III',4:'IV',5:'V',6:'VI',7:'VII'})[l] || l; }
function renderShips() {
    const grid = $('shipsGrid'); if (!grid) return;
    let list = shipsCache.slice();
    if (shipsFilterLevel !== 'all') list = list.filter(s => String(s.level) === String(shipsFilterLevel));
    if (shipsFilterType !== 'all') list = list.filter(s => (s.type || '') === shipsFilterType);
    if (shipsSearch) { const q = shipsSearch.toLowerCase(); list = list.filter(s => (s.name || '').toLowerCase().includes(q)); }
    const sorters = {
        'level-desc': (a,b) => (b.level||0)-(a.level||0),
        'level-asc': (a,b) => (a.level||0)-(b.level||0),
        'name-asc': (a,b) => (a.name||'').localeCompare(b.name||''),
        'name-desc': (a,b) => (b.name||'').localeCompare(a.name||''),
        'durability-desc': (a,b) => (b.durability||0)-(a.durability||0),
        'speed-desc': (a,b) => (b.speed||0)-(a.speed||0),
        'maneuverability-desc': (a,b) => (b.maneuverability||0)-(a.maneuverability||0),
        'armor-desc': (a,b) => (b.armor||0)-(a.armor||0),
        'guns-desc': (a,b) => (b.guns||0)-(a.guns||0),
        'cargo-desc': (a,b) => (b.cargo||0)-(a.cargo||0),
        'crew-desc': (a,b) => (b.crew||0)-(a.crew||0)
    };
    list.sort(sorters[shipsSort] || sorters['level-desc']);
    if (!list.length) { grid.innerHTML = '<div class="empty">Корабли не найдены</div>'; return; }
    grid.innerHTML = '';
    list.forEach(s => {
        const el = document.createElement('div');
        el.className = 'ship-card-view';
        const stats = [
            ['Прочность', s.durability], ['Скорость', s.speed], ['Манёвр', s.maneuverability],
            ['Броня', s.armor], ['Орудия', s.guns], ['Трюм', s.cargo], ['Экипаж', s.crew]
        ].filter(x => x[1] !== undefined && x[1] !== null);
        el.innerHTML = `
            ${s.image ? `<img class="ship-card-view__image" src="${escapeHtml(s.image)}" onerror="this.style.display='none'">` : ''}
            <h3 class="ship-card-view__name">${escapeHtml(s.name)}</h3>
            <div class="ship-card-view__badges">
                <span class="ship-card-view__level">${shipLevelRoman(s.level)}</span>
                ${s.type ? `<span class="ship-card-view__type">${escapeHtml(s.type)}</span>` : ''}
            </div>
            <div class="ship-card-view__stats">
                ${stats.map(([l, v]) => `<div class="ship-stat"><span class="ship-stat__label">${l}</span><span class="ship-stat__value">${v}</span></div>`).join('')}
            </div>`;
        grid.appendChild(el);
    });
}
on('ships-search', 'input', () => { shipsSearch = val('ships-search'); renderShips(); });
on('ships-sort', 'change', () => { shipsSort = val('ships-sort'); renderShips(); });
on('ships-level-filters', 'click', e => {
    const ch = e.target.closest('.ships-chip'); if (!ch) return;
    document.querySelectorAll('#ships-level-filters .ships-chip').forEach(x => x.classList.remove('active'));
    ch.classList.add('active'); shipsFilterLevel = ch.dataset.level; renderShips();
});
on('ships-type-filters', 'click', e => {
    const ch = e.target.closest('.ships-chip'); if (!ch) return;
    document.querySelectorAll('#ships-type-filters .ships-chip').forEach(x => x.classList.remove('active'));
    ch.classList.add('active'); shipsFilterType = ch.dataset.type; renderShips();
});
function renderAdminShips() {
    const c = $('adminShipsList'); if (!c) return;
    c.innerHTML = '';
    if (!shipsCache.length) { c.innerHTML = '<div class="empty">Пока нет кораблей</div>'; return; }
    shipsCache.forEach(s => {
        const el = document.createElement('div');
        el.className = 'partners-admin-item';
        const logo = s.image ? `<img src="${escapeHtml(s.image)}" onerror="this.outerHTML='<span>🚢</span>'">` : `<span>🚢</span>`;
        el.innerHTML = `
            <div class="logo-mini">${logo}</div>
            <div class="txt"><b>${escapeHtml(s.name)}</b><span>${shipLevelRoman(s.level)} · ${escapeHtml(s.type || '')}</span></div>
            <div class="actions"><button class="edit">✏️</button><button class="delete">🗑</button></div>`;
        el.querySelector('.edit').addEventListener('click', () => openShipEdit(s));
        el.querySelector('.delete').addEventListener('click', () => deleteShip(s.id, s.name));
        c.appendChild(el);
    });
}
on('reloadShipsBtn', 'click', () => loadShips());
function openShipEdit(s) {
    const id = prompt('Название корабля:', s.name || ''); if (id === null) return;
    const lvl = prompt('Уровень (1-7):', s.level || 1); if (lvl === null) return;
    const type = prompt('Тип (Боевые/Торговые/...):', s.type || ''); if (type === null) return;
    const patch = { name: id.trim() || s.name, level: parseInt(lvl) || 1, type: type.trim() || null };
    supabase.from('ships').update(patch).eq('id', s.id).then(({ error }) => {
        if (error) return alert(error.message);
        loadShips();
    });
}
async function deleteShip(id, name) {
    if (!confirm(`Удалить корабль «${name}»?`)) return;
    await supabase.from('ships').delete().eq('id', id);
    loadShips();
}
function fillShipSelects() {
    ['pvpShip','pbShip','sc-ship','builderTargetShip2','tm-ship-select','recipe-ship'].forEach(id => {
        const sel = $(id); if (!sel) return;
        const cur = sel.value; sel.innerHTML = '<option value="">— Выберите корабль —</option>';
        shipsCache.forEach(s => {
            const o = document.createElement('option');
            o.value = s.id; o.textContent = `${s.name} (${shipLevelRoman(s.level)})`;
            sel.appendChild(o);
        });
        if (cur) sel.value = cur;
    });
}
['pvpShip','pbShip'].forEach(id => {
    on(id, 'change', () => {
        const s = shipsCache.find(x => String(x.id) === val(id));
        const img = $(id === 'pvpShip' ? 'pvpShipPreview' : 'pbShipPreview');
        if (!img) return;
        if (s && s.image) { img.src = s.image; img.hidden = false; } else img.hidden = true;
    });
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   36.  📦  РЕСУРСЫ + ЦЕНООБРАЗОВАНИЕ                                 ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadResources() {
    const { data, error } = await supabase.from('resources').select('*').order('sort_order').order('name');
    if (error) return console.error(error);
    resourcesCache = data || [];
    renderResourcesPublic();
    renderPricingGrid();
    fillResourceSelects();
}
function renderResourcesPublic() {
    const tbody = $('res-tbody'); if (!tbody) return;
    if (!resourcesCache.length) { tbody.innerHTML = '<tr><td colspan="3" class="res-empty">Ресурсов пока нет</td></tr>'; return; }
    let list = resourcesCache.slice();
    const q = ($('res-search')?.value || '').trim().toLowerCase();
    if (q) list = list.filter(r => (r.name || '').toLowerCase().includes(q));
    const sort = $('res-sort')?.value || 'name-asc';
    const sorters = {
        'name-asc': (a,b) => (a.name||'').localeCompare(b.name||''),
        'name-desc': (a,b) => (b.name||'').localeCompare(a.name||''),
        'price-asc': (a,b) => (a.price||0)-(b.price||0),
        'price-desc': (a,b) => (b.price||0)-(a.price||0),
        'updated-desc': (a,b) => new Date(b.updated_at||0)-new Date(a.updated_at||0)
    };
    list.sort(sorters[sort] || sorters['name-asc']);
    tbody.innerHTML = list.map(r => `
        <tr>
            <td><span class="res-name">${r.image ? `<img src="${escapeHtml(r.image)}" onerror="this.style.display='none'">` : ''}${escapeHtml(r.name)}</span></td>
            <td class="res-cell-price avg">${Number(r.price || 0).toLocaleString('ru-RU')} 🪙</td>
            <td>${r.updated_at ? new Date(r.updated_at).toLocaleString('ru-RU', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' }) : '—'}</td>
        </tr>`).join('') || '<tr><td colspan="3" class="res-empty">Ничего не найдено</td></tr>';
}
on('res-search', 'input', renderResourcesPublic);
on('res-sort', 'change', renderResourcesPublic);
on('res-refresh', 'click', () => loadResources());
function renderPricingGrid() {
    const wrap = $('pricingGroups'); if (!wrap) return;
    wrap.innerHTML = '';
    if (!resourcesCache.length) { wrap.innerHTML = '<div class="pricing-empty">Ресурсов нет. Нажми «Импорт базового набора» или «Добавить ресурс»</div>'; return; }
    const groups = {};
    resourcesCache.forEach(r => { const g = r.group_id || 'other'; (groups[g] ||= []).push(r); });
    const groupMeta = {
        raw:       { name: '🪵 Сырьё',        cls: 'pricing-group-raw' },
        processed: { name: '⚙️ Обработанные', cls: 'pricing-group-processed' },
        consum:    { name: '🧪 Расходники',   cls: 'pricing-group-consum' },
        valuable:  { name: '💎 Ценности',     cls: 'pricing-group-valuable' },
        other:     { name: '📦 Прочее',       cls: 'pricing-group-other' }
    };
    Object.keys(groups).forEach(gid => {
        const meta = groupMeta[gid] || { name: gid, cls: 'pricing-group-other' };
        const gEl = document.createElement('div');
        gEl.className = 'pricing-group ' + meta.cls;
        gEl.innerHTML = `<div class="pricing-group-title">${meta.name} <span class="count">${groups[gid].length}</span></div>`;
        const grid = document.createElement('div');
        grid.className = 'pricing-grid';
        groups[gid].forEach(r => {
            const card = document.createElement('div');
            card.className = 'pricing-card';
            card.innerHTML = `
                <div class="pricing-card-head">
                    <div class="pricing-card-icon">${r.image ? `<img src="${escapeHtml(r.image)}" onerror="this.outerHTML='${r.icon || '📦'}'">` : (r.icon || '📦')}</div>
                    <div class="pricing-card-name">
                        <div class="main">${escapeHtml(r.name)}</div>
                        ${r.name_en ? `<div class="latin">${escapeHtml(r.name_en)}</div>` : ''}
                    </div>
                </div>
                <div class="pricing-card-price">
                    <span class="pricing-card-prefix">G</span>
                    <input type="number" class="pricing-card-input" value="${r.price || 0}" step="0.01" data-id="${r.id}">
                </div>
                <div class="pricing-card-actions">
                    <button class="pricing-card-btn edit">✏️ Изменить</button>
                    <button class="pricing-card-btn del">🗑</button>
                </div>`;
            const inp = card.querySelector('.pricing-card-input');
            inp.addEventListener('input', () => {
                clearTimeout(pricingSaveTimers[r.id]);
                pricingSaveTimers[r.id] = setTimeout(async () => {
                    const p = parseFloat(inp.value) || 0;
                    await supabase.from('resources').update({ price: p, updated_at: new Date().toISOString() }).eq('id', r.id);
                    r.price = p;
                    const st = $('pricingStatus'); if (st) { st.textContent = '✔ Сохранено'; st.style.color = '#6ee7a7'; setTimeout(() => st.textContent = '', 1500); }
                }, 600);
            });
            card.querySelector('.edit').addEventListener('click', () => openResourceEdit(r));
            card.querySelector('.del').addEventListener('click', async () => {
                if (!confirm(`Удалить ресурс «${r.name}»?`)) return;
                await supabase.from('resources').delete().eq('id', r.id);
                loadResources();
            });
            grid.appendChild(card);
        });
        gEl.appendChild(grid);
        wrap.appendChild(gEl);
    });
}
on('pricingAddBtn', 'click', () => openResourceEdit(null));
on('pricingPresetBtn', 'click', async () => {
    const preset = [
        ['wood','Дерево','WOOD','🪵',3.9,'raw'],
        ['iron','Железо','IRON','⛓',12,'raw'],
        ['fabric','Ткань','FABRIC','🧵',3.5,'raw'],
        ['resin','Смола','RESIN','🛢',54,'raw'],
        ['coal','Уголь','COAL','⚫',25.5,'raw'],
        ['volcanic_ore','Вулк. руда','VOLCANIC ORE','🪨',370,'raw'],
        ['copper','Медь','COPPER','🟠',65,'processed'],
        ['beam','Балка','BEAM','🪵',779,'processed'],
        ['canvas','Парус','CANVAS','🧶',230,'processed'],
        ['bulkhead','Переборка','BULKHEAD','🛡',1120,'processed'],
        ['plate','Плита','PLATE','🔩',1500,'processed'],
        ['bronze','Бронза','BRONZE','🥉',1150,'processed'],
        ['rum','Ром','RUM','🥃',13.5,'consum'],
        ['salt','Соль','SALT','🧂',0,'consum'],
        ['wreckage','Обломки','WRECKAGE','📦',100,'valuable'],
        ['battle_mark','Боевая метка','BATTLE MARK','🎖',755,'valuable'],
        ['escudo','Эскудо','ESCUDO','🪙',4000,'valuable']
    ];
    const rows = preset.map(([id,name,en,icon,price,group], i) => ({
        id, name, name_en: en, icon, price, group_id: group, sort_order: i * 10
    }));
    if (!confirm(`Импортировать ${rows.length} ресурсов?`)) return;
    const { error } = await supabase.from('resources').upsert(rows, { onConflict: 'id' });
    if (error) return alert(error.message);
    await loadResources();
});
function openResourceEdit(r) {
    editingResourceId = r?.id || null;
    $('resourceEditTitle').textContent = r ? '✏️ Редактировать ресурс' : '➕ Новый ресурс';
    $('re-id').value = r?.id || '';
    $('re-name').value = r?.name || '';
    $('re-latin').value = r?.name_en || '';
    $('re-group').value = r?.group_id || 'raw';
    $('re-price').value = r?.price || 0;
    $('re-icon').value = r?.icon || '';
    $('re-image-url').value = r?.image || '';
    window.__reImageData = null;
    $('re-image-preview').hidden = true;
    $('re-image-name').textContent = '';
    $('re-msg').textContent = '';
    $('resourceEditModal').hidden = false;
}
on('re-cancel', 'click', () => { $('resourceEditModal').hidden = true; editingResourceId = null; });
on('re-image-pick', 'click', () => $('re-image-file').click());
on('re-image-file', 'change', async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
        window.__reImageData = await compressSquare(f, 128, 0.9);
        $('re-image-preview-img').src = window.__reImageData;
        $('re-image-preview').hidden = false;
        $('re-image-name').textContent = f.name;
    } catch (err) { alert(err.message); }
});
on('re-image-clear', 'click', () => {
    window.__reImageData = null;
    $('re-image-file').value = '';
    $('re-image-preview').hidden = true;
    $('re-image-name').textContent = '';
});
on('re-save', 'click', async () => {
    const id = val('re-id').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const name = val('re-name').trim();
    const msg = $('re-msg');
    if (!id) { msg.textContent = 'Укажи ID'; msg.style.color = '#ff7a7a'; return; }
    if (!name) { msg.textContent = 'Укажи название'; msg.style.color = '#ff7a7a'; return; }
    const payload = {
        id, name, name_en: val('re-latin').trim() || null,
        group_id: val('re-group') || 'raw',
        price: parseFloat(val('re-price')) || 0,
        icon: val('re-icon').trim() || null,
        image: window.__reImageData || val('re-image-url').trim() || null,
        sort_order: 10
    };
    const { error } = await supabase.from('resources').upsert(payload, { onConflict: 'id' });
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    $('resourceEditModal').hidden = true; editingResourceId = null;
    loadResources();
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   37.  ⚙️  BUILD-ITEMS (СПРАВОЧНИК АПГРЕЙДОВ)                        ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadBuildItems() {
    const { data, error } = await supabase.from('build_items').select('*').order('type').order('sort_order');
    if (error) return console.error(error);
    buildItemsCache = data || [];
    renderBuildItemsAdmin();
    fillBuildCatalogSelects();
}
function renderBuildItemsAdmin() {
    const c = $('buildItemsAdminList'); if (!c) return;
    c.innerHTML = '';
    if (!buildItemsCache.length) { c.innerHTML = '<div class="empty">Справочник пуст</div>'; return; }
    buildItemsCache.forEach(it => {
        const meta = BUILD_ITEM_TYPES[it.type] || { label: it.type, icon: '⚙️' };
        const el = document.createElement('div');
        el.className = 'partners-admin-item';
        el.innerHTML = `
            <div class="logo-mini"><span>${meta.icon}</span></div>
            <div class="txt"><b>${escapeHtml(it.name)}</b><span>${meta.label}${it.bonuses ? ' · ' + escapeHtml(it.bonuses) : ''}</span></div>
            <div class="actions"><button class="delete">🗑</button></div>`;
        el.querySelector('.delete').addEventListener('click', async () => {
            if (!confirm(`Удалить «${it.name}»?`)) return;
            await supabase.from('build_items').delete().eq('id', it.id);
            loadBuildItems();
        });
        c.appendChild(el);
    });
}
on('bi-type', 'change', () => {
    const t = val('bi-type');
    $('bi-bonuses-field').hidden = t !== 'specialist';
});
on('bi-add', 'click', async () => {
    const type = val('bi-type');
    const name = val('bi-name').trim();
    const bonuses = val('bi-bonuses').trim();
    const order = parseInt(val('bi-order')) || 0;
    const msg = $('bi-msg'); msg.style.color = '';
    if (!name) { msg.textContent = 'Укажи название'; msg.style.color = '#ff7a7a'; return; }
    const { error } = await supabase.from('build_items').insert({ type, name, bonuses: bonuses || null, sort_order: order });
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    $('bi-name').value = ''; $('bi-bonuses').value = '';
    msg.textContent = '✔ Добавлено'; msg.style.color = '#6ee7a7';
    loadBuildItems();
});
function fillBuildCatalogSelects() {
    document.querySelectorAll('.build-catalog-select').forEach(sel => {
        const type = sel.dataset.type;
        const cur = sel.value;
        sel.innerHTML = `<option value="">— Из справочника —</option>`;
        buildItemsCache.filter(it => it.type === type).forEach(it => {
            const o = document.createElement('option');
            o.value = it.name;
            o.textContent = it.name + (it.bonuses ? ` (${it.bonuses})` : '');
            sel.appendChild(o);
        });
        if (cur) sel.value = cur;
    });
}
document.querySelectorAll('.build-catalog-add').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const target = $(targetId); if (!target) return;
        const sel = btn.parentElement.querySelector('.build-catalog-select');
        if (!sel || !sel.value) return;
        const cur = target.value.trim();
        target.value = cur ? cur + '\n' + sel.value : sel.value;
        sel.value = '';
    });
});
document.querySelectorAll('.build-catalog-select[data-mode="set"]').forEach(sel => {
    sel.addEventListener('change', () => {
        const t = $(sel.dataset.target); if (!t) return;
        t.value = sel.value;
        sel.value = '';
    });
});
/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   38.  🔧  БИЛДЕР (СБОРКА КОРАБЛЯ)                                    ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
let builderRows = [];

function renderBuilder() {
    fillShipSelects();
    renderBuilderRows();
    updateBuilderStats();
}
on('builderTargetShip2', 'change', () => {
    const s = shipsCache.find(x => String(x.id) === val('builderTargetShip2'));
    const img = $('builderTargetImg2');
    if (!img) return;
    if (s && s.image) { img.src = s.image; img.hidden = false; } else img.hidden = true;
});
function renderBuilderRows() {
    const tbody = $('builderRows2'); if (!tbody) return;
    tbody.innerHTML = '';
    builderRows.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <select class="builder-row-select" data-idx="${idx}">
                    <option value="">— Выбрать ресурс —</option>
                    ${resourcesCache.map(r => `<option value="${r.id}" ${r.id === row.resource_id ? 'selected' : ''}>${escapeHtml(r.name)}</option>`).join('')}
                </select>
            </td>
            <td><input type="number" class="builder-row-qty" data-idx="${idx}" value="${row.qty || 1}" min="1" step="1"></td>
            <td>${row.price != null ? Number(row.price).toLocaleString('ru-RU') + ' 🪙' : '<span class="builder-avg no-data">— нет цены —</span>'}</td>
            <td>${row.price != null ? `<span class="builder-row-total">${Number(row.price * row.qty).toLocaleString('ru-RU')} 🪙</span>` : '<span class="builder-row-total no-data">—</span>'}</td>
            <td><button class="builder-del" data-idx="${idx}">✕</button></td>`;
        tr.querySelector('.builder-row-select').addEventListener('change', e => {
            builderRows[idx].resource_id = e.target.value;
            const r = resourcesCache.find(x => x.id === e.target.value);
            builderRows[idx].price = r ? Number(r.price || 0) : null;
            renderBuilderRows(); updateBuilderStats();
        });
        tr.querySelector('.builder-row-qty').addEventListener('input', e => {
            builderRows[idx].qty = parseInt(e.target.value) || 1;
            renderBuilderRows(); updateBuilderStats();
        });
        tr.querySelector('.builder-del').addEventListener('click', () => {
            builderRows.splice(idx, 1);
            renderBuilderRows(); updateBuilderStats();
        });
        tbody.appendChild(tr);
    });
}
on('builderAddRow2', 'click', () => {
    builderRows.push({ resource_id: '', qty: 1, price: null });
    renderBuilderRows(); updateBuilderStats();
});
on('builderClear2', 'click', () => { builderRows = []; renderBuilderRows(); updateBuilderStats(); });
on('builderRecalc2', 'click', () => {
    builderRows.forEach(row => {
        const r = resourcesCache.find(x => x.id === row.resource_id);
        row.price = r ? Number(r.price || 0) : null;
    });
    renderBuilderRows(); updateBuilderStats();
    flashStatus('✔ Пересчитано', '#6ee7a7');
});
on('builderCopy2', 'click', async () => {
    const ship = shipsCache.find(s => String(s.id) === val('builderTargetShip2'));
    const lines = [`Сборка: ${ship ? ship.name : '—'}`, ''];
    builderRows.forEach(row => {
        const r = resourcesCache.find(x => x.id === row.resource_id);
        if (r) lines.push(`${r.name} × ${row.qty} — ${Number((row.price || 0) * row.qty).toLocaleString('ru-RU')} 🪙`);
    });
    const total = builderRows.reduce((s, x) => s + ((x.price || 0) * (x.qty || 0)), 0);
    lines.push('', `Итого: ${Number(total).toLocaleString('ru-RU')} 🪙`);
    try { await navigator.clipboard.writeText(lines.join('\n')); flashStatus('✔ Скопировано', '#6ee7a7'); }
    catch { alert(lines.join('\n')); }
});
function updateBuilderStats() {
    const priced = builderRows.filter(r => r.price != null);
    const found = priced.length;
    const total = priced.reduce((s, r) => s + (r.price * r.qty), 0);
    const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
    set('builderCountPositions2', builderRows.length);
    set('builderCountPrices2', `${found} / ${builderRows.length}`);
    set('builderTotal2', Number(total).toLocaleString('ru-RU') + ' 🪙');
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   39.  🔨  SHIPCOST — ПОСТРОЙКА КОРАБЛЯ                              ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadRecipes() {
    const { data, error } = await supabase.from('recipes').select('*');
    if (error) console.warn(error);
    recipesCache = data || [];
    const { data: d } = await supabase.from('discounts').select('*').order('created_at', { ascending: false });
    discountsCache = d || [];
    renderRecipeShipSelect();
    renderRecipeRows();
    renderDiscountsAdmin();
    renderShipCost();
}
function renderRecipeShipSelect() {
    const sel = $('recipe-ship'); if (!sel) return;
    const cur = sel.value; sel.innerHTML = '<option value="">— Корабль —</option>';
    shipsCache.forEach(s => {
        const o = document.createElement('option');
        o.value = s.id; o.textContent = `${s.name} (${shipLevelRoman(s.level)})`;
        sel.appendChild(o);
    });
    if (cur) sel.value = cur;
}
on('recipe-ship', 'change', renderRecipeRows);
function renderRecipeRows() {
    const c = $('recipe-rows'); if (!c) return;
    const sid = val('recipe-ship');
    if (!sid) { c.innerHTML = '<div class="empty">Выберите корабль</div>'; return; }
    const rows = recipesCache.filter(r => String(r.ship_id) === String(sid));
    if (!rows.length) { c.innerHTML = '<div class="empty">Рецепт пуст — добавьте ресурсы</div>'; return; }
    c.innerHTML = '';
    rows.forEach(r => {
        const res = resourcesCache.find(x => String(x.id) === String(r.resource_id));
        const el = document.createElement('div');
        el.className = 'recipe-row';
        el.innerHTML = `
            <img src="${escapeHtml(res?.image || '')}" onerror="this.style.visibility='hidden'">
            <select data-id="${r.id}">
                <option value="">— Ресурс —</option>
                ${resourcesCache.map(x => `<option value="${x.id}" ${x.id === r.resource_id ? 'selected' : ''}>${escapeHtml(x.name)}</option>`).join('')}
            </select>
            <input type="number" data-id="${r.id}" value="${r.quantity || 0}" min="0">
            <button class="rr-del" data-id="${r.id}">✕</button>`;
        el.querySelector('select').addEventListener('change', e => { r.resource_id = e.target.value; });
        el.querySelector('input').addEventListener('input', e => { r.quantity = parseFloat(e.target.value) || 0; });
        el.querySelector('.rr-del').addEventListener('click', async () => {
            await supabase.from('recipes').delete().eq('id', r.id);
            loadRecipes();
        });
        c.appendChild(el);
    });
}
on('recipe-add-row', 'click', async () => {
    const sid = val('recipe-ship');
    if (!sid) return alert('Выберите корабль');
    const res = resourcesCache[0];
    if (!res) return alert('Нет ресурсов — сначала импортируйте');
    const { error } = await supabase.from('recipes').insert({ ship_id: sid, resource_id: res.id, quantity: 1 });
    if (error) return alert(error.message);
    loadRecipes();
});
on('recipe-save', 'click', async () => {
    const sid = val('recipe-ship');
    if (!sid) return alert('Выберите корабль');
    const msg = $('recipe-msg');
    try {
        for (const r of recipesCache.filter(x => String(x.ship_id) === String(sid))) {
            await supabase.from('recipes').update({ resource_id: r.resource_id, quantity: r.quantity }).eq('id', r.id);
        }
        msg.textContent = '✔ Сохранено'; msg.style.color = '#6ee7a7';
    } catch (e) { msg.textContent = 'Ошибка: ' + e.message; msg.style.color = '#ff7a7a'; }
});
on('recipe-clear', 'click', async () => {
    const sid = val('recipe-ship');
    if (!sid) return;
    if (!confirm('Очистить рецепт?')) return;
    await supabase.from('recipes').delete().eq('ship_id', sid);
    loadRecipes();
});
function applyDiscounts(base) {
    const active = discountsCache.filter(d => d.active !== false);
    let total = base, list = [];
    active.forEach(d => {
        const cut = total * (Number(d.value) / 100);
        total -= cut;
        list.push({ ...d, cut });
    });
    return { total, list };
}
function renderShipCost() {
    const sel = $('sc-ship'); if (!sel) return;
    const cur = sel.value; sel.innerHTML = '<option value="">— Выберите корабль —</option>';
    shipsCache.forEach(s => { const o = document.createElement('option'); o.value = s.id; o.textContent = `${s.name} (${shipLevelRoman(s.level)})`; sel.appendChild(o); });
    if (cur) sel.value = cur;

    const citySel = $('sc-city'); if (citySel) citySel.innerHTML = '<option value="">— Не указан —</option>' + portsCache.filter(p => p.type === 'city').map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
    const fSel = $('sc-faction'); if (fSel) fSel.innerHTML = '<option value="">— Не указана —</option>' + factionsCache.map(f => `<option value="${f.id}">${escapeHtml(f.name)}</option>`).join('');

    updateShipCost();
}
on('sc-ship', 'change', updateShipCost);
on('sc-city', 'change', updateShipCost);
on('sc-faction', 'change', updateShipCost);
function updateShipCost() {
    const sid = val('sc-ship');
    const empty = $('sc-empty'), content = $('sc-content');
    if (!sid) { if (empty) empty.hidden = false; if (content) content.hidden = true; return; }
    if (empty) empty.hidden = true; if (content) content.hidden = false;
    const rows = recipesCache.filter(r => String(r.ship_id) === String(sid));
    if (!rows.length) {
        const tb = $('sc-tbody'); if (tb) tb.innerHTML = '<tr><td colspan="4" class="res-empty">Рецепт не задан</td></tr>';
        ['sc-base','sc-discounts-sum','sc-final'].forEach(i => { const el = $(i); if (el) el.textContent = '0 🪙'; });
        const dl = $('sc-discounts-list'); if (dl) dl.innerHTML = '';
        return;
    }
    let base = 0;
    const tb = $('sc-tbody'); if (tb) {
        tb.innerHTML = '';
        rows.forEach(r => {
            const res = resourcesCache.find(x => String(x.id) === String(r.resource_id));
            const price = Number(res?.price || 0);
            const sum = price * (r.quantity || 0);
            base += sum;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="sc-res-name">${res?.image ? `<img src="${escapeHtml(res.image)}" onerror="this.style.display='none'">` : ''}${escapeHtml(res?.name || r.resource_id)}</span></td>
                <td class="sc-qty">${r.quantity || 0}</td>
                <td class="sc-price">${Number(price).toLocaleString('ru-RU')} 🪙</td>
                <td class="sc-sum">${Number(sum).toLocaleString('ru-RU')} 🪙</td>`;
            tb.appendChild(tr);
        });
    }
    const { total, list } = applyDiscounts(base);
    const discSum = base - total;
    const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
    set('sc-base', Number(base).toLocaleString('ru-RU') + ' 🪙');
    set('sc-discounts-sum', '−' + Number(discSum).toLocaleString('ru-RU') + ' 🪙');
    set('sc-final', Number(total).toLocaleString('ru-RU') + ' 🪙');
    const dl = $('sc-discounts-list'); if (dl) {
        dl.innerHTML = '';
        if (!list.length) dl.innerHTML = '<div style="color:var(--muted);font-size:13px;">Нет активных скидок</div>';
        list.forEach(d => {
            const row = document.createElement('div');
            row.className = 'sc-disc-row';
            const typeCls = d.type === 'seasonal' ? 'seasonal' : d.type === 'city' ? 'city' : 'faction';
            row.innerHTML = `
                <span class="sc-disc-name">${escapeHtml(d.name)}<span class="sc-disc-badge ${typeCls}">${d.type === 'seasonal' ? '🗓' : d.type === 'city' ? '⚓' : '🏴'}</span></span>
                <span class="sc-disc-value">−${d.value}% → ${Number(d.cut).toLocaleString('ru-RU')} 🪙</span>`;
            dl.appendChild(row);
        });
    }
}
/* ── Скидки админ ── */
on('disc-type', 'change', () => {
    const t = val('disc-type');
    $('disc-city-field').hidden = t !== 'city';
    $('disc-faction-field').hidden = t !== 'faction';
    if (t === 'city') {
        const sel = $('disc-city-select');
        if (sel) sel.innerHTML = portsCache.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
    }
    if (t === 'faction') {
        const sel = $('disc-faction-select');
        if (sel) sel.innerHTML = factionsCache.map(f => `<option value="${f.id}">${escapeHtml(f.name)}</option>`).join('');
    }
});
on('disc-add', 'click', async () => {
    const name = val('disc-name').trim();
    const value = parseFloat(val('disc-value')) || 0;
    const type = val('disc-type');
    const msg = $('disc-msg');
    if (!name) { msg.textContent = 'Укажи название'; msg.style.color = '#ff7a7a'; return; }
    if (value <= 0 || value > 100) { msg.textContent = 'Процент 0–100'; msg.style.color = '#ff7a7a'; return; }
    const payload = {
        name, type, value,
        city_id: type === 'city' ? val('disc-city-select') : null,
        faction_id: type === 'faction' ? val('disc-faction-select') : null,
        date_from: val('disc-from') || null,
        date_to: val('disc-to') || null,
        note: val('disc-note').trim() || null,
        active: $('disc-active').checked
    };
    const { error } = await supabase.from('discounts').insert(payload);
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    msg.textContent = '✔ Добавлено'; msg.style.color = '#6ee7a7';
    ['disc-name','disc-note','disc-from','disc-to'].forEach(i => { const el = $(i); if (el) el.value = ''; });
    loadRecipes();
});
function renderDiscountsAdmin() {
    const c = $('discounts-list'); if (!c) return;
    c.innerHTML = '';
    if (!discountsCache.length) { c.innerHTML = '<div class="empty">Скидок нет</div>'; return; }
    discountsCache.forEach(d => {
        const el = document.createElement('div');
        el.className = 'partners-admin-item';
        el.innerHTML = `
            <div class="logo-mini"><span>${d.type === 'seasonal' ? '🗓' : d.type === 'city' ? '⚓' : '🏴'}</span></div>
            <div class="txt"><b>${escapeHtml(d.name)}</b><span>−${d.value}%${d.active === false ? ' · неактивна' : ''}</span></div>
            <div class="actions"><button class="delete">🗑</button></div>`;
        el.querySelector('.delete').addEventListener('click', async () => {
            if (!confirm('Удалить скидку?')) return;
            await supabase.from('discounts').delete().eq('id', d.id);
            loadRecipes();
        });
        c.appendChild(el);
    });
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   40.  ⚓  ФРАКЦИИ / ПОРТЫ / РАНГИ                                    ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadFactions() {
    const { data } = await supabase.from('factions').select('*').order('sort_order');
    factionsCache = data || [];
    renderFactionsAdmin();
    fillPortFactionSelect();
    fillFactionAdminSelect();
}
function fillPortFactionSelect() {
    ['port-faction', 'pe-faction'].forEach(id => {
        const sel = $(id); if (!sel) return;
        const cur = sel.value; sel.innerHTML = '<option value="">— Без фракции —</option>';
        factionsCache.forEach(f => { const o = document.createElement('option'); o.value = f.id; o.textContent = f.name; sel.appendChild(o); });
        if (cur) sel.value = cur;
    });
}
function fillFactionAdminSelect() {
    const sel = $('disc-faction-select'); if (!sel) return;
    sel.innerHTML = factionsCache.map(f => `<option value="${f.id}">${escapeHtml(f.name)}</option>`).join('');
}
async function loadPorts() {
    const { data } = await supabase.from('ports').select('*').order('sort_order');
    portsCache = data || [];
    renderPortsAdmin();
}
async function loadRanks() {
    const { data } = await supabase.from('ranks').select('*').order('level');
    ranksCache = data || [];
    renderRanksAdmin();
}
function renderFactionsAdmin() {
    const c = $('factions-admin-list'); if (!c) return;
    c.innerHTML = '';
    if (!factionsCache.length) { c.innerHTML = '<div class="empty">Фракций нет</div>'; return; }
    factionsCache.forEach(f => {
        const el = document.createElement('div');
        el.className = 'partners-admin-item';
        el.innerHTML = `
            <div class="logo-mini"><span>${f.icon || '🏴'}</span></div>
            <div class="txt"><b>${escapeHtml(f.name)}</b><span>${escapeHtml(f.type || '')}</span></div>
            <div class="actions"><button class="edit">✏️</button><button class="delete">🗑</button></div>`;
        el.querySelector('.edit').addEventListener('click', () => openFactionEdit(f));
        el.querySelector('.delete').addEventListener('click', async () => {
            if (!confirm(`Удалить фракцию «${f.name}»?`)) return;
            await supabase.from('factions').delete().eq('id', f.id);
            loadFactions();
        });
        c.appendChild(el);
    });
}
function openFactionEdit(f) {
    editingItem = f || {};
    $('factionEditTitle').textContent = f ? '✏️ Фракция' : '➕ Новая фракция';
    $('fe-id').value = f?.id || '';
    $('fe-name').value = f?.name || '';
    $('fe-type').value = f?.type || 'military';
    $('fe-color').value = f?.color || '';
    $('fe-desc').value = f?.description || '';
    $('fe-msg').textContent = '';
    $('factionEditModal').hidden = false;
}
on('fe-cancel', 'click', () => { $('factionEditModal').hidden = true; editingItem = null; });
on('fe-save', 'click', async () => {
    const name = val('fe-name').trim();
    const id = val('fe-id').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || name.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const msg = $('fe-msg');
    if (!name) { msg.textContent = 'Укажи название'; msg.style.color = '#ff7a7a'; return; }
    const payload = {
        id, name,
        type: val('fe-type') || 'military',
        color: val('fe-color').trim() || null,
        description: val('fe-desc').trim() || null,
        sort_order: 10
    };
    const { error } = await supabase.from('factions').upsert(payload, { onConflict: 'id' });
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    $('factionEditModal').hidden = true;
    loadFactions();
});
function renderPortsAdmin() {
    const c = $('ports-admin-list'); if (!c) return;
    c.innerHTML = '';
    if (!portsCache.length) { c.innerHTML = '<div class="empty">Портов нет</div>'; return; }
    portsCache.forEach(p => {
        const f = factionsCache.find(x => x.id === p.faction_id);
        const el = document.createElement('div');
        el.className = 'partners-admin-item';
        el.innerHTML = `
            <div class="logo-mini"><span>⚓</span></div>
            <div class="txt"><b>${escapeHtml(p.name)}</b><span>${p.type || ''}${f ? ' · ' + escapeHtml(f.name) : ''}</span></div>
            <div class="actions"><button class="edit">✏️</button><button class="delete">🗑</button></div>`;
        el.querySelector('.edit').addEventListener('click', () => openPortEdit(p));
        el.querySelector('.delete').addEventListener('click', async () => {
            if (!confirm(`Удалить порт «${p.name}»?`)) return;
            await supabase.from('ports').delete().eq('id', p.id);
            loadPorts();
        });
        c.appendChild(el);
    });
}
function openPortEdit(p) {
    editingItem = p || {};
    $('portEditTitle').textContent = p ? '✏️ Порт' : '➕ Новый порт';
    $('pe-id').value = p?.id || '';
    $('pe-name').value = p?.name || '';
    $('pe-type').value = p?.type || 'city';
    $('pe-faction').value = p?.faction_id || '';
    $('pe-region').value = p?.region || '';
    $('pe-capturable').checked = p?.capturable !== false;
    $('pe-note').value = p?.note || '';
    $('pe-msg').textContent = '';
    $('portEditModal').hidden = false;
}
on('pe-cancel', 'click', () => { $('portEditModal').hidden = true; editingItem = null; });
on('pe-save', 'click', async () => {
    const name = val('pe-name').trim();
    const id = val('pe-id').trim() || undefined;
    const msg = $('pe-msg');
    if (!name) { msg.textContent = 'Укажи название'; msg.style.color = '#ff7a7a'; return; }
    const payload = {
        name,
        type: val('pe-type') || 'city',
        faction_id: val('pe-faction') || null,
        region: val('pe-region').trim() || null,
        capturable: $('pe-capturable').checked,
        note: val('pe-note').trim() || null,
        sort_order: 10
    };
    let error;
    if (id) ({ error } = await supabase.from('ports').update(payload).eq('id', id));
    else ({ error } = await supabase.from('ports').insert(payload));
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    $('portEditModal').hidden = true;
    loadPorts();
});
on('port-add', 'click', async () => {
    const name = val('port-name').trim();
    const msg = $('port-msg');
    if (!name) { msg.textContent = 'Укажи название'; msg.style.color = '#ff7a7a'; return; }
    const { error } = await supabase.from('ports').insert({
        name,
        type: val('port-type') || 'city',
        faction_id: val('port-faction') || null,
        region: val('port-region').trim() || null,
        capturable: $('port-capturable').checked,
        note: val('port-note').trim() || null,
        sort_order: 10
    });
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    ['port-name','port-region','port-note'].forEach(i => { const el = $(i); if (el) el.value = ''; });
    msg.textContent = '✔ Добавлено'; msg.style.color = '#6ee7a7';
    loadPorts();
});
function renderRanksAdmin() {
    const c = $('ranks-admin-list'); if (!c) return;
    c.innerHTML = '';
    if (!ranksCache.length) { c.innerHTML = '<div class="empty">Рангов нет</div>'; return; }
    ranksCache.forEach(r => {
        const el = document.createElement('div');
        el.className = 'partners-admin-item';
        el.innerHTML = `
            <div class="logo-mini"><span>${r.level || '—'}</span></div>
            <div class="txt"><b>${escapeHtml(r.name)}</b><span>${escapeHtml(r.description || '')}</span></div>`;
        c.appendChild(el);
    });
}
on('ranks-reload', 'click', loadRanks);

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   41.  🔔  УВЕДОМЛЕНИЯ                                                ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadNotifications() {
    const nick = getViewerNick();
    if (!nick) { notifications = []; renderNotifications(); return; }
    const { data, error } = await supabase.from('notifications').select('*').eq('user_nickname', nick).order('created_at', { ascending: false }).limit(50);
    if (error) return;
    notifications = data || [];
    renderNotifications();
}
function renderNotifications() {
    const list = $('notifList'); if (!list) return;
    const unread = notifications.filter(n => !n.is_read).length;
    ['notifBadge','notifBadge2'].forEach(id => {
        const b = $(id); if (!b) return;
        if (unread > 0) { b.textContent = unread > 99 ? '99+' : unread; b.hidden = false; }
        else b.hidden = true;
    });
    if (!notifications.length) { list.innerHTML = '<p class="empty" style="padding:20px;text-align:center;">Уведомлений нет</p>'; return; }
    const icons = { event: '📅', trade: '🪙', application: '📝', chat: '💬', system: '⚙️' };
    list.innerHTML = notifications.map(n => `
        <div class="notif-item ${n.is_read ? '' : 'unread'}" data-id="${n.id}">
            <div class="notif-item-icon">${icons[n.type] || '🔔'}</div>
            <div class="notif-item-body">
                <div class="notif-item-title">${escapeHtml(n.title || '')}</div>
                ${n.body ? `<div class="notif-item-text">${escapeHtml(n.body)}</div>` : ''}
                <div class="notif-item-time">${tradeTimeAgo(n.created_at)}</div>
            </div>
        </div>`).join('');
    list.querySelectorAll('.notif-item').forEach(el => {
        el.addEventListener('click', async () => {
            const n = notifications.find(x => String(x.id) === String(el.dataset.id));
            if (!n) return;
            if (!n.is_read) {
                await supabase.from('notifications').update({ is_read: true }).eq('id', n.id);
                n.is_read = true; renderNotifications();
            }
            const p = $('notifPanel'); if (p) p.hidden = true;
        });
    });
}
async function createNotification(userNickname, type, title, body, link) {
    if (!userNickname) return;
    try { await supabase.from('notifications').insert({ user_nickname: userNickname, type, title, body: body || null, link: link || null }); }
    catch (e) { }
}
function openNotifPanel() { const p = $('notifPanel'); if (p) p.hidden = false; loadNotifications(); }
function closeNotifPanel() { const p = $('notifPanel'); if (p) p.hidden = true; }
on('notifBell',  'click', e => { e.stopPropagation(); $('notifPanel').hidden ? openNotifPanel() : closeNotifPanel(); });
on('notifBell2', 'click', e => { e.stopPropagation(); $('notifPanel').hidden ? openNotifPanel() : closeNotifPanel(); });
document.addEventListener('click', e => {
    const p = $('notifPanel'); if (!p || p.hidden) return;
    if (e.target.closest('#notifPanel')) return;
    if (e.target.closest('#notifBell') || e.target.closest('#notifBell2')) return;
    closeNotifPanel();
});
on('notifMarkAllRead', 'click', async () => {
    const nick = getViewerNick(); if (!nick) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_nickname', nick).eq('is_read', false);
    loadNotifications();
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   42.  💬  ЧАТ + ГОЛОСОВОЙ                                           ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function setChatMode(mode) {
    chatMode = mode;
    document.querySelectorAll('.chat-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
    const privTab = $('chatPrivateTab');
    if (privTab) { if (chatPrivateWith) { privTab.hidden = false; privTab.textContent = '✉️ ' + chatPrivateWith; } else privTab.hidden = true; }
    const leadersTab = $('chatLeadersTab');
    if (leadersTab) leadersTab.hidden = !isClanLeader();
    const voiceTab = $('chatVoiceTab'); if (voiceTab) voiceTab.hidden = !currentClan;
    const clearBtn = $('chatClear'); if (clearBtn) clearBtn.hidden = !isAdmin || mode === 'voice';

    const inputRow = $('chatInputRow'), voiceBox = $('chatVoiceContainer'), msgBox = $('chatMessages');
    if (mode === 'voice') {
        if (inputRow) inputRow.hidden = true;
        if (msgBox) msgBox.hidden = true;
        if (voiceBox) voiceBox.hidden = false;
        startVoiceChat(); return;
    } else {
        if (inputRow) inputRow.hidden = false;
        if (msgBox) msgBox.hidden = false;
        if (voiceBox) voiceBox.hidden = true;
        stopVoiceChat();
    }
    const input = $('chatInput');
    if (input) {
        if (mode === 'private' && chatPrivateWith) input.placeholder = `Личное для ${chatPrivateWith}...`;
        else if (mode === 'general') input.placeholder = 'Общий чат...';
        else if (mode === 'leaders') input.placeholder = 'Чат глав...';
        else input.placeholder = 'Чат гильдии...';
    }
    loadChatMessages();
    initChatRealtime();
}
function buildVoiceRoomName() { return 'wosb_guild_' + (String(currentClan || 'common').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()); }
function ensureJitsiApi(cb) {
    if (window.JitsiMeetExternalAPI) { cb(); return; }
    if (jitsiLoading) return;
    jitsiLoading = true;
    const s = document.createElement('script');
    s.src = 'https://meet.jit.si/external_api.js'; s.async = true;
    s.onload = () => { jitsiLoading = false; cb(); };
    s.onerror = () => { jitsiLoading = false; alert('Не удалось загрузить голосовой чат.'); };
    document.head.appendChild(s);
}
function startVoiceChat() {
    if (!currentClan) return;
    const c = $('chatVoiceContainer'); if (!c || jitsiApi) return;
    ensureJitsiApi(() => {
        c.innerHTML = '';
        jitsiApi = new window.JitsiMeetExternalAPI('meet.jit.si', {
            roomName: buildVoiceRoomName(),
            parentNode: c, width: '100%', height: '100%',
            userInfo: { displayName: getViewerNick() || 'Гость' },
            configOverwrite: { startWithVideoMuted: true, startWithAudioMuted: false, prejoinPageEnabled: false, disableDeepLinking: true, p2p: { enabled: false }, toolbarButtons: ['microphone','camera','desktop','chat','raisehand','tileview','settings','hangup'] },
            interfaceConfigOverwrite: { SHOW_JITSI_WATERMARK: false, SHOW_WATERMARK_FOR_GUESTS: false, DEFAULT_BACKGROUND: '#0a0d12' }
        });
        jitsiApi.addEventListener('videoConferenceLeft', stopVoiceChat);
    });
}
function stopVoiceChat() {
    if (jitsiApi) { try { jitsiApi.dispose(); } catch (e) { } jitsiApi = null; }
    const c = $('chatVoiceContainer'); if (c) c.innerHTML = '';
}
async function loadChatMessages() {
    const c = $('chatMessages'); if (!c) return;
    if (chatMode === 'guild' && !currentClan) { c.innerHTML = '<p class="empty" style="text-align:center;padding:20px;">🏰 Зайдите в гильдию.</p>'; return; }
    if (chatMode === 'private' && !chatPrivateWith) { c.innerHTML = '<p class="empty" style="text-align:center;padding:20px;">Выберите получателя.</p>'; return; }
    c.innerHTML = '<p class="empty" style="text-align:center;">Загрузка…</p>';
    const myNick = getViewerNick();
    let q = supabase.from('chat_messages').select('*');
    if (chatMode === 'guild') q = q.eq('clan_id', currentClan).is('recipient', null);
    else if (chatMode === 'general') q = q.is('clan_id', null).is('recipient', null);
    else if (chatMode === 'leaders') q = q.eq('clan_id', '__leaders__');
    else if (chatMode === 'private') {
        const other = chatPrivateWith, me = myNick || '__no_nick__';
        q = q.or(`and(nickname.eq.${me},recipient.eq.${other}),and(nickname.eq.${other},recipient.eq.${me})`);
    }
    const { data, error } = await q.order('created_at', { ascending: true }).limit(200);
    if (error) { c.innerHTML = `<p class="empty">Ошибка: ${error.message}</p>`; return; }
    chatMessages = data || [];
    renderChatMessages();
}
function renderChatMessages() {
    const c = $('chatMessages'); if (!c) return;
    if (!chatMessages.length) { c.innerHTML = '<p class="empty" style="text-align:center;padding:20px;">Сообщений нет</p>'; return; }
    const me = getViewerNick().toLowerCase();
    c.innerHTML = chatMessages.map(m => {
        const mine = me && (m.nickname || '').toLowerCase() === me;
        const d = new Date(m.created_at);
        const time = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
        const dateStr = d.toLocaleDateString('ru-RU');
        const today = new Date().toLocaleDateString('ru-RU');
        const tl = dateStr === today ? time : `${dateStr} ${time}`;
        return `
            <div class="chat-message ${mine ? 'mine' : ''} ${m.recipient ? 'private' : ''}">
                <div class="chat-message-head">
                    <span class="chat-message-author" data-nick="${escapeHtml(m.nickname)}">${escapeHtml(m.nickname)}${m.recipient ? ' ✉️' : ''}</span>
                    <span class="chat-message-time">${tl}</span>
                </div>
                <div class="chat-message-text">${escapeHtml(m.text)}</div>
            </div>`;
    }).join('');
    c.scrollTop = c.scrollHeight;
    c.querySelectorAll('.chat-message-author').forEach(el => el.addEventListener('click', () => openProfile(el.dataset.nick)));
}
async function sendChatMessage() {
    const input = $('chatInput'); if (!input) return;
    const text = input.value.trim(); if (!text) return;
    if (chatMode === 'guild' && !currentClan) return alert('Зайдите в гильдию.');
    if (chatMode === 'private' && !chatPrivateWith) return alert('Выберите получателя');
    let nick = getViewerNick();
    if (!nick) {
        nick = prompt('Введите ваш ник:');
        if (!nick || nick.trim().length < 2) return;
        nick = nick.trim(); localStorage.setItem(VIEWER_NICK_KEY, nick); sendHeartbeat();
    }
    const payload = { nickname: nick, text };
    if (chatMode === 'guild') payload.clan_id = currentClan;
    else if (chatMode === 'general') { payload.clan_id = null; payload.recipient = null; }
    else if (chatMode === 'leaders') { payload.clan_id = '__leaders__'; payload.recipient = null; }
    else if (chatMode === 'private') { payload.clan_id = null; payload.recipient = chatPrivateWith; }
    $('chatSend').disabled = true;
    const { error } = await supabase.from('chat_messages').insert(payload);
    $('chatSend').disabled = false;
    if (error) return alert('Ошибка: ' + error.message);
    input.value = '';
}
async function clearChat() {
    if (!isAdmin) return;
    const label = chatMode === 'general' ? 'ОБЩИЙ чат' : chatMode === 'private' ? `личные с «${chatPrivateWith}»` : `чат гильдии «${clansCache[currentClan]?.name || currentClan}»`;
    if (!confirm(`Очистить ${label}?`)) return;
    let q = supabase.from('chat_messages').delete();
    const my = getViewerNick();
    if (chatMode === 'guild') q = q.eq('clan_id', currentClan).is('recipient', null);
    else if (chatMode === 'general') q = q.is('clan_id', null).is('recipient', null);
    else if (chatMode === 'private') q = q.or(`and(nickname.eq.${my},recipient.eq.${chatPrivateWith}),and(nickname.eq.${chatPrivateWith},recipient.eq.${my})`);
    const { error } = await q;
    if (error) return alert('Ошибка: ' + error.message);
    chatMessages = []; renderChatMessages();
}
function openChat(mode) {
    const cb = $('chatClear'); if (cb) cb.hidden = !isAdmin;
    $('chatPanel').hidden = false;
    if (mode === 'voice' && currentClan) setChatMode('voice');
    else if (mode === 'private' && chatPrivateWith) setChatMode('private');
    else if (mode === 'general') setChatMode('general');
    else if (mode === 'leaders') setChatMode('leaders');
    else if (mode === 'guild') setChatMode('guild');
    else setChatMode(currentClan ? 'guild' : 'general');
}
function openPrivateChat(nick) {
    if (!nick) return;
    chatPrivateWith = nick;
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
on('chatInput', 'keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } });
document.querySelectorAll('.chat-tab').forEach(tab => tab.addEventListener('click', () => setChatMode(tab.dataset.mode)));
on('chatVoiceTab', 'click', () => openChat('voice'));
function initChatRealtime() {
    if (chatChannel) { supabase.removeChannel(chatChannel); chatChannel = null; }
    if (chatMode === 'voice') return;
    const channelName = 'chat_' + chatMode + '_' + (chatPrivateWith || currentClan || 'global');
    chatChannel = supabase.channel(channelName)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, payload => {
            const m = payload.new;
            const my = getViewerNick();
            if (chatMode === 'guild') { if (m.clan_id !== currentClan || m.recipient) return; }
            else if (chatMode === 'general') { if (m.clan_id !== null || m.recipient) return; }
            else if (chatMode === 'private') {
                if (!chatPrivateWith) return;
                const other = chatPrivateWith;
                const a = m.nickname === my && m.recipient === other;
                const b = m.nickname === other && m.recipient === my;
                if (!a && !b) return;
            }
            if (chatMessages.some(x => x.id === m.id)) return;
            chatMessages.push(m);
            if (chatMessages.length > 200) chatMessages.shift();
            renderChatMessages();
        }).subscribe();
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   43.  📰  VK-НОВОСТИ                                                ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function openVkNewsModal() {
    const m = $('vkNewsModal'); if (!m) return;
    m.hidden = false; document.body.style.overflow = 'hidden';
    loadNews();
}
function closeVkNewsModal() {
    const m = $('vkNewsModal'); if (!m) return;
    m.hidden = true; document.body.style.overflow = '';
}
async function loadNews() {
    const c = $('vkNewsList'); if (!c) return;
    c.innerHTML = '<div class="vk-news-loading">Загрузка новостей…</div>';
    const link = $('vkNewsSourceLink');
    if (link && settingsCache?.news_rss_url) link.href = settingsCache.news_rss_url;
    const apiUrl = `https://api.vk.com/method/wall.get?domain=${encodeURIComponent(VK_DOMAIN)}&count=${VK_POSTS_COUNT}&v=${VK_API_VERSION}`;
    const proxies = [
        u => 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u),
        u => 'https://corsproxy.io/?' + encodeURIComponent(u)
    ];
    let json = null, lastErr = null;
    for (const make of proxies) {
        try {
            const r = await fetch(make(apiUrl), { cache: 'no-store' });
            if (!r.ok) continue;
            const d = await r.json();
            if (d?.response) { json = d; break; }
            if (d?.error) lastErr = d.error.error_msg;
        } catch (e) { lastErr = e.message; }
    }
    if (!json) { c.innerHTML = `<div class="vk-news-error">Не удалось загрузить новости.<br>${escapeHtml(lastErr || '')}</div>`; return; }
    const posts = json.response?.items || [];
    if (!posts.length) { c.innerHTML = '<div class="vk-news-empty">Новостей нет</div>'; return; }
    c.innerHTML = '';
    posts.forEach(p => c.appendChild(createVkNewsCard(p)));
}
function createVkNewsCard(post) {
    const el = document.createElement('article');
    el.className = 'vk-news-item';
    const date = new Date(post.date * 1000);
    const ds = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    let text = post.text || '';
    const isLong = text.length > 1000;
    if (isLong) text = text.slice(0, 1000) + '…';
    const link = `https://vk.com/wall${post.owner_id}_${post.id}`;
    const photos = [];
    (post.attachments || []).forEach(att => {
        if (att.type === 'photo' && att.photo) {
            const s = (att.photo.sizes || []).filter(x => x.width <= 1300).sort((a, b) => b.width - a.width)[0];
            const best = s || (att.photo.sizes || []).sort((a, b) => b.width - a.width)[0];
            if (best) photos.push(best.url);
        }
    });
    el.innerHTML = `
        <div class="vk-news-header"><span class="vk-news-date">📅 ${ds}</span></div>
        ${text ? `<div class="vk-news-text">${escapeHtml(text)}</div>` : ''}
        ${photos.length ? `<div class="vk-news-attachments">${photos.slice(0, 2).map(u => `<img class="vk-news-photo" src="${escapeHtml(u)}" loading="lazy" onerror="this.style.display='none'">`).join('')}</div>` : ''}
        <div class="vk-news-footer">
            <span class="vk-news-likes">❤️ ${post.likes?.count || 0}</span>
            <a class="vk-news-link" href="${escapeHtml(link)}" target="_blank" rel="noopener">Читать полностью →</a>
        </div>`;
    return el;
}
on('openVkNewsBtn', 'click', openVkNewsModal);
on('closeVkNews', 'click', closeVkNewsModal);
on('vkNewsModal', 'click', e => { if (e.target.id === 'vkNewsModal') closeVkNewsModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { const m = $('vkNewsModal'); if (m && !m.hidden) closeVkNewsModal(); } });

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   44.  👤  ПРОФИЛЬ ИГРОКА                                            ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function openProfile(nick) {
    if (!nick) return;
    $('profileNickname').textContent = nick;
    const st = $('profileStats');
    st.innerHTML = '<div class="empty">Загрузка…</div>';
    $('profileModal').hidden = false;
    try {
        const [en, fr, ne, pe, tb, ts] = await Promise.all([
            supabase.from('enemies').select('id', { count: 'exact', head: true }).eq('nickname', nick),
            supabase.from('friends').select('id', { count: 'exact', head: true }).eq('nickname', nick),
            supabase.from('neutral').select('id', { count: 'exact', head: true }).eq('nickname', nick),
            supabase.from('personal').select('id', { count: 'exact', head: true }).eq('nickname', nick),
            supabase.from('trades').select('id', { count: 'exact', head: true }).eq('nickname', nick).eq('type', 'buy'),
            supabase.from('trades').select('id', { count: 'exact', head: true }).eq('nickname', nick).eq('type', 'sell')
        ]);
        const stats = [
            { label: '🔴 Врагов',      value: en.count || 0 },
            { label: '🟢 Друзей',      value: fr.count || 0 },
            { label: '⚪ Нейтралитет', value: ne.count || 0 },
            { label: '🟡 Не трогать',  value: pe.count || 0 },
            { label: '🛒 Хочет купить', value: tb.count || 0 },
            { label: '💰 Хочет продать', value: ts.count || 0 }
        ];
        const { data: online } = await supabase.from('online_users').select('last_seen').eq('nickname', nick).maybeSingle();
        let o = '⚫ Офлайн';
        if (online?.last_seen) {
            const d = Date.now() - new Date(online.last_seen).getTime();
            if (d < 90000) o = '🟢 Онлайн';
            else if (d < 3600000) o = `🔵 ${Math.floor(d/60000)} мин назад`;
            else if (d < 86400000) o = `🔵 ${Math.floor(d/3600000)} ч назад`;
        }
        stats.unshift({ label: '📡 Статус', value: o });
        st.innerHTML = stats.map(s => `
            <div class="profile-stat-row"><span class="profile-stat-label">${s.label}</span><span class="profile-stat-value">${s.value}</span></div>`).join('');
    } catch (e) { st.innerHTML = `<div class="empty">Ошибка: ${e.message}</div>`; }
}
on('closeProfile', 'click', () => { $('profileModal').hidden = true; });
on('profileModal', 'click', e => { if (e.target.id === 'profileModal') $('profileModal').hidden = true; });

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   45.  🎖  ПАНЕЛЬ ГЛАВЫ                                              ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function openLeaderPanel() {
    if (!isClanLeader()) return alert('Только для глав');
    const cid = getLeaderClanId();
    const nameEl = $('leaderClanName');
    if (nameEl) nameEl.textContent = cid && clansCache[cid] ? clansCache[cid].name : '—';
    showScreen('leader');
}
['leaderPanelBtn','leaderPanelBtn2','leaderPanelBtn3'].forEach(id => on(id, 'click', openLeaderPanel));
on('leaderBackBtn', 'click', () => showScreen(currentClan ? 'lists' : 'home'));
on('leaderOpenChatBtn', 'click', () => openChat('leaders'));
on('leaderOpenVoiceBtn', 'click', () => openChat('voice'));
on('leaderOpenChatTop', 'click', () => openChat('leaders'));
on('leaderOpenVoiceTop', 'click', () => openChat('voice'));
on('leaderOfferAllianceBtn', 'click', () => {
    const sel = $('leaderAlliancePickerSelect'); if (!sel) return;
    const cid = getLeaderClanId();
    sel.innerHTML = '';
    Object.values(clansCache).filter(c => c.id !== cid).forEach(c => {
        const o = document.createElement('option'); o.value = c.id; o.textContent = c.name; sel.appendChild(o);
    });
    $('leaderAlliancePickerMsg').value = '';
    $('leaderAlliancePickerError').textContent = '';
    $('leaderAlliancePickerModal').hidden = false;
});
on('leaderAlliancePickerCancel', 'click', () => { $('leaderAlliancePickerModal').hidden = true; });
on('leaderAlliancePickerSend', 'click', async () => {
    const target = val('leaderAlliancePickerSelect');
    const cid = getLeaderClanId();
    const err = $('leaderAlliancePickerError');
    if (!target || !cid) { err.textContent = 'Выберите гильдию'; return; }
    const { error } = await supabase.from('alliance_requests').insert({
        from_clan: cid, to_clan: target, message: val('leaderAlliancePickerMsg').trim() || null, status: 'pending'
    });
    if (error) { err.textContent = 'Ошибка: ' + error.message; return; }
    $('leaderAlliancePickerModal').hidden = true;
    alert('✔ Предложение отправлено');
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   46.  🏰  АДМИН: ГИЛЬДИИ                                            ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function renderAdminClanSelect() {
    const sel = $('adminClanSelect'); if (!sel) return;
    const cur = sel.value; sel.innerHTML = '';
    Object.values(clansCache).forEach(c => { const o = document.createElement('option'); o.value = c.id; o.textContent = c.name; sel.appendChild(o); });
    if (cur && clansCache[cur]) sel.value = cur;
    updateAdminFields();
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
    $('adminLeaderNick').value = clan?.leader_nick || '';
    $('adminDiscord').value = clan?.discord || '';
    $('adminPhone').value = clan?.phone || '';
    $('adminNews').value = clan?.news || '';
    $('adminRules').value = clan?.rules || '';
    $('adminNicks').value = clan?.admin_nicks || '';
    $('adminMembers').value = clan?.members_list || '';
    const img = $('adminClanImage'); if (img) img.value = clan?.image || '';
    const fl = $('adminClanFlag'); if (fl) fl.value = clan?.flag || 'neutral';
    updateFlagPreview('adminClanFlag', 'adminClanFlagPreview');
    $('adminPanelMsg').textContent = '';
}
on('saveAdminSettings', 'click', async () => {
    const cid = val('adminClanSelect'); if (!cid) return;
    const clan = clansCache[cid]; if (!clan) return;
    const msg = $('adminPanelMsg');
    const np = val('adminNewPass').trim(), nap = val('adminNewAdminPass').trim();
    const payload = {
        leader_nick: val('adminLeaderNick').trim() || null,
        discord: val('adminDiscord').trim() || null,
        phone: val('adminPhone').trim() || null,
        news: val('adminNews') || null,
        rules: val('adminRules'),
        game_id: val('adminClanGame') || null,
        alliance_id: val('adminClanAlliance') || null,
        admin_nicks: val('adminNicks') || null,
        members_list: val('adminMembers') || null,
        image: val('adminClanImage').trim() || null,
        flag: val('adminClanFlag') || 'neutral',
        updated_at: new Date().toISOString()
    };
    if (np) payload.password = np;
    if (nap) payload.admin_password = nap;
    const { error } = await supabase.from('clans').update(payload).eq('id', cid);
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    Object.assign(clansCache[cid], payload);
    msg.textContent = '✔ Сохранено'; msg.style.color = '#6ee7a7';
    $('adminNewPass').value = ''; $('adminNewAdminPass').value = '';
    $('adminCurrentPass').value = clansCache[cid].password || '—';
    $('adminCurrentAdminPass').value = clansCache[cid].admin_password || '—';
    if (currentClan === cid) { renderMembers(); renderAdmins(); }
    renderHomeCards(); renderContacts(); renderAlliancesAdmin(); updateAllianceBar();
});
on('deleteClanBtn', 'click', async () => {
    const cid = val('adminClanSelect'); if (!cid) return;
    const clan = clansCache[cid]; if (!clan) return;
    if (!confirm(`Удалить «${clan.name}»?`)) return;
    if (prompt(`Введите «${clan.name}» для подтверждения:`) !== clan.name) return alert('Не совпадает');
    const btn = $('deleteClanBtn'); btn.disabled = true; btn.textContent = '⏳…';
    try {
        for (const t of TABS) await supabase.from(t).delete().eq('clan', cid);
        await supabase.from('events').delete().eq('clan', cid).eq('is_shared', false);
        await supabase.from('treasury').delete().eq('clan', cid);
        await supabase.from('trades').delete().eq('clan', cid);
        await supabase.from('builds').delete().eq('clan', cid).eq('is_shared', false);
        await supabase.from('clans').delete().eq('id', cid);
        delete clansCache[cid];
        if (currentClan === cid) { currentClan = null; ['guild_last_clan','guild_unlocked','guild_my_clan'].forEach(k => localStorage.removeItem(k)); }
        renderHomeCards(); renderAdminClanSelect(); renderContacts();
        $('adminPanelMsg').textContent = '✔ Удалено'; $('adminPanelMsg').style.color = '#6ee7a7';
    } catch (e) { $('adminPanelMsg').textContent = 'Ошибка: ' + e.message; $('adminPanelMsg').style.color = '#ff7a7a'; }
    btn.disabled = false; btn.textContent = '🗑 Удалить гильдию';
});
on('adminClanImagePick', 'click', () => $('adminClanImageFile').click());
on('adminClanImageFile', 'change', async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
        if (f.type.startsWith('video/')) {
            const r = new FileReader();
            r.onload = ev => {
                window.__adminClanLogoData = ev.target.result;
                $('adminClanImagePreviewImg').src = '';
                $('adminClanImagePreview').hidden = false;
                $('adminClanImageName').textContent = f.name + ' (видео)';
                const i = $('adminClanImage'); if (i) i.value = '';
            };
            r.readAsDataURL(f); return;
        }
        window.__adminClanLogoData = await compressSquare(f, 256, 0.9);
        $('adminClanImagePreviewImg').src = window.__adminClanLogoData;
        $('adminClanImagePreview').hidden = false;
        $('adminClanImageName').textContent = f.name;
    } catch (err) { alert('Ошибка: ' + err.message); }
});
on('adminClanImageClear', 'click', () => {
    window.__adminClanLogoData = null;
    $('adminClanImageFile').value = '';
    $('adminClanImagePreview').hidden = true;
    $('adminClanImageName').textContent = '';
});
on('newClanImagePick', 'click', () => $('newClanImageFile').click());
on('newClanImageFile', 'change', async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
        if (f.type.startsWith('video/')) {
            const r = new FileReader();
            r.onload = ev => {
                window.__newClanLogoData = ev.target.result;
                $('newClanImagePreviewImg').src = '';
                $('newClanImagePreview').hidden = false;
                $('newClanImageName').textContent = f.name + ' (видео)';
            };
            r.readAsDataURL(f); return;
        }
        window.__newClanLogoData = await compressSquare(f, 256, 0.9);
        $('newClanImagePreviewImg').src = window.__newClanLogoData;
        $('newClanImagePreview').hidden = false;
        $('newClanImageName').textContent = f.name;
    } catch (err) { alert('Ошибка: ' + err.message); }
});
on('newClanImageClear', 'click', () => {
    window.__newClanLogoData = null;
    $('newClanImageFile').value = '';
    $('newClanImagePreview').hidden = true;
    $('newClanImageName').textContent = '';
});
function updateFlagPreview(selId, prevId) {
    const s = $(selId), p = $(prevId); if (!s || !p) return;
    const flag = CLAN_FLAGS[s.value] || CLAN_FLAGS.neutral;
    p.style.backgroundImage = `url("${flag}")`;
}
on('newClanFlag', 'change', () => updateFlagPreview('newClanFlag', 'newClanFlagPreview'));
on('adminClanFlag', 'change', () => updateFlagPreview('adminClanFlag', 'adminClanFlagPreview'));
on('openAddClan', 'click', () => {
    ['newClanId','newClanName','newClanLeaderNick','newClanDesc','newClanRules','newClanPass','newClanAdminPass','newClanDiscord','newClanPhone','newClanImage','newClanBg'].forEach(i => { const el = $(i); if (el) el.value = ''; });
    $('newClanFlag').value = 'neutral';
    updateFlagPreview('newClanFlag', 'newClanFlagPreview');
    window.__newClanLogoData = null;
    $('newClanImagePreview').hidden = true;
    $('newClanImageName').textContent = '';
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
    const game = val('newClanGame');
    const msg = $('addClanMsg');
    if (!id || !name || !pass) { msg.textContent = 'ID, название и пароль обязательны'; msg.style.color = '#ff7a7a'; return; }
    if (!game) { msg.textContent = 'Выберите игру'; msg.style.color = '#ff7a7a'; return; }
    if (clansCache[id]) { msg.textContent = 'ID занят'; msg.style.color = '#ff7a7a'; return; }
    const payload = {
        id, name, game_id: game,
        leader_nick: val('newClanLeaderNick').trim() || null,
        description: val('newClanDesc').trim() || null,
        rules: val('newClanRules') || null,
        password: pass,
        admin_password: val('newClanAdminPass').trim() || null,
        alliance_id: val('newClanAlliance') || null,
        discord: val('newClanDiscord').trim() || null,
        phone: val('newClanPhone').trim() || null,
        image: window.__newClanLogoData || val('newClanImage').trim() || null,
        flag: val('newClanFlag') || 'neutral',
        bg: val('newClanBg').trim() || null
    };
    const { error } = await supabase.from('clans').insert(payload);
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    clansCache[id] = payload;
    renderHomeCards(); renderAdminClanSelect(); renderContacts();
    msg.textContent = '✔ Гильдия создана'; msg.style.color = '#6ee7a7';
    setTimeout(() => { $('addClanModal').hidden = true; }, 800);
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   47.  📨  ЗАЯВКИ НА СОЗДАНИЕ ГИЛЬДИЙ (админ)                        ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
on('openClanRequestBtn', 'click', () => {
    ['crName','crLeaderNick','crDesc','crRules','crRequesterNick','crEmail','crDiscord','crPassword','crAdminPassword','crImage'].forEach(i => { const el = $(i); if (el) el.value = ''; });
    $('crFlag').value = 'neutral';
    $('crRequesterNick').value = getViewerNick();
    renderClanRequestGameSelect();
    $('clanRequestMsg').textContent = '';
    $('clanRequestModal').hidden = false;
});
on('clanRequestCancel', 'click', () => { $('clanRequestModal').hidden = true; });
on('clanRequestSubmit', 'click', async () => {
    const name = val('crName').trim();
    const nick = val('crRequesterNick').trim();
    const pass = val('crPassword').trim();
    const msg = $('clanRequestMsg');
    if (!name) { msg.textContent = 'Укажи название'; msg.style.color = '#ff7a7a'; return; }
    if (!nick) { msg.textContent = 'Укажи свой ник'; msg.style.color = '#ff7a7a'; return; }
    if (!pass || pass.length < 2) { msg.textContent = 'Пароль от 2 символов'; msg.style.color = '#ff7a7a'; return; }
    const payload = {
        nickname: nick, email: val('crEmail').trim() || null,
        password: pass, admin_password: val('crAdminPassword').trim() || null,
        clan_name: name,
        leader_nick: val('crLeaderNick').trim() || null,
        description: val('crDesc').trim() || null,
        rules: val('crRules').trim() || null,
        discord: val('crDiscord').trim() || null,
        game_id: val('crGameId') || null,
        image: val('crImage').trim() || null,
        flag: val('crFlag') || 'neutral',
        requester_nickname: nick,
        requester_email: val('crEmail').trim() || null,
        status: 'pending'
    };
    $('clanRequestSubmit').disabled = true;
    const { error } = await supabase.from('clan_requests').insert(payload);
    $('clanRequestSubmit').disabled = false;
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    msg.textContent = '✔ Заявка отправлена!'; msg.style.color = '#6ee7a7';
    setTimeout(() => { $('clanRequestModal').hidden = true; }, 1800);
});
async function renderClanRequestsAdmin() {
    const c = $('clanRequestsList'); if (!c) return;
    if (!isOwner) { c.innerHTML = '<div class="empty">Только владелец</div>'; return; }
    c.innerHTML = '<div class="empty">Загрузка…</div>';
    const { data, error } = await supabase.from('clan_requests').select('*').order('created_at', { ascending: false });
    if (error) { c.innerHTML = `<div class="empty">Ошибка: ${error.message}</div>`; return; }
    if (!data?.length) { c.innerHTML = '<div class="empty">Заявок нет</div>'; return; }
    c.innerHTML = '';
    data.forEach(r => {
        const d = new Date(r.created_at);
        const ds = d.toLocaleDateString('ru-RU') + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
        const card = document.createElement('div');
        card.className = 'application-card ' + (r.status || 'pending');
        card.innerHTML = `
            <div class="application-head">
                <div class="application-nick">🏰 ${escapeHtml(r.clan_name)}</div>
                <div class="application-date">${ds} · <b>${escapeHtml(r.status || 'pending')}</b></div>
            </div>
            <div class="application-grid">
                <div><b>Автор</b>${escapeHtml(r.requester_nickname || r.nickname || '—')}</div>
                <div><b>Email</b>${escapeHtml(r.email || '—')}</div>
                <div><b>Discord</b>${escapeHtml(r.discord || '—')}</div>
                <div><b>Игра</b>${escapeHtml(gamesCache[r.game_id]?.name || r.game_id || '—')}</div>
                <div><b>Флаг</b>${escapeHtml(r.flag || 'neutral')}</div>
                <div><b>Пароль</b><code>${escapeHtml(r.password)}</code></div>
            </div>
            ${r.description ? `<div class="application-why"><b>Описание:</b>\n${escapeHtml(r.description)}</div>` : ''}
            <div class="application-actions">
                ${r.status === 'pending' ? `<button class="approve">✅ Создать</button><button class="reject">❌ Отклонить</button>` : ''}
                <button class="delete">🗑 Удалить</button>
            </div>`;
        card.querySelector('.approve')?.addEventListener('click', async () => {
            if (!confirm(`Создать гильдию «${r.clan_name}»?`)) return;
            const { data: resp, error } = await supabase.rpc('approve_clan_request', { request_id: r.id });
            if (error) return alert(error.message);
            if (resp?.error) return alert(resp.error);
            alert('✔ Гильдия создана: ' + resp.clan_id);
            await loadClans();
            await renderClanRequestsAdmin();
        });
        card.querySelector('.reject')?.addEventListener('click', async () => {
            if (!confirm('Отклонить?')) return;
            const { data: resp, error } = await supabase.rpc('reject_clan_request', { request_id: r.id });
            if (error) return alert(error.message);
            if (resp?.error) return alert(resp.error);
            await renderClanRequestsAdmin();
        });
        card.querySelector('.delete')?.addEventListener('click', async () => {
            if (!confirm('Удалить заявку?')) return;
            await supabase.from('clan_requests').delete().eq('id', r.id);
            await renderClanRequestsAdmin();
        });
        c.appendChild(el => el);
        c.appendChild(card);
    });
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   48.  ⚙️  НАСТРОЙКИ САЙТА                                           ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadSettings() {
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'main').single();
    if (error) return;
    settingsCache = data || {};
}
function renderSiteFields() {
    const s = settingsCache || {};
    const w = $('adminWebhook'); if (w) w.value = s.discord_webhook || '';
    const n = $('adminNewsRss'); if (n) n.value = s.news_rss_url || 'https://vk.ru/@worldofseabattle';
    const m = $('adminSiteMsg'); if (m) m.textContent = '';
}
on('saveSiteSettings', 'click', async () => {
    const msg = $('adminSiteMsg'); msg.style.color = '';
    const payload = {
        discord_webhook: val('adminWebhook').trim() || null,
        news_rss_url: val('adminNewsRss').trim() || null,
        updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('site_settings').update(payload).eq('id', 'main');
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    settingsCache = Object.assign({ id: 'main' }, settingsCache || {}, payload);
    msg.textContent = '✔ Сохранено'; msg.style.color = '#6ee7a7';
});
async function loadStats() {
    const row = $('statsRow'); if (!row) return;
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
            { label: 'Нейтралов', value: n.count || 0, ico: '⚪' },
            { label: 'В личном', value: p.count || 0, ico: '🟡' },
            { label: 'ПВП-билды', value: b1.count || 0, ico: '⚔️' },
            { label: 'ПБ-билды', value: b2.count || 0, ico: '🛡' },
            { label: 'Гильдий', value: c.count || 0, ico: '🏰' },
            { label: 'Сделок', value: t.count || 0, ico: '💰' }
        ];
        stats.forEach(s => {
            const el = document.createElement('div');
            el.className = 'stat-card';
            el.innerHTML = `<div class="stat-value">${s.ico} ${s.value}</div><div class="stat-label">${s.label}</div>`;
            row.appendChild(el);
        });
    } catch (e) { }
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║   49.  🚀  СТАРТ                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
(async () => {
    const ver = document.querySelector('.footer-right');
    if (ver) ver.textContent = 'v' + APP_VERSION;
    initTheme();

    const { data: { session } } = await supabase.auth.getSession();
    currentSession = session;

    await loadSiteAdmins();
    await Promise.allSettled([loadGames(), loadAlliances(), loadSettings()]);
    await loadClans();

    await Promise.allSettled([
        loadShips(), loadBuildItems(), loadFaq(), loadPartners(), loadTactics(),
        loadResources(), loadRecipes(), loadFactions(), loadPorts(), loadRanks()
    ]);

    await loadMapSettings();
    await loadStats();

    initTradeCategorySelect();
    initTradeCategoryFilters();
    updateTradeFormTotal();
    renderTradeClanSelect();
    renderTradeClanFilters();
    await renderTrades();
    await loadNotifications();

    applyAdminUI();
    updateFlagPreview('newClanFlag', 'newClanFlagPreview');
    updateFlagPreview('adminClanFlag', 'adminClanFlagPreview');

    const last = localStorage.getItem(LAST_CLAN_KEY);
    if (last && isUnlocked() && clansCache[last]) {
        openClan(last, localStorage.getItem(CLAN_ADMIN_PASS_KEY) === '1');
    } else {
        showScreen('home');
    }

    startHeartbeat();
    setTimeout(handleBuildHash, 800);
    setInterval(() => {
        const adminOnline = document.querySelector('.admin-section[data-apanel="online"]');
        if (adminOnline && adminOnline.classList.contains('active') && isAdmin) renderAdminOnlineList();
    }, 15000);
})();
