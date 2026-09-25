/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   1.  📦  ИМПОРТЫ И КОНСТАНТЫ                                        ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
import { supabase } from './supabase.js';

console.log('🚀 app.js v2.5.0');

const ADMIN_EMAILS_FALLBACK = ['dead_antihrist@mail.ru'];
const APP_VERSION = '2.5.0';
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
const VK_API_VERSION = '5.131';
const VK_POSTS_COUNT = 10;
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const MAP_DEFAULT_DETAILED = 'images/map/detailed.jpg';
const MAP_DEFAULT_CLEAN    = 'images/map/clean.jpg';

const TRADE_CATEGORIES = [
    { id: 'resource', name: 'Ресурс', icon: '🪵' }, { id: 'ship', name: 'Корабль', icon: '⛵' },
    { id: 'module', name: 'Модуль', icon: '⚙️' }, { id: 'weapon', name: 'Оружие', icon: '⚔️' },
    { id: 'ammo', name: 'Боеприпас', icon: '💣' }, { id: 'blueprint', name: 'Чертёж', icon: '📜' },
    { id: 'consum', name: 'Расходник', icon: '🧪' }, { id: 'other', name: 'Прочее', icon: '📦' }
];
const BUILDER_CATEGORIES = [
    { id: 'resource', name: 'Ресурс', icon: '🪵' },
    { id: 'module', name: 'Модуль', icon: '⚙️' },
    { id: 'weapon', name: 'Оружие', icon: '⚔️' },
    { id: 'ammo', name: 'Боеприпас', icon: '💣' },
    { id: 'blueprint', name: 'Чертёж', icon: '📜' },
    { id: 'consum', name: 'Расходник', icon: '🧪' },
    { id: 'other', name: 'Прочее', icon: '📦' }
];
const PRICING_GROUPS = [
    { id: 'raw',       name: '🪵 Сырьё',         cls: 'pricing-group-raw' },
    { id: 'processed', name: '⚙️ Обработанные',  cls: 'pricing-group-processed' },
    { id: 'consum',    name: '🧪 Расходники',    cls: 'pricing-group-consum' },
    { id: 'valuable',  name: '💎 Ценности',      cls: 'pricing-group-valuable' },
    { id: 'other',     name: '📦 Прочее',        cls: 'pricing-group-other' }
];
const RESOURCE_PRESET = [
    ['wood','Дерево','WOOD','🪵','images/resources/wood.png',3.9,10,'raw'],
    ['iron','Железо','IRON','⛓','images/resources/iron.png',12,20,'raw'],
    ['fabric','Ткань','FABRIC','🧵','images/resources/fabric.png',3.5,30,'raw'],
    ['resin','Смола','RESIN','🛢','images/resources/resin.png',54,40,'raw'],
    ['coal','Уголь','COAL','⚫','images/resources/coal.png',25.5,50,'raw'],
    ['volcanic_ore','Вулк. руда','VOLCANIC ORE','🪨','images/resources/volcanic_ore.png',370,60,'raw'],
    ['copper','Медь','COPPER','🟠','images/resources/plate.png',65,70,'processed'],
    ['beam','Балка','BEAM','🪵','images/resources/beam.png',779,90,'processed'],
    ['canvas','Парус','CANVAS','🧶','images/resources/canvas.png',230,100,'processed'],
    ['bulkhead','Переборка','BULKHEAD','🛡','images/resources/bulkhead.png',1120,110,'processed'],
    ['plate','Плита','PLATE','🔩','images/resources/plate.png',1500,120,'processed'],
    ['bronze','Бронза','BRONZE','🥉','images/resources/bronze.png',1150,130,'processed'],
    ['rum','Ром','RUM','🥃','images/resources/rum.png',13.5,80,'consum'],
    ['salt','Соль','SALT','🧂','images/resources/salt.png',0,210,'consum'],
    ['wreckage','Обломки','WRECKAGE','📦','images/resources/pouch.png',100,140,'valuable'],
    ['battle_mark','Боевая метка','BATTLE MARK','🎖','images/resources/bronze.png',755,150,'valuable'],
    ['blueprint_fragment','Фрагмент чертежа','BL. FRAGMENT','📜','images/resources/blueprint_fragment.png',18400,160,'valuable'],
    ['blueprint_imp','Имп. чертёж','IMP. BLUE','📜','images/resources/blueprint.png',2000000,170,'valuable'],
    ['escudo','Эскудо','ESCUDO','🪙','images/resources/escudo.png',4000,180,'valuable'],
    ['pirate_token','Пиратский жетон','PIR. TOKEN','☠️','images/resources/pirate_token.png',0,190,'valuable'],
    ['license','Лицензия','CONST. LICE','📃','images/resources/license.png',550000,200,'valuable'],
    ['copper_ingot','Медный слиток','CU INGOT','🟧','images/resources/copper_ingot.png',0,220,'processed']
];

/* v2.5.0: типы меток на карте событий */
const EVENT_MARKER_TYPES = {
    target:  { label: 'Цель',      icon: '🎯', color: '#ff7a7a' },
    regroup: { label: 'Регруп',    icon: '🤝', color: '#6ee7a7' },
    battle:  { label: 'Бой',       icon: '⚔️', color: '#fbbf24' },
    point:   { label: 'Точка',     icon: '📍', color: '#7db9ff' },
    danger:  { label: 'Опасность', icon: '☠️', color: '#dc2626' },
    loot:    { label: 'Добыча',    icon: '🏆', color: '#ffd479' }
};

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   2.  🗂️  ГЛОБАЛЬНОЕ СОСТОЯНИЕ                                       ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
let gamesCache = {}, clansCache = {}, alliancesCache = {};
let settingsCache = null, faqCache = [], partnersCache = [], tacticsCache = [], tradesCache = [];
let shipsCache = [];
let buildItemsCache = [];
let siteAdminsCache = [];
let currentSession = null;
let isOwner = false, isMod = false, siteAdminRole = null, myAdminClanId = null;
let isAdmin = false;
let partnerLogoData = null, clanLogoData = null, newClanLogoData = null;
let currentGame = null, currentClan = null;
let currentClanIsAdmin = false, currentClanPass = null;
let pendingClanId = null, currentTab = 'enemies';
let movingItem = null, editingItem = null, editingBuild = null, editingGame = null;
let duplicatingBuild = null, editingTactic = null, editingAlliance = null, acceptingTrade = null;
let editingTradeId = null, editingResourceId = null;
let tradeFormType = 'buy', tradeFilterType = 'all', tradeFilterCat = 'all', tradeFilterClan = 'all';
let tradeSort = 'new', tradeStatusFilter = 'active';
let tradeOnlyShips = false;
let shipsFilterLevel = 'all', shipsFilterType = 'all', shipsSort = 'level-desc';
let heartbeatTimer = null;
let chatChannel = null, onlineChannel = null, notifChannel = null;
let chatMessages = [], notifications = [];
let chatMode = 'guild', chatPrivateWith = null, voiceActive = false, voiceRoomOverride = null;
let resourcesCache = [];
let pricingSaveTimers = {};
let recipesCache = [];
let discountsCache = [];
let mapSettings = null;
let currentMapView = 'detailed';
let mapFsZoom = 1, mapFsX = 0, mapFsY = 0, mapFsDragging = false;
let mapFsDragStart = null;
let mapDetailedData = null, mapCleanData = null;
let factionsCache = [], portsCache = [], ranksCache = [];

/* v2.5.0: состояние редактора меток */
let evMapMarkers = [];
let evMapCurrentType = 'target';

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   3.  🧰  DOM И УТИЛИТЫ                                              ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
const $ = id => document.getElementById(id);
function on(id, event, handler, opts) {
    const el = $(id);
    if (!el) return false;
    el.addEventListener(event, handler, opts);
    return true;
}
function val(id) { const el = $(id); return el ? el.value : ''; }

function flashStatusEl(el, text, color) {
    if (!el) return;
    el.textContent = text; el.style.color = color;
    clearTimeout(el._t); el._t = setTimeout(() => el.textContent = '', 2000);
}
function flashStatus(text, color) {
    const el = $('status'); if (!el) return;
    el.textContent = text; el.style.color = color;
    clearTimeout(flashStatus._t);
    flashStatus._t = setTimeout(() => el.textContent = '', 2000);
}

const screenHome  = $('screen-home');
const screenClan  = $('screen-clan');
const screenAdmin = $('screen-admin');
const clanView    = $('clanView');
const bgFileInput = $('bgFileInput');

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
function colorFromString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    const hue = Math.abs(h) % 360;
    return `linear-gradient(135deg, hsl(${hue}, 55%, 45%), hsl(${hue}, 55%, 30%))`;
}
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
    const nameAttr = escapeHtml(clan?.name || '');
    const classMap = { card: '', info: '', icon: 'clan-icon-small', alliance: '', contact: '' };
    if (useVideo) {
        const cls = (classMap[size] || '') + flagClass;
        return `<video autoplay muted loop playsinline preload="metadata" class="${cls}"><source src="${escapeHtml(url)}" type="video/mp4"><source src="${escapeHtml(url)}" type="video/webm"></video>`;
    }
    const cls = (classMap[size] || '') + flagClass;
    return `<img src="${escapeHtml(url)}" alt="${nameAttr}" class="${cls}" onerror="this.style.display='none'">`;
}
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
    const myEmail = (currentSession?.user?.email || '').toLowerCase();
    return BINDING_OWNERS.map(e => e.toLowerCase()).includes(myEmail);
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   4.  🔐  ПРАВА ДОСТУПА                                              ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
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
function isClanLeader() {
    if (isOwner && getLeaderClanId()) return true;
    if ((isAdmin || isMod) && myAdminClanId) return true;
    return !!(currentClanIsAdmin && getMyClanId());
}
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
   ║   5.  🎨  ТЕМА И ФОНЫ                                                ║
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
['themeToggle','themeToggle2','themeToggle3'].forEach(id => on(id, 'click', toggleTheme));
on('themeToggle4', 'click', toggleTheme);

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
on('bgChangeBtn', 'click', () => { if (!canEditClan(currentClan)) return; bgFileInput.value = ''; bgFileInput.click(); });
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
   ║   6.  📝  ЛОГИ И WEBHOOK                                             ║
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
   ║   7.  👑  АДМИНЫ САЙТА                                              ║
   ║                                                                      ║
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
    isMod = me?.role === 'mod';
    siteAdminRole = me?.role || null;
    myAdminClanId = me?.clan_id || null;
}
async function renderSiteAdminsAdmin() {
    const container = $('siteAdminsList'); if (!container) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    const canBind = canEditBindings();
    document.querySelectorAll('.owner-only').forEach(el => { el.hidden = !isOwner; });
    if (!siteAdminsCache.length) { container.innerHTML = '<div class="empty">Пока нет админов</div>'; return; }

    let clansList = Object.values(clansCache);
    if (!clansList.length) {
        try {
            const { data, error } = await supabase.from('clans').select('id, name').order('name');
            if (error) throw error;
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
        el.querySelector('.role-select')?.addEventListener('change', () => setAdminRole(email, el.querySelector('.role-select').value));
        el.querySelector('.clan-select')?.addEventListener('change', () => setAdminClanId(email, el.querySelector('.clan-select').value));
        el.querySelector('.edit')?.addEventListener('click', () => changeAdminPassword(email));
        el.querySelector('.nick-btn')?.addEventListener('click', () => changeAdminNickname(email, nick));
        el.querySelector('.delete')?.addEventListener('click', () => deleteSiteAdmin(email));
        container.appendChild(el);
    });
}
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
}
async function deleteSiteAdmin(email) {
    if (!isOwner) { alert('Только владелец может удалять админов'); return; }
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
    await logAdminAction('Изменил роль админа', email, `новая: ${newRole}`);
    await loadSiteAdmins();
}
async function setAdminClanId(email, clanId) {
    if (!canEditBindings()) { alert('Менять привязку может только владелец'); renderSiteAdminsAdmin(); return; }
    const { data, error } = await supabase.rpc('set_admin_clan_id', { target_email: email, new_clan_id: clanId || '' });
    if (error) { alert('Ошибка: ' + error.message); renderSiteAdminsAdmin(); return; }
    if (data?.error) { alert(data.error); renderSiteAdminsAdmin(); return; }
    await logAdminAction('Привязал админа к гильдии', email, `clan_id: ${clanId || '—'}`);
    await loadSiteAdmins();
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
    await loadSiteAdmins();
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
   ║   8.  🟢  ОНЛАЙН                                                     ║
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
function initRealtime() {
    closeRealtime();
    if (!currentClan) return;
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
                ['notifBell', 'notifBell2'].forEach(id => { const b = $(id); if (!b) return; b.style.transform = 'scale(1.15)'; b.classList.add('has-notif'); setTimeout(() => b.style.transform = '', 300); });
            }).subscribe();
    }
}
function closeRealtime() {
    if (onlineChannel) { supabase.removeChannel(onlineChannel); onlineChannel = null; }
    if (notifChannel) { supabase.removeChannel(notifChannel); notifChannel = null; }
}
async function renderAdminOnlineList() {
    const container = $('adminOnlineList'); if (!container) return;
    if (!isAdmin && !canEditClan(currentClan)) return;
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
        const clanName = u.clan_id && clansCache[u.clan_id] ? clansCache[u.clan_id].name : (u.clan_id || null);
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
                <div class="online-meta">${clanName ? `🏰 ${escapeHtml(clanName)} · ` : ''}⏱ ${timeLabel}</div>
            </div>
            <div class="online-actions">
                ${!isGuest && !isMe ? `<button class="online-msg-btn" data-nick="${escapeHtml(nick)}">✉️ Написать</button>` : isGuest ? `<span class="online-hint">гость</span>` : ''}
            </div>`;
        const msgBtn = el.querySelector('.online-msg-btn');
        if (msgBtn) msgBtn.addEventListener('click', () => openPrivateChat(msgBtn.dataset.nick));
        container.appendChild(el);
    });
}
on('refreshOnlineList', 'click', renderAdminOnlineList);
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
   ║   9.  🖥️  ЭКРАНЫ И НАВИГАЦИЯ                                         ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function showScreen(name) {
    if (screenHome)  screenHome.hidden  = name !== 'home';
    if (screenClan)  screenClan.hidden  = name !== 'clan';
    if (clanView)    clanView.hidden    = name !== 'lists';
    if (screenAdmin) screenAdmin.hidden = name !== 'admin';
    const leader = $('screen-leader');
    if (leader) leader.hidden = name !== 'leader';
    window.scrollTo(0, 0); applyBg();
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   10.  🎮  ИГРЫ                                                       ║
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
    renderGamesAdmin(); renderNewClanGameSelect(); renderClanRequestGameSelect(); applyBg();
}
function renderGamesAdmin() {
    const container = $('gamesAdminList'); if (!container) return;
    container.innerHTML = '';
    const list = Object.values(gamesCache);
    if (!list.length) { container.innerHTML = '<div class="empty">Пока нет игр</div>'; return; }
    list.forEach(g => {
        const el = document.createElement('div');
        el.className = 'games-admin-item';
        const logoHtml = g.image ? `<img src="${escapeHtml(g.image)}" alt="" onerror="this.outerHTML='<span>🎮</span>'">` : `<span>🎮</span>`;
        el.innerHTML = `
            <div class="logo-mini">${logoHtml}</div>
            <div class="txt"><b>${escapeHtml(g.name)}</b><span>ID: ${escapeHtml(g.id)}${g.bg ? ' · 🎨' : ''}</span></div>
            <div class="actions">
                <button class="edit">✏️</button>
                <button class="delete">🗑</button>
            </div>`;
        el.querySelector('.edit').addEventListener('click', () => openGameEdit(g));
        el.querySelector('.delete').addEventListener('click', () => deleteGame(g.id, g.name));
        container.appendChild(el);
    });
}
on('gameAddBtn', 'click', async () => {
    const id = val('gameId').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const name = val('gameName').trim(), image = val('gameImage').trim(), bg = val('gameBg').trim();
    const statusEl = $('gameStatus');
    if (!id) { flashStatusEl(statusEl, 'Укажи ID', '#ff7a7a'); return; }
    if (!name) { flashStatusEl(statusEl, 'Укажи название', '#ff7a7a'); return; }
    if (gamesCache[id]) { flashStatusEl(statusEl, 'ID существует', '#ff7a7a'); return; }
    const { error } = await supabase.from('games').insert({ id, name, image: image || null, bg: bg || null, sort_order: Object.keys(gamesCache).length });
    if (error) { flashStatusEl(statusEl, 'Ошибка: ' + error.message, '#ff7a7a'); return; }
    ['gameId','gameName','gameImage','gameBg'].forEach(i => { const el = $(i); if (el) el.value = ''; });
    flashStatusEl(statusEl, '✔ Добавлено', '#6ee7a7');
    await loadGames();
});
function openGameEdit(g) {
    editingGame = g;
    $('gameEditId').value = g.id; $('gameEditName').value = g.name;
    $('gameEditImage').value = g.image || ''; $('gameEditBg').value = g.bg || '';
    $('gameEditMsg').textContent = ''; $('gameEditModal').hidden = false;
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
    $('gameEditModal').hidden = true; editingGame = null; await loadGames();
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
   ║                                                                      ║
   ║   11.  🤝  СОЮЗЫ                                                     ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadAlliances() {
    try {
        const { data, error } = await supabase.from('alliances').select('*').order('name');
        if (error) { alliancesCache = {}; return; }
        alliancesCache = {};
        (data || []).forEach(a => { alliancesCache[a.id] = a; });
        renderAlliancesAdmin(); renderAllianceSelects();
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
    $('allyEditMsg').textContent = ''; $('allyEditModal').hidden = false;
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
    $('allyEditModal').hidden = true; editingAlliance = null; await loadAlliances();
});
async function deleteAlliance(id, name) {
    if (!confirm(`Удалить союз «${name}»?`)) return;
    await supabase.from('alliances').delete().eq('id', id);
    await loadAlliances(); await loadClans();
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   12.  🖼️  ЛОГОТИПЫ ГИЛЬДИЙ                                          ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
on('adminClanImagePick', 'click', () => { const f = $('adminClanImageFile'); if (f) f.click(); });
on('adminClanImageFile', 'change', async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try {
        if (file.size > 5 * 1024 * 1024) { alert('Файл слишком большой. Максимум 5 МБ.'); return; }
        if (file.type.startsWith('video/')) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                clanLogoData = ev.target.result;
                $('adminClanImagePreviewImg').src = '';
                $('adminClanImagePreview').hidden = false;
                $('adminClanImageName').textContent = file.name + ' (видео)';
                const inp = $('adminClanImage'); if (inp) inp.value = '';
            };
            reader.readAsDataURL(file); return;
        }
        if (file.type === 'image/gif' || file.type === 'image/webp') {
            const reader = new FileReader();
            reader.onload = (ev) => {
                clanLogoData = ev.target.result;
                $('adminClanImagePreviewImg').src = clanLogoData;
                $('adminClanImagePreview').hidden = false;
                $('adminClanImageName').textContent = file.name;
                const inp = $('adminClanImage'); if (inp) inp.value = '';
            };
            reader.readAsDataURL(file); return;
        }
        clanLogoData = await compressLogo(file, 256, 0.9);
        $('adminClanImagePreviewImg').src = clanLogoData;
        $('adminClanImagePreview').hidden = false;
        $('adminClanImageName').textContent = file.name;
        const inp = $('adminClanImage'); if (inp) inp.value = '';
    } catch (err) { alert('Не удалось обработать: ' + err.message); }
});
on('adminClanImageClear', 'click', () => {
    clanLogoData = null;
    const fi = $('adminClanImageFile'); if (fi) fi.value = '';
    const prev = $('adminClanImagePreview'); if (prev) prev.hidden = true;
    const nm = $('adminClanImageName'); if (nm) nm.textContent = '';
});
on('newClanImagePick', 'click', () => { const f = $('newClanImageFile'); if (f) f.click(); });
on('newClanImageFile', 'change', async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try {
        if (file.size > 5 * 1024 * 1024) { alert('Файл слишком большой. Максимум 5 МБ.'); return; }
        if (file.type.startsWith('video/') || file.type === 'image/gif' || file.type === 'image/webp') {
            const reader = new FileReader();
            reader.onload = (ev) => {
                newClanLogoData = ev.target.result;
                if (!file.type.startsWith('video/')) $('newClanImagePreviewImg').src = newClanLogoData;
                $('newClanImagePreview').hidden = false;
                $('newClanImageName').textContent = file.name + (file.type.startsWith('video/') ? ' (видео)' : '');
                const inp = $('newClanImage'); if (inp) inp.value = '';
            };
            reader.readAsDataURL(file); return;
        }
        newClanLogoData = await compressLogo(file, 256, 0.9);
        $('newClanImagePreviewImg').src = newClanLogoData;
        $('newClanImagePreview').hidden = false;
        $('newClanImageName').textContent = file.name;
        const inp = $('newClanImage'); if (inp) inp.value = '';
    } catch (err) { alert('Не удалось обработать: ' + err.message); }
});
on('newClanImageClear', 'click', () => {
    newClanLogoData = null;
    const fi = $('newClanImageFile'); if (fi) fi.value = '';
    const prev = $('newClanImagePreview'); if (prev) prev.hidden = true;
    const nm = $('newClanImageName'); if (nm) nm.textContent = '';
});
function updateFlagPreview(selectId, previewId) {
    const sel = $(selectId);
    const prev = $(previewId);
    if (!sel || !prev) return;
    const flag = CLAN_FLAGS[sel.value] || CLAN_FLAGS.neutral;
    prev.style.backgroundImage = `url("${flag}")`;
}
on('newClanFlag', 'change', () => updateFlagPreview('newClanFlag', 'newClanFlagPreview'));
on('adminClanFlag', 'change', () => updateFlagPreview('adminClanFlag', 'adminClanFlagPreview'));

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   13.  📚  САЙДБАР ГИЛЬДИИ (группы-аккордеоны)                        ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
document.querySelectorAll('.side-group-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const group = btn.closest('.side-group');
        if (!group) return;
        group.classList.toggle('open');
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
        else if (section === 'ships') loadShips();
        else if (section === 'builder') { if (builderClanCtrl) builderClanCtrl.refresh(); }
        else if (section === 'shipcost') { renderShipCostPublic(); }
        else if (section === 'resources') { renderResourcePricesHome(); }
        else if (section === 'map') { renderMapPreview(); }
        else if (section === 'contacts') renderContacts();
        else if (section === 'members') { renderMembers(); renderAdmins(); }
        else if (section === 'applications') renderApplications();
        else if (section === 'online') renderClanOnlineList();
    });
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   14.  ⚙️  САЙДБАР АДМИНА (с группами-аккордеонами)                   ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
document.querySelectorAll('.admin-nav-group-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const group = btn.closest('.admin-nav-group');
        if (!group) return;
        group.classList.toggle('open');
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
   ║                                                                      ║
   ║   15.  ⛵  КОРАБЛИ                                                     ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadShips() {
    const { data, error } = await supabase.from('ships').select('*')
        .order('level', { ascending: true }).order('name', { ascending: true });
    if (error) { console.error('Ships load error:', error); return; }
    shipsCache = data || [];
    renderShips();
    renderAdminShips();
    renderShipCostPublic();
}
function shipTypeLabel(type) {
    const map = {
        frigate: 'Фрегат', galleon: 'Галеон', brig: 'Бриг',
        corvette: 'Корвет', manowar: 'Мановар', schooner: 'Шхуна',
        sloop: 'Шлюп', other: 'Другое'
    };
    return map[type] || (type || 'Другое');
}
function shipLevelRoman(lvl) { return ROMAN[lvl] || lvl; }

function renderShips() {
    const container = $('shipsList'); if (!container) return;
    let list = shipsCache.slice();
    if (shipsFilterLevel !== 'all') list = list.filter(s => String(s.level) === String(shipsFilterLevel));
    if (shipsFilterType  !== 'all') list = list.filter(s => (s.type || 'other') === shipsFilterType);
    if (shipsSort === 'level-desc') list.sort((a, b) => (b.level || 0) - (a.level || 0) || (a.name || '').localeCompare(b.name || ''));
    else if (shipsSort === 'level-asc') list.sort((a, b) => (a.level || 0) - (b.level || 0) || (a.name || '').localeCompare(b.name || ''));
    else if (shipsSort === 'name') list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    const counterEl = $('shipsCount');
    if (counterEl) counterEl.textContent = `${list.length} ${tradePlural(list.length, 'корабль','корабля','кораблей')}`;

    if (!list.length) { container.innerHTML = '<div class="empty">Ничего не найдено</div>'; return; }
    container.innerHTML = '';
    list.forEach(s => {
        const el = document.createElement('div');
        el.className = 'ship-card';
        const img = s.image ? `<img src="${escapeHtml(s.image)}" alt="" onerror="this.outerHTML='<span style=\\'font-size:42px\\'>⛵</span>'">` : `<span style="font-size:42px">⛵</span>`;
        const topSpecs = (s.specs || []).slice(0, 4).map(sp => {
            const p = parseBonus(sp);
            return `<span class="ship-spec">${escapeHtml(p.stat)}${p.value !== null ? ` <b>${p.value > 0 ? '+' : ''}${p.value}</b>` : ''}</span>`;
        }).join('');
        el.innerHTML = `
            <div class="ship-logo">${img}</div>
            <div class="ship-main">
                <div class="ship-title">
                    <b>${escapeHtml(s.name)}</b>
                    <span class="ship-rank">${shipLevelRoman(s.level)}</span>
                </div>
                <div class="ship-meta">
                    <span class="ship-type">${escapeHtml(shipTypeLabel(s.type))}</span>
                    ${s.hp ? `<span class="ship-hp">❤️ ${s.hp}</span>` : ''}
                    ${s.slots ? `<span class="ship-slots">🎛 ${s.slots}</span>` : ''}
                </div>
                ${topSpecs ? `<div class="ship-specs">${topSpecs}</div>` : ''}
                ${s.description ? `<div class="ship-desc">${escapeHtml(s.description)}</div>` : ''}
            </div>`;
        container.appendChild(el);
    });
}
on('shipsFilterLevel', 'change', () => { shipsFilterLevel = val('shipsFilterLevel'); renderShips(); });
on('shipsFilterType',  'change', () => { shipsFilterType  = val('shipsFilterType');  renderShips(); });
on('shipsSort',        'change', () => { shipsSort        = val('shipsSort');        renderShips(); });
on('shipsSearch', 'input', () => {
    const q = val('shipsSearch').trim().toLowerCase();
    const container = $('shipsList'); if (!container) return;
    document.querySelectorAll('.ship-card').forEach(card => {
        const t = card.textContent.toLowerCase();
        card.style.display = (!q || t.includes(q)) ? '' : 'none';
    });
});

function renderAdminShips() {
    const container = $('adminShipsList'); if (!container) return;
    container.innerHTML = '';
    if (!shipsCache.length) { container.innerHTML = '<div class="empty">Пока нет кораблей</div>'; return; }
    shipsCache.forEach(s => {
        const el = document.createElement('div');
        el.className = 'games-admin-item';
        const logoHtml = s.image ? `<img src="${escapeHtml(s.image)}" alt="" onerror="this.outerHTML='<span>⛵</span>'">` : `<span>⛵</span>`;
        el.innerHTML = `
            <div class="logo-mini">${logoHtml}</div>
            <div class="txt"><b>${escapeHtml(s.name)}</b><span>${shipLevelRoman(s.level)} · ${escapeHtml(shipTypeLabel(s.type))}</span></div>
            <div class="actions">
                <button class="edit">✏️</button>
                <button class="delete">🗑</button>
            </div>`;
        el.querySelector('.edit').addEventListener('click', () => openShipEdit(s));
        el.querySelector('.delete').addEventListener('click', () => deleteShip(s.id, s.name));
        container.appendChild(el);
    });
}
on('shipAddBtn', 'click', async () => {
    const name = val('shipName').trim();
    const level = parseInt(val('shipLevel'), 10) || 1;
    const type = val('shipType') || 'other';
    const image = val('shipImage').trim();
    const hp = parseInt(val('shipHp'), 10) || null;
    const slots = parseInt(val('shipSlots'), 10) || null;
    const specs = parseLines(val('shipSpecs'));
    const description = val('shipDesc').trim();
    const msg = $('shipMsg');
    if (!name) { flashStatusEl(msg, 'Укажи название', '#ff7a7a'); return; }
    const { error } = await supabase.from('ships').insert({
        name, level, type, image: image || null, hp, slots,
        specs, description: description || null
    });
    if (error) { flashStatusEl(msg, 'Ошибка: ' + error.message, '#ff7a7a'); return; }
    ['shipName','shipImage','shipHp','shipSlots','shipSpecs','shipDesc'].forEach(i => { const el = $(i); if (el) el.value = ''; });
    flashStatusEl(msg, '✔ Добавлено', '#6ee7a7');
    await loadShips();
});
function openShipEdit(s) {
    editingItem = s;
    $('shipEditId').value = s.id; $('shipEditName').value = s.name || '';
    $('shipEditLevel').value = s.level || 1;
    $('shipEditType').value = s.type || 'other';
    $('shipEditImage').value = s.image || '';
    $('shipEditHp').value = s.hp || '';
    $('shipEditSlots').value = s.slots || '';
    $('shipEditSpecs').value = (s.specs || []).join('\n');
    $('shipEditDesc').value = s.description || '';
    $('shipEditMsg').textContent = ''; $('shipEditModal').hidden = false;
    $('shipEditName').focus();
}
on('cancelShipEdit', 'click', () => { $('shipEditModal').hidden = true; editingItem = null; });
on('saveShipEdit', 'click', async () => {
    if (!editingItem) return;
    const name = val('shipEditName').trim();
    if (!name) { const m = $('shipEditMsg'); m.textContent = 'Укажи название'; m.style.color = '#ff7a7a'; return; }
    const patch = {
        name,
        level: parseInt(val('shipEditLevel'), 10) || 1,
        type: val('shipEditType') || 'other',
        image: val('shipEditImage').trim() || null,
        hp: parseInt(val('shipEditHp'), 10) || null,
        slots: parseInt(val('shipEditSlots'), 10) || null,
        specs: parseLines(val('shipEditSpecs')),
        description: val('shipEditDesc').trim() || null
    };
    const { error } = await supabase.from('ships').update(patch).eq('id', editingItem.id);
    if (error) { const m = $('shipEditMsg'); m.textContent = 'Ошибка: ' + error.message; m.style.color = '#ff7a7a'; return; }
    $('shipEditModal').hidden = true; editingItem = null;
    await loadShips();
});
async function deleteShip(id, name) {
    if (!confirm(`Удалить корабль «${name}»?`)) return;
    const { error } = await supabase.from('ships').delete().eq('id', id);
    if (error) return alert('Ошибка: ' + error.message);
    await loadShips();
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   15.1  📚  СПРАВОЧНИК BUILD_ITEMS (v2.4.0)                          ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadBuildItems() {
    try {
        const { data, error } = await supabase.from('build_items').select('*')
            .order('category').order('name');
        if (error) throw error;
        buildItemsCache = data || [];
    } catch (e) {
        console.warn('build_items load error:', e.message);
        buildItemsCache = [];
    }
    renderBuildItemsAdmin();
}
function renderBuildItemsAdmin() {
    const container = $('buildItemsAdminList'); if (!container) return;
    container.innerHTML = '';
    if (!buildItemsCache.length) { container.innerHTML = '<div class="empty">Пока нет элементов</div>'; return; }
    const grouped = {};
    buildItemsCache.forEach(it => {
        const cat = it.category || 'other';
        (grouped[cat] = grouped[cat] || []).push(it);
    });
    Object.keys(grouped).forEach(catId => {
        const catMeta = BUILDER_CATEGORIES.find(c => c.id === catId) || { icon: '📦', name: catId };
        const wrap = document.createElement('div');
        wrap.className = 'build-items-group';
        wrap.innerHTML = `<div class="build-items-group-title">${catMeta.icon} ${escapeHtml(catMeta.name)} (${grouped[catId].length})</div>`;
        grouped[catId].forEach(it => {
            const el = document.createElement('div');
            el.className = 'games-admin-item';
            const img = it.image ? `<img src="${escapeHtml(it.image)}" alt="" onerror="this.outerHTML='<span>${catMeta.icon}</span>'">` : `<span>${catMeta.icon}</span>`;
            el.innerHTML = `
                <div class="logo-mini">${img}</div>
                <div class="txt"><b>${escapeHtml(it.name)}</b><span>${escapeHtml(it.unit || 'шт')} · ${Number(it.price || 0).toLocaleString('ru-RU')} 🪙</span></div>
                <div class="actions">
                    <button class="edit">✏️</button>
                    <button class="delete">🗑</button>
                </div>`;
            el.querySelector('.edit').addEventListener('click', () => openBuildItemEdit(it));
            el.querySelector('.delete').addEventListener('click', () => deleteBuildItem(it.id, it.name));
            wrap.appendChild(el);
        });
        container.appendChild(wrap);
    });
}
on('buildItemAddBtn', 'click', async () => {
    const name = val('buildItemName').trim();
    const category = val('buildItemCategory') || 'other';
    const unit = val('buildItemUnit').trim() || 'шт';
    const price = parseFloat(val('buildItemPrice')) || 0;
    const image = val('buildItemImage').trim();
    const msg = $('buildItemMsg');
    if (!name) { flashStatusEl(msg, 'Укажи название', '#ff7a7a'); return; }
    const { error } = await supabase.from('build_items').insert({
        name, category, unit, price, image: image || null
    });
    if (error) { flashStatusEl(msg, 'Ошибка: ' + error.message, '#ff7a7a'); return; }
    ['buildItemName','buildItemUnit','buildItemPrice','buildItemImage'].forEach(i => { const el = $(i); if (el) el.value = ''; });
    flashStatusEl(msg, '✔ Добавлено', '#6ee7a7');
    await loadBuildItems();
});
function openBuildItemEdit(it) {
    editingItem = it;
    $('buildItemEditId').value = it.id;
    $('buildItemEditName').value = it.name || '';
    $('buildItemEditCategory').value = it.category || 'other';
    $('buildItemEditUnit').value = it.unit || 'шт';
    $('buildItemEditPrice').value = it.price || 0;
    $('buildItemEditImage').value = it.image || '';
    $('buildItemEditMsg').textContent = '';
    $('buildItemEditModal').hidden = false;
    $('buildItemEditName').focus();
}
on('cancelBuildItemEdit', 'click', () => { $('buildItemEditModal').hidden = true; editingItem = null; });
on('saveBuildItemEdit', 'click', async () => {
    if (!editingItem) return;
    const name = val('buildItemEditName').trim();
    if (!name) { const m = $('buildItemEditMsg'); m.textContent = 'Укажи название'; m.style.color = '#ff7a7a'; return; }
    const patch = {
        name,
        category: val('buildItemEditCategory') || 'other',
        unit: val('buildItemEditUnit').trim() || 'шт',
        price: parseFloat(val('buildItemEditPrice')) || 0,
        image: val('buildItemEditImage').trim() || null
    };
    const { error } = await supabase.from('build_items').update(patch).eq('id', editingItem.id);
    if (error) { const m = $('buildItemEditMsg'); m.textContent = 'Ошибка: ' + error.message; m.style.color = '#ff7a7a'; return; }
    $('buildItemEditModal').hidden = true; editingItem = null;
    await loadBuildItems();
});
async function deleteBuildItem(id, name) {
    if (!confirm(`Удалить элемент «${name}»?`)) return;
    const { error } = await supabase.from('build_items').delete().eq('id', id);
    if (error) return alert('Ошибка: ' + error.message);
    await loadBuildItems();
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   16.  🧮  КАЛЬКУЛЯТОР СБОРКИ (SHIP BUILDER)                          ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
let builderClanCtrl = null;

function initShipBuilder() {
    const root = $('builderRoot'); if (!root) return;
    builderClanCtrl = createClanPicker(root.querySelector('.builder-clan-slot'), () => recalcBuilder());

    const catSel = $('builderCategory');
    if (catSel && !catSel.options.length) {
        BUILDER_CATEGORIES.forEach(c => {
            const o = document.createElement('option');
            o.value = c.id; o.textContent = `${c.icon} ${c.name}`;
            catSel.appendChild(o);
        });
    }
    const itemSel = $('builderItem');
    function refreshItems() {
        if (!itemSel) return;
        const cat = val('builderCategory') || 'resource';
        itemSel.innerHTML = '';
        buildItemsCache.filter(it => (it.category || 'other') === cat).forEach(it => {
            const o = document.createElement('option');
            o.value = it.id; o.textContent = `${it.name} (${it.unit || 'шт'})`;
            itemSel.appendChild(o);
        });
    }
    on('builderCategory', 'change', refreshItems);
    refreshItems();

    on('builderAddItem', 'click', () => {
        const id = val('builderItem');
        const qty = parseFloat(val('builderQty')) || 0;
        if (!id || qty <= 0) return;
        addBuilderRow(id, qty);
        const q = $('builderQty'); if (q) q.value = '1';
        recalcBuilder();
    });
    on('builderClear', 'click', () => {
        const tbody = $('builderRows'); if (tbody) tbody.innerHTML = '';
        recalcBuilder();
    });
    on('builderMarkup', 'input', recalcBuilder);
    on('builderDiscount', 'input', recalcBuilder);

    recalcBuilder();
}
function addBuilderRow(itemId, qty) {
    const tbody = $('builderRows'); if (!tbody) return;
    const item = buildItemsCache.find(i => String(i.id) === String(itemId));
    if (!item) return;
    const tr = document.createElement('tr');
    tr.dataset.itemId = item.id;
    tr.dataset.qty = qty;
    tr.innerHTML = `
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.unit || 'шт')}</td>
        <td class="builder-qty">${qty}</td>
        <td class="builder-price">${Number(item.price || 0).toLocaleString('ru-RU')}</td>
        <td class="builder-sum">${(Number(item.price || 0) * qty).toLocaleString('ru-RU')}</td>
        <td><button class="builder-remove" title="Убрать">✖</button></td>`;
    tr.querySelector('.builder-remove').addEventListener('click', () => { tr.remove(); recalcBuilder(); });
    tbody.appendChild(tr);
}
function recalcBuilder() {
    const tbody = $('builderRows'); if (!tbody) return;
    let base = 0;
    [...tbody.children].forEach(tr => {
        const item = buildItemsCache.find(i => String(i.id) === String(tr.dataset.itemId));
        const qty = parseFloat(tr.dataset.qty) || 0;
        if (!item) return;
        base += Number(item.price || 0) * qty;
        tr.querySelector('.builder-sum').textContent = (Number(item.price || 0) * qty).toLocaleString('ru-RU');
    });
    const markup = parseFloat(val('builderMarkup')) || 0;
    const disc = parseFloat(val('builderDiscount')) || 0;
    const withMarkup = base * (1 + markup / 100);
    const final = withMarkup * (1 - disc / 100);
    const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
    set('builderBase', base.toLocaleString('ru-RU') + ' 🪙');
    set('builderMarkupVal', withMarkup.toLocaleString('ru-RU') + ' 🪙');
    set('builderFinal', final.toLocaleString('ru-RU') + ' 🪙');
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   17.  🎯  ТАКТИКА                                                    ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadTactics() {
    try {
        const { data, error } = await supabase.from('tactics').select('*').order('sort_order').order('title');
        if (error) throw error;
        tacticsCache = data || [];
    } catch (e) { tacticsCache = []; }
    renderTacticsClan();
    renderTacticsAdmin();
}
function renderTacticsClan() {
    const container = $('tacticsList'); if (!container) return;
    const cid = currentClan || getMyClanId();
    const list = tacticsCache.filter(t => !t.clan_id || t.clan_id === cid || (isAdmin && !myAdminClanId));
    if (!list.length) { container.innerHTML = '<div class="empty">Тактик пока нет</div>'; return; }
    container.innerHTML = '';
    list.forEach(t => {
        const el = document.createElement('div');
        el.className = 'tactic-card';
        el.innerHTML = `
            <div class="tactic-title">🎯 <b>${escapeHtml(t.title)}</b></div>
            ${t.description ? `<div class="tactic-desc">${escapeHtml(t.description)}</div>` : ''}
            ${t.steps?.length ? `<ol class="tactic-steps">${t.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol>` : ''}`;
        container.appendChild(el);
    });
}
function renderTacticsAdmin() {
    const container = $('tacticsAdminList'); if (!container) return;
    container.innerHTML = '';
    if (!tacticsCache.length) { container.innerHTML = '<div class="empty">Пока нет тактик</div>'; return; }
    tacticsCache.forEach(t => {
        const el = document.createElement('div');
        el.className = 'games-admin-item';
        el.innerHTML = `
            <div class="logo-mini"><span>🎯</span></div>
            <div class="txt"><b>${escapeHtml(t.title)}</b><span>${t.clan_id ? 'для гильдии' : 'общая'}</span></div>
            <div class="actions">
                <button class="edit">✏️</button>
                <button class="delete">🗑</button>
            </div>`;
        el.querySelector('.edit').addEventListener('click', () => openTacticEdit(t));
        el.querySelector('.delete').addEventListener('click', () => deleteTactic(t.id, t.title));
        container.appendChild(el);
    });
}
on('tacticAddBtn', 'click', async () => {
    const title = val('tacticTitle').trim();
    const description = val('tacticDesc').trim();
    const steps = parseLines(val('tacticSteps'));
    const msg = $('tacticMsg');
    if (!title) { flashStatusEl(msg, 'Укажи название', '#ff7a7a'); return; }
    const { error } = await supabase.from('tactics').insert({
        title, description: description || null, steps,
        clan_id: currentClan || getMyClanId() || null,
        sort_order: tacticsCache.length
    });
    if (error) { flashStatusEl(msg, 'Ошибка: ' + error.message, '#ff7a7a'); return; }
    ['tacticTitle','tacticDesc','tacticSteps'].forEach(i => { const el = $(i); if (el) el.value = ''; });
    flashStatusEl(msg, '✔ Добавлено', '#6ee7a7');
    await loadTactics();
});
function openTacticEdit(t) {
    editingTactic = t;
    $('tacticEditId').value = t.id;
    $('tacticEditTitle').value = t.title || '';
    $('tacticEditDesc').value = t.description || '';
    $('tacticEditSteps').value = (t.steps || []).join('\n');
    $('tacticEditMsg').textContent = '';
    $('tacticEditModal').hidden = false;
    $('tacticEditTitle').focus();
}
on('cancelTacticEdit', 'click', () => { $('tacticEditModal').hidden = true; editingTactic = null; });
on('saveTacticEdit', 'click', async () => {
    if (!editingTactic) return;
    const title = val('tacticEditTitle').trim();
    if (!title) { const m = $('tacticEditMsg'); m.textContent = 'Укажи название'; m.style.color = '#ff7a7a'; return; }
    const patch = {
        title,
        description: val('tacticEditDesc').trim() || null,
        steps: parseLines(val('tacticEditSteps'))
    };
    const { error } = await supabase.from('tactics').update(patch).eq('id', editingTactic.id);
    if (error) { const m = $('tacticEditMsg'); m.textContent = 'Ошибка: ' + error.message; m.style.color = '#ff7a7a'; return; }
    $('tacticEditModal').hidden = true; editingTactic = null;
    await loadTactics();
});
async function deleteTactic(id, title) {
    if (!confirm(`Удалить тактику «${title}»?`)) return;
    await supabase.from('tactics').delete().eq('id', id);
    await loadTactics();
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   18.  🔑  ВХОД АДМИНА                                                ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadSession() {
    try {
        const { data } = await supabase.auth.getSession();
        currentSession = data?.session || null;
    } catch (e) { currentSession = null; }
    recalcIsAdmin();
    applyAdminUI();
}
async function adminLogin(email, password) {
    const msg = $('adminLoginMsg');
    if (msg) { msg.textContent = ''; msg.style.color = ''; }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        if (msg) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; }
        return false;
    }
    currentSession = data.session;
    await loadSiteAdmins();
    applyAdminUI();
    return true;
}
on('adminLoginBtn', 'click', async () => {
    const btn = $('adminLoginBtn');
    btn.disabled = true; const old = btn.textContent; btn.textContent = '⏳ Вход…';
    const ok = await adminLogin(val('adminLoginEmail').trim(), val('adminLoginPassword'));
    btn.disabled = false; btn.textContent = old;
    if (ok) showScreen('admin');
});
on('adminLogoutBtn', 'click', async () => {
    await supabase.auth.signOut();
    currentSession = null; isAdmin = false; isOwner = false; isMod = false;
    siteAdminRole = null; myAdminClanId = null;
    applyAdminUI();
    showScreen('home');
});
on('adminLoginPassword', 'keydown', e => { if (e.key === 'Enter') $('adminLoginBtn').click(); });

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   19.  ⚙️  АДМИН-ПАНЕЛЬ (UI)                                          ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function applyAdminUI() {
    document.querySelectorAll('.admin-only').forEach(el => { el.hidden = !isAdmin; });
    document.querySelectorAll('.owner-only').forEach(el => { el.hidden = !isOwner; });
    document.querySelectorAll('.mod-only').forEach(el => { el.hidden = !isMod; });
    const sideGroupAdmin = $('sideGroupAdmin');
    if (sideGroupAdmin) sideGroupAdmin.hidden = !isAdmin;
    const sideAdminLink = $('sideAdminLink');
    if (sideAdminLink) sideAdminLink.hidden = !isAdmin;

    const badge = $('adminBadge');
    if (badge) {
        if (isOwner) { badge.textContent = '👑 Владелец'; badge.hidden = false; }
        else if (isAdmin) { badge.textContent = '⚙️ Админ'; badge.hidden = false; }
        else if (isMod) { badge.textContent = '🎖 Глава Клана'; badge.hidden = false; }
        else { badge.hidden = true; }
    }
    const myEmailEl = $('adminMyEmail');
    if (myEmailEl) myEmailEl.textContent = currentSession?.user?.email || '';
    const bindSection = $('adminBindSection');
    if (bindSection) bindSection.hidden = !canEditBindings();
}
on('openAdminBtn', 'click', () => { if (isAdmin) showScreen('admin'); else showScreen('admin'); });

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   20.  🏰  ГИЛЬДИИ                                                    ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadClans() {
    try {
        const { data, error } = await supabase.from('clans').select('*').order('name');
        if (error) throw error;
        clansCache = {};
        (data || []).forEach(c => { clansCache[c.id] = c; });
    } catch (e) {
        try {
            const { data } = await supabase.from('clans_public').select('*').order('name');
            clansCache = {};
            (data || []).forEach(c => { clansCache[c.id] = c; });
        } catch (e2) { clansCache = {}; }
    }
    renderClansHome();
    renderAdminClanSelect();
    renderAlliancesAdmin();
}
function renderClansHome() {
    const container = $('clansList'); if (!container) return;
    const list = Object.values(clansCache).filter(c => !currentGame || c.game_id === currentGame);
    if (!list.length) { container.innerHTML = '<div class="empty">Пока нет гильдий</div>'; return; }
    container.innerHTML = '';
    list.forEach(c => {
        const el = document.createElement('div');
        el.className = 'clan-card';
        const logo = renderClanLogoHtml(c, 'card');
        el.innerHTML = `
            <div class="clan-logo">${logo}</div>
            <div class="clan-info">
                <div class="clan-name">${escapeHtml(c.name)}</div>
                ${c.tag ? `<div class="clan-tag">[${escapeHtml(c.tag)}]</div>` : ''}
                ${c.alliance_id && alliancesCache[c.alliance_id] ? `<div class="clan-alliance">🤝 ${escapeHtml(alliancesCache[c.alliance_id].name)}</div>` : ''}
            </div>`;
        el.addEventListener('click', () => openClan(c.id));
        container.appendChild(el);
    });
}
function openClan(clanId) {
    if (!clansCache[clanId]) return;
    currentClan = clanId;
    currentClanIsAdmin = canEditClan(clanId);
    currentTab = TABS[0];
    renderClanInfo();
    renderAllianceBar();
    showScreen('clan');
    TABS.forEach(loadList);
    renderEvents();
    renderTreasury();
    renderMembers();
    renderAdmins();
    renderContacts();
    renderApplications();
    renderClanOnlineList();
    applyBg();
    logView(getViewerNick(), clanId, 'clan');
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   21.  📄  ОПИСАНИЕ ГИЛЬДИИ                                           ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function renderClanInfo() {
    const c = clansCache[currentClan]; if (!c) return;
    const set = (id, v) => { const el = $(id); if (el) el.textContent = v ?? ''; };
    set('clanViewName', c.name);
    set('clanViewTag', c.tag ? `[${c.tag}]` : '');
    set('clanViewDesc', c.description || '');

    const logoWrap = $('clanViewLogo');
    if (logoWrap) logoWrap.innerHTML = renderClanLogoHtml(c, 'info');

    const badge = $('clanAdminBadge');
    if (badge) badge.hidden = !currentClanIsAdmin;

    const editBtn = $('clanInfoEditBtn');
    if (editBtn) editBtn.hidden = !canEditClan(currentClan);

    const adminsWrap = $('clanViewAdmins');
    if (adminsWrap) {
        const admins = parseLines(c.admins);
        adminsWrap.innerHTML = admins.length
            ? admins.map(a => `<span class="chip">👑 ${escapeHtml(a)}</span>`).join('')
            : '';
    }
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   22.  🤝  ПОЛОСА СОЮЗА                                               ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function renderAllianceBar() {
    const bar = $('allianceBar'); if (!bar) return;
    const c = clansCache[currentClan];
    const ally = c?.alliance_id ? alliancesCache[c.alliance_id] : null;
    if (!ally) { bar.hidden = true; bar.innerHTML = ''; return; }
    bar.hidden = false;
    const members = Object.values(clansCache).filter(x => x.alliance_id === ally.id);
    bar.innerHTML = `
        <div class="alliance-bar-title">🤝 Союз «${escapeHtml(ally.name)}»</div>
        <div class="alliance-bar-members">
            ${members.map(m => `
                <button class="alliance-member ${m.id === currentClan ? 'active' : ''}" data-id="${escapeHtml(m.id)}">
                    ${renderClanLogoHtml(m, 'icon')}
                    <span>${escapeHtml(m.name)}</span>
                </button>`).join('')}
        </div>`;
    bar.querySelectorAll('.alliance-member').forEach(b => {
        b.addEventListener('click', () => openClan(b.dataset.id));
    });
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   23.  📑  ВКЛАДКИ / СПИСКИ И БИЛДЫ                                  ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (!tab) return;
        currentTab = tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.toggle('active', tc.dataset.tab === tab));
        loadList(tab);
    });
});
async function loadList(tab) {
    const container = $('list-' + tab); if (!container) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    if (!currentClan) { container.innerHTML = '<div class="empty">Не выбрана гильдия</div>'; return; }
    try {
        const { data, error } = await supabase.from('clan_lists').select('*')
            .eq('clan_id', currentClan).eq('tab', tab).order('sort_order').order('name');
        if (error) throw error;
        renderListItems(container, tab, data || []);
    } catch (e) {
        container.innerHTML = `<div class="empty">Ошибка: ${escapeHtml(e.message)}</div>`;
    }
}
function renderListItems(container, tab, items) {
    if (!items.length) { container.innerHTML = '<div class="empty">Пусто</div>'; return; }
    container.innerHTML = '';
    items.forEach(it => {
        const el = document.createElement('div');
        el.className = 'list-item';
        el.innerHTML = `
            <div class="list-item-name">${escapeHtml(it.name)}</div>
            ${it.note ? `<div class="list-item-note">${escapeHtml(it.note)}</div>` : ''}
            ${currentClanIsAdmin ? `<div class="actions"><button class="edit">✏️</button><button class="delete">🗑</button></div>` : ''}`;
        if (currentClanIsAdmin) {
            el.querySelector('.edit')?.addEventListener('click', () => openListItemEdit(it));
            el.querySelector('.delete')?.addEventListener('click', () => deleteListItem(it.id));
        }
        container.appendChild(el);
    });
}
function openListItemEdit(it) {
    movingItem = it;
    $('listItemEditId').value = it.id || '';
    $('listItemEditTab').value = it.tab || currentTab;
    $('listItemEditName').value = it.name || '';
    $('listItemEditNote').value = it.note || '';
    $('listItemEditMsg').textContent = '';
    $('listItemEditModal').hidden = false;
}
on('cancelListItemEdit', 'click', () => { $('listItemEditModal').hidden = true; movingItem = null; });
on('saveListItemEdit', 'click', async () => {
    const name = val('listItemEditName').trim();
    const tab = val('listItemEditTab') || currentTab;
    const note = val('listItemEditNote').trim();
    const msg = $('listItemEditMsg');
    if (!name) { msg.textContent = 'Укажи имя'; msg.style.color = '#ff7a7a'; return; }
    if (movingItem?.id) {
        const { error } = await supabase.from('clan_lists').update({ name, note: note || null }).eq('id', movingItem.id);
        if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    } else {
        const { error } = await supabase.from('clan_lists').insert({
            clan_id: currentClan, tab, name, note: note || null, sort_order: 0
        });
        if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    }
    $('listItemEditModal').hidden = true; movingItem = null;
    loadList(tab);
});
async function deleteListItem(id) {
    if (!confirm('Удалить запись?')) return;
    await supabase.from('clan_lists').delete().eq('id', id);
    loadList(currentTab);
}
on('listItemAddBtn', 'click', () => openListItemEdit({ tab: currentTab }));

/* ────────── Билды: PvP / PB ────────── */
async function renderBuilds(kind) {
    const container = $('builds-' + kind); if (!container) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    if (!currentClan) { container.innerHTML = '<div class="empty">Не выбрана гильдия</div>'; return; }
    try {
        const { data, error } = await supabase.from('builds').select('*')
            .eq('clan_id', currentClan).eq('kind', kind).order('sort_order').order('title');
        if (error) throw error;
        const list = data || [];
        if (!list.length) { container.innerHTML = '<div class="empty">Билдов пока нет</div>'; return; }
        container.innerHTML = '';
        list.forEach(b => {
            const el = document.createElement('div');
            el.className = 'build-card';
            el.innerHTML = `
                <div class="build-title">${kind === 'pvp' ? '⚔️' : '🏴‍☠️'} <b>${escapeHtml(b.title)}</b></div>
                ${b.ship_name ? `<div class="build-ship">⛵ ${escapeHtml(b.ship_name)}</div>` : ''}
                ${b.notes ? `<div class="build-notes">${escapeHtml(b.notes)}</div>` : ''}
                ${currentClanIsAdmin ? `<div class="actions"><button class="edit">✏️</button><button class="delete">🗑</button></div>` : ''}`;
            if (currentClanIsAdmin) {
                el.querySelector('.edit')?.addEventListener('click', () => openBuildEdit(b, kind));
                el.querySelector('.delete')?.addEventListener('click', () => deleteBuild(b.id, kind));
            }
            container.appendChild(el);
        });
    } catch (e) {
        container.innerHTML = `<div class="empty">Ошибка: ${escapeHtml(e.message)}</div>`;
    }
}
function openBuildEdit(b, kind) {
    editingBuild = { ...b, kind };
    $('buildEditId').value = b.id || '';
    $('buildEditKind').value = kind;
    $('buildEditTitle').value = b.title || '';
    $('buildEditShip').value = b.ship_name || '';
    $('buildEditNotes').value = b.notes || '';
    $('buildEditMsg').textContent = '';
    $('buildEditModal').hidden = false;
}
on('buildAddPvp', 'click', () => openBuildEdit({}, 'pvp'));
on('buildAddPb',  'click', () => openBuildEdit({}, 'pb'));
on('cancelBuildEdit', 'click', () => { $('buildEditModal').hidden = true; editingBuild = null; });
on('saveBuildEdit', 'click', async () => {
    if (!editingBuild) return;
    const title = val('buildEditTitle').trim();
    const kind = val('buildEditKind') || 'pvp';
    const msg = $('buildEditMsg');
    if (!title) { msg.textContent = 'Укажи название'; msg.style.color = '#ff7a7a'; return; }
    const patch = {
        clan_id: currentClan, kind, title,
        ship_name: val('buildEditShip').trim() || null,
        notes: val('buildEditNotes').trim() || null
    };
    if (editingBuild.id) {
        const { error } = await supabase.from('builds').update(patch).eq('id', editingBuild.id);
        if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    } else {
        const { error } = await supabase.from('builds').insert({ ...patch, sort_order: 0 });
        if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    }
    $('buildEditModal').hidden = true; editingBuild = null;
    renderBuilds(kind);
});
async function deleteBuild(id, kind) {
    if (!confirm('Удалить билд?')) return;
    await supabase.from('builds').delete().eq('id', id);
    renderBuilds(kind);
}

/* ────────── События (список) ────────── */
async function renderEvents() {
    const container = $('eventsList'); if (!container) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    if (!currentClan) { container.innerHTML = '<div class="empty">Не выбрана гильдия</div>'; return; }
    try {
        const { data, error } = await supabase.from('events').select('*')
            .eq('clan_id', currentClan).order('event_at', { ascending: true });
        if (error) throw error;
        const list = data || [];
        if (!list.length) { container.innerHTML = '<div class="empty">Событий пока нет</div>'; return; }
        container.innerHTML = '';
        list.forEach(ev => {
            const el = document.createElement('div');
            el.className = 'event-card';
            const when = ev.event_at ? new Date(ev.event_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
            el.innerHTML = `
                <div class="event-head">
                    <div class="event-title">📅 <b>${escapeHtml(ev.title || '')}</b></div>
                    ${when ? `<div class="event-when">${escapeHtml(when)}</div>` : ''}
                </div>
                ${ev.description ? `<div class="event-desc">${escapeHtml(ev.description)}</div>` : ''}
                ${ev.map_markers?.length ? `<div class="event-map-badge">🗺 ${ev.map_markers.length} меток <button class="event-map-open">Открыть карту</button></div>` : ''}
                ${currentClanIsAdmin ? `<div class="actions"><button class="edit">✏️</button><button class="delete">🗑</button></div>` : ''}`;
            el.querySelector('.event-map-open')?.addEventListener('click', () => openEventMapViewer(ev));
            if (currentClanIsAdmin) {
                el.querySelector('.edit')?.addEventListener('click', () => openEventEdit(ev));
                el.querySelector('.delete')?.addEventListener('click', () => deleteEvent(ev.id));
            }
            container.appendChild(el);
        });
    } catch (e) {
        container.innerHTML = `<div class="empty">Ошибка: ${escapeHtml(e.message)}</div>`;
    }
}
let editingEventId = null;
function openEventEdit(ev) {
    editingEventId = ev.id || null;
    $('evTitle').value = ev.title || '';
    $('evDesc').value = ev.description || '';
    $('evWhen').value = ev.event_at ? new Date(ev.event_at).toISOString().slice(0, 16) : '';
    evMapMarkers = Array.isArray(ev.map_markers) ? ev.map_markers.slice() : [];
    renderEventMapEditor();
    $('evModal').hidden = false;
}
on('evAddBtn', 'click', () => {
    const title = val('evTitle').trim();
    const description = val('evDesc').trim();
    const when = val('evWhen');
    const msg = $('evMsg');
    if (!title) { flashStatusEl(msg, 'Укажи название', '#ff7a7a'); return; }
    const payload = {
        clan_id: currentClan,
        title,
        description: description || null,
        event_at: when ? new Date(when).toISOString() : null,
        map_markers: evMapMarkers
    };
    (async () => {
        const { error } = editingEventId
            ? await supabase.from('events').update(payload).eq('id', editingEventId)
            : await supabase.from('events').insert(payload);
        if (error) { flashStatusEl(msg, 'Ошибка: ' + error.message, '#ff7a7a'); return; }
        flashStatusEl(msg, '✔ Сохранено', '#6ee7a7');
        editingEventId = null; evMapMarkers = [];
        renderEventMapEditor();
        await renderEvents();
    })();
});
on('cancelEventEdit', 'click', () => {
    $('evModal').hidden = true;
    editingEventId = null; evMapMarkers = [];
    renderEventMapEditor();
});
async function deleteEvent(id) {
    if (!confirm('Удалить событие?')) return;
    await supabase.from('events').delete().eq('id', id);
    renderEvents();
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   23.1  🗺️  КАРТА-МЕТКИ СОБЫТИЙ (v2.5.0)                             ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function renderEventMapEditor() {
    const root = $('evMapEditor'); if (!root) return;

    const typeBar = root.querySelector('.ev-map-types');
    if (typeBar) {
        typeBar.innerHTML = '';
        Object.entries(EVENT_MARKER_TYPES).forEach(([key, meta]) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'ev-map-type' + (evMapCurrentType === key ? ' active' : '');
            btn.style.borderColor = meta.color;
            btn.innerHTML = `${meta.icon} ${meta.label}`;
            btn.addEventListener('click', () => { evMapCurrentType = key; renderEventMapEditor(); });
            typeBar.appendChild(btn);
        });
    }

    const list = root.querySelector('.ev-map-list');
    if (list) {
        list.innerHTML = '';
        if (!evMapMarkers.length) {
            list.innerHTML = '<div class="empty">Меток нет. Кликните по карте, чтобы добавить.</div>';
        } else {
            evMapMarkers.forEach((m, idx) => {
                const meta = EVENT_MARKER_TYPES[m.type] || EVENT_MARKER_TYPES.point;
                const row = document.createElement('div');
                row.className = 'ev-map-row';
                row.innerHTML = `
                    <span class="ev-map-dot" style="background:${meta.color}"></span>
                    <span class="ev-map-label">${meta.icon} ${escapeHtml(m.label || meta.label)}</span>
                    <span class="ev-map-coords">${(m.x * 100).toFixed(1)}% / ${(m.y * 100).toFixed(1)}%</span>
                    <button class="ev-map-del" title="Удалить">✖</button>`;
                row.querySelector('.ev-map-del').addEventListener('click', () => {
                    evMapMarkers.splice(idx, 1);
                    renderEventMapEditor();
                });
                list.appendChild(row);
            });
        }
    }

    const canvas = root.querySelector('.ev-map-canvas');
    if (canvas) {
        canvas.innerHTML = '';
        const img = document.createElement('img');
        img.src = (mapSettings?.detailed || MAP_DEFAULT_DETAILED);
        img.alt = '';
        img.draggable = false;
        canvas.appendChild(img);

        const overlay = document.createElement('div');
        overlay.className = 'ev-map-overlay';
        canvas.appendChild(overlay);

        evMapMarkers.forEach(m => {
            const meta = EVENT_MARKER_TYPES[m.type] || EVENT_MARKER_TYPES.point;
            const pin = document.createElement('span');
            pin.className = 'ev-map-pin';
            pin.style.left = (m.x * 100) + '%';
            pin.style.top  = (m.y * 100) + '%';
            pin.style.borderColor = meta.color;
            pin.textContent = meta.icon;
            pin.title = m.label || meta.label;
            overlay.appendChild(pin);
        });

        canvas.onclick = (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
            const meta = EVENT_MARKER_TYPES[evMapCurrentType] || EVENT_MARKER_TYPES.point;
            const label = prompt(`Подпись метки «${meta.label}»:`, meta.label) ?? '';
            evMapMarkers.push({ x, y, type: evMapCurrentType, label: label.trim() || meta.label });
            renderEventMapEditor();
        };
    }
}
function openEventMapViewer(ev) {
    const modal = $('evMapViewer'); if (!modal) return;
    const stage = modal.querySelector('.ev-map-viewer-stage');
    stage.innerHTML = '';
    const img = document.createElement('img');
    img.src = (mapSettings?.detailed || MAP_DEFAULT_DETAILED);
    img.alt = '';
    stage.appendChild(img);
    (ev.map_markers || []).forEach(m => {
        const meta = EVENT_MARKER_TYPES[m.type] || EVENT_MARKER_TYPES.point;
        const pin = document.createElement('span');
        pin.className = 'ev-map-pin viewer';
        pin.style.left = (m.x * 100) + '%';
        pin.style.top  = (m.y * 100) + '%';
        pin.style.borderColor = meta.color;
        pin.textContent = meta.icon;
        pin.title = m.label || meta.label;
        stage.appendChild(pin);
    });
    modal.hidden = false;
}
on('closeEvMapViewer', 'click', () => { const m = $('evMapViewer'); if (m) m.hidden = true; });
on('evMapClear', 'click', () => {
    if (!evMapMarkers.length) return;
    if (!confirm('Убрать все метки?')) return;
    evMapMarkers = [];
    renderEventMapEditor();
});
/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   24.  💰  КАЗНА                                                      ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadTreasury() {
    const container = $('treasuryList'); if (!container) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    if (!currentClan) { container.innerHTML = '<div class="empty">Не выбрана гильдия</div>'; return; }
    try {
        const { data, error } = await supabase.from('treasury').select('*')
            .eq('clan_id', currentClan).order('sort_order').order('name');
        if (error) throw error;
        renderTreasury(data || []);
    } catch (e) {
        container.innerHTML = `<div class="empty">Ошибка: ${escapeHtml(e.message)}</div>`;
    }
}
function renderTreasury(items) {
    const container = $('treasuryList'); if (!container) return;
    if (!items.length) { container.innerHTML = '<div class="empty">Казна пуста</div>'; return; }
    container.innerHTML = '';
    items.forEach(it => {
        const el = document.createElement('div');
        el.className = 'treasury-item';
        el.innerHTML = `
            <div class="treasury-icon">${it.icon || '💰'}</div>
            <div class="treasury-info">
                <div class="treasury-name">${escapeHtml(it.name)}</div>
                <div class="treasury-qty">${Number(it.quantity || 0).toLocaleString('ru-RU')} ${escapeHtml(it.unit || 'шт')}</div>
            </div>
            ${currentClanIsAdmin ? `<div class="actions"><button class="edit">✏️</button><button class="delete">🗑</button></div>` : ''}`;
        if (currentClanIsAdmin) {
            el.querySelector('.edit')?.addEventListener('click', () => openTreasuryEdit(it));
            el.querySelector('.delete')?.addEventListener('click', () => deleteTreasuryItem(it.id));
        }
        container.appendChild(el);
    });
}
function openTreasuryEdit(it) {
    editingItem = it;
    $('treasuryEditId').value = it?.id || '';
    $('treasuryEditName').value = it?.name || '';
    $('treasuryEditQty').value = it?.quantity || 0;
    $('treasuryEditUnit').value = it?.unit || 'шт';
    $('treasuryEditIcon').value = it?.icon || '💰';
    $('treasuryEditMsg').textContent = '';
    $('treasuryEditModal').hidden = false;
    $('treasuryEditName').focus();
}
on('treasuryAddBtn', 'click', () => openTreasuryEdit(null));
on('cancelTreasuryEdit', 'click', () => { $('treasuryEditModal').hidden = true; editingItem = null; });
on('saveTreasuryEdit', 'click', async () => {
    const name = val('treasuryEditName').trim();
    const msg = $('treasuryEditMsg');
    if (!name) { msg.textContent = 'Укажи название'; msg.style.color = '#ff7a7a'; return; }
    const patch = {
        clan_id: currentClan,
        name,
        quantity: parseFloat(val('treasuryEditQty')) || 0,
        unit: val('treasuryEditUnit').trim() || 'шт',
        icon: val('treasuryEditIcon').trim() || '💰',
        sort_order: 0
    };
    if (editingItem?.id) {
        const { error } = await supabase.from('treasury').update(patch).eq('id', editingItem.id);
        if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    } else {
        const { error } = await supabase.from('treasury').insert(patch);
        if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    }
    $('treasuryEditModal').hidden = true; editingItem = null;
    await loadTreasury();
});
async function deleteTreasuryItem(id) {
    if (!confirm('Удалить запись из казны?')) return;
    await supabase.from('treasury').delete().eq('id', id);
    await loadTreasury();
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   25.  👥  СОСТАВ ГИЛЬДИИ                                            ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadMembers() {
    const container = $('membersList'); if (!container) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    if (!currentClan) { container.innerHTML = '<div class="empty">Не выбрана гильдия</div>'; return; }
    try {
        const { data, error } = await supabase.from('members').select('*')
            .eq('clan_id', currentClan).order('sort_order').order('name');
        if (error) throw error;
        renderMembers(data || []);
    } catch (e) {
        container.innerHTML = `<div class="empty">Ошибка: ${escapeHtml(e.message)}</div>`;
    }
}
function renderMembers(items) {
    const container = $('membersList'); if (!container) return;
    if (!items.length) { container.innerHTML = '<div class="empty">Состав пуст</div>'; return; }
    container.innerHTML = '';
    items.forEach(m => {
        const el = document.createElement('div');
        el.className = 'member-item';
        el.innerHTML = `
            <div class="member-num">${escapeHtml(m.num || '')}</div>
            <div class="member-name">${escapeHtml(m.name)}</div>
            ${currentClanIsAdmin ? `<div class="actions"><button class="edit">✏️</button><button class="delete">🗑</button></div>` : ''}`;
        if (currentClanIsAdmin) {
            el.querySelector('.edit')?.addEventListener('click', () => openMemberEdit(m));
            el.querySelector('.delete')?.addEventListener('click', () => deleteMember(m.id));
        }
        container.appendChild(el);
    });
}
function openMemberEdit(m) {
    editingItem = m;
    $('memberEditId').value = m?.id || '';
    $('memberEditNum').value = m?.num || '';
    $('memberEditName').value = m?.name || '';
    $('memberEditMsg').textContent = '';
    $('memberEditModal').hidden = false;
    $('memberEditName').focus();
}
on('memberAddBtn', 'click', () => openMemberEdit(null));
on('cancelMemberEdit', 'click', () => { $('memberEditModal').hidden = true; editingItem = null; });
on('saveMemberEdit', 'click', async () => {
    const name = val('memberEditName').trim();
    const msg = $('memberEditMsg');
    if (!name) { msg.textContent = 'Укажи имя'; msg.style.color = '#ff7a7a'; return; }
    const patch = {
        clan_id: currentClan,
        num: val('memberEditNum').trim() || null,
        name,
        sort_order: 0
    };
    if (editingItem?.id) {
        const { error } = await supabase.from('members').update(patch).eq('id', editingItem.id);
        if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    } else {
        const { error } = await supabase.from('members').insert(patch);
        if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    }
    $('memberEditModal').hidden = true; editingItem = null;
    await loadMembers();
});
async function deleteMember(id) {
    if (!confirm('Удалить участника?')) return;
    await supabase.from('members').delete().eq('id', id);
    await loadMembers();
}

/* ────────── Админы гильдии (отдельный список) ────────── */
async function loadClanAdmins() {
    const container = $('adminsList'); if (!container) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    if (!currentClan) { container.innerHTML = '<div class="empty">Не выбрана гильдия</div>'; return; }
    try {
        const { data, error } = await supabase.from('clan_admins').select('*')
            .eq('clan_id', currentClan).order('sort_order').order('name');
        if (error) throw error;
        renderClanAdmins(data || []);
    } catch (e) {
        container.innerHTML = `<div class="empty">Ошибка: ${escapeHtml(e.message)}</div>`;
    }
}
function renderClanAdmins(items) {
    const container = $('adminsList'); if (!container) return;
    if (!items.length) { container.innerHTML = '<div class="empty">Нет админов</div>'; return; }
    container.innerHTML = '';
    items.forEach(a => {
        const el = document.createElement('div');
        el.className = 'member-item';
        el.innerHTML = `
            <div class="member-num">👑</div>
            <div class="member-name">${escapeHtml(a.name)}</div>
            ${currentClanIsAdmin ? `<div class="actions"><button class="edit">✏️</button><button class="delete">🗑</button></div>` : ''}`;
        if (currentClanIsAdmin) {
            el.querySelector('.edit')?.addEventListener('click', () => openClanAdminEdit(a));
            el.querySelector('.delete')?.addEventListener('click', () => deleteClanAdmin(a.id));
        }
        container.appendChild(el);
    });
}
function openClanAdminEdit(a) {
    editingItem = a;
    $('adminEditId').value = a?.id || '';
    $('adminEditName').value = a?.name || '';
    $('adminEditMsg').textContent = '';
    $('adminEditModal').hidden = false;
    $('adminEditName').focus();
}
on('adminAddBtn', 'click', () => openClanAdminEdit(null));
on('cancelAdminEdit', 'click', () => { $('adminEditModal').hidden = true; editingItem = null; });
on('saveAdminEdit', 'click', async () => {
    const name = val('adminEditName').trim();
    const msg = $('adminEditMsg');
    if (!name) { msg.textContent = 'Укажи имя'; msg.style.color = '#ff7a7a'; return; }
    const patch = { clan_id: currentClan, name, sort_order: 0 };
    if (editingItem?.id) {
        const { error } = await supabase.from('clan_admins').update(patch).eq('id', editingItem.id);
        if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    } else {
        const { error } = await supabase.from('clan_admins').insert(patch);
        if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    }
    $('adminEditModal').hidden = true; editingItem = null;
    await loadClanAdmins();
});
async function deleteClanAdmin(id) {
    if (!confirm('Удалить админа гильдии?')) return;
    await supabase.from('clan_admins').delete().eq('id', id);
    await loadClanAdmins();
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   26.  📨  ЗАЯВКИ В ГИЛЬДИЮ (админ)                                  ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadClanRequests() {
    const container = $('clanRequestsAdminList'); if (!container) return;
    if (!isAdmin) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    try {
        const { data, error } = await supabase.from('clan_requests').select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        renderClanRequestsAdmin(data || []);
    } catch (e) {
        container.innerHTML = `<div class="empty">Ошибка: ${escapeHtml(e.message)}</div>`;
    }
}
function renderClanRequestsAdmin(items) {
    const container = $('clanRequestsAdminList'); if (!container) return;
    if (!items.length) { container.innerHTML = '<div class="empty">Заявок нет</div>'; return; }
    container.innerHTML = '';
    items.forEach(r => {
        const el = document.createElement('div');
        el.className = 'request-item';
        const statusMap = { pending: '⏳ Ожидает', approved: '✅ Принята', rejected: '❌ Отклонена' };
        el.innerHTML = `
            <div class="request-head">
                <b>${escapeHtml(r.clan_name || r.clan_id)}</b>
                <span class="request-status ${r.status}">${statusMap[r.status] || r.status}</span>
            </div>
            <div class="request-meta">
                👤 ${escapeHtml(r.nickname || '—')} · 🎮 ${escapeHtml(r.game_id || '—')}
                · ${r.created_at ? new Date(r.created_at).toLocaleString('ru-RU') : ''}
            </div>
            ${r.comment ? `<div class="request-comment">${escapeHtml(r.comment)}</div>` : ''}
            ${r.status === 'pending' ? `
                <div class="request-actions">
                    <button class="approve">✅ Принять</button>
                    <button class="reject">❌ Отклонить</button>
                </div>` : ''}`;
        el.querySelector('.approve')?.addEventListener('click', () => approveClanRequest(r.id));
        el.querySelector('.reject')?.addEventListener('click', () => rejectClanRequest(r.id));
        container.appendChild(el);
    });
}
async function approveClanRequest(id) {
    const { error } = await supabase.from('clan_requests').update({ status: 'approved' }).eq('id', id);
    if (error) return alert('Ошибка: ' + error.message);
    await loadClanRequests();
}
async function rejectClanRequest(id) {
    const { error } = await supabase.from('clan_requests').update({ status: 'rejected' }).eq('id', id);
    if (error) return alert('Ошибка: ' + error.message);
    await loadClanRequests();
}
on('refreshClanRequests', 'click', loadClanRequests);

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   27.  💱  ТРЕЙДЫ                                                    ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadTrades() {
    const container = $('tradesList'); if (!container) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    try {
        let q = supabase.from('trades').select('*');
        if (tradeStatusFilter === 'active') q = q.eq('status', 'active');
        else if (tradeStatusFilter === 'done') q = q.eq('status', 'done');
        if (tradeFilterType !== 'all') q = q.eq('type', tradeFilterType);
        if (tradeFilterCat !== 'all') q = q.eq('category', tradeFilterCat);
        if (tradeFilterClan !== 'all') q = q.eq('clan_id', tradeFilterClan);
        q = q.order('created_at', { ascending: tradeSort === 'old' });
        const { data, error } = await q;
        if (error) throw error;
        tradesCache = data || [];
        renderTrades();
    } catch (e) {
        container.innerHTML = `<div class="empty">Ошибка: ${escapeHtml(e.message)}</div>`;
    }
}
function renderTrades() {
    const container = $('tradesList'); if (!container) return;
    let list = tradesCache.slice();
    if (tradeOnlyShips) list = list.filter(t => t.category === 'ship');
    if (!list.length) { container.innerHTML = '<div class="empty">Трейдов нет</div>'; return; }
    container.innerHTML = '';
    list.forEach(t => {
        const cat = tradeCatById(t.category);
        const el = document.createElement('div');
        el.className = 'trade-card' + (t.status === 'done' ? ' done' : '');
        el.innerHTML = `
            <div class="trade-head">
                <span class="trade-type ${t.type}">${t.type === 'buy' ? '🛒 Куплю' : '💰 Продам'}</span>
                <span class="trade-cat">${cat.icon} ${escapeHtml(cat.name)}</span>
                <span class="trade-time">${tradeTimeAgo(t.created_at)}</span>
            </div>
            <div class="trade-title">${escapeHtml(t.title)}</div>
            <div class="trade-meta">
                <span>💵 ${tradeFmtGold(t.price)}</span>
                ${t.quantity ? `<span>📦 ${t.quantity} ${escapeHtml(t.unit || 'шт')}</span>` : ''}
                ${t.clan_id && clansCache[t.clan_id] ? `<span>🏰 ${escapeHtml(clansCache[t.clan_id].name)}</span>` : ''}
            </div>
            ${t.description ? `<div class="trade-desc">${escapeHtml(t.description)}</div>` : ''}
            <div class="trade-actions">
                ${t.status === 'active' ? `<button class="accept">✅ Принять</button>` : ''}
                ${(isOwner || t.author_nick === getViewerNick()) ? `<button class="delete">🗑 Удалить</button>` : ''}
            </div>`;
        el.querySelector('.accept')?.addEventListener('click', () => acceptTrade(t));
        el.querySelector('.delete')?.addEventListener('click', () => deleteTrade(t.id));
        container.appendChild(el);
    });
}
function openTradeForm(trade) {
    editingTradeId = trade?.id || null;
    $('tradeFormType').value = trade?.type || 'buy';
    $('tradeFormTitle').value = trade?.title || '';
    $('tradeFormCategory').value = trade?.category || 'resource';
    $('tradeFormPrice').value = trade?.price || '';
    $('tradeFormQty').value = trade?.quantity || '';
    $('tradeFormUnit').value = trade?.unit || 'шт';
    $('tradeFormDesc').value = trade?.description || '';
    $('tradeFormMsg').textContent = '';
    $('tradeFormModal').hidden = false;
    $('tradeFormTitle').focus();
}
on('tradeAddBtn', 'click', () => openTradeForm(null));
on('cancelTradeForm', 'click', () => { $('tradeFormModal').hidden = true; editingTradeId = null; });
on('saveTradeForm', 'click', async () => {
    const title = val('tradeFormTitle').trim();
    const msg = $('tradeFormMsg');
    if (!title) { msg.textContent = 'Укажи название'; msg.style.color = '#ff7a7a'; return; }
    const patch = {
        type: val('tradeFormType') || 'buy',
        title,
        category: val('tradeFormCategory') || 'resource',
        price: parseFloat(val('tradeFormPrice')) || 0,
        quantity: parseFloat(val('tradeFormQty')) || null,
        unit: val('tradeFormUnit').trim() || 'шт',
        description: val('tradeFormDesc').trim() || null,
        author_nick: getViewerNick() || 'гость',
        clan_id: currentClan || getMyClanId() || null,
        status: 'active'
    };
    if (editingTradeId) {
        const { error } = await supabase.from('trades').update(patch).eq('id', editingTradeId);
        if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    } else {
        const { error } = await supabase.from('trades').insert(patch);
        if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    }
    $('tradeFormModal').hidden = true; editingTradeId = null;
    await loadTrades();
});
async function acceptTrade(t) {
    acceptingTrade = t;
    if (!confirm(`Принять трейд «${t.title}»?`)) return;
    const { error } = await supabase.from('trades').update({ status: 'done' }).eq('id', t.id);
    if (error) return alert('Ошибка: ' + error.message);
    await loadTrades();
}
async function deleteTrade(id) {
    if (!confirm('Удалить трейд?')) return;
    const { error } = await supabase.from('trades').delete().eq('id', id);
    if (error) return alert('Ошибка: ' + error.message);
    await loadTrades();
}
on('tradeFilterType', 'change', () => { tradeFilterType = val('tradeFilterType'); loadTrades(); });
on('tradeFilterCat',  'change', () => { tradeFilterCat  = val('tradeFilterCat');  loadTrades(); });
on('tradeFilterClan', 'change', () => { tradeFilterClan = val('tradeFilterClan'); loadTrades(); });
on('tradeSort',       'change', () => { tradeSort       = val('tradeSort');       loadTrades(); });
on('tradeStatusFilter','change',() => { tradeStatusFilter = val('tradeStatusFilter'); loadTrades(); });
on('tradeOnlyShips', 'change', () => { tradeOnlyShips = $('tradeOnlyShips').checked; renderTrades(); });

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   28.  📝  ЗАЯВКИ (APPLICATIONS)                                     ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadApplications() {
    const container = $('applicationsList'); if (!container) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    if (!currentClan) { container.innerHTML = '<div class="empty">Не выбрана гильдия</div>'; return; }
    try {
        const { data, error } = await supabase.from('applications').select('*')
            .eq('clan_id', currentClan).order('created_at', { ascending: false });
        if (error) throw error;
        renderApplications(data || []);
    } catch (e) {
        container.innerHTML = `<div class="empty">Ошибка: ${escapeHtml(e.message)}</div>`;
    }
}
function renderApplications(items) {
    const container = $('applicationsList'); if (!container) return;
    if (!items.length) { container.innerHTML = '<div class="empty">Заявок нет</div>'; return; }
    container.innerHTML = '';
    items.forEach(a => {
        const el = document.createElement('div');
        el.className = 'application-item';
        el.innerHTML = `
            <div class="application-head">
                <b>${escapeHtml(a.nickname)}</b>
                <span class="application-status ${a.status}">${a.status === 'pending' ? '⏳' : a.status === 'approved' ? '✅' : '❌'}</span>
            </div>
            ${a.message ? `<div class="application-msg">${escapeHtml(a.message)}</div>` : ''}
            <div class="application-meta">${a.created_at ? new Date(a.created_at).toLocaleString('ru-RU') : ''}</div>
            ${currentClanIsAdmin && a.status === 'pending' ? `
                <div class="application-actions">
                    <button class="approve">✅ Принять</button>
                    <button class="reject">❌ Отклонить</button>
                </div>` : ''}`;
        el.querySelector('.approve')?.addEventListener('click', () => approveApplication(a.id));
        el.querySelector('.reject')?.addEventListener('click', () => rejectApplication(a.id));
        container.appendChild(el);
    });
}
async function approveApplication(id) {
    const { error } = await supabase.from('applications').update({ status: 'approved' }).eq('id', id);
    if (error) return alert('Ошибка: ' + error.message);
    await loadApplications();
}
async function rejectApplication(id) {
    const { error } = await supabase.from('applications').update({ status: 'rejected' }).eq('id', id);
    if (error) return alert('Ошибка: ' + error.message);
    await loadApplications();
}
on('appSubmitBtn', 'click', async () => {
    const msg = $('appMsg');
    const nick = getViewerNick();
    if (!nick) { msg.textContent = 'Укажи ник в профиле'; msg.style.color = '#ff7a7a'; return; }
    if (!currentClan) { msg.textContent = 'Выбери гильдию'; msg.style.color = '#ff7a7a'; return; }
    const { error } = await supabase.from('applications').insert({
        clan_id: currentClan,
        nickname: nick,
        message: val('appMessage').trim() || null,
        status: 'pending'
    });
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    msg.textContent = '✔ Заявка отправлена'; msg.style.color = '#6ee7a7';
    $('appMessage').value = '';
    await loadApplications();
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   29.  ❓  FAQ-АДМИН                                                 ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadFaq() {
    try {
        const { data, error } = await supabase.from('faq').select('*').order('sort_order');
        if (error) throw error;
        faqCache = data || [];
    } catch (e) { faqCache = []; }
    renderFaqAdmin();
}
function renderFaqAdmin() {
    const container = $('faqAdminList'); if (!container) return;
    container.innerHTML = '';
    if (!faqCache.length) { container.innerHTML = '<div class="empty">Пока нет вопросов</div>'; return; }
    faqCache.forEach(f => {
        const el = document.createElement('div');
        el.className = 'games-admin-item';
        el.innerHTML = `
            <div class="logo-mini"><span>❓</span></div>
            <div class="txt"><b>${escapeHtml(f.question)}</b><span>${escapeHtml(f.answer || '').slice(0, 80)}…</span></div>
            <div class="actions">
                <button class="edit">✏️</button>
                <button class="delete">🗑</button>
            </div>`;
        el.querySelector('.edit').addEventListener('click', () => openFaqEdit(f));
        el.querySelector('.delete').addEventListener('click', () => deleteFaq(f.id));
        container.appendChild(el);
    });
}
function openFaqEdit(f) {
    editingItem = f;
    $('faqEditId').value = f?.id || '';
    $('faqEditQuestion').value = f?.question || '';
    $('faqEditAnswer').value = f?.answer || '';
    $('faqEditMsg').textContent = '';
    $('faqEditModal').hidden = false;
    $('faqEditQuestion').focus();
}
on('faqAddBtn', 'click', () => openFaqEdit(null));
on('cancelFaqEdit', 'click', () => { $('faqEditModal').hidden = true; editingItem = null; });
on('saveFaqEdit', 'click', async () => {
    const q = val('faqEditQuestion').trim();
    const a = val('faqEditAnswer').trim();
    const msg = $('faqEditMsg');
    if (!q || !a) { msg.textContent = 'Заполни вопрос и ответ'; msg.style.color = '#ff7a7a'; return; }
    const patch = { question: q, answer: a, sort_order: 0 };
    if (editingItem?.id) {
        const { error } = await supabase.from('faq').update(patch).eq('id', editingItem.id);
        if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    } else {
        const { error } = await supabase.from('faq').insert(patch);
        if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    }
    $('faqEditModal').hidden = true; editingItem = null;
    await loadFaq();
});
async function deleteFaq(id) {
    if (!confirm('Удалить вопрос?')) return;
    await supabase.from('faq').delete().eq('id', id);
    await loadFaq();
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   30.  🤝  ПАРТНЁРЫ-АДМИН                                            ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadPartners() {
    try {
        const { data, error } = await supabase.from('partners').select('*').order('sort_order');
        if (error) throw error;
        partnersCache = data || [];
    } catch (e) { partnersCache = []; }
    renderPartnersAdmin();
}
function renderPartnersAdmin() {
    const container = $('partnersAdminList'); if (!container) return;
    container.innerHTML = '';
    if (!partnersCache.length) { container.innerHTML = '<div class="empty">Пока нет партнёров</div>'; return; }
    partnersCache.forEach(p => {
        const el = document.createElement('div');
        el.className = 'partners-admin-item';
        const logo = p.logo ? `<img src="${escapeHtml(p.logo)}" alt="" onerror="this.outerHTML='<span>🤝</span>'">` : `<span>🤝</span>`;
        el.innerHTML = `
            <div class="logo-mini">${logo}</div>
            <div class="txt"><b>${escapeHtml(p.name)}</b><span>${escapeHtml(p.url || '')}</span></div>
            <div class="actions">
                <button class="edit">✏️</button>
                <button class="delete">🗑</button>
            </div>`;
        el.querySelector('.edit').addEventListener('click', () => openPartnerEdit(p));
        el.querySelector('.delete').addEventListener('click', () => deletePartner(p.id));
        container.appendChild(el);
    });
}
function openPartnerEdit(p) {
    editingItem = p;
    $('partnerEditId').value = p?.id || '';
    $('partnerEditName').value = p?.name || '';
    $('partnerEditUrl').value = p?.url || '';
    $('partnerEditDesc').value = p?.description || '';
    $('partnerEditMsg').textContent = '';
    $('partnerEditModal').hidden = false;
    $('partnerEditName').focus();
}
on('partnerAddBtn', 'click', () => openPartnerEdit(null));
on('cancelPartnerEdit', 'click', () => { $('partnerEditModal').hidden = true; editingItem = null; });
on('savePartnerEdit', 'click', async () => {
    const name = val('partnerEditName').trim();
    const msg = $('partnerEditMsg');
    if (!name) { msg.textContent = 'Укажи название'; msg.style.color = '#ff7a7a'; return; }
    const patch = {
        name,
        url: val('partnerEditUrl').trim() || null,
        description: val('partnerEditDesc').trim() || null,
        logo: partnerLogoData || null,
        sort_order: 0
    };
    if (editingItem?.id) {
        const { error } = await supabase.from('partners').update(patch).eq('id', editingItem.id);
        if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    } else {
        const { error } = await supabase.from('partners').insert(patch);
        if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    }
    $('partnerEditModal').hidden = true; editingItem = null; partnerLogoData = null;
    await loadPartners();
});
async function deletePartner(id) {
    if (!confirm('Удалить партнёра?')) return;
    await supabase.from('partners').delete().eq('id', id);
    await loadPartners();
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   31.  🎯  ТАКТИКА-АДМИН (см. часть 2/4, модуль 17)                   ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
/* Уже реализовано в части 2/4. Здесь дублировать не нужно. */

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   32.  🪵  РЕСУРСЫ (ЦЕНЫ)                                            ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadResources() {
    try {
        const { data, error } = await supabase.from('resources').select('*').order('sort_order');
        if (error) throw error;
        resourcesCache = data || [];
    } catch (e) { resourcesCache = []; }
    renderPricingGrid();
    renderResourcePricesHome();
}
function renderPricingGrid() {
    const container = $('pricingGrid'); if (!container) return;
    if (!resourcesCache.length) {
        container.innerHTML = '<div class="empty">Нет ресурсов. Добавьте из пресета.</div>';
        return;
    }
    container.innerHTML = '';
    PRICING_GROUPS.forEach(g => {
        const list = resourcesCache.filter(r => (r.group_id || 'other') === g.id);
        if (!list.length) return;
        const groupEl = document.createElement('div');
        groupEl.className = 'pricing-group ' + g.cls;
        groupEl.innerHTML = `<div class="pricing-group-title">${g.name} (${list.length})</div>`;
        list.forEach(r => {
            const el = document.createElement('div');
            el.className = 'pricing-row';
            el.innerHTML = `
                <div class="pricing-icon">${r.icon || '📦'}</div>
                <div class="pricing-name">${escapeHtml(r.name)}</div>
                <input type="number" class="pricing-input" value="${r.price || 0}" step="0.01" data-id="${r.id}">
                <span class="pricing-cur">🪙</span>
                <button class="pricing-save" title="Сохранить">💾</button>`;
            el.querySelector('.pricing-save').addEventListener('click', async () => {
                const inp = el.querySelector('.pricing-input');
                const price = parseFloat(inp.value) || 0;
                const { error } = await supabase.from('resources').update({ price }).eq('id', r.id);
                if (error) return alert('Ошибка: ' + error.message);
                r.price = price;
                flashStatus('✔ Цена сохранена', '#6ee7a7');
            });
            container.appendChild(el);
        });
        container.appendChild(groupEl);
    });
}
function renderResourcePricesHome() {
    const container = $('resourcePricesList'); if (!container) return;
    if (!resourcesCache.length) { container.innerHTML = '<div class="empty">Нет данных</div>'; return; }
    container.innerHTML = '';
    PRICING_GROUPS.forEach(g => {
        const list = resourcesCache.filter(r => (r.group_id || 'other') === g.id);
        if (!list.length) return;
        const groupEl = document.createElement('div');
        groupEl.className = 'resource-group';
        groupEl.innerHTML = `<div class="resource-group-title">${g.name}</div>`;
        list.forEach(r => {
            const el = document.createElement('div');
            el.className = 'resource-row';
            el.innerHTML = `
                <span class="resource-icon">${r.icon || '📦'}</span>
                <span class="resource-name">${escapeHtml(r.name)}</span>
                <span class="resource-price">${Number(r.price || 0).toLocaleString('ru-RU')} 🪙</span>`;
            groupEl.appendChild(el);
        });
        container.appendChild(groupEl);
    });
}
on('resourcePresetBtn', 'click', async () => {
    if (!confirm('Загрузить стандартный набор ресурсов?')) return;
    const rows = RESOURCE_PRESET.map(([id, name, en, icon, img, price, sort, group]) => ({
        id, name, name_en: en, icon, image: img, price, sort_order: sort, group_id: group
    }));
    const { error } = await supabase.from('resources').upsert(rows);
    if (error) return alert('Ошибка: ' + error.message);
    await loadResources();
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   33.  🧪  РЕЦЕПТЫ (SHIP COST)                                        ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadRecipes() {
    try {
        const { data, error } = await supabase.from('recipes').select('*');
        if (error) throw error;
        recipesCache = data || [];
    } catch (e) { recipesCache = []; }
    try {
        const { data, error } = await supabase.from('discounts').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        discountsCache = data || [];
    } catch (e) { discountsCache = []; }
    renderRecipeShipSelect();
    renderRecipeRows();
    renderDiscountsAdmin();
    renderShipCostPublic();
}
function renderRecipeShipSelect() {
    const sel = $('recipeShipSelect'); if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = '';
    shipsCache.forEach(s => {
        const o = document.createElement('option');
        o.value = s.id; o.textContent = `${s.name} (${shipLevelRoman(s.level)})`;
        sel.appendChild(o);
    });
    if (cur && shipsCache.some(s => String(s.id) === String(cur))) sel.value = cur;
    else if (shipsCache[0]) sel.value = shipsCache[0].id;
}
function renderRecipeRows() {
    const container = $('recipeRows'); if (!container) return;
    const shipId = val('recipeShipSelect');
    if (!shipId) { container.innerHTML = '<div class="empty">Выбери корабль</div>'; return; }
    const rows = recipesCache.filter(r => String(r.ship_id) === String(shipId));
    if (!rows.length) { container.innerHTML = '<div class="empty">Рецепт пуст</div>'; return; }
    container.innerHTML = '';
    rows.forEach(r => {
        const res = resourcesCache.find(x => String(x.id) === String(r.resource_id));
        const el = document.createElement('div');
        el.className = 'recipe-row';
        el.innerHTML = `
            <span class="recipe-icon">${res?.icon || '📦'}</span>
            <span class="recipe-name">${escapeHtml(res?.name || r.resource_id)}</span>
            <input type="number" class="recipe-qty" value="${r.quantity || 0}" step="1" data-id="${r.id}">
            <span class="recipe-unit">${escapeHtml(res?.unit || 'шт')}</span>
            <button class="recipe-save" title="Сохранить">💾</button>
            <button class="recipe-del" title="Удалить">✖</button>`;
        el.querySelector('.recipe-save').addEventListener('click', async () => {
            const q = parseFloat(el.querySelector('.recipe-qty').value) || 0;
            const { error } = await supabase.from('recipes').update({ quantity: q }).eq('id', r.id);
            if (error) return alert('Ошибка: ' + error.message);
            r.quantity = q;
            flashStatus('✔ Сохранено', '#6ee7a7');
        });
        el.querySelector('.recipe-del').addEventListener('click', async () => {
            if (!confirm('Удалить ресурс из рецепта?')) return;
            await supabase.from('recipes').delete().eq('id', r.id);
            await loadRecipes();
        });
        container.appendChild(el);
    });
}
on('recipeShipSelect', 'change', renderRecipeRows);
on('recipeAddRow', 'click', async () => {
    const shipId = val('recipeShipSelect');
    const resId = val('recipeResourceSelect');
    if (!shipId || !resId) return;
    const exists = recipesCache.some(r => String(r.ship_id) === String(shipId) && String(r.resource_id) === String(resId));
    if (exists) return alert('Уже есть в рецепте');
    const { error } = await supabase.from('recipes').insert({
        ship_id: shipId, resource_id: resId, quantity: 1
    });
    if (error) return alert('Ошибка: ' + error.message);
    await loadRecipes();
});
function renderShipCostPublic() {
    const container = $('shipCostPublic'); if (!container) return;
    const shipId = val('shipCostPublicSelect');
    if (!shipId) { container.innerHTML = '<div class="empty">Выбери корабль</div>'; return; }
    const rows = recipesCache.filter(r => String(r.ship_id) === String(shipId));
    if (!rows.length) { container.innerHTML = '<div class="empty">Рецепт не задан</div>'; return; }
    let total = 0;
    container.innerHTML = '';
    rows.forEach(r => {
        const res = resourcesCache.find(x => String(x.id) === String(r.resource_id));
        const sum = (res?.price || 0) * (r.quantity || 0);
        total += sum;
        const el = document.createElement('div');
        el.className = 'shipcost-row';
        el.innerHTML = `
            <span>${res?.icon || '📦'} ${escapeHtml(res?.name || r.resource_id)}</span>
            <span>${r.quantity || 0} ${escapeHtml(res?.unit || 'шт')}</span>
            <span>${Number(sum).toLocaleString('ru-RU')} 🪙</span>`;
        container.appendChild(el);
    });
    const totalEl = document.createElement('div');
    totalEl.className = 'shipcost-total';
    totalEl.innerHTML = `<b>Итого: ${Number(total).toLocaleString('ru-RU')} 🪙</b>`;
    container.appendChild(totalEl);
}
on('shipCostPublicSelect', 'change', renderShipCostPublic);
function renderDiscountsAdmin() {
    const container = $('discountsAdminList'); if (!container) return;
    container.innerHTML = '';
    if (!discountsCache.length) { container.innerHTML = '<div class="empty">Скидок нет</div>'; return; }
    discountsCache.forEach(d => {
        const el = document.createElement('div');
        el.className = 'games-admin-item';
        el.innerHTML = `
            <div class="logo-mini"><span>🏷</span></div>
            <div class="txt"><b>${escapeHtml(d.title)}</b><span>−${d.percent}%</span></div>
            <div class="actions"><button class="delete">🗑</button></div>`;
        el.querySelector('.delete').addEventListener('click', async () => {
            if (!confirm('Удалить скидку?')) return;
            await supabase.from('discounts').delete().eq('id', d.id);
            await loadRecipes();
        });
        container.appendChild(el);
    });
}
on('discountAddBtn', 'click', async () => {
    const title = val('discountTitle').trim();
    const percent = parseFloat(val('discountPercent')) || 0;
    if (!title || percent <= 0) return alert('Заполни название и процент');
    const { error } = await supabase.from('discounts').insert({ title, percent });
    if (error) return alert('Ошибка: ' + error.message);
    $('discountTitle').value = ''; $('discountPercent').value = '';
    await loadRecipes();
});
/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   34.  🏴  ФРАКЦИИ / ПОРТЫ / РАНГИ                                    ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadFactions() {
    try {
        const { data, error } = await supabase.from('factions').select('*').order('sort_order').order('name');
        if (error) throw error;
        factionsCache = data || [];
    } catch (e) { factionsCache = []; }
    renderFactionsAdmin();
    fillPortFactionSelect();
}
async function loadPorts() {
    try {
        const { data, error } = await supabase.from('ports').select('*').order('sort_order').order('name');
        if (error) throw error;
        portsCache = data || [];
    } catch (e) { portsCache = []; }
    renderPortsAdmin();
}
async function loadRanks() {
    try {
        const { data, error } = await supabase.from('ranks').select('*').order('sort_order').order('name');
        if (error) throw error;
        ranksCache = data || [];
    } catch (e) { ranksCache = []; }
    renderRanksAdmin();
}
function renderFactionsAdmin() {
    const container = $('factionsAdminList'); if (!container) return;
    container.innerHTML = '';
    if (!factionsCache.length) { container.innerHTML = '<div class="empty">Нет фракций</div>'; return; }
    factionsCache.forEach(f => {
        const el = document.createElement('div');
        el.className = 'games-admin-item';
        el.innerHTML = `
            <div class="logo-mini"><span>${f.icon || '🏴'}</span></div>
            <div class="txt"><b>${escapeHtml(f.name)}</b><span>ID: ${escapeHtml(f.id)}</span></div>
            <div class="actions">
                <button class="edit">✏️</button>
                <button class="delete">🗑</button>
            </div>`;
        el.querySelector('.edit').addEventListener('click', () => openFactionEdit(f));
        el.querySelector('.delete').addEventListener('click', () => deleteFaction(f.id));
        container.appendChild(el);
    });
}
function openFactionEdit(f) {
    editingItem = f;
    $('factionEditId').value = f?.id || '';
    $('factionEditName').value = f?.name || '';
    $('factionEditIcon').value = f?.icon || '🏴';
    $('factionEditMsg').textContent = '';
    $('factionEditModal').hidden = false;
    $('factionEditName').focus();
}
on('factionAddBtn', 'click', () => openFactionEdit(null));
on('cancelFactionEdit', 'click', () => { $('factionEditModal').hidden = true; editingItem = null; });
on('saveFactionEdit', 'click', async () => {
    const name = val('factionEditName').trim();
    const id = (editingItem?.id || name.toLowerCase().replace(/[^a-z0-9_-]/g, '')).slice(0, 32);
    const msg = $('factionEditMsg');
    if (!name) { msg.textContent = 'Укажи название'; msg.style.color = '#ff7a7a'; return; }
    const patch = { name, icon: val('factionEditIcon').trim() || '🏴', sort_order: 0 };
    if (editingItem?.id) {
        const { error } = await supabase.from('factions').update(patch).eq('id', editingItem.id);
        if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    } else {
        const { error } = await supabase.from('factions').insert({ id, ...patch });
        if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    }
    $('factionEditModal').hidden = true; editingItem = null;
    await loadFactions();
});
async function deleteFaction(id) {
    if (!confirm('Удалить фракцию?')) return;
    await supabase.from('factions').delete().eq('id', id);
    await loadFactions();
}

function renderPortsAdmin() {
    const container = $('portsAdminList'); if (!container) return;
    container.innerHTML = '';
    if (!portsCache.length) { container.innerHTML = '<div class="empty">Нет портов</div>'; return; }
    portsCache.forEach(p => {
        const f = factionsCache.find(x => x.id === p.faction_id);
        const el = document.createElement('div');
        el.className = 'games-admin-item';
        el.innerHTML = `
            <div class="logo-mini"><span>⚓</span></div>
            <div class="txt"><b>${escapeHtml(p.name)}</b><span>${f ? `${f.icon || '🏴'} ${escapeHtml(f.name)}` : 'без фракции'}</span></div>
            <div class="actions">
                <button class="edit">✏️</button>
                <button class="delete">🗑</button>
            </div>`;
        el.querySelector('.edit').addEventListener('click', () => openPortEdit(p));
        el.querySelector('.delete').addEventListener('click', () => deletePort(p.id));
        container.appendChild(el);
    });
}
function fillPortFactionSelect() {
    ['portEditFaction', 'portAddFaction'].forEach(id => {
        const sel = $(id); if (!sel) return;
        const cur = sel.value;
        sel.innerHTML = '<option value="">— Без фракции —</option>';
        factionsCache.forEach(f => {
            const o = document.createElement('option');
            o.value = f.id; o.textContent = `${f.icon || '🏴'} ${f.name}`;
            sel.appendChild(o);
        });
        if (cur && factionsCache.some(f => f.id === cur)) sel.value = cur;
    });
}
function openPortEdit(p) {
    editingItem = p;
    $('portEditId').value = p?.id || '';
    $('portEditName').value = p?.name || '';
    $('portEditFaction').value = p?.faction_id || '';
    $('portEditMsg').textContent = '';
    $('portEditModal').hidden = false;
    $('portEditName').focus();
}
on('portAddBtn', 'click', () => {
    editingItem = null;
    $('portEditId').value = '';
    $('portEditName').value = '';
    $('portEditFaction').value = val('portAddFaction') || '';
    $('portEditMsg').textContent = '';
    $('portEditModal').hidden = false;
    $('portEditName').focus();
});
on('cancelPortEdit', 'click', () => { $('portEditModal').hidden = true; editingItem = null; });
on('savePortEdit', 'click', async () => {
    const name = val('portEditName').trim();
    const msg = $('portEditMsg');
    if (!name) { msg.textContent = 'Укажи название'; msg.style.color = '#ff7a7a'; return; }
    const patch = { name, faction_id: val('portEditFaction') || null, sort_order: 0 };
    if (editingItem?.id) {
        const { error } = await supabase.from('ports').update(patch).eq('id', editingItem.id);
        if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    } else {
        const { error } = await supabase.from('ports').insert(patch);
        if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    }
    $('portEditModal').hidden = true; editingItem = null;
    await loadPorts();
});
async function deletePort(id) {
    if (!confirm('Удалить порт?')) return;
    await supabase.from('ports').delete().eq('id', id);
    await loadPorts();
}

function renderRanksAdmin() {
    const container = $('ranksAdminList'); if (!container) return;
    container.innerHTML = '';
    if (!ranksCache.length) { container.innerHTML = '<div class="empty">Нет рангов</div>'; return; }
    ranksCache.forEach(r => {
        const el = document.createElement('div');
        el.className = 'games-admin-item';
        el.innerHTML = `
            <div class="logo-mini"><span>🎖</span></div>
            <div class="txt"><b>${escapeHtml(r.name)}</b><span>ур. ${r.level || 1}</span></div>
            <div class="actions">
                <button class="edit">✏️</button>
                <button class="delete">🗑</button>
            </div>`;
        el.querySelector('.edit').addEventListener('click', () => openRankEdit(r));
        el.querySelector('.delete').addEventListener('click', () => deleteRank(r.id));
        container.appendChild(el);
    });
}
function openRankEdit(r) {
    editingItem = r;
    $('rankEditId').value = r?.id || '';
    $('rankEditName').value = r?.name || '';
    $('rankEditLevel').value = r?.level || 1;
    $('rankEditMsg').textContent = '';
    $('rankEditModal').hidden = false;
    $('rankEditName').focus();
}
on('rankAddBtn', 'click', () => openRankEdit(null));
on('cancelRankEdit', 'click', () => { $('rankEditModal').hidden = true; editingItem = null; });
on('saveRankEdit', 'click', async () => {
    const name = val('rankEditName').trim();
    const msg = $('rankEditMsg');
    if (!name) { msg.textContent = 'Укажи название'; msg.style.color = '#ff7a7a'; return; }
    const patch = { name, level: parseInt(val('rankEditLevel'), 10) || 1, sort_order: 0 };
    if (editingItem?.id) {
        const { error } = await supabase.from('ranks').update(patch).eq('id', editingItem.id);
        if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    } else {
        const { error } = await supabase.from('ranks').insert(patch);
        if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    }
    $('rankEditModal').hidden = true; editingItem = null;
    await loadRanks();
});
async function deleteRank(id) {
    if (!confirm('Удалить ранг?')) return;
    await supabase.from('ranks').delete().eq('id', id);
    await loadRanks();
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   35.  ⚙️  НАСТРОЙКИ АДМИНА                                          ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadSettings() {
    try {
        const { data, error } = await supabase.from('settings').select('*').limit(1).maybeSingle();
        if (error) throw error;
        settingsCache = data || {};
    } catch (e) { settingsCache = {}; }
    renderSiteFields();
}
function renderSiteFields() {
    if (!settingsCache) return;
    const set = (id, v) => { const el = $(id); if (el) el.value = v ?? ''; };
    set('siteTitle', settingsCache.site_title);
    set('siteDiscord', settingsCache.discord_webhook);
    set('siteVk', settingsCache.vk_group);
    set('siteFooter', settingsCache.footer_text);
}
on('saveSiteFields', 'click', async () => {
    const patch = {
        id: settingsCache?.id || 1,
        site_title: val('siteTitle').trim() || null,
        discord_webhook: val('siteDiscord').trim() || null,
        vk_group: val('siteVk').trim() || null,
        footer_text: val('siteFooter').trim() || null
    };
    const { error } = await supabase.from('settings').upsert(patch);
    if (error) return alert('Ошибка: ' + error.message);
    settingsCache = { ...(settingsCache || {}), ...patch };
    flashStatus('✔ Сохранено', '#6ee7a7');
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   36.  📞  КОНТАКТЫ                                                   ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadContacts() {
    const container = $('contactsList'); if (!container) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    if (!currentClan) { container.innerHTML = '<div class="empty">Не выбрана гильдия</div>'; return; }
    try {
        const { data, error } = await supabase.from('contacts').select('*')
            .eq('clan_id', currentClan).order('sort_order').order('name');
        if (error) throw error;
        renderContacts(data || []);
    } catch (e) {
        container.innerHTML = `<div class="empty">Ошибка: ${escapeHtml(e.message)}</div>`;
    }
}
function renderContacts(items) {
    const container = $('contactsList'); if (!container) return;
    if (!items.length) { container.innerHTML = '<div class="empty">Контактов нет</div>'; return; }
    container.innerHTML = '';
    items.forEach(c => {
        const el = document.createElement('div');
        el.className = 'contact-item';
        el.innerHTML = `
            <div class="contact-role">${escapeHtml(c.role || '—')}</div>
            <div class="contact-name">${escapeHtml(c.name)}</div>
            ${c.value ? `<div class="contact-value">${escapeHtml(c.value)}</div>` : ''}
            ${currentClanIsAdmin ? `<div class="actions"><button class="edit">✏️</button><button class="delete">🗑</button></div>` : ''}`;
        if (currentClanIsAdmin) {
            el.querySelector('.edit')?.addEventListener('click', () => openContactEdit(c));
            el.querySelector('.delete')?.addEventListener('click', () => deleteContact(c.id));
        }
        container.appendChild(el);
    });
}
function openContactEdit(c) {
    editingItem = c;
    $('contactEditId').value = c?.id || '';
    $('contactEditRole').value = c?.role || '';
    $('contactEditName').value = c?.name || '';
    $('contactEditValue').value = c?.value || '';
    $('contactEditMsg').textContent = '';
    $('contactEditModal').hidden = false;
    $('contactEditName').focus();
}
on('contactAddBtn', 'click', () => openContactEdit(null));
on('cancelContactEdit', 'click', () => { $('contactEditModal').hidden = true; editingItem = null; });
on('saveContactEdit', 'click', async () => {
    const name = val('contactEditName').trim();
    const msg = $('contactEditMsg');
    if (!name) { msg.textContent = 'Укажи имя'; msg.style.color = '#ff7a7a'; return; }
    const patch = {
        clan_id: currentClan,
        role: val('contactEditRole').trim() || null,
        name,
        value: val('contactEditValue').trim() || null,
        sort_order: 0
    };
    if (editingItem?.id) {
        const { error } = await supabase.from('contacts').update(patch).eq('id', editingItem.id);
        if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    } else {
        const { error } = await supabase.from('contacts').insert(patch);
        if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    }
    $('contactEditModal').hidden = true; editingItem = null;
    await loadContacts();
});
async function deleteContact(id) {
    if (!confirm('Удалить контакт?')) return;
    await supabase.from('contacts').delete().eq('id', id);
    await loadContacts();
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   37.  🧩  ХЕШ СБОРКИ / ПРОФИЛЬ                                       ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function computeBuildHash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16).padStart(8, '0');
}
function loadProfile() {
    const nick = getViewerNick();
    const el = $('profileNick'); if (el) el.value = nick || '';
    const clanId = getMyClanId();
    const clanNameEl = $('profileClanName');
    if (clanNameEl) clanNameEl.textContent = clanId && clansCache[clanId] ? clansCache[clanId].name : '—';
    const hashEl = $('profileHash');
    if (hashEl) {
        const payload = [nick, clanId || '', currentGame || ''].join('|');
        hashEl.textContent = nick ? computeBuildHash(payload) : '—';
    }
}
on('saveProfileBtn', 'click', () => {
    const nick = val('profileNick').trim();
    if (!nick) return alert('Укажи ник');
    localStorage.setItem(VIEWER_NICK_KEY, nick);
    flashStatus('✔ Профиль сохранён', '#6ee7a7');
    sendHeartbeat();
    initRealtime();
    loadProfile();
});
on('profileCopyHash', 'click', async () => {
    const hash = $('profileHash')?.textContent || '';
    if (!hash || hash === '—') return;
    try { await navigator.clipboard.writeText(hash); flashStatus('✔ Хеш скопирован', '#6ee7a7'); }
    catch { alert('Не удалось скопировать'); }
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   38.  🔔  УВЕДОМЛЕНИЯ                                                ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadNotifications() {
    const nick = getViewerNick();
    if (!nick) { notifications = []; renderNotifications(); return; }
    try {
        const { data, error } = await supabase.from('notifications').select('*')
            .eq('user_nickname', nick).order('created_at', { ascending: false }).limit(50);
        if (error) throw error;
        notifications = data || [];
    } catch (e) { notifications = []; }
    renderNotifications();
}
function renderNotifications() {
    const containers = [$('notifList'), $('notifList2')];
    containers.forEach(container => {
        if (!container) return;
        if (!notifications.length) { container.innerHTML = '<div class="empty">Уведомлений нет</div>'; return; }
        container.innerHTML = '';
        notifications.forEach(n => {
            const el = document.createElement('div');
            el.className = 'notif-item' + (n.read ? ' read' : '');
            el.innerHTML = `
                <div class="notif-title">${escapeHtml(n.title || '')}</div>
                ${n.body ? `<div class="notif-body">${escapeHtml(n.body)}</div>` : ''}
                <div class="notif-time">${n.created_at ? tradeTimeAgo(n.created_at) : ''}</div>`;
            el.addEventListener('click', async () => {
                if (n.read) return;
                await supabase.from('notifications').update({ read: true }).eq('id', n.id);
                n.read = true; renderNotifications();
            });
            container.appendChild(el);
        });
    });
    ['notifBell', 'notifBell2'].forEach(id => {
        const b = $(id);
        if (!b) return;
        const hasUnread = notifications.some(n => !n.read);
        b.classList.toggle('has-notif', hasUnread);
    });
}
on('notifBell', 'click', () => { const p = $('notifPanel'); if (p) p.hidden = !p.hidden; });
on('notifBell2', 'click', () => { const p = $('notifPanel2'); if (p) p.hidden = !p.hidden; });
on('notifMarkAllRead', 'click', async () => {
    const nick = getViewerNick(); if (!nick) return;
    await supabase.from('notifications').update({ read: true }).eq('user_nickname', nick).eq('read', false);
    await loadNotifications();
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   39.  💬  ЧАТ                                                        ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadChat() {
    const container = $('chatMessages'); if (!container) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    const room = chatPrivateWith
        ? [getViewerNick(), chatPrivateWith].sort().join('|')
        : (chatMode === 'leaders' ? LEADERS_ROOM : (currentClan || SHARED));
    try {
        const { data, error } = await supabase.from('chat_messages').select('*')
            .eq('room', room).order('created_at', { ascending: true }).limit(200);
        if (error) throw error;
        chatMessages = data || [];
        renderChat();
    } catch (e) {
        container.innerHTML = `<div class="empty">Ошибка: ${escapeHtml(e.message)}</div>`;
    }
}
function renderChat() {
    const container = $('chatMessages'); if (!container) return;
    if (!chatMessages.length) { container.innerHTML = '<div class="empty">Сообщений нет</div>'; return; }
    const myNick = getViewerNick().toLowerCase();
    container.innerHTML = '';
    chatMessages.forEach(m => {
        const el = document.createElement('div');
        el.className = 'chat-msg' + (m.nickname?.toLowerCase() === myNick ? ' mine' : '');
        el.innerHTML = `
            <div class="chat-meta">
                <span class="chat-nick">${escapeHtml(m.nickname || 'гость')}</span>
                <span class="chat-time">${m.created_at ? new Date(m.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
            </div>
            <div class="chat-text">${escapeHtml(m.text || '')}</div>`;
        container.appendChild(el);
    });
    container.scrollTop = container.scrollHeight;
}
on('chatSendBtn', 'click', async () => {
    const text = val('chatInput').trim();
    if (!text) return;
    const nick = getViewerNick() || 'гость';
    const room = chatPrivateWith
        ? [nick, chatPrivateWith].sort().join('|')
        : (chatMode === 'leaders' ? LEADERS_ROOM : (currentClan || SHARED));
    const { error } = await supabase.from('chat_messages').insert({ room, nickname: nick, text });
    if (error) return alert('Ошибка: ' + error.message);
    $('chatInput').value = '';
    await loadChat();
});
on('chatInput', 'keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('chatSendBtn').click(); } });
function openPrivateChat(nick) {
    chatPrivateWith = nick; chatMode = 'private';
    const t = $('chatTitle'); if (t) t.textContent = `💬 ЛС с ${nick}`;
    loadChat();
}
on('chatModeGuild', 'click', () => { chatPrivateWith = null; chatMode = 'guild'; const t = $('chatTitle'); if (t) t.textContent = '💬 Гильдия'; loadChat(); });
on('chatModeShared', 'click', () => { chatPrivateWith = null; chatMode = 'shared'; const t = $('chatTitle'); if (t) t.textContent = '💬 Общий чат'; loadChat(); });
on('chatModeLeaders', 'click', () => {
    if (!isClanLeader()) return alert('Доступно только лидерам гильдий');
    chatPrivateWith = null; chatMode = 'leaders'; const t = $('chatTitle'); if (t) t.textContent = '💬 Чат лидеров'; loadChat();
});
function initChat() {
    if (chatChannel) { supabase.removeChannel(chatChannel); chatChannel = null; }
    if (!currentClan && chatMode !== 'shared' && chatMode !== 'leaders') return;
    chatChannel = supabase.channel('chat')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, () => loadChat())
        .subscribe();
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   40.  📰  VK-НОВОСТИ                                                 ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadVkNews() {
    const container = $('vkNewsList'); if (!container) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    const token = settingsCache?.vk_token;
    const group = settingsCache?.vk_group || VK_DOMAIN;
    if (!token) { container.innerHTML = '<div class="empty">VK-токен не задан</div>'; return; }
    try {
        const url = `https://api.vk.com/method/wall.get?domain=${encodeURIComponent(group)}&count=${VK_POSTS_COUNT}&access_token=${encodeURIComponent(token)}&v=${VK_API_VERSION}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.error) throw new Error(json.error.error_msg || 'VK error');
        const items = json.response?.items || [];
        if (!items.length) { container.innerHTML = '<div class="empty">Новостей нет</div>'; return; }
        container.innerHTML = '';
        items.forEach(p => {
            const el = document.createElement('div');
            el.className = 'vk-post';
            el.innerHTML = `
                <div class="vk-post-text">${escapeHtml((p.text || '').slice(0, 400))}</div>
                <div class="vk-post-meta">${new Date((p.date || 0) * 1000).toLocaleString('ru-RU')} · ❤ ${p.likes?.count || 0}</div>`;
            container.appendChild(el);
        });
    } catch (e) {
        container.innerHTML = `<div class="empty">Ошибка: ${escapeHtml(e.message)}</div>`;
    }
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   41.  🎖  ПАНЕЛЬ ЛИДЕРА                                             ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function openLeaderPanel() {
    if (!isClanLeader()) return alert('Доступно только лидерам');
    const lc = $('leaderClanName');
    if (lc) {
        const cid = getLeaderClanId();
        lc.textContent = cid && clansCache[cid] ? clansCache[cid].name : '—';
    }
    showScreen('leader');
}
on('openLeaderPanel', 'click', openLeaderPanel);
on('leaderBack', 'click', () => showScreen('clan'));
on('leaderOpenAdmin', 'click', () => showScreen('admin'));
on('leaderRequests', 'click', () => loadClanRequests());

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   42.  🚀  START                                                     ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function start() {
    try { initTheme(); } catch (e) { console.warn(e); }
    await loadSession();

    await Promise.allSettled([
        loadSiteAdmins(),
        loadSettings(),
        loadGames(),
        loadAlliances()
    ]);

    await loadClans();
    await Promise.allSettled([
        loadShips(),
        loadBuildItems(),
        loadFaq(),
        loadPartners(),
        loadTactics(),
        loadResources(),
        loadRecipes(),
        loadFactions(),
        loadPorts(),
        loadRanks(),
        loadTrades()
    ]);

    initShipBuilder();
    loadProfile();
    startHeartbeat();
    initRealtime();
    await loadNotifications();
    loadVkNews();

    const last = localStorage.getItem(LAST_CLAN_KEY);
    if (last && clansCache[last]) {
        pendingClanId = last;
        const openBtn = $('openLastClanBtn');
        if (openBtn) openBtn.hidden = false;
    }

    showScreen('home');
    document.body.classList.add('app-ready');
}

window.addEventListener('DOMContentLoaded', start);
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) sendHeartbeat();
});

/* Конец app.js v2.5.0 */
