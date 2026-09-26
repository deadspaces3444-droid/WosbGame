/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   1.  📦  ИМПОРТЫ И КОНСТАНТЫ                                        ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
import { supabase } from './supabase.js';

console.log('🚀 app.js v2.5.1');

const ADMIN_EMAILS_FALLBACK = ['dead_antihrist@mail.ru'];
const APP_VERSION = '2.5.1';
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

/* v2.5.1: типы элементов в справочнике билдов */
const BI_TYPE_LABELS = {
    upgrade:       '🔧 Апгрейд',
    sail:          '⛵ Парус',
    weapon_small:  '🟢 Малая пушка',
    weapon_medium: '🟡 Средняя пушка',
    weapon_large:  '🔴 Большая пушка',
    mortar_light:  '💣 Лёгкая мортира',
    mortar_medium: '💣 Средняя мортира',
    mortar_heavy:  '💣 Тяжёлая мортира',
    specialist:    '👤 Специалист',
    consum:        '⚗️ Расходник',
    cargo:         '📦 Трюм'
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
    return String(str ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
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
/* v2.5.1: парсер с бонусами для апгрейдов/парусов/пушек/мортир */
function parseItemWithBonuses(text) {
    return parseLines(text).map(line => {
        const parts = line.split('|').map(p => p.trim()).filter(Boolean);
        if (!parts.length) return null;
        return { name: parts[0], bonuses: parts.slice(1).map(parseBonus) };
    }).filter(Boolean);
}
/* v2.5.1: парсер специалистов с группой (Имя | Группа | Бонус +5 | HP -2) */
function parseSpecialistsWithGroup(text) {
    return parseLines(text).map(line => {
        const parts = line.split('|').map(p => p.trim()).filter(Boolean);
        if (!parts.length) return null;
        const name = parts[0];
        let group = null, start = 1;
        if (parts.length > 1 && !/[+-]\s*\d+\s*$/.test(parts[1])) {
            group = parts[1];
            start = 2;
        }
        return { name, group, bonuses: parts.slice(start).map(parseBonus) };
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
   ║   13.  📚  САЙДБАР ГИЛЬДИИ (аккордеон)                               ║
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
   ║   14.  ⚙️  САЙДБАР АДМИНА (аккордеон)                                ║
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
   ║   15.  🚢  КОРАБЛИ                                                   ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadShips() {
    const { data, error } = await supabase.from('ships').select('*')
        .order('level', { ascending: false }).order('name');
    if (error) { console.warn('ships load error:', error.message); shipsCache = []; }
    else shipsCache = data || [];
    renderShipsGrid();
    fillShipSelects();
    renderAdminShips();
}
function renderShipsGrid() {
    const grid = $('shipsGrid'); if (!grid) return;
    const q = ($('ships-search')?.value || '').trim().toLowerCase();
    let list = shipsCache.filter(s => {
        if (shipsFilterLevel !== 'all' && s.level !== parseInt(shipsFilterLevel)) return false;
        if (shipsFilterType !== 'all' && s.type !== shipsFilterType) return false;
        if (q && !s.name.toLowerCase().includes(q)) return false;
        return true;
    });
    list = list.slice();
    switch (shipsSort) {
        case 'level-asc': list.sort((a, b) => (a.level - b.level) || a.name.localeCompare(b.name)); break;
        case 'name-asc': list.sort((a, b) => a.name.localeCompare(b.name)); break;
        case 'name-desc': list.sort((a, b) => b.name.localeCompare(a.name)); break;
        case 'durability-desc': list.sort((a, b) => (b.durability || 0) - (a.durability || 0)); break;
        case 'speed-desc': list.sort((a, b) => (Number(b.speed) || 0) - (Number(a.speed) || 0)); break;
        case 'maneuverability-desc': list.sort((a, b) => (b.maneuverability || 0) - (a.maneuverability || 0)); break;
        case 'armor-desc': list.sort((a, b) => (Number(b.armor) || 0) - (Number(a.armor) || 0)); break;
        case 'guns-desc': list.sort((a, b) => (b.guns || 0) - (a.guns || 0)); break;
        case 'cargo-desc': list.sort((a, b) => (b.cargo_hold || 0) - (a.cargo_hold || 0)); break;
        case 'crew-desc': list.sort((a, b) => (b.crew || 0) - (a.crew || 0)); break;
        default: list.sort((a, b) => (b.level - a.level) || a.name.localeCompare(b.name));
    }
    if (!list.length) { grid.innerHTML = '<div class="empty">Корабли не найдены</div>'; return; }
    grid.innerHTML = '';
    list.forEach(ship => {
        const card = document.createElement('div');
        card.className = 'ship-card-view';
        card.innerHTML = `
            <img class="ship-card-view__image" src="${escapeHtml(ship.image_url || '')}" alt="${escapeHtml(ship.name)}" onerror="this.style.display='none'">
            <div class="ship-card-view__badges">
                <span class="ship-card-view__level">${ROMAN[ship.level] || ship.level}</span>
                <span class="ship-card-view__type">${escapeHtml(ship.type || '')}</span>
            </div>
            <h3 class="ship-card-view__name">${escapeHtml(ship.name)}</h3>
            <div class="ship-card-view__stats">
                <div class="ship-stat"><span class="ship-stat__label">💪 Прочность</span><span class="ship-stat__value">${ship.durability || '—'}</span></div>
                <div class="ship-stat"><span class="ship-stat__label">⚡ Скорость</span><span class="ship-stat__value">${ship.speed || '—'}</span></div>
                <div class="ship-stat"><span class="ship-stat__label">🔄 Маневр.</span><span class="ship-stat__value">${ship.maneuverability || '—'}</span></div>
                <div class="ship-stat"><span class="ship-stat__label">🛡 Броня</span><span class="ship-stat__value">${ship.armor || '—'}</span></div>
                <div class="ship-stat"><span class="ship-stat__label">📦 Трюм</span><span class="ship-stat__value">${ship.cargo_hold || '—'}</span></div>
                <div class="ship-stat"><span class="ship-stat__label">👥 Экипаж</span><span class="ship-stat__value">${ship.crew || '—'}</span></div>
                <div class="ship-stat"><span class="ship-stat__label">🔫 Орудия</span><span class="ship-stat__value">${ship.guns || '—'}</span></div>
            </div>`;
        grid.appendChild(card);
    });
}
on('ships-search', 'input', renderShipsGrid);
on('ships-level-filters', 'click', e => {
    const chip = e.target.closest('.ships-chip'); if (!chip) return;
    document.querySelectorAll('#ships-level-filters .ships-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active'); shipsFilterLevel = chip.dataset.level; renderShipsGrid();
});
on('ships-type-filters', 'click', e => {
    const chip = e.target.closest('.ships-chip'); if (!chip) return;
    document.querySelectorAll('#ships-type-filters .ships-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active'); shipsFilterType = chip.dataset.type; renderShipsGrid();
});
on('ships-sort', 'change', e => { shipsSort = e.target.value; renderShipsGrid(); });

function fillShipSelects() {
    ['pvpShip', 'pbShip'].forEach(id => {
        const sel = $(id); if (!sel) return;
        const cur = sel.value;
        sel.innerHTML = '<option value="">— Выберите корабль —</option>';
        shipsCache.slice().sort((a, b) => a.name.localeCompare(b.name)).forEach(s => {
            const o = document.createElement('option');
            o.value = s.name;
            o.textContent = `${ROMAN[s.level] || s.level} · ${s.name}`;
            o.dataset.image = s.image_url || '';
            sel.appendChild(o);
        });
        if (cur) sel.value = cur;
    });
    const tmSel = $('tm-ship-select');
    if (tmSel) {
        const cur = tmSel.value;
        tmSel.innerHTML = '<option value="">— Выберите корабль —</option>';
        shipsCache.slice().sort((a, b) => a.name.localeCompare(b.name)).forEach(s => {
            const o = document.createElement('option');
            o.value = s.name;
            o.textContent = `${ROMAN[s.level] || s.level} · ${s.name}`;
            o.dataset.image = s.image_url || '';
            o.dataset.level = s.level;
            o.dataset.type = s.type || '';
            o.dataset.durability = s.durability || '';
            o.dataset.guns = s.guns || '';
            tmSel.appendChild(o);
        });
        if (cur) tmSel.value = cur;
    }
    if (builderClanCtrl) builderClanCtrl.fillTargetShip();
    fillScShipSelect();
}
on('pvpShip', 'change', e => {
    const opt = e.target.selectedOptions[0]; const img = $('pvpShipPreview');
    if (opt && opt.dataset.image) { img.src = opt.dataset.image; img.hidden = false; } else img.hidden = true;
});
on('pbShip', 'change', e => {
    const opt = e.target.selectedOptions[0]; const img = $('pbShipPreview');
    if (opt && opt.dataset.image) { img.src = opt.dataset.image; img.hidden = false; } else img.hidden = true;
});
function renderAdminShips() {
    const container = $('adminShipsList'); if (!container) return;
    container.innerHTML = '';
    if (!shipsCache.length) { container.innerHTML = '<div class="empty">Корабли не загружены. Запустите SQL из README.</div>'; return; }
    shipsCache.forEach(s => {
        const el = document.createElement('div');
        el.className = 'ship-admin-item';
        el.innerHTML = `
            <div class="logo-mini"><img src="${escapeHtml(s.image_url || '')}" alt="" onerror="this.outerHTML='<span>🚢</span>'"></div>
            <div class="txt">
                <b>${ROMAN[s.level] || s.level} · ${escapeHtml(s.name)}</b>
                <span style="color:var(--muted);font-size:11px;">${escapeHtml(s.type || '')} · 💪 ${s.durability || '—'} · ⚡ ${s.speed || '—'} · 🔫 ${s.guns || '—'}</span>
            </div>`;
        container.appendChild(el);
    });
}
on('reloadShipsBtn', 'click', loadShips);

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   16.  ⚙️  BUILD ITEMS (апгрейды/паруса/пушки/мортиры/спецы/расход)  ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadBuildItems() {
    try {
        const { data, error } = await supabase.from('build_items').select('*')
            .order('type').order('sort_order').order('name');
        if (error) throw error;
        buildItemsCache = data || [];
    } catch (e) {
        console.warn('build_items load error:', e.message);
        buildItemsCache = [];
    }
    renderBuildPickers();
    renderBuildItemsAdmin();
}

function renderBuildPickers() {
    document.querySelectorAll('.build-catalog-select').forEach(sel => {
        const type = sel.dataset.type;
        const cur = sel.value;
        const first = sel.querySelector('option');
        sel.innerHTML = '';
        if (first) sel.appendChild(first);
        buildItemsCache.filter(b => b.type === type && b.is_active !== false).forEach(b => {
            const o = document.createElement('option');
            o.value = b.name;
            /* v2.5.1: сохраняем всю строку "Имя [| Группа] | Бонусы" */
            const group = (type === 'specialist' && b.subgroup) ? b.subgroup : null;
            const parts = [b.name];
            if (group) parts.push(group);
            if (b.bonuses && b.bonuses.trim()) {
                b.bonuses.trim().split('|').map(s => s.trim()).filter(Boolean).forEach(x => parts.push(x));
            }
            o.dataset.value = parts.join(' | ');
            o.textContent = b.name + (group ? ` (${group})` : '') + (b.bonuses ? ' — ' + b.bonuses : '');
            sel.appendChild(o);
        });
        if (cur) sel.value = cur;
    });
}

document.addEventListener('click', e => {
    const btn = e.target.closest('.build-catalog-add');
    if (!btn) return;
    const targetId = btn.dataset.target;
    const field = document.getElementById(targetId);
    if (!field) return;
    const wrapper = btn.closest('.build-picker-controls');
    const sel = wrapper?.querySelector(`.build-catalog-select[data-target="${targetId}"]`);
    if (!sel || !sel.value) { alert('Выберите элемент из списка'); return; }
    const opt = sel.selectedOptions[0];
    const value = opt.dataset.value || opt.value;
    const mode = sel.dataset.mode || 'append';

    if (mode === 'set' || field.tagName === 'INPUT') {
        field.value = value;
    } else {
        const lines = (field.value || '').split('\n').map(s => s.trim()).filter(Boolean);
        if (!lines.includes(value)) lines.push(value);
        field.value = lines.join('\n');
    }
    sel.value = '';
});

function renderBuildItemsAdmin() {
    const container = $('buildItemsAdminList'); if (!container) return;
    container.innerHTML = '';
    if (!buildItemsCache.length) {
        container.innerHTML = '<div class="empty">Каталог пуст. Добавь элементы выше.</div>';
        return;
    }
    const groups = {};
    buildItemsCache.forEach(b => {
        const t = b.type || 'other';
        (groups[t] ||= []).push(b);
    });
    const typeOrder = [
        'upgrade','sail',
        'weapon_small','weapon_medium','weapon_large',
        'mortar_light','mortar_medium','mortar_heavy',
        'specialist','consum','cargo'
    ];
    typeOrder.forEach(t => {
        const items = groups[t];
        if (!items?.length) return;
        const head = document.createElement('div');
        head.className = 'pricing-group-title';
        head.style.marginTop = '12px';
        head.innerHTML = `${BI_TYPE_LABELS[t] || t} <span class="count">· ${items.length}</span>`;
        container.appendChild(head);
        items.forEach(b => {
            const el = document.createElement('div');
            el.className = 'partners-admin-item';
            el.innerHTML = `
                <div class="logo-mini"><span>${(BI_TYPE_LABELS[b.type] || '⚙️').split(' ')[0]}</span></div>
                <div class="txt">
                    <b>${escapeHtml(b.name)}</b>
                    <span style="color:var(--muted);font-size:11px;">
                        ${b.subgroup ? '📁 ' + escapeHtml(b.subgroup) + ' · ' : ''}
                        ${b.bonuses ? escapeHtml(b.bonuses) : ''}
                    </span>
                </div>
                <div class="actions">
                    <button class="delete" title="Удалить">🗑</button>
                </div>`;
            el.querySelector('.delete').addEventListener('click', async () => {
                if (!confirm(`Удалить «${b.name}»?`)) return;
                const { error } = await supabase.from('build_items').delete().eq('id', b.id);
                if (error) return alert(error.message);
                await logAdminAction('Удалил build_item', b.name);
                await loadBuildItems();
            });
            container.appendChild(el);
        });
    });
}

function onBuildItemTypeChange() {
    const type = val('bi-type');
    const bonusesField = $('bi-bonuses-field');
    const subgroupField = $('bi-subgroup-field');
    if (bonusesField) bonusesField.hidden = false;
    if (subgroupField) subgroupField.hidden = type !== 'specialist';
}
on('bi-type', 'change', onBuildItemTypeChange);

on('bi-add', 'click', async () => {
    const type = val('bi-type');
    const name = val('bi-name').trim();
    const bonuses = val('bi-bonuses').trim();
    const subgroup = type === 'specialist' ? (val('bi-subgroup').trim() || null) : null;
    const order = parseInt(val('bi-order')) || 0;
    const msg = $('bi-msg'); msg.textContent = ''; msg.style.color = '';
    if (!type) { msg.textContent = 'Выбери категорию'; msg.style.color = '#ff7a7a'; return; }
    if (!name) { msg.textContent = 'Укажи название'; msg.style.color = '#ff7a7a'; return; }

    const payload = {
        type, name,
        bonuses: bonuses || null,
        subgroup,
        sort_order: order,
        is_active: true
    };
    const { error } = await supabase.from('build_items').insert(payload);
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    await logAdminAction('Добавил build_item', name, `тип: ${type}`);
    msg.textContent = '✔ Добавлено'; msg.style.color = '#6ee7a7';
    $('bi-name').value = '';
    $('bi-bonuses').value = '';
    const subEl = $('bi-subgroup'); if (subEl) subEl.value = '';
    await loadBuildItems();
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   17.  🔧  КАЛЬКУЛЯТОР СБОРКИ                                         ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function createShipBuilder(prefix) {
    const ids = {
        targetSel: prefix ? prefix + 'TargetShip2' : 'builderTargetShip',
        targetImg: prefix ? prefix + 'TargetImg2' : 'builderTargetImg',
        addRow: prefix ? prefix + 'AddRow2' : 'builderAddRow',
        clear: prefix ? prefix + 'Clear2' : 'builderClear',
        tbody: prefix ? prefix + 'Rows2' : 'builderRows',
        cntPos: prefix ? prefix + 'CountPositions2' : 'builderCountPositions',
        cntPrices: prefix ? prefix + 'CountPrices2' : 'builderCountPrices',
        total: prefix ? prefix + 'Total2' : 'builderTotal',
        recalc: prefix ? prefix + 'Recalc2' : 'builderRecalc',
        copy: prefix ? prefix + 'Copy2' : 'builderCopy'
    };
    const state = { rows: [], counter: 0, ctx: prefix ? 'clan' : 'home' };

    function fillTargetShip() {
        const sel = $(ids.targetSel); if (!sel) return;
        const cur = sel.value;
        sel.innerHTML = '<option value="">— Не выбран —</option>';
        shipsCache.slice().sort((a, b) => a.name.localeCompare(b.name)).forEach(s => {
            const o = document.createElement('option');
            o.value = s.name;
            o.textContent = `${ROMAN[s.level] || s.level} · ${s.name}`;
            o.dataset.image = s.image_url || '';
            sel.appendChild(o);
        });
        if (cur) sel.value = cur;
    }
    function addRow() {
        state.counter++;
        state.rows.push({ id: state.counter, category: 'resource', name: '', qty: 1 });
    }
    function computeAvg(name) {
        const lower = (name || '').trim().toLowerCase();
        if (!lower) return null;
        const res = resourcesCache.find(r => (r.name || '').trim().toLowerCase() === lower);
        if (!res) return null;
        return Number(res.price) || 0;
    }
    function updateRowImage(rowId) {
        const row = state.rows.find(x => x.id === rowId); if (!row) return;
        const img = document.querySelector(`#${ids.tbody} .builder-row-img[data-id="${rowId}"]`);
        if (!img) return;
        const lower = (row.name || '').trim().toLowerCase();
        const res = resourcesCache.find(r => (r.name || '').trim().toLowerCase() === lower);
        if (res && res.image_url) { img.src = res.image_url; img.hidden = false; }
        else { img.hidden = true; img.src = ''; }
    }
    function renderRows() {
        const tbody = $(ids.tbody); if (!tbody) return;
        tbody.innerHTML = '';
        if (!state.rows.length) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--muted);font-style:italic;">Нет компонентов. Нажми «➕ Добавить компонент».</td></tr>`;
            updateSummary(); return;
        }
        state.rows.forEach(row => {
            const tr = document.createElement('tr');
            const tdName = document.createElement('td');
            tdName.innerHTML = `
                <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                    <img class="builder-row-img" data-id="${row.id}" src="" alt="" hidden>
                    <select class="builder-cat" data-id="${row.id}" style="flex:0 0 110px;padding:8px 8px;background:var(--input-bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;">
                        ${BUILDER_CATEGORIES.map(c => `<option value="${c.id}" ${c.id === row.category ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}
                    </select>
                    <input type="text" class="builder-name" data-id="${row.id}" list="builderSuggestions_${state.ctx}" placeholder="Название компонента" value="${escapeHtml(row.name)}" style="flex:1;min-width:120px;">
                </div>`;
            const tdQty = document.createElement('td');
            tdQty.innerHTML = `<input type="number" class="builder-qty" data-id="${row.id}" min="1" step="1" value="${row.qty}">`;
            const tdAvg = document.createElement('td');
            tdAvg.className = 'builder-avg-cell'; tdAvg.dataset.id = row.id;
            tdAvg.innerHTML = `<span class="builder-avg no-data">— нет данных —</span>`;
            const tdTotal = document.createElement('td');
            tdTotal.className = 'builder-total-cell'; tdTotal.dataset.id = row.id;
            tdTotal.innerHTML = `<span class="builder-row-total no-data">—</span>`;
            const tdDel = document.createElement('td');
            tdDel.innerHTML = `<button class="builder-del" data-id="${row.id}" title="Удалить">✕</button>`;
            tr.appendChild(tdName); tr.appendChild(tdQty); tr.appendChild(tdAvg); tr.appendChild(tdTotal); tr.appendChild(tdDel);
            tbody.appendChild(tr);
        });
        let dl = document.getElementById('builderSuggestions_' + state.ctx);
        if (!dl) {
            dl = document.createElement('datalist');
            dl.id = 'builderSuggestions_' + state.ctx;
            document.body.appendChild(dl);
        }
        const unique = [...new Set(resourcesCache.map(r => r.name))].sort();
        dl.innerHTML = unique.map(n => `<option value="${escapeHtml(n)}">`).join('');
        tbody.querySelectorAll('.builder-cat').forEach(el => {
            el.addEventListener('change', e => {
                const r = state.rows.find(x => x.id === parseInt(e.target.dataset.id));
                if (r) { r.category = e.target.value; recalc(); }
            });
        });
        tbody.querySelectorAll('.builder-name').forEach(el => {
            el.addEventListener('input', e => {
                const r = state.rows.find(x => x.id === parseInt(e.target.dataset.id));
                if (r) { r.name = e.target.value; updateRowImage(r.id); recalc(); }
            });
        });
        tbody.querySelectorAll('.builder-qty').forEach(el => {
            el.addEventListener('input', e => {
                const r = state.rows.find(x => x.id === parseInt(e.target.dataset.id));
                if (r) { r.qty = Math.max(1, parseInt(e.target.value) || 1); recalc(); }
            });
        });
        tbody.querySelectorAll('.builder-del').forEach(el => {
            el.addEventListener('click', e => {
                const id = parseInt(e.target.dataset.id);
                state.rows = state.rows.filter(r => r.id !== id);
                renderRows(); recalc();
            });
        });
        state.rows.forEach(r => updateRowImage(r.id));
        recalc();
    }
    function recalc() {
        let found = 0, totalRows = 0, grand = 0;
        state.rows.forEach(row => {
            totalRows++;
            const avgCell = document.querySelector(`#${ids.tbody} .builder-avg-cell[data-id="${row.id}"]`);
            const totalCell = document.querySelector(`#${ids.tbody} .builder-total-cell[data-id="${row.id}"]`);
            if (!avgCell || !totalCell) return;
            const name = (row.name || '').trim();
            const qty = Math.max(1, Number(row.qty) || 1);
            if (!name) {
                avgCell.innerHTML = `<span class="builder-avg no-data">— введите название —</span>`;
                totalCell.innerHTML = `<span class="builder-row-total no-data">—</span>`;
                return;
            }
            const avg = computeAvg(name);
            if (avg === null) {
                avgCell.innerHTML = `<span class="builder-avg no-data">— нет в справочнике —</span>`;
                totalCell.innerHTML = `<span class="builder-row-total no-data">—</span>`;
                return;
            }
            const rowTotal = avg * qty;
            avgCell.innerHTML = `<span class="builder-avg">${avg.toLocaleString('ru-RU', { maximumFractionDigits: 1 })} 🪙</span>`;
            totalCell.innerHTML = `<span class="builder-row-total">${Math.round(rowTotal).toLocaleString('ru-RU')} 🪙</span>`;
            found++; grand += rowTotal;
        });
        const elPos = $(ids.cntPos);
        const elPr = $(ids.cntPrices);
        const elTt = $(ids.total);
        if (elPos) elPos.textContent = totalRows;
        if (elPr) elPr.textContent = `${found} / ${totalRows}`;
        if (elTt) elTt.textContent = Math.round(grand).toLocaleString('ru-RU') + ' 🪙';
    }
    function updateSummary() { recalc(); }
    function copyResult() {
        if (!state.rows.length) { alert('Список пуст'); return; }
        const target = $(ids.targetSel)?.value || '';
        const lines = [`🔧 Сборка корабля${target ? ' — ' + target : ''}`, ''];
        let grand = 0;
        state.rows.forEach(row => {
            const name = (row.name || '').trim(); if (!name) return;
            const qty = Number(row.qty) || 1;
            const avg = computeAvg(name);
            const sum = (avg || 0) * qty;
            grand += sum;
            lines.push(`• ${name} × ${qty} = ${Math.round(sum).toLocaleString('ru-RU')} 🪙 (${(avg || 0).toFixed(1)} 🪙/шт)`);
        });
        lines.push(''); lines.push(`💰 Итого: ${Math.round(grand).toLocaleString('ru-RU')} 🪙`);
        const text = lines.join('\n');
        navigator.clipboard.writeText(text).then(
            () => alert('📋 Результат скопирован!'),
            () => prompt('Скопируйте вручную:', text)
        );
    }
    function bind() {
        on(ids.addRow, 'click', () => { addRow(); renderRows(); });
        on(ids.clear, 'click', () => {
            if (!confirm('Очистить калькулятор?')) return;
            state.rows = []; addRow(); renderRows();
        });
        on(ids.recalc, 'click', async () => {
            await loadResourcePrices();
            state.rows.forEach(r => updateRowImage(r.id));
            recalc();
        });
        on(ids.copy, 'click', copyResult);
        on(ids.targetSel, 'change', e => {
            const opt = e.target.selectedOptions[0]; const img = $(ids.targetImg);
            if (!img) return;
            if (opt && opt.dataset.image) { img.src = opt.dataset.image; img.hidden = false; }
            else img.hidden = true;
        });
    }
    function init() { bind(); if (!state.rows.length) addRow(); fillTargetShip(); renderRows(); }
    function refresh() { fillTargetShip(); renderRows(); }
    return { init, refresh, recalc, fillTargetShip, state };
}
let builderClanCtrl = null;
function initShipBuilders() {
    builderClanCtrl = createShipBuilder('builder');
    builderClanCtrl.init();
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   18.  📖  ТАКТИКА                                                    ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadTactics() {
    try {
        const { data, error } = await supabase.from('tactics').select('*').order('sort_order');
        if (error) tacticsCache = []; else tacticsCache = data || [];
    } catch (e) { tacticsCache = []; }
    renderTacticsModal(); renderTacticsAdmin();
}
function renderTacticsModal() {
    const body = $('tacticsBody'); if (!body) return;
    body.innerHTML = '';
    if (!tacticsCache.length) {
        body.innerHTML = '<p class="empty" style="text-align:center;padding:20px;">Разделы тактики пока не добавлены.</p>';
        return;
    }
    tacticsCache.forEach(t => {
        const section = document.createElement('section');
        section.className = 'tactics-section';
        section.innerHTML = `<h3>${escapeHtml(t.icon || '📖')} ${escapeHtml(t.title || '')}</h3><div class="tactics-text">${t.content || ''}</div>`;
        body.appendChild(section);
    });
}
function openTacticsModal() { const m = $('tacticsModal'); if (m) { m.hidden = false; document.body.style.overflow = 'hidden'; } }
function closeTacticsModal() { const m = $('tacticsModal'); if (m) { m.hidden = true; document.body.style.overflow = ''; } }
on('openTacticsBtn', 'click', openTacticsModal);
on('closeTactics', 'click', closeTacticsModal);
on('tacticsModal', 'click', e => { if (e.target.id === 'tacticsModal') closeTacticsModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { const m = $('tacticsModal'); if (m && !m.hidden) closeTacticsModal(); } });
/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   19.  🔐  АДМИН: ВХОД И ПАНЕЛЬ                                       ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function openAdminAuth() {
    $('adminAuthModal').hidden = false;
    $('adminAuthError').textContent = '';
    $('adminEmail').value = ''; $('adminPassword').value = '';
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
on('adminPassword', 'keydown', e => { if (e.key === 'Enter') $('doAdminLogin').click(); });
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
    const setHidden = (id, hidden) => { const el = $(id); if (el) el.hidden = hidden; };
    const canAccessPanel = isAdmin && !isMod;
    setHidden('adminLoginBtn', isAdmin);
    setHidden('adminLogoutBtn', !isAdmin);
    setHidden('adminPanelBtn', !canAccessPanel);
    setHidden('adminLogoutBtn2', !isAdmin);
    setHidden('adminPanelBtn2', !canAccessPanel);
    setHidden('adminPanelBtn3', !canAccessPanel);
    const label = isAdmin ? (isOwner ? '👑 Владелец' : siteAdminRole === 'mod' ? '🎖 Глава Клана' : '⚙️ Админ') : '';
    ['adminInfo','adminInfo2','adminInfo3'].forEach(id => { const el = $(id); if (el) el.textContent = label; });

    /* v2.5.0: показать/скрыть группу «Управление» в сайдбаре гильдии */
    const sideGroupAdmin = $('sideGroupAdmin');
    if (sideGroupAdmin) sideGroupAdmin.hidden = !canEditClan(currentClan);

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
    updateLeaderButtonsVisibility();
}
function openAdminPage() {
    if (!isAdmin || isMod) return;
    const firstNav = document.querySelector('.admin-nav-item[data-apanel="clans"]');
    if (firstNav) firstNav.click();
    renderAdminClanSelect(); renderSiteFields();
    renderFaqAdmin(); renderPartnersAdmin(); renderGamesAdmin();
    renderTacticsAdmin(); renderAlliancesAdmin();
    renderSiteAdminsAdmin(); renderClanRequestsAdmin();
    renderAdminShips();
    renderPricingGrid();
    renderBuildItemsAdmin();
    showScreen('admin');
}
on('adminPanelBtn', 'click', openAdminPage);
on('adminPanelBtn2', 'click', openAdminPage);
on('adminPanelBtn3', 'click', openAdminPage);

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   20.  🏰  ГИЛЬДИИ                                                    ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadClans() {
    const source = isAdmin ? 'clans' : 'clans_public';
    const { data, error } = await supabase.from(source).select('*');
    if (error) { console.error('loadClans error:', error); return; }
    clansCache = {};
    (data || []).forEach(c => { clansCache[c.id] = c; });
    renderHomeCards(); renderAdminClanSelect(); renderScopeSelects();
    renderContacts(); renderTradeClanSelect(); renderTradeClanFilters();
    renderApplyClanSelect(); renderAlliancesAdmin();
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
    if (isOwner) { openClan(id); return; }
    if (isMod && !myAdminClanId) { openClanInfo(id, { locked: true }); return; }
    if (isAdmin && myAdminClanId) {
        if (canAccessClan(id)) { openClan(id); return; }
        openClanInfo(id, { locked: true }); return;
    }
    if (isAdmin) { openClan(id); return; }
    const myClan = getMyClanId();
    if (!myClan) { openClanInfo(id, { locked: false }); return; }
    if (id === myClan) { openClan(id); return; }
    if (canAccessClan(id)) { openClan(id); return; }
    openClanInfo(id, { locked: true });
}
function renderScopeSelects() {
    const clans = Object.values(clansCache);
    ['pvpScope', 'pbScope', 'buildEditScope', 'buildDupScope', 'evScope'].forEach(id => {
        const sel = $(id); if (!sel) return;
        const current = sel.value; sel.innerHTML = '';
        const hideShared = (id === 'evScope' && !isOwner);
        if (!hideShared) {
            const opt1 = document.createElement('option');
            opt1.value = SHARED; opt1.textContent = '🌐 Общий';
            sel.appendChild(opt1);
        }
        clans.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id; opt.textContent = '🏰 ' + c.name; sel.appendChild(opt);
        });
        if (current && Array.from(sel.options).some(o => o.value === current)) sel.value = current;
        else if (currentClan && (id === 'pvpScope' || id === 'pbScope' || id === 'evScope')) sel.value = currentClan;
    });
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   21.  📖  ОПИСАНИЕ ГИЛЬДИИ И ВХОД                                    ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function openClanInfo(id, opts = {}) {
    const clan = clansCache[id]; if (!clan) return;
    pendingClanId = id;
    const locked = opts.locked === true;
    const loggedInSomewhere = isUnlocked();
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
    const loginBtn = $('clanLoginBtn'); const viewBtn = $('clanViewBtn');
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
    await logView(nick, pendingClanId, isClanAdminLogin ? 'вход (адмирал)' : 'вход');
    sendHeartbeat();
    const tn = $('tm-nickname'); if (tn && !tn.value) tn.value = nick;
    const cid = pendingClanId; pendingClanId = null;
    openClan(cid, isClanAdminLogin);
});
on('clanNickname', 'keydown', e => { if (e.key === 'Enter') $('clanPassword').focus(); });
on('clanPassword', 'keydown', e => { if (e.key === 'Enter') $('doClanLogin').click(); });

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   22.  🤝  ПОЛОСА СОЮЗА И ОТКРЫТИЕ ГИЛЬДИИ                            ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function updateAllianceBar() {
    const bar = $('allianceBar'); const list = $('allianceBarList');
    if (!bar || !list) return;
    const myClan = clansCache[currentClan];
    if (!myClan || !myClan.alliance_id) { bar.hidden = true; return; }
    const ally = alliancesCache[myClan.alliance_id];
    const members = Object.values(clansCache).filter(c => c.alliance_id === myClan.alliance_id && c.id !== currentClan);
    if (!members.length) { bar.hidden = true; return; }
    bar.hidden = false;
    bar.querySelector('.alliance-bar-label').textContent = `🤝 ${ally ? ally.name : 'Союз'}:`;
    list.innerHTML = '';
    members.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'alliance-chip';
        btn.innerHTML = renderClanLogoHtml(c, 'alliance') + ' ' + escapeHtml(c.name);
        btn.addEventListener('click', () => openClan(c.id, false));
        list.appendChild(btn);
    });
}
function openClan(id, isClanAdminLogin = false) {
    const clan = clansCache[id]; if (!clan) return;
    if (!isOwner) {
        if (isAdmin && myAdminClanId) { if (!canAccessClan(id)) { openClanInfo(id, { locked: true }); return; } }
        else if (!isAdmin) {
            if (!isUnlocked()) { openClanInfo(id, { locked: false }); return; }
            const myClan = getMyClanId();
            if (!myClan) { openClanInfo(id, { locked: false }); return; }
            if (id !== myClan && !canAccessClan(id)) { openClanInfo(id, { locked: true }); return; }
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
    const titleEl = $('clanTitle'); if (titleEl) titleEl.textContent = clan.name;
    const iconWrap = $('clanIconWrap');
    if (iconWrap) iconWrap.innerHTML = renderClanLogoHtml(clan, 'icon');
    showScreen('lists');
    document.querySelectorAll('.side-item').forEach(b => b.classList.toggle('active', b.dataset.section === 'lists'));
    document.querySelectorAll('.clan-section').forEach(s => s.classList.toggle('active', s.id === 'section-lists'));
    currentTab = 'enemies';
    document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === 'enemies'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === 'tab-enemies'));
    renderScopeSelects(); applyAdminUI(); updateAllianceBar();
    renderAll(); renderBuilds('pvp'); renderBuilds('pb'); renderContacts();
    renderEvents(); renderTreasury(); renderApplications();
    renderMembers(); renderAdmins();
    sendHeartbeat(); initRealtime();
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

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   23.  📋  ВКЛАДКИ И СПИСКИ                                           ║
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
   ║   24.  ⚔️  БИЛДЫ (с парусами, мортирами и группами специалистов)      ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
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

    /* v2.5.1: используем парсер с бонусами и группами */
    const upgrades = parseItemWithBonuses(item.upgrades);
    const sails    = parseItemWithBonuses(item.sails);
    const weapS    = parseItemWithBonuses(item.weapons_small);
    const weapM    = parseItemWithBonuses(item.weapons_medium);
    const weapL    = parseItemWithBonuses(item.weapons_large);
    const mortarL  = parseItemWithBonuses(item.mortars_light);
    const mortarM  = parseItemWithBonuses(item.mortars_medium);
    const mortarH  = parseItemWithBonuses(item.mortars_heavy);
    const cons     = [item.consumable1, item.consumable2, item.consumable3].filter(Boolean);
    const cargo    = item.cargo ? parseLines(item.cargo) : [];
    const specs    = parseSpecialistsWithGroup(item.specialists);

    const scopeBadge = item.is_shared
        ? `<span class="build-scope shared">🌐 Общий</span>`
        : `<span class="build-scope clan">🏰 ${escapeHtml(clansCache[item.clan]?.name || item.clan || '?')}</span>`;
    const rankBadge = (item.type === 'pb' && item.rank)
        ? `<span class="build-rank">Ранг ${escapeHtml(item.rank)}</span>` : '';
    const canEditThis = canEditClan(item.clan) || isAdmin;
    const actions = `<div class="build-actions">
        <button class="share" title="Скопировать ссылку">🔗</button>
        ${canEditThis ? `<button class="edit" title="Редактировать">✏️</button>
        <button class="copy" title="Дублировать">📋</button>
        <button class="delete" title="Удалить">🗑</button>` : ''}
    </div>`;

    /* Чип с бонусами (тултип) и счётчиком бонусов */
    const chipWith = (it, cls) => {
        const tip = it.bonuses.map(b =>
            `${b.stat}${b.value !== null ? ' ' + (b.value > 0 ? '+' : '') + b.value : ''}`
        ).join(' · ');
        const badge = it.bonuses.length
            ? ` <span class="chip-bonus-count">${it.bonuses.length}</span>` : '';
        return `<span class="chip ${cls}"${tip ? ` title="${escapeHtml(tip)}"` : ''}>${escapeHtml(it.name)}${badge}</span>`;
    };

    /* Сворачиваемая секция (details) для пушек/мортир */
    const detailsSection = (label, items, cls) => {
        if (!items.length) return '';
        return `<details class="build-details" open>
            <summary class="build-details-summary">${label} <span class="build-details-count">${items.length}</span></summary>
            <div class="build-chips">${items.map(it => chipWith(it, cls)).join('')}</div>
        </details>`;
    };

    /* Плоская секция для апгрейдов/парусов */
    const flatSection = (label, items, cls) => {
        if (!items.length) return '';
        return `<div class="build-section"><div class="build-section-label">${label}</div><div class="build-chips">${items.map(it => chipWith(it, cls)).join('')}</div></div>`;
    };

    /* Специалисты, сгруппированные по группам */
    let specHtml = '';
    if (specs.length) {
        const grouped = {};
        specs.forEach(s => {
            const g = s.group || 'Прочие';
            (grouped[g] ||= []).push(s);
        });
        const groupsSorted = Object.keys(grouped).sort((a, b) => {
            if (a === 'Прочие') return 1;
            if (b === 'Прочие') return -1;
            return a.localeCompare(b);
        });
        const groupsHtml = groupsSorted.map(g => `
            <div class="spec-group">
                <div class="spec-group-title">📁 ${escapeHtml(g)} <span class="spec-group-count">${grouped[g].length}</span></div>
                <div class="spec-list">
                    ${grouped[g].map(s => `
                        <div class="spec-item">
                            <div class="spec-name">${escapeHtml(s.name)}</div>
                            ${s.bonuses.length ? `<div class="spec-bonuses">${s.bonuses.map(b => {
                                const cls = b.value === null ? 'neutral' : (b.value > 0 ? 'plus' : 'minus');
                                const v = b.value === null ? '' : ` ${b.value > 0 ? '+' : ''}${b.value}`;
                                return `<span class="spec-bonus ${cls}">${escapeHtml(b.stat)}${v}</span>`;
                            }).join('')}</div>` : ''}
                        </div>`).join('')}
                </div>
            </div>`).join('');
        specHtml = `<div class="build-section"><div class="build-section-label">👤 Специалисты</div>${groupsHtml}</div>`;
    }

    card.innerHTML = `
        <div class="build-header">
            <h3 class="build-ship">${escapeHtml(item.ship_name)}</h3>
            ${rankBadge}${scopeBadge}${actions}
        </div>
        ${flatSection('🔧 Апгрейды', upgrades, 'chip-upgrade')}
        ${flatSection('⛵ Паруса', sails, 'chip-sail')}
        ${detailsSection('🟢 Малые пушки (до 12ф)', weapS, 'chip-weap-small')}
        ${detailsSection('🟡 Средние пушки (до 24ф)', weapM, 'chip-weap-medium')}
        ${detailsSection('🔴 Большие пушки (до 48ф)', weapL, 'chip-weap-large')}
        ${detailsSection('💣 Лёгкие мортиры', mortarL, 'chip-mortar-light')}
        ${detailsSection('💣 Средние мортиры', mortarM, 'chip-mortar-medium')}
        ${detailsSection('💣 Тяжёлые мортиры', mortarH, 'chip-mortar-heavy')}
        ${cons.length ? `<div class="build-section"><div class="build-section-label">⚗️ Расходники</div><div class="build-chips">${cons.map(c => `<span class="chip chip-cons">${escapeHtml(c)}</span>`).join('')}</div></div>` : ''}
        ${cargo.length ? `<div class="build-section"><div class="build-section-label">📦 Трюм</div><div class="build-chips">${cargo.map(c => `<span class="chip chip-cargo">${escapeHtml(c)}</span>`).join('')}</div></div>` : ''}
        ${specHtml}
    `;

    card.querySelector('.share').addEventListener('click', () => {
        const url = `${location.origin}${location.pathname}#build=${item.id}`;
        navigator.clipboard.writeText(url).then(() => alert('🔗 Ссылка на билд скопирована!'), () => prompt('Скопируйте ссылку:', url));
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
        upgrades:       val(`${type}Upgrades`) || null,
        sails:          val(`${type}Sails`)    || null,
        weapons_small:  val(`${type}WeapS`)    || null,
        weapons_medium: val(`${type}WeapM`)    || null,
        weapons_large:  val(`${type}WeapL`)    || null,
        mortars_light:  val(`${type}MortarL`)  || null,
        mortars_medium: val(`${type}MortarM`)  || null,
        mortars_heavy:  val(`${type}MortarH`)  || null,
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
    ['Rank','Upgrades','Sails','WeapS','WeapM','WeapL','MortarL','MortarM','MortarH','Cons1','Cons2','Cons3','Cargo','Specs']
        .forEach(s => { const el = $(`${type}${s}`); if (el) el.value = ''; });
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
    $('buildEditSails').value    = item.sails || '';
    $('buildEditWeapS').value = item.weapons_small || '';
    $('buildEditWeapM').value = item.weapons_medium || '';
    $('buildEditWeapL').value = item.weapons_large || '';
    $('buildEditMortarL').value  = item.mortars_light || '';
    $('buildEditMortarM').value  = item.mortars_medium || '';
    $('buildEditMortarH').value  = item.mortars_heavy || '';
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
        upgrades:       val('buildEditUpgrades') || null,
        sails:          val('buildEditSails')    || null,
        weapons_small:  val('buildEditWeapS')    || null,
        weapons_medium: val('buildEditWeapM')    || null,
        weapons_large:  val('buildEditWeapL')    || null,
        mortars_light:  val('buildEditMortarL')  || null,
        mortars_medium: val('buildEditMortarM')  || null,
        mortars_heavy:  val('buildEditMortarH')  || null,
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
    const item = duplicatingBuild;
    if (!canEditClan(currentClan)) { msg.textContent = 'Нет прав'; msg.style.color = '#ff7a7a'; return; }
    const { error } = await supabase.from('builds').insert({
        clan: clanValue, is_shared: isShared, type: item.type, rank: item.rank || null, ship_name: item.ship_name,
        upgrades: item.upgrades || null,
        sails: item.sails || null,
        weapons_small: item.weapons_small || null,
        weapons_medium: item.weapons_medium || null,
        weapons_large: item.weapons_large || null,
        mortars_light: item.mortars_light || null,
        mortars_medium: item.mortars_medium || null,
        mortars_heavy: item.mortars_heavy || null,
        consumable1: item.consumable1 || null,
        consumable2: item.consumable2 || null,
        consumable3: item.consumable3 || null,
        cargo: item.cargo || null,
        specialists: item.specialists || null
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
   ║                                                                      ║
   ║   25.  📅  СОБЫТИЯ + КАРТА МЕТОК (v2.5.0)                            ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function renderEvents() {
    if (!currentClan) return;
    const container = $('eventsList'); if (!container) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    const { data, error } = await supabase.from('events').select('*')
        .or(`is_shared.eq.true,clan.eq.${currentClan}`).order('event_date', { ascending: true });
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
        const hasMap = Array.isArray(ev.map_markers) && ev.map_markers.length;
        const mapBtn = hasMap ? `<button type="button" class="event-map-btn">🗺 Карта</button>` : '';
        const actions = `<div class="event-actions">${mapBtn}${canDel ? `<button class="delete">🗑</button>` : ''}</div>`;
        card.innerHTML = `
            <div class="event-date-block"><div class="event-day">${day}</div><div class="event-month">${month}</div></div>
            <div class="event-info">
                <div class="event-title">${scopeBadge}${escapeHtml(ev.title)}</div>
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
    if (isShared && !isOwner) { flashStatusEl(statusEl, 'Общие события создаёт только владелец', '#ff7a7a'); return; }

    /* v2.5.0: забираем метки из формы */
    let markers = [];
    try { markers = JSON.parse(val('evMapData') || '[]'); } catch (e) { markers = []; }

    if (isAdmin) {
        const { error } = await supabase.from('events').insert({
            clan: clanVal, is_shared: isShared, title,
            event_date: new Date(dateStr).toISOString(),
            description: desc || null,
            map_markers: markers.length ? markers : null
        });
        if (error) { flashStatusEl(statusEl, 'Ошибка: ' + error.message, '#ff7a7a'); return; }
    } else {
        const { data: resp, error } = await supabase.rpc('clan_admin_action', {
            action: 'insert', target_table: 'events', target_clan: currentClan,
            entered_password: currentClanPass,
            data: {
                title, event_date: new Date(dateStr).toISOString(),
                description: desc || null,
                map_markers: markers.length ? markers : null
            }
        });
        if (error || resp?.error) { flashStatusEl(statusEl, 'Ошибка: ' + (resp?.error || error.message), '#ff7a7a'); return; }
    }
    await logAdminAction('Добавил событие', title, markers.length ? `меток: ${markers.length}` : null);
    ['evTitle','evDate','evDesc'].forEach(id => { const el = $(id); if (el) el.value = ''; });
    const md = $('evMapData'); if (md) md.value = '';
    updateEvMapInfo();
    flashStatusEl(statusEl, '✔ Добавлено', '#6ee7a7');
    renderEvents();
});

/* ─── v2.5.0: карта события (редактор меток) ─── */
function getMarkerMeta(type) { return EVENT_MARKER_TYPES[type] || EVENT_MARKER_TYPES.point; }
function getMapUrls() {
    const s = mapSettings || {};
    return {
        detailed: s.detailed_url || MAP_DEFAULT_DETAILED,
        clean:    s.clean_url    || MAP_DEFAULT_CLEAN
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
            renderEventMapMarkers();
            renderEventMapMarkerList();
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
            renderEventMapMarkers();
            renderEventMapMarkerList();
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
    renderEventMapMarkers();
    renderEventMapMarkerList();
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
   ║                                                                      ║
   ║   26.  💰  КАЗНА                                                     ║
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
   ║   27.  👥  УЧАСТНИКИ И АДМИРАЛЫ ГИЛЬДИИ                              ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
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
   ║   28.  📨  ЗАЯВКИ НА СОЗДАНИЕ ГИЛЬДИЙ                                ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function openClanRequestModal() {
    ['crName','crDesc','crRules','crRequesterNick','crEmail','crDiscord','crPassword','crAdminPassword','crImage','crLeaderNick'].forEach(id => { const el = $(id); if (el) el.value = ''; });
    const flagEl = $('crFlag'); if (flagEl) flagEl.value = 'neutral';
    $('crRequesterNick').value = localStorage.getItem(VIEWER_NICK_KEY) || '';
    renderClanRequestGameSelect();
    $('clanRequestMsg').textContent = '';
    $('clanRequestModal').hidden = false;
}
function closeClanRequestModal() { $('clanRequestModal').hidden = true; }
on('openClanRequestBtn', 'click', openClanRequestModal);
on('clanRequestCancel', 'click', closeClanRequestModal);
on('clanRequestModal', 'click', e => { if (e.target.id === 'clanRequestModal') closeClanRequestModal(); });
on('clanRequestSubmit', 'click', async () => {
    const msg = $('clanRequestMsg');
    msg.textContent = ''; msg.style.color = '';
    const name = val('crName').trim();
    const nick = val('crRequesterNick').trim();
    const password = val('crPassword').trim();
    if (!name) { msg.textContent = 'Укажи название гильдии'; msg.style.color = '#ff7a7a'; return; }
    if (!nick) { msg.textContent = 'Укажи свой игровой ник'; msg.style.color = '#ff7a7a'; return; }
    if (!password || password.length < 2) { msg.textContent = 'Пароль от 2 символов'; msg.style.color = '#ff7a7a'; return; }
    const payload = {
        nickname: nick, email: val('crEmail').trim() || null, password,
        admin_password: val('crAdminPassword').trim() || null,
        clan_name: name, description: val('crDesc').trim() || null,
        rules: val('crRules').trim() || null, discord: val('crDiscord').trim() || null,
        game_id: val('crGameId') || null, image: val('crImage').trim() || null,
        flag: val('crFlag') || 'neutral', leader_nick: val('crLeaderNick').trim() || null,
        requester_nickname: nick, requester_email: val('crEmail').trim() || null, status: 'pending'
    };
    $('clanRequestSubmit').disabled = true;
    const { error } = await supabase.from('clan_requests').insert(payload);
    $('clanRequestSubmit').disabled = false;
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    msg.textContent = '✔ Заявка отправлена! Владелец рассмотрит её.'; msg.style.color = '#6ee7a7';
    setTimeout(closeClanRequestModal, 1800);
});
async function renderClanRequestsAdmin() {
    const container = $('clanRequestsList'); if (!container) return;
    if (!isOwner) { container.innerHTML = '<div class="empty">Доступно только владельцу</div>'; return; }
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    const { data, error } = await supabase.from('clan_requests').select('*').order('created_at', { ascending: false });
    if (error) { container.innerHTML = `<div class="empty">Ошибка: ${error.message}</div>`; return; }
    if (!data?.length) { container.innerHTML = '<div class="empty">Заявок пока нет</div>'; return; }
    container.innerHTML = '';
    data.forEach(r => {
        const d = new Date(r.created_at);
        const dateStr = d.toLocaleDateString('ru-RU') + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
        const card = document.createElement('div');
        card.className = 'application-card ' + (r.status || 'pending');
        card.innerHTML = `
            <div class="application-head">
                <div class="application-nick">🏰 ${escapeHtml(r.clan_name)}</div>
                <div class="application-date">${dateStr} · статус: <b>${escapeHtml(r.status || 'pending')}</b></div>
            </div>
            <div class="application-grid">
                <div><b>Автор</b>${escapeHtml(r.requester_nickname || r.nickname || '—')}</div>
                <div><b>Глава</b>${escapeHtml(r.leader_nick || '—')}</div>
                <div><b>Email</b>${escapeHtml(r.email || '—')}</div>
                <div><b>Discord</b>${escapeHtml(r.discord || '—')}</div>
                <div><b>Игра</b>${escapeHtml(gamesCache[r.game_id]?.name || r.game_id || '—')}</div>
                <div><b>Флаг</b>${escapeHtml(r.flag || 'neutral')}</div>
                <div><b>Пароль</b><code>${escapeHtml(r.password)}</code></div>
                <div><b>Админ-пароль</b><code>${escapeHtml(r.admin_password || '—')}</code></div>
            </div>
            ${r.description ? `<div class="application-why"><b>Описание:</b>\n${escapeHtml(r.description)}</div>` : ''}
            ${r.rules ? `<div class="application-why"><b>Правила:</b>\n${escapeHtml(r.rules)}</div>` : ''}
            <div class="application-actions">
                ${r.status === 'pending' ? `<button class="approve">✅ Создать гильдию</button><button class="reject">❌ Отклонить</button>` : ''}
                <button class="delete">🗑 Удалить заявку</button>
            </div>`;
        card.querySelector('.approve')?.addEventListener('click', async () => {
            if (!confirm(`Создать гильдию «${r.clan_name}»?`)) return;
            const { data: resp, error } = await supabase.rpc('approve_clan_request', { request_id: r.id });
            if (error) return alert('Ошибка: ' + error.message);
            if (resp?.error) return alert(resp.error);
            alert('✔ Гильдия создана: ' + resp.clan_id);
            await loadClans(); await renderClanRequestsAdmin();
        });
        card.querySelector('.reject')?.addEventListener('click', async () => {
            if (!confirm('Отклонить заявку?')) return;
            const { data: resp, error } = await supabase.rpc('reject_clan_request', { request_id: r.id });
            if (error) return alert('Ошибка: ' + error.message);
            if (resp?.error) return alert(resp.error);
            await renderClanRequestsAdmin();
        });
        card.querySelector('.delete')?.addEventListener('click', async () => {
            if (!confirm('Удалить заявку?')) return;
            await supabase.from('clan_requests').delete().eq('id', r.id);
            await renderClanRequestsAdmin();
        });
        container.appendChild(card);
    });
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   29.  🪙  ТОРГОВЛЯ                                                  ║
   ║                                                                      ║
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
        const canDelete = isOwner || isAdmin || (isMine && !isAccepted && !isDone);
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
            ? `<span class="author-rating" title="Завершённых сделок">⭐ ${authorCompleted}</span>`
            : `<span class="author-rating new" title="Новый игрок">🆕</span>`;
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
on('tmToggle', 'click', () => {
    const market = document.querySelector('.trade-market');
    if (!market) return;
    market.classList.toggle('collapsed');
    const btn = $('tmToggle');
    if (btn) btn.title = market.classList.contains('collapsed') ? 'Развернуть' : 'Свернуть';
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
        const canDel = isOwner || isAdmin || (
            t.status !== 'done' && !t.accepted_by &&
            (t.nickname || '').toLowerCase() === getViewerNick().toLowerCase()
        );
        if (!canDel) { alert('Нет прав на удаление этой заявки'); return; }
        if (!confirm(`Удалить заявку «${t.name}» автора ${t.nickname}?`)) return;
        const { error } = await supabase.from('trades').delete().eq('id', id);
        if (error) return alert(error.message);
        await logAdminAction('Удалил торговую заявку', `${t.nickname} — ${t.name}`);
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
        await createNotification(t.accepted_by, 'trade', '✅ Сделка завершена', `Сделка «${t.name}» подтверждена. Спасибо!`, null);
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
        await createNotification(t.accepted_by, 'trade', '⚠️ Сделка отменена', `Заявка «${t.name}» снова свободна`, null);
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
    const shipSel = $('tm-ship-select'); if (shipSel) shipSel.value = '';
    const shipPrev = $('tm-ship-preview'); if (shipPrev) shipPrev.hidden = true;
    const nameField = $('tm-name'); if (nameField) delete nameField.dataset.previousShip;
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
    $('tradeEditItemName').focus();
}
on('tradeEditCancel', 'click', () => { $('tradeEditModal').hidden = true; editingTradeId = null; });
on('tradeEditModal', 'click', e => { if (e.target.id === 'tradeEditModal') { $('tradeEditModal').hidden = true; editingTradeId = null; } });
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
    await logAdminAction('Изменил торговую заявку', name);
    $('tradeEditModal').hidden = true; editingTradeId = null; renderTrades();
});
function repeatTrade(t) {
    if (!t) return;
    const clanSel = $('tm-clan'); if (clanSel && clansCache[t.clan]) clanSel.value = t.clan;
    const catSel = $('tm-category'); if (catSel) catSel.value = t.category;
    tradeFormType = t.type;
    document.querySelectorAll('.tm-type-btn').forEach(b => { b.classList.toggle('active', b.dataset.type === t.type); });
    $('tm-name').value = t.name;
    $('tm-price').value = t.price;
    $('tm-qty').value = t.qty;
    $('tm-port').value = t.port || '';
    $('tm-note').value = t.note || '';
    const nickEl = $('tm-nickname'); if (nickEl && !nickEl.value) nickEl.value = getViewerNick() || t.nickname;
    updateTradeFormTotal();
    updateShipPickerVisibility();
    const form = document.querySelector('.tm-panel'); if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTradeStatus('🔁 Данные перенесены. Проверьте и опубликуйте.', 'success');
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   30.  🤝  ПРИНЯТИЕ СДЕЛКИ                                            ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
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
    await createNotification(acceptingTrade.nickname, 'trade', '🤝 Вашу заявку приняли', `${nick} принял заявку «${acceptingTrade.name}». Подтвердите сделку.`, null);
    const tn = $('tm-nickname'); if (tn) tn.value = nick;
    closeAcceptTradeModal(); renderTrades();
    setTradeStatus('✅ Вы приняли заявку. Ждите подтверждения.', 'success');
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   31.  📝  ЗАЯВКИ В ГИЛЬДИЮ                                          ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function renderApplications() {
    const container = $('applicationsList');
    if (!container) return;
    if (!canEditClan(currentClan)) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    const { data, error } = await supabase.from('applications').select('*').order('created_at', { ascending: false });
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
        card.querySelector('.approve')?.addEventListener('click', () => updateAppStatus(app.id, 'approved'));
        card.querySelector('.reject')?.addEventListener('click', () => updateAppStatus(app.id, 'rejected'));
        card.querySelector('.delete')?.addEventListener('click', async () => {
            if (!confirm('Удалить заявку?')) return;
            await supabase.from('applications').delete().eq('id', app.id);
            renderApplications();
        });
        container.appendChild(card);
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
    list.forEach(c => { const o = document.createElement('option'); o.value = c.id; o.textContent = c.name; sel.appendChild(o); });
}
on('applyBtn', 'click', async () => {
    const nick = val('applyNick').trim();
    const why = val('applyWhy').trim();
    const msg = $('applyMsg'); msg.style.color = '';
    if (!nick) { msg.textContent = 'Введите никнейм'; msg.style.color = '#ff7a7a'; return; }
    if (!why) { msg.textContent = 'Расскажите, почему хотите вступить'; msg.style.color = '#ff7a7a'; return; }
    const payload = {
        nickname: nick, age: val('applyAge').trim() || null,
        experience: val('applyExp').trim() || null, why,
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
   ║                                                                      ║
   ║   32.  ❓  FAQ                                                       ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadFaq() {
    const { data, error } = await supabase.from('faq').select('*').order('sort_order');
    if (error) return;
    faqCache = data || [];
    renderFaq(); renderFaqAdmin();
}
function renderFaq() {
    const container = $('faqList'); if (!container) return;
    container.innerHTML = '';
    if (!faqCache.length) { container.innerHTML = '<div class="empty">Пока нет вопросов</div>'; return; }
    faqCache.forEach(item => {
        const details = document.createElement('details');
        details.className = 'faq-item';
        details.innerHTML = `<summary class="faq-q">${escapeHtml(item.question)}</summary><div class="faq-a">${escapeHtml(item.answer)}</div>`;
        container.appendChild(details);
    });
}
function renderFaqAdmin() {
    const container = $('faqAdminList'); if (!container) return;
    container.innerHTML = '';
    if (!faqCache.length) { container.innerHTML = '<div class="empty">Пока нет</div>'; return; }
    faqCache.forEach(item => {
        const el = document.createElement('div');
        el.className = 'faq-admin-item';
        el.innerHTML = `<div class="txt"><b>${escapeHtml(item.question)}</b><span>${escapeHtml(item.answer)}</span></div><button>🗑</button>`;
        el.querySelector('button').addEventListener('click', async () => {
            if (!confirm('Удалить вопрос?')) return;
            await supabase.from('faq').delete().eq('id', item.id);
            loadFaq();
        });
        container.appendChild(el);
    });
}
on('faqAddBtn', 'click', async () => {
    const q = val('faqQ').trim(), a = val('faqA').trim();
    if (!q || !a) { alert('Заполни вопрос и ответ'); return; }
    const { error } = await supabase.from('faq').insert({ question: q, answer: a, sort_order: faqCache.length + 1 });
    if (error) return alert(error.message);
    $('faqQ').value = ''; $('faqA').value = '';
    loadFaq();
});
/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   33.  🤝  ПАРТНЁРЫ                                                  ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadPartners() {
    const { data, error } = await supabase.from('partners').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true });
    if (error) return;
    partnersCache = data || [];
    renderPartnersHome(); renderPartnersAdmin();
}
function isYouTubeUrl(url) {
    if (!url) return false;
    try { return /(?:^|\.)(?:youtube\.com|youtu\.be)$/i.test(new URL(url.trim()).hostname); } catch { return false; }
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
    partnersCache.forEach(p => { list.appendChild(isYouTubeUrl(p.url) ? createYouTubeCard(p) : createPartnerCard(p)); });
}
function createYouTubeCard(p) {
    const a = document.createElement('a');
    a.className = 'yt-promo-card'; a.href = p.url; a.target = '_blank'; a.rel = 'noopener';
    const logoEl = document.createElement('img');
    logoEl.className = 'yt-promo-logo'; logoEl.alt = p.name;
    logoEl.src = getPartnerLogo(p) || 'images/aov.png';
    logoEl.onerror = () => { logoEl.onerror = null; logoEl.src = 'images/aov.png'; };
    const info = document.createElement('div');
    info.className = 'yt-promo-info';
    info.innerHTML = `<div class="yt-promo-name">${escapeHtml(p.name)}</div>${p.description ? `<div class="yt-promo-desc">${escapeHtml(p.description)}</div>` : ''}<div class="yt-promo-btn">Смотреть на YouTube</div>`;
    a.appendChild(logoEl); a.appendChild(info); return a;
}
function createPartnerCard(p) {
    const a = document.createElement('a');
    a.className = 'partner-card'; a.href = p.url; a.target = '_blank'; a.rel = 'noopener';
    const logoEl = document.createElement('div');
    logoEl.className = 'partner-logo';
    const logoSrc = getPartnerLogo(p);
    if (logoSrc) {
        const img = document.createElement('img');
        img.src = logoSrc; img.alt = '';
        img.onerror = () => img.replaceWith(makePartnerLetter(p.name));
        logoEl.appendChild(img);
    } else logoEl.appendChild(makePartnerLetter(p.name));
    const info = document.createElement('div');
    info.className = 'partner-info';
    info.innerHTML = `<div class="partner-name">${escapeHtml(p.name)}</div>${p.description ? `<div class="partner-desc">${escapeHtml(p.description)}</div>` : ''}<div class="partner-link">🔗 ${escapeHtml(p.url)}</div>`;
    a.appendChild(logoEl); a.appendChild(info); return a;
}
function makePartnerLetter(name) {
    const span = document.createElement('span');
    span.className = 'partner-letter';
    span.textContent = (name || '?').trim()[0]?.toUpperCase() || '?';
    span.style.background = colorFromString(name || '?');
    return span;
}
function renderPartnersAdmin() {
    const container = $('partnersAdminList'); if (!container) return;
    container.innerHTML = '';
    if (!partnersCache.length) { container.innerHTML = '<div class="empty">Пока нет партнёров</div>'; return; }
    partnersCache.forEach((p, idx) => {
        const el = document.createElement('div');
        el.className = 'partners-admin-item';
        const letter = (p.name || '?')[0].toUpperCase();
        const logoSrc = getPartnerLogo(p);
        const logoHtml = logoSrc ? `<img src="${escapeHtml(logoSrc)}" alt="" onerror="this.outerHTML='<span>${escapeHtml(letter)}</span>'">` : `<span>${escapeHtml(letter)}</span>`;
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
        container.appendChild(el);
    });
}
async function movePartner(id, dir) {
    const idx = partnersCache.findIndex(p => p.id === id); if (idx === -1) return;
    const swapIdx = idx + dir; if (swapIdx < 0 || swapIdx >= partnersCache.length) return;
    const a = partnersCache[idx], b = partnersCache[swapIdx];
    await supabase.from('partners').update({ sort_order: swapIdx }).eq('id', a.id);
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
        partnerLogoData = await compressLogo(file);
        $('partnerLogoImg').src = partnerLogoData;
        $('partnerLogoPreview').hidden = false;
        $('partnerLogoName').textContent = file.name;
    } catch (err) { alert('Не удалось загрузить: ' + err.message); }
});
on('partnerLogoClear', 'click', () => {
    partnerLogoData = null; $('partnerLogoFile').value = '';
    $('partnerLogoPreview').hidden = true; $('partnerLogoName').textContent = '';
});
on('partnerAddBtn', 'click', async () => {
    const name = val('partnerName').trim(), url = val('partnerUrl').trim(), desc = val('partnerDesc').trim();
    const statusEl = $('partnerStatus');
    if (!name) { flashStatusEl(statusEl, 'Укажи название', '#ff7a7a'); return; }
    if (!url) { flashStatusEl(statusEl, 'Укажи ссылку', '#ff7a7a'); return; }
    if (!/^https?:\/\//i.test(url)) { flashStatusEl(statusEl, 'Ссылка с http(s)://', '#ff7a7a'); return; }
    const { error } = await supabase.from('partners').insert({ name, url, logo_url: partnerLogoData || null, description: desc || null, sort_order: partnersCache.length });
    if (error) { flashStatusEl(statusEl, 'Ошибка: ' + error.message, '#ff7a7a'); return; }
    ['partnerName','partnerUrl','partnerDesc'].forEach(id => { const el = $(id); if (el) el.value = ''; });
    partnerLogoData = null; $('partnerLogoFile').value = '';
    $('partnerLogoPreview').hidden = true; $('partnerLogoName').textContent = '';
    flashStatusEl(statusEl, '✔ Добавлено', '#6ee7a7');
    await loadPartners();
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   34.  📖  ТАКТИКА-АДМИН                                             ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function renderTacticsAdmin() {
    const container = $('tacticsAdminList'); if (!container) return;
    container.innerHTML = '';
    if (!tacticsCache.length) { container.innerHTML = '<div class="empty">Пока нет разделов</div>'; return; }
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
        container.appendChild(el);
    });
}
async function moveTactic(id, dir) {
    const idx = tacticsCache.findIndex(t => t.id === id); if (idx === -1) return;
    const swapIdx = idx + dir; if (swapIdx < 0 || swapIdx >= tacticsCache.length) return;
    const a = tacticsCache[idx], b = tacticsCache[swapIdx];
    await supabase.from('tactics').update({ sort_order: b.sort_order }).eq('id', a.id);
    await supabase.from('tactics').update({ sort_order: a.sort_order }).eq('id', b.id);
    await loadTactics();
}
function openTacticEdit(t) {
    editingTactic = t;
    $('tacEditId').value = t.id; $('tacEditTitle').value = t.title || '';
    $('tacEditIcon').value = t.icon || ''; $('tacEditOrder').value = t.sort_order ?? 0;
    $('tacEditContent').value = t.content || '';
    $('tacEditMsg').textContent = '';
    $('tacticsEditModal').hidden = false; $('tacEditTitle').focus();
}
on('cancelTacEdit', 'click', () => { $('tacticsEditModal').hidden = true; editingTactic = null; });
on('saveTacEdit', 'click', async () => {
    if (!editingTactic) return;
    const title = val('tacEditTitle').trim(), icon = val('tacEditIcon').trim();
    const content = val('tacEditContent'), order = parseInt(val('tacEditOrder')) || 0;
    const msg = $('tacEditMsg');
    if (!title) { msg.textContent = 'Укажи заголовок'; msg.style.color = '#ff7a7a'; return; }
    if (!content.trim()) { msg.textContent = 'Укажи содержимое'; msg.style.color = '#ff7a7a'; return; }
    const { error } = await supabase.from('tactics').update({ title, icon: icon || null, content, sort_order: order, updated_at: new Date().toISOString() }).eq('id', editingTactic.id);
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    $('tacticsEditModal').hidden = true; editingTactic = null; await loadTactics();
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
    const statusEl = $('tacStatus');
    if (!id) { flashStatusEl(statusEl, 'Укажи ID', '#ff7a7a'); return; }
    if (!title) { flashStatusEl(statusEl, 'Укажи заголовок', '#ff7a7a'); return; }
    if (!content.trim()) { flashStatusEl(statusEl, 'Укажи содержимое', '#ff7a7a'); return; }
    const { error } = await supabase.from('tactics').insert({ id, title, icon: icon || null, content, sort_order: order });
    if (error) { flashStatusEl(statusEl, 'Ошибка: ' + error.message, '#ff7a7a'); return; }
    ['tacId','tacTitle','tacIcon','tacContent'].forEach(i => { const el = $(i); if (el) el.value = ''; });
    $('tacOrder').value = 10;
    flashStatusEl(statusEl, '✔ Добавлено', '#6ee7a7');
    await loadTactics();
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   35.  📦  РЕСУРСЫ + ЦЕНООБРАЗОВАНИЕ                                 ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadResourcePrices() {
    const { data, error } = await supabase
        .from('resource_prices')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });
    if (error) { console.warn('resource_prices load error:', error.message); resourcesCache = []; }
    else resourcesCache = data || [];
    renderPricingGrid();
    renderResourcePricesHome();
    if (builderClanCtrl) builderClanCtrl.refresh();
}
function renderPricingGrid() {
    const container = $('pricingGroups'); if (!container) return;
    const q = ($('pricing-search')?.value || '').trim().toLowerCase();
    let list = resourcesCache.slice();
    if (q) list = list.filter(r =>
        (r.name || '').toLowerCase().includes(q) ||
        (r.name_latin || '').toLowerCase().includes(q) ||
        (r.id || '').toLowerCase().includes(q)
    );
    if (!list.length) {
        container.innerHTML = `<div class="pricing-empty">${q ? 'Ничего не найдено' : 'Пока нет ресурсов. Нажми «📥 Импорт базового набора».'}</div>`;
        return;
    }
    const byGroup = {};
    PRICING_GROUPS.forEach(g => { byGroup[g.id] = []; });
    list.forEach(r => {
        const gid = r.group_name || 'other';
        (byGroup[gid] || (byGroup[gid] = [])).push(r);
    });
    container.innerHTML = '';
    PRICING_GROUPS.forEach(g => {
        const items = byGroup[g.id] || [];
        if (!items.length) return;
        const section = document.createElement('section');
        section.className = 'pricing-group ' + g.cls;
        const title = document.createElement('h3');
        title.className = 'pricing-group-title';
        title.innerHTML = `${g.name} <span class="count">· ${items.length}</span>`;
        section.appendChild(title);
        const grid = document.createElement('div');
        grid.className = 'pricing-grid';
        items.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || (a.name || '').localeCompare(b.name || ''));
        items.forEach(r => {
            const iconHtml = r.image_url
                ? `<img src="${escapeHtml(r.image_url)}" alt="" onerror="this.parentNode.innerHTML='${escapeHtml(r.icon || '📦')}'">`
                : (r.icon || '📦');
            const latin = (r.name_latin || r.id || '').toUpperCase();
            const card = document.createElement('div');
            card.className = 'pricing-card';
            card.dataset.id = r.id;
            card.innerHTML = `
                <div class="pricing-card-head">
                    <span class="pricing-card-icon">${iconHtml}</span>
                    <span class="pricing-card-name">
                        <span class="main">${escapeHtml(r.name)}</span>
                        <span class="latin">${escapeHtml(latin)}</span>
                    </span>
                </div>
                <div class="pricing-card-price">
                    <span class="pricing-card-prefix">G</span>
                    <input type="number" class="pricing-card-input"
                           data-id="${escapeHtml(r.id)}"
                           value="${Number(r.price) || 0}"
                           min="0" step="1">
                </div>
                <div class="pricing-card-actions">
                    <button class="pricing-card-btn edit" data-id="${escapeHtml(r.id)}" title="Редактировать">✏️ Изменить</button>
                    <button class="pricing-card-btn del" data-id="${escapeHtml(r.id)}" title="Удалить">🗑</button>
                </div>`;
            grid.appendChild(card);
        });
        section.appendChild(grid);
        container.appendChild(section);
    });
    container.querySelectorAll('.pricing-card-input').forEach(inp => {
        inp.addEventListener('input', e => {
            const id = e.target.dataset.id;
            clearTimeout(pricingSaveTimers[id]);
            pricingSaveTimers[id] = setTimeout(() => saveResourcePrice(id, e.target.value), 700);
        });
        inp.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const id = e.target.dataset.id;
                clearTimeout(pricingSaveTimers[id]);
                saveResourcePrice(id, e.target.value);
                e.target.blur();
            }
        });
    });
    container.querySelectorAll('.pricing-card-btn.del').forEach(btn =>
        btn.addEventListener('click', () => deleteResourcePrice(btn.dataset.id))
    );
    container.querySelectorAll('.pricing-card-btn.edit').forEach(btn =>
        btn.addEventListener('click', () => openResourceEditModal(btn.dataset.id))
    );
}
async function saveResourcePrice(id, rawPrice) {
    const price = parseFloat(rawPrice) || 0;
    const status = $('pricingStatus');
    const { error } = await supabase.from('resource_prices')
        .update({ price, updated_at: new Date().toISOString(), updated_by: getViewerNick() || 'admin' })
        .eq('id', id);
    if (error) { if (status) { status.textContent = '❌ ' + error.message; status.style.color = '#ff7a7a'; setTimeout(() => status.textContent = '', 2500); } return; }
    const r = resourcesCache.find(x => x.id === id);
    if (r) r.price = price;
    if (status) { status.textContent = '✔ Сохранено'; status.style.color = '#6ee7a7'; setTimeout(() => status.textContent = '', 1500); }
    renderResourcePricesHome();
    renderShipCostPublic();
}
async function deleteResourcePrice(id) {
    const r = resourcesCache.find(x => x.id === id);
    if (!r) return;
    if (!confirm(`Удалить ресурс «${r.name}»?`)) return;
    const { error } = await supabase.from('resource_prices').delete().eq('id', id);
    if (error) return alert(error.message);
    await logAdminAction('Удалил ресурс', r.name);
    await loadResourcePrices();
}
function openResourceEditModal(id) {
    const r = id ? resourcesCache.find(x => x.id === id) : null;
    editingResourceId = r ? r.id : null;
    $('resourceEditTitle').textContent = r ? '✏️ Редактировать ресурс' : '➕ Новый ресурс';
    $('re-id').value = r?.id || '';
    $('re-id').disabled = !!r;
    $('re-name').value = r?.name || '';
    $('re-latin').value = r?.name_latin || '';
    $('re-group').value = r?.group_name || 'raw';
    $('re-price').value = r?.price ?? 0;
    $('re-icon').value = r?.icon || '📦';
    $('re-image-url').value = (r?.image_url && !r.image_url.startsWith('data:')) ? r.image_url : '';
    delete $('re-image-url').dataset.dataUrl;
    if (r?.image_url) { $('re-image-preview-img').src = r.image_url; $('re-image-preview').hidden = false; }
    else $('re-image-preview').hidden = true;
    $('re-image-name').textContent = '';
    $('re-msg').textContent = '';
    $('resourceEditModal').hidden = false;
    $('re-name').focus();
}
on('pricingAddBtn', 'click', () => openResourceEditModal(null));
on('re-cancel', 'click', () => { $('resourceEditModal').hidden = true; editingResourceId = null; });
on('resourceEditModal', 'click', e => { if (e.target.id === 'resourceEditModal') { $('resourceEditModal').hidden = true; editingResourceId = null; } });
on('re-image-pick', 'click', () => { const f = $('re-image-file'); if (f) { f.value = ''; f.click(); } });
on('re-image-file', 'change', async e => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Максимум 2 МБ'); return; }
    try {
        const dataUrl = await compressLogo(file, 128, 0.9);
        $('re-image-preview-img').src = dataUrl;
        $('re-image-preview').hidden = false;
        $('re-image-name').textContent = file.name;
        $('re-image-url').value = '';
        $('re-image-url').dataset.dataUrl = dataUrl;
    } catch (err) { alert('Ошибка: ' + err.message); }
});
on('re-image-clear', 'click', () => {
    $('re-image-preview').hidden = true; $('re-image-file').value = '';
    $('re-image-name').textContent = ''; $('re-image-url').value = '';
    delete $('re-image-url').dataset.dataUrl;
});
on('re-image-url', 'input', () => {
    delete $('re-image-url').dataset.dataUrl;
    const url = val('re-image-url').trim();
    if (url) { $('re-image-preview-img').src = url; $('re-image-preview').hidden = false; }
    else $('re-image-preview').hidden = true;
});
on('re-save', 'click', async () => {
    const msg = $('re-msg'); msg.textContent = '';
    const id = (editingResourceId || val('re-id').trim().toLowerCase().replace(/[^a-z0-9_-]/g, ''));
    const name = val('re-name').trim();
    const latin = (val('re-latin').trim() || id).toUpperCase();
    const group = val('re-group') || 'raw';
    const price = parseFloat(val('re-price')) || 0;
    const icon = val('re-icon').trim() || '📦';
    const urlField = val('re-image-url').trim();
    const image = urlField || $('re-image-url').dataset.dataUrl ||
                  (editingResourceId ? resourcesCache.find(x => x.id === editingResourceId)?.image_url : null);
    if (!id) { msg.textContent = 'Укажи ID'; msg.style.color = '#ff7a7a'; return; }
    if (!name) { msg.textContent = 'Укажи название'; msg.style.color = '#ff7a7a'; return; }
    const payload = {
        id, name, name_latin: latin, group_name: group,
        icon, image_url: image, price, category: 'resource',
        sort_order: resourcesCache.find(x => x.id === id)?.sort_order ?? (resourcesCache.length + 1) * 10,
        updated_at: new Date().toISOString(),
        updated_by: getViewerNick() || 'admin'
    };
    let error;
    if (editingResourceId) ({ error } = await supabase.from('resource_prices').update(payload).eq('id', id));
    else ({ error } = await supabase.from('resource_prices').insert(payload));
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    await logAdminAction(editingResourceId ? 'Обновил ресурс' : 'Добавил ресурс', name);
    $('resourceEditModal').hidden = true;
    editingResourceId = null;
    await loadResourcePrices();
});
on('pricingPresetBtn', 'click', async () => {
    if (!confirm('Загрузить базовый набор из 22 ресурсов? Существующие с такими ID будут перезаписаны.')) return;
    const btn = $('pricingPresetBtn'); btn.disabled = true; btn.textContent = '⏳…';
    let count = 0;
    for (const [id, name, latin, icon, image_url, price, sort, group] of RESOURCE_PRESET) {
        const payload = {
            id, name, name_latin: latin, icon, image_url, price,
            category: 'resource', sort_order: sort, group_name: group || 'raw',
            updated_at: new Date().toISOString(), updated_by: 'preset'
        };
        const { error } = await supabase.from('resource_prices').upsert(payload, { onConflict: 'id' });
        if (!error) count++;
    }
    btn.disabled = false; btn.textContent = '📥 Импорт базового набора';
    await logAdminAction('Импорт пресета ресурсов', null, `загружено: ${count}`);
    await loadResourcePrices();
    alert(`✔ Загружено ${count} из ${RESOURCE_PRESET.length}`);
});
on('pricingAuto', 'change', async (e) => {
    const on2 = e.target.checked; const msg = $('pricingAutoMsg');
    if (!on2) { if (msg) msg.textContent = ''; return; }
    if (msg) { msg.textContent = '⏳ считаю…'; msg.style.color = '#7db9ff'; }
    const active = tradesCache.filter(t => t.status !== 'done' && t.type === 'sell' && t.category === 'resource');
    if (!active.length) { if (msg) { msg.textContent = 'Нет активных заявок'; msg.style.color = '#ff7a7a'; } e.target.checked = false; return; }
    const sums = {};
    active.forEach(t => {
        const k = (t.name || '').trim().toLowerCase();
        if (!sums[k]) sums[k] = { gold: 0, qty: 0 };
        sums[k].gold += (Number(t.price) || 0) * (Number(t.qty) || 0);
        sums[k].qty += Number(t.qty) || 0;
    });
    let updated = 0;
    for (const r of resourcesCache) {
        const k = (r.name || '').trim().toLowerCase();
        if (sums[k] && sums[k].qty > 0) {
            const avg = Math.round(sums[k].gold / sums[k].qty);
            const { error } = await supabase.from('resource_prices').update({ price: avg, updated_at: new Date().toISOString(), updated_by: 'auto' }).eq('id', r.id);
            if (!error) { r.price = avg; updated++; }
        }
    }
    await logAdminAction('Авто-цены', null, `обновлено: ${updated}`);
    renderPricingGrid(); renderResourcePricesHome();
    if (msg) { msg.textContent = `✔ обновлено ${updated}`; msg.style.color = '#6ee7a7'; setTimeout(() => msg.textContent = '', 3000); }
});
on('pricingCollapse', 'click', () => { const p = document.querySelector('.pricing-panel'); if (p) p.classList.toggle('collapsed'); });
on('pricing-search', 'input', renderPricingGrid);
function renderResourcePricesHome() {
    const tbody = $('res-tbody'); if (!tbody) return;
    const q = ($('res-search')?.value || '').trim().toLowerCase();
    const sort = $('res-sort')?.value || 'name-asc';
    let list = resourcesCache.slice();
    if (q) list = list.filter(r => (r.name || '').toLowerCase().includes(q));
    list.sort((a, b) => {
        switch (sort) {
            case 'name-desc': return (b.name || '').localeCompare(a.name || '');
            case 'price-asc': return (a.price || 0) - (b.price || 0);
            case 'price-desc': return (b.price || 0) - (a.price || 0);
            case 'updated-desc': return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
            default: return (a.name || '').localeCompare(b.name || '');
        }
    });
    if (!list.length) { tbody.innerHTML = `<tr><td colspan="3" class="res-empty">${q ? 'Ничего не найдено' : 'Справочник пуст'}</td></tr>`; return; }
    const fmt = n => Number(n).toLocaleString('ru-RU');
    tbody.innerHTML = '';
    list.forEach(r => {
        const img = r.image_url
            ? `<img src="${escapeHtml(r.image_url)}" alt="" onerror="this.style.display='none'">`
            : `<span style="font-size:18px;">${escapeHtml(r.icon || '📦')}</span>`;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="res-name">${img}${escapeHtml(r.name)}</span></td>
            <td><span class="res-cell-price avg">${fmt(r.price)} 🪙</span></td>
            <td style="font-size:11px;color:var(--muted);">${r.updated_at ? new Date(r.updated_at).toLocaleDateString('ru-RU') : '—'}</td>`;
        tbody.appendChild(tr);
    });
    const upd = $('res-updated');
    if (upd) upd.textContent = 'обновлено ' + new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}
on('res-search', 'input', renderResourcePricesHome);
on('res-sort', 'change', renderResourcePricesHome);
on('res-refresh', 'click', loadResourcePrices);

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   36.  🔨  ПОСТРОЙКА КОРАБЛЯ + СКИДКИ                                ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadRecipes() {
    const { data, error } = await supabase.from('ship_recipes').select('*').order('sort_order').order('id');
    if (error) { console.warn('ship_recipes load:', error.message); recipesCache = []; }
    else recipesCache = data || [];
    renderRecipeShipSelect();
    renderRecipeRows();
    renderShipCostPublic();
}
async function loadDiscounts() {
    const { data, error } = await supabase.from('discounts').select('*').order('sort_order').order('id');
    if (error) { console.warn('discounts load:', error.message); discountsCache = []; }
    else discountsCache = data || [];
    renderDiscountsAdmin();
    renderShipCostPublic();
    fillScCities();
}
function fillScCities() {
    const sel = $('sc-city'); if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = '<option value="">— Не указан —</option>' +
        portsCache.map(p => `<option value="${escapeHtml(p.name)}">${escapeHtml(p.name)}</option>`).join('');
    if (cur && portsCache.some(p => p.name === cur)) sel.value = cur;
}
function fillScShipSelect() {
    const sel = $('sc-ship'); if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = '<option value="">— Выберите корабль —</option>';
    shipsCache.slice().sort((a, b) => a.name.localeCompare(b.name)).forEach(s => {
        const o = document.createElement('option');
        o.value = s.name; o.textContent = `${ROMAN[s.level] || s.level} · ${s.name}`;
        o.dataset.image = s.image_url || '';
        sel.appendChild(o);
    });
    if (cur) sel.value = cur;
}
function fillScFactionSelect() {
    const sel = $('sc-faction'); if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = '<option value="">— Не указана —</option>' +
        factionsCache.filter(f => f.type !== 'neutral').map(f => `<option value="${escapeHtml(f.name)}">${escapeHtml(f.name)}</option>`).join('');
    if (cur) sel.value = cur;
}
function getActiveDiscounts(city, faction) {
    const today = new Date().toISOString().slice(0, 10);
    return discountsCache.filter(d => {
        if (!d.is_active) return false;
        if (d.date_from && d.date_from > today) return false;
        if (d.date_to   && d.date_to   < today) return false;
        if (d.type === 'city'    && (!d.city    || d.city    !== city))    return false;
        if (d.type === 'faction' && (!d.faction || d.faction !== faction)) return false;
        return true;
    });
}
function renderShipCostPublic() {
    const sel = $('sc-ship'); if (!sel) return;
    const shipName = sel.value;
    const img = $('sc-ship-img');
    const empty = $('sc-empty');
    const content = $('sc-content');
    if (!shipName) {
        if (img) img.hidden = true;
        if (empty) empty.hidden = false;
        if (content) content.hidden = true;
        return;
    }
    const opt = sel.selectedOptions[0];
    if (img && opt?.dataset.image) { img.src = opt.dataset.image; img.hidden = false; }
    else if (img) img.hidden = true;
    const recipe = recipesCache.filter(r => r.ship_id === shipName);
    if (!recipe.length) {
        if (empty) { empty.hidden = false; empty.textContent = 'Для этого корабля рецепт не задан.'; }
        if (content) content.hidden = true;
        return;
    }
    if (empty) empty.hidden = true;
    if (content) content.hidden = false;
    const tbody = $('sc-tbody'); if (!tbody) return;
    tbody.innerHTML = '';
    let baseSum = 0;
    recipe.forEach(r => {
        const res = resourcesCache.find(x => x.id === r.resource_id);
        const price = res ? Number(res.price) || 0 : 0;
        const qty   = Number(r.quantity) || 0;
        const sum   = price * qty;
        baseSum += sum;
        const imgHtml = res?.image_url
            ? `<img src="${escapeHtml(res.image_url)}" alt="">`
            : `<span style="font-size:18px;">${escapeHtml(res?.icon || '📦')}</span>`;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="sc-res-name">${imgHtml}${escapeHtml(res?.name || r.resource_id)}</span></td>
            <td class="sc-qty">${qty.toLocaleString('ru-RU')}</td>
            <td class="sc-price">${price.toLocaleString('ru-RU')} 🪙</td>
            <td class="sc-sum">${Math.round(sum).toLocaleString('ru-RU')} 🪙</td>`;
        tbody.appendChild(tr);
    });
    const city = val('sc-city');
    const faction = val('sc-faction');
    const active = getActiveDiscounts(city, faction);
    const dl = $('sc-discounts-list');
    const block = document.querySelector('.sc-discounts');
    if (dl) {
        if (!active.length) { if (block) block.hidden = true; dl.innerHTML = ''; }
        else {
            if (block) block.hidden = false;
            dl.innerHTML = active.map(d => `
                <div class="sc-disc-row">
                    <span class="sc-disc-name">${escapeHtml(d.name)}
                        <span class="sc-disc-badge ${d.type}">${
                            d.type === 'seasonal' ? '🗓 сезон' :
                            d.type === 'city' ? '⚓ ' + escapeHtml(d.city || '') :
                            '🏴 ' + escapeHtml(d.faction || '')
                        }</span>
                    </span>
                    <span class="sc-disc-value">−${d.value}%</span>
                </div>`).join('');
        }
    }
    const totalPercent = active.reduce((s, d) => s + (Number(d.value) || 0), 0);
    const discountSum = baseSum * totalPercent / 100;
    const finalSum = Math.max(0, baseSum - discountSum);
    const fmt = n => Math.round(n).toLocaleString('ru-RU') + ' 🪙';
    const baseEl = $('sc-base'); if (baseEl) baseEl.textContent = fmt(baseSum);
    const dEl = $('sc-discounts-sum'); if (dEl) dEl.textContent = '−' + fmt(discountSum);
    const fEl = $('sc-final'); if (fEl) fEl.textContent = fmt(finalSum);
}
on('sc-ship', 'change', renderShipCostPublic);
on('sc-city', 'change', renderShipCostPublic);
on('sc-faction', 'change', renderShipCostPublic);
function renderRecipeShipSelect() {
    const sel = $('recipe-ship'); if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = '<option value="">— Выберите корабль —</option>';
    shipsCache.slice().sort((a, b) => a.name.localeCompare(b.name)).forEach(s => {
        const o = document.createElement('option');
        o.value = s.name; o.textContent = `${ROMAN[s.level] || s.level} · ${s.name}`;
        sel.appendChild(o);
    });
    if (cur) sel.value = cur;
}
function renderRecipeRows() {
    const container = $('recipe-rows'); if (!container) return;
    const ship = val('recipe-ship');
    if (!ship) { container.innerHTML = '<p class="hint" style="margin:0;">Выберите корабль — появятся его компоненты.</p>'; return; }
    const rows = recipesCache.filter(r => r.ship_id === ship).sort((a, b) => (a.sort_order||0) - (b.sort_order||0));
    container.innerHTML = '';
    if (!rows.length) { container.innerHTML = '<p class="hint" style="margin:0;">Рецепт пуст. Нажмите «➕ Добавить ресурс».</p>'; return; }
    rows.forEach(r => addRecipeRowUI(r.resource_id, r.quantity, r.id));
}
function addRecipeRowUI(resourceId = '', qty = 1, id = null) {
    const container = $('recipe-rows'); if (!container) return;
    if (container.querySelector('.hint')) container.innerHTML = '';
    const row = document.createElement('div');
    row.className = 'recipe-row';
    if (id) row.dataset.id = id;
    row.innerHTML = `
        <img class="rr-img" src="" alt="" hidden>
        <select class="rr-res">
            <option value="">— Ресурс —</option>
            ${resourcesCache.map(r => `<option value="${escapeHtml(r.id)}" ${r.id === resourceId ? 'selected' : ''}>${escapeHtml(r.name)}</option>`).join('')}
        </select>
        <input type="number" class="rr-qty" min="1" step="1" value="${Number(qty) || 1}">
        <button class="rr-del" title="Удалить">✕</button>`;
    const sel = row.querySelector('.rr-res');
    const img = row.querySelector('.rr-img');
    const updateImg = () => {
        const r = resourcesCache.find(x => x.id === sel.value);
        if (r?.image_url) { img.src = r.image_url; img.hidden = false; }
        else { img.hidden = true; img.src = ''; }
    };
    sel.addEventListener('change', updateImg);
    updateImg();
    row.querySelector('.rr-del').addEventListener('click', () => row.remove());
    container.appendChild(row);
}
on('recipe-ship', 'change', renderRecipeRows);
on('recipe-add-row', 'click', () => {
    if (!val('recipe-ship')) { alert('Сначала выберите корабль'); return; }
    addRecipeRowUI();
});
on('recipe-clear', 'click', async () => {
    const ship = val('recipe-ship'); if (!ship) return;
    if (!confirm(`Удалить рецепт корабля «${ship}»?`)) return;
    const { error } = await supabase.from('ship_recipes').delete().eq('ship_id', ship);
    if (error) return alert('Ошибка: ' + error.message);
    await logAdminAction('Удалил рецепт', ship);
    await loadRecipes();
});
on('recipe-save', 'click', async () => {
    const ship = val('recipe-ship');
    const msg = $('recipe-msg'); msg.textContent = '';
    if (!ship) { msg.textContent = 'Выберите корабль'; msg.style.color = '#ff7a7a'; return; }
    const rows = [...document.querySelectorAll('#recipe-rows .recipe-row')].map(r => ({
        resource_id: r.querySelector('.rr-res').value,
        quantity: Number(r.querySelector('.rr-qty').value) || 0
    })).filter(r => r.resource_id && r.quantity > 0);
    const seen = new Set();
    for (const r of rows) {
        if (seen.has(r.resource_id)) { msg.textContent = 'Ресурс повторяется: ' + r.resource_id; msg.style.color = '#ff7a7a'; return; }
        seen.add(r.resource_id);
    }
    const { error: delErr } = await supabase.from('ship_recipes').delete().eq('ship_id', ship);
    if (delErr) { msg.textContent = 'Ошибка удаления: ' + delErr.message; msg.style.color = '#ff7a7a'; return; }
    if (rows.length) {
        const payload = rows.map((r, i) => ({ ship_id: ship, resource_id: r.resource_id, quantity: r.quantity, sort_order: i * 10 }));
        const { error } = await supabase.from('ship_recipes').insert(payload);
        if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    }
    await logAdminAction('Сохранил рецепт', ship, `компонентов: ${rows.length}`);
    msg.textContent = '✔ Рецепт сохранён'; msg.style.color = '#6ee7a7';
    await loadRecipes();
});
function renderDiscountsAdmin() {
    const container = $('discounts-list'); if (!container) return;
    container.innerHTML = '';
    if (!discountsCache.length) { container.innerHTML = '<div class="empty">Скидок пока нет</div>'; return; }
    discountsCache.forEach(d => {
        const typeLabels = { seasonal: '🗓 Сезонная', city: '⚓ Городская', faction: '🏴 Фракционная' };
        const range = (d.date_from || d.date_to) ? `${d.date_from || '…'} → ${d.date_to || '…'}` : 'без ограничения';
        const el = document.createElement('div');
        el.className = 'partners-admin-item';
        el.innerHTML = `
            <div class="logo-mini"><span>💸</span></div>
            <div class="txt">
                <b>${escapeHtml(d.name)} <span style="color:var(--green)">−${d.value}%</span></b>
                <span style="color:var(--muted);font-size:11px;">
                    ${typeLabels[d.type] || d.type}
                    ${d.city ? ' · ' + escapeHtml(d.city) : ''}
                    ${d.faction ? ' · ' + escapeHtml(d.faction) : ''}
                    · ${range} · ${d.is_active ? '🟢 активна' : '⚫ выкл'}
                </span>
                ${d.note ? `<span style="color:var(--muted);font-size:11px;font-style:italic;">${escapeHtml(d.note)}</span>` : ''}
            </div>
            <div class="actions">
                <button class="edit" title="Вкл/выкл">${d.is_active ? '🟢' : '⚫'}</button>
                <button class="delete" title="Удалить">🗑</button>
            </div>`;
        el.querySelector('.edit').addEventListener('click', async () => {
            const { error } = await supabase.from('discounts').update({ is_active: !d.is_active }).eq('id', d.id);
            if (error) return alert(error.message);
            await loadDiscounts();
        });
        el.querySelector('.delete').addEventListener('click', async () => {
            if (!confirm(`Удалить скидку «${d.name}»?`)) return;
            await supabase.from('discounts').delete().eq('id', d.id);
            await logAdminAction('Удалил скидку', d.name);
            await loadDiscounts();
        });
        container.appendChild(el);
    });
}
function onDiscountTypeChange() {
    const type = val('disc-type');
    const cityField = $('disc-city-field');
    const factionField = $('disc-faction-field');
    if (cityField) cityField.hidden = type !== 'city';
    if (factionField) factionField.hidden = type !== 'faction';
}
on('disc-type', 'change', onDiscountTypeChange);
function fillDiscountCitySelect() {
    const sel = $('disc-city-select'); if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = '<option value="">— Не выбран —</option>' +
        portsCache.map(p => `<option value="${escapeHtml(p.name)}">${escapeHtml(p.name)}</option>`).join('');
    if (cur && portsCache.some(p => p.name === cur)) sel.value = cur;
}
function fillDiscountFactionSelect() {
    const sel = $('disc-faction-select'); if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = '<option value="">— Не выбрана —</option>' +
        factionsCache.map(f => `<option value="${escapeHtml(f.name)}">${escapeHtml(f.name)}</option>`).join('');
    if (cur) sel.value = cur;
}
on('disc-add', 'click', async () => {
    const msg = $('disc-msg'); msg.textContent = '';
    const name = val('disc-name').trim();
    const type = val('disc-type');
    const value = parseFloat(val('disc-value')) || 0;
    const city = val('disc-city-select') || null;
    const faction = val('disc-faction-select') || null;
    const dateFrom = val('disc-from') || null;
    const dateTo = val('disc-to') || null;
    const note = val('disc-note').trim() || null;
    const isActive = $('disc-active').checked;
    if (!name) { msg.textContent = 'Укажи название'; msg.style.color = '#ff7a7a'; return; }
    if (value <= 0 || value > 100) { msg.textContent = 'Процент 0–100'; msg.style.color = '#ff7a7a'; return; }
    if (type === 'city' && !city) { msg.textContent = 'Укажи город'; msg.style.color = '#ff7a7a'; return; }
    if (type === 'faction' && !faction) { msg.textContent = 'Укажи фракцию'; msg.style.color = '#ff7a7a'; return; }
    const { error } = await supabase.from('discounts').insert({
        name, type, value, city, faction,
        date_from: dateFrom, date_to: dateTo,
        note, is_active: isActive,
        sort_order: (discountsCache.length + 1) * 10
    });
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    await logAdminAction('Добавил скидку', name, `${type} −${value}%`);
    msg.textContent = '✔ Скидка добавлена'; msg.style.color = '#6ee7a7';
    ['disc-name','disc-city-select','disc-faction-select','disc-from','disc-to','disc-note'].forEach(i => { const el = $(i); if (el) el.value = ''; });
    $('disc-value').value = 5;
    await loadDiscounts();
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   37.  ⚓  ФРАКЦИИ / ПОРТЫ / РАНГИ                                    ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadFactions() {
    const { data, error } = await supabase.from('factions').select('*').order('sort_order');
    if (error) { factionsCache = []; return; }
    factionsCache = data || [];
    renderFactionsAdmin();
    fillPortFactionSelect();
    fillDiscountFactionSelect();
    fillScFactionSelect();
}
async function loadPorts() {
    const { data, error } = await supabase.from('ports').select('*').order('sort_order').order('name');
    if (error) { portsCache = []; return; }
    portsCache = data || [];
    renderPortsAdmin();
    fillDiscountCitySelect();
    fillScCities();
}
async function loadRanks() {
    const { data, error } = await supabase.from('ship_ranks').select('*').order('rank', { ascending: false });
    if (error) { ranksCache = []; return; }
    ranksCache = data || [];
    renderRanksAdmin();
}
function renderFactionsAdmin() {
    const container = $('factions-admin-list'); if (!container) return;
    container.innerHTML = '';
    if (!factionsCache.length) { container.innerHTML = '<div class="empty">Нет фракций</div>'; return; }
    const typeLabels = { military: '⚔️ Военная', trade: '💰 Торговая', pirate: '☠️ Пиратская', neutral: '🕊 Нейтральная' };
    factionsCache.forEach(f => {
        const el = document.createElement('div');
        el.className = 'partners-admin-item';
        el.innerHTML = `
            <div class="logo-mini" style="background:${escapeHtml(f.color || '#8a93a3')}22;color:${escapeHtml(f.color || '#8a93a3')};"><span>🏴</span></div>
            <div class="txt">
                <b style="color:${escapeHtml(f.color || 'var(--text)')}">${escapeHtml(f.name)}</b>
                <span style="color:var(--muted);font-size:11px;">${typeLabels[f.type] || f.type}${f.description ? ' · ' + escapeHtml(f.description) : ''}</span>
            </div>
            <div class="actions">
                <button class="edit" title="Редактировать">✏️</button>
            </div>`;
        el.querySelector('.edit').addEventListener('click', () => openFactionEditModal(f));
        container.appendChild(el);
    });
}
function renderPortsAdmin() {
    const container = $('ports-admin-list'); if (!container) return;
    container.innerHTML = '';
    if (!portsCache.length) { container.innerHTML = '<div class="empty">Нет портов</div>'; return; }
    const typeLabels = { city: '🏙 Город', port: '⚓ Порт', neutral_bay: '🕊 Нейтральная', pirate_bay: '☠️ Пиратская' };
    portsCache.forEach(p => {
        const faction = factionsCache.find(f => f.id === p.faction_id);
        const el = document.createElement('div');
        el.className = 'partners-admin-item';
        el.innerHTML = `
            <div class="logo-mini"><span>${p.type === 'pirate_bay' ? '☠️' : p.type === 'neutral_bay' ? '🕊' : p.type === 'city' ? '🏙' : '⚓'}</span></div>
            <div class="txt">
                <b>${escapeHtml(p.name)}</b>
                <span style="color:var(--muted);font-size:11px;">
                    ${typeLabels[p.type] || p.type}
                    ${faction ? ' · ' + escapeHtml(faction.name) : ''}
                    ${p.can_be_captured ? ' · ⚔️ захватываемый' : ' · 🔒 не захватывается'}
                    ${p.region ? ' · 📍 ' + escapeHtml(p.region) : ''}
                </span>
                ${p.note ? `<span style="color:var(--muted);font-size:11px;font-style:italic;">${escapeHtml(p.note)}</span>` : ''}
            </div>
            <div class="actions">
                <button class="edit" title="Редактировать">✏️</button>
                <button class="delete" title="Удалить">🗑</button>
            </div>`;
        el.querySelector('.edit').addEventListener('click', () => openPortEditModal(p));
        el.querySelector('.txt b').addEventListener('dblclick', () => openPortEditModal(p));
        el.querySelector('.delete').addEventListener('click', async () => {
            if (!confirm(`Удалить порт «${p.name}»?`)) return;
            await supabase.from('ports').delete().eq('id', p.id);
            await loadPorts();
        });
        container.appendChild(el);
    });
}
function renderRanksAdmin() {
    const container = $('ranks-admin-list'); if (!container) return;
    container.innerHTML = '';
    if (!ranksCache.length) { container.innerHTML = '<div class="empty">Нет данных о рангах</div>'; return; }
    ranksCache.forEach(r => {
        const el = document.createElement('div');
        el.className = 'partners-admin-item';
        el.innerHTML = `
            <div class="logo-mini"><span>${ROMAN[r.rank] || r.rank}</span></div>
            <div class="txt">
                <b>${escapeHtml(r.name)}</b>
                <span style="color:var(--muted);font-size:11px;">
                    Мин. уровень: ${r.min_level || '—'}
                    ${r.requires_blueprint ? ' · 📜 нужен чертёж' : ''}
                    ${r.note ? ' · ' + escapeHtml(r.note) : ''}
                </span>
            </div>`;
        container.appendChild(el);
    });
}
function fillPortFactionSelect() {
    const sel = $('port-faction'); if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = '<option value="">— Без фракции —</option>' +
        factionsCache.map(f => `<option value="${escapeHtml(f.id)}">${escapeHtml(f.name)}</option>`).join('');
    if (cur) sel.value = cur;
}
function openPortEditModal(port) {
    if (!port) return;
    $('portEditTitle').textContent = '✏️ Редактировать порт';
    $('pe-id').value = port.id;
    $('pe-name').value = port.name || '';
    $('pe-type').value = port.type || 'city';
    $('pe-region').value = port.region || '';
    $('pe-note').value = port.note || '';
    $('pe-capturable').checked = port.can_be_captured !== false;
    const sel = $('pe-faction');
    sel.innerHTML = '<option value="">— Без фракции —</option>' +
        factionsCache.map(f => `<option value="${escapeHtml(f.id)}" ${f.id === port.faction_id ? 'selected' : ''}>${escapeHtml(f.name)}</option>`).join('');
    $('pe-msg').textContent = '';
    $('portEditModal').hidden = false;
    $('pe-name').focus();
}
on('pe-cancel', 'click', () => { $('portEditModal').hidden = true; });
on('portEditModal', 'click', e => { if (e.target.id === 'portEditModal') $('portEditModal').hidden = true; });
on('pe-save', 'click', async () => {
    const id = $('pe-id').value;
    const name = val('pe-name').trim();
    const type = val('pe-type');
    const factionId = val('pe-faction') || null;
    const region = val('pe-region').trim() || null;
    const capturable = $('pe-capturable').checked;
    const note = val('pe-note').trim() || null;
    const msg = $('pe-msg'); msg.textContent = '';
    if (!name) { msg.textContent = 'Укажи название'; msg.style.color = '#ff7a7a'; return; }
    if (portsCache.some(p => p.name === name && String(p.id) !== String(id))) { msg.textContent = 'Порт с таким именем уже есть'; msg.style.color = '#ff7a7a'; return; }
    const { error } = await supabase.from('ports').update({ name, type, faction_id: factionId, region, can_be_captured: capturable, note }).eq('id', id);
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    await logAdminAction('Обновил порт', name);
    $('portEditModal').hidden = true;
    await loadPorts();
});
function openFactionEditModal(faction) {
    if (!faction) return;
    $('factionEditTitle').textContent = '✏️ Редактировать фракцию';
    $('fe-id').value = faction.id;
    $('fe-name').value = faction.name || '';
    $('fe-type').value = faction.type || 'military';
    $('fe-color').value = faction.color || '';
    $('fe-desc').value = faction.description || '';
    $('fe-msg').textContent = '';
    $('factionEditModal').hidden = false;
    $('fe-name').focus();
}
on('fe-cancel', 'click', () => { $('factionEditModal').hidden = true; });
on('factionEditModal', 'click', e => { if (e.target.id === 'factionEditModal') $('factionEditModal').hidden = true; });
on('fe-save', 'click', async () => {
    const id = $('fe-id').value;
    const name = val('fe-name').trim();
    const type = val('fe-type');
    const color = val('fe-color').trim() || null;
    const desc = val('fe-desc').trim() || null;
    const msg = $('fe-msg'); msg.textContent = '';
    if (!name) { msg.textContent = 'Укажи название'; msg.style.color = '#ff7a7a'; return; }
    const { error } = await supabase.from('factions').update({ name, type, color, description: desc }).eq('id', id);
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    await logAdminAction('Обновил фракцию', name);
    $('factionEditModal').hidden = true;
    await loadFactions();
    await loadPorts();
});
on('port-add', 'click', async () => {
    const msg = $('port-msg'); msg.textContent = '';
    const name = val('port-name').trim();
    const type = val('port-type');
    const factionId = val('port-faction') || null;
    const region = val('port-region').trim() || null;
    const capturable = $('port-capturable').checked;
    const note = val('port-note').trim() || null;
    if (!name) { msg.textContent = 'Укажи название'; msg.style.color = '#ff7a7a'; return; }
    if (portsCache.some(p => p.name === name)) { msg.textContent = 'Такой порт уже есть'; msg.style.color = '#ff7a7a'; return; }
    const { error } = await supabase.from('ports').insert({ name, type, faction_id: factionId, region, can_be_captured: capturable, note, sort_order: (portsCache.length + 1) * 10 });
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    msg.textContent = '✔ Порт добавлен'; msg.style.color = '#6ee7a7';
    ['port-name','port-region','port-note'].forEach(i => { const el = $(i); if (el) el.value = ''; });
    $('port-capturable').checked = true;
    await loadPorts();
});
on('ranks-reload', 'click', loadRanks);

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   38.  🗺️  КАРТА                                                     ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadMapSettings() {
    const { data, error } = await supabase.from('map_settings').select('*').eq('id', 'main').maybeSingle();
    if (error) { console.warn('map_settings load:', error.message); mapSettings = null; }
    else mapSettings = data;
    renderMapPreview();
    renderMapAdmin();
}
function renderMapPreview() {
    const urls = getMapUrls();
    const titleEl = $('map-title'); if (titleEl) titleEl.textContent = mapSettings?.title || 'World of Sea Battle — Карта';
    const noteEl  = $('map-note');  if (noteEl)  noteEl.textContent = mapSettings?.note || '';
    const img = $('map-preview-img'); if (!img) return;
    document.querySelectorAll('.map-view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === currentMapView));
    const src = currentMapView === 'clean' ? urls.clean : urls.detailed;
    img.src = src || '';
    img.onerror = () => {
        if (currentMapView === 'detailed' && urls.clean) { img.src = urls.clean; }
        else if (currentMapView === 'clean' && urls.detailed) { img.src = urls.detailed; }
        else { img.alt = 'Карта не загружена'; }
    };
}
function openMapFullscreen() {
    const urls = getMapUrls();
    const fs = $('mapFullscreen'); if (!fs) return;
    const img = $('map-fs-img');
    const src = currentMapView === 'clean' ? urls.clean : urls.detailed;
    if (!src) { alert('Карта не настроена'); return; }
    img.src = src;
    img.onerror = () => { img.src = currentMapView === 'clean' ? urls.detailed : urls.clean; };
    const titleEl = $('map-fs-title'); if (titleEl) titleEl.textContent = mapSettings?.title || 'Карта';
    mapFsZoom = 1; mapFsX = 0; mapFsY = 0; applyMapFsTransform();
    fs.hidden = false;
    document.body.style.overflow = 'hidden';
}
function closeMapFullscreen() {
    const fs = $('mapFullscreen'); if (!fs) return;
    fs.hidden = true;
    document.body.style.overflow = '';
}
function applyMapFsTransform() {
    const img = $('map-fs-img'); if (!img) return;
    img.style.transform = `translate(${mapFsX}px, ${mapFsY}px) scale(${mapFsZoom})`;
}
function setMapFsZoom(z) {
    mapFsZoom = Math.max(0.5, Math.min(6, z));
    if (mapFsZoom <= 1) { mapFsX = 0; mapFsY = 0; }
    applyMapFsTransform();
}
function resetMapFs() { mapFsZoom = 1; mapFsX = 0; mapFsY = 0; applyMapFsTransform(); }
on('map-open', 'click', openMapFullscreen);
on('map-preview', 'click', openMapFullscreen);
document.querySelectorAll('.map-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentMapView = btn.dataset.view;
        renderMapPreview();
        const fs = $('mapFullscreen');
        if (fs && !fs.hidden) {
            const urls = getMapUrls();
            const img = $('map-fs-img');
            if (img) img.src = currentMapView === 'clean' ? urls.clean : urls.detailed;
            resetMapFs();
        }
    });
});
on('map-fs-close', 'click', closeMapFullscreen);
on('map-fs-zoom-in', 'click', () => setMapFsZoom(mapFsZoom + 0.25));
on('map-fs-zoom-out', 'click', () => setMapFsZoom(mapFsZoom - 0.25));
on('map-fs-reset', 'click', resetMapFs);
on('map-fs-stage', 'wheel', e => { e.preventDefault(); setMapFsZoom(mapFsZoom + (e.deltaY < 0 ? 0.15 : -0.15)); }, { passive: false });
on('map-fs-stage', 'mousedown', e => {
    if (mapFsZoom <= 1) return;
    mapFsDragging = true;
    mapFsDragStart = { x: e.clientX - mapFsX, y: e.clientY - mapFsY };
    $('map-fs-stage').classList.add('dragging');
});
document.addEventListener('mousemove', e => {
    if (!mapFsDragging) return;
    mapFsX = e.clientX - mapFsDragStart.x;
    mapFsY = e.clientY - mapFsDragStart.y;
    applyMapFsTransform();
});
document.addEventListener('mouseup', () => {
    if (!mapFsDragging) return;
    mapFsDragging = false;
    $('map-fs-stage')?.classList.remove('dragging');
});
on('map-fs-stage', 'mouseleave', () => { mapFsDragging = false; });
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        const fs = $('mapFullscreen');
        if (fs && !fs.hidden) closeMapFullscreen();
    }
});
function renderMapAdmin() {
    const urls = getMapUrls();
    const t = $('map-title-input'); if (t) t.value = mapSettings?.title || 'World of Sea Battle — Карта';
    const n = $('map-note-input');  if (n) n.value = mapSettings?.note || '';
    const dv = $('map-default-view'); if (dv) dv.value = mapSettings?.default_view || 'detailed';
    const det = $('map-detailed-url'); if (det) det.value = (urls.detailed && !urls.detailed.startsWith('data:')) ? urls.detailed : '';
    const cln = $('map-clean-url');    if (cln) cln.value = (urls.clean    && !urls.clean.startsWith('data:'))    ? urls.clean    : '';
    const detPrev = $('map-detailed-preview');
    const detImg  = $('map-detailed-preview-img');
    if (urls.detailed) { detImg.src = urls.detailed; detPrev.hidden = false; } else detPrev.hidden = true;
    const clnPrev = $('map-clean-preview');
    const clnImg  = $('map-clean-preview-img');
    if (urls.clean) { clnImg.src = urls.clean; clnPrev.hidden = false; } else clnPrev.hidden = true;
    mapDetailedData = null;
    mapCleanData = null;
    const msg = $('map-admin-msg'); if (msg) msg.textContent = '';
}
on('map-detailed-pick', 'click', () => { const f = $('map-detailed-file'); if (f) { f.value = ''; f.click(); } });
on('map-detailed-file', 'change', async e => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 8 * 1024 * 1024) { alert('Максимум 8 МБ'); return; }
    try {
        const dataUrl = await compressImage(file, 3000, 0.9);
        mapDetailedData = dataUrl;
        $('map-detailed-preview-img').src = dataUrl;
        $('map-detailed-preview').hidden = false;
        $('map-detailed-name').textContent = file.name;
        $('map-detailed-url').value = '';
    } catch (err) { alert('Ошибка: ' + err.message); }
});
on('map-detailed-clear', 'click', () => {
    mapDetailedData = null;
    $('map-detailed-preview').hidden = true;
    $('map-detailed-name').textContent = '';
    $('map-detailed-file').value = '';
    $('map-detailed-url').value = '';
});
on('map-clean-pick', 'click', () => { const f = $('map-clean-file'); if (f) { f.value = ''; f.click(); } });
on('map-clean-file', 'change', async e => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 8 * 1024 * 1024) { alert('Максимум 8 МБ'); return; }
    try {
        const dataUrl = await compressImage(file, 3000, 0.9);
        mapCleanData = dataUrl;
        $('map-clean-preview-img').src = dataUrl;
        $('map-clean-preview').hidden = false;
        $('map-clean-name').textContent = file.name;
        $('map-clean-url').value = '';
    } catch (err) { alert('Ошибка: ' + err.message); }
});
on('map-clean-clear', 'click', () => {
    mapCleanData = null;
    $('map-clean-preview').hidden = true;
    $('map-clean-name').textContent = '';
    $('map-clean-file').value = '';
    $('map-clean-url').value = '';
});
on('map-reset-urls', 'click', () => {
    $('map-detailed-url').value = MAP_DEFAULT_DETAILED;
    $('map-clean-url').value    = MAP_DEFAULT_CLEAN;
    mapDetailedData = null; mapCleanData = null;
    $('map-detailed-preview').hidden = false;
    $('map-detailed-preview-img').src = MAP_DEFAULT_DETAILED;
    $('map-clean-preview').hidden = false;
    $('map-clean-preview-img').src = MAP_DEFAULT_CLEAN;
});
on('map-save', 'click', async () => {
    const msg = $('map-admin-msg'); msg.textContent = '';
    const title = val('map-title-input').trim() || 'World of Sea Battle — Карта';
    const note = val('map-note-input').trim() || null;
    const defaultView = val('map-default-view') || 'detailed';
    const detailedUrl = mapDetailedData || val('map-detailed-url').trim() || null;
    const cleanUrl    = mapCleanData    || val('map-clean-url').trim()    || null;
    const { error } = await supabase.from('map_settings').upsert({
        id: 'main', title, note, default_view: defaultView,
        detailed_url: detailedUrl, clean_url: cleanUrl,
        updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    await logAdminAction('Обновил карту', title);
    msg.textContent = '✔ Карта сохранена'; msg.style.color = '#6ee7a7';
    await loadMapSettings();
});
/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   39.  💬  КОНТАКТЫ                                                  ║
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
   ║   40.  ✏️  РЕДАКТИРОВАНИЕ / ДОБАВЛЕНИЕ / УДАЛЕНИЕ ЗАПИСЕЙ             ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function openEditModal(tab, item) {
    editingItem = { tab, id: item.id };
    $('editPlayerGuild').value = item.player_guild || '';
    $('editNickname').value = item.nickname || '';
    $('editFaction').value = item.faction || '';
    $('editNote').value = item.note || '';
    $('editError').textContent = '';
    $('editModal').hidden = false; $('editPlayerGuild').focus();
}
on('cancelEdit', 'click', () => { $('editModal').hidden = true; editingItem = null; });
on('saveEdit', 'click', async () => {
    if (!editingItem) return;
    const pg = val('editPlayerGuild').trim(), nick = val('editNickname').trim();
    if (!pg && !nick) { $('editError').textContent = 'Заполни Гильдию или Ник'; return; }
    const { tab, id } = editingItem;
    const data = { nickname: nick || null, player_guild: pg || null, faction: val('editFaction').trim() || null, note: val('editNote').trim() || null };
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
    $('editModal').hidden = true; editingItem = null; loadList(tab);
});
['editPlayerGuild','editNickname','editFaction','editNote'].forEach(id => {
    on(id, 'keydown', e => { if (e.key === 'Enter') $('saveEdit').click(); });
});
on('addBtn', 'click', async () => {
    if (!canEditClan(currentClan)) return;
    const pg = val('playerGuild').trim(), nick = val('nickname').trim();
    if (!pg && !nick) { flashStatus('Заполни Гильдию или Ник', '#ff7a7a'); return; }
    const data = { nickname: nick || null, player_guild: pg || null, faction: val('faction').trim() || null, note: val('note').trim() || null };
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
    ['playerGuild','nickname','faction','note'].forEach(id => { const el = $(id); if (el) el.value = ''; });
    $('playerGuild').focus();
    flashStatus('✔ Добавлено', '#6ee7a7');
    loadList(currentTab);
});
['playerGuild','nickname','faction','note'].forEach(id => {
    on(id, 'keydown', e => { if (e.key === 'Enter') $('addBtn').click(); });
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
            if (err2 || resp2?.error) return alert('Ошибка: ' + (resp2?.error || err2.message));
        }
        loadList(fromTab); loadList(toTab);
    });
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   41.  🏰  АДМИН: ГИЛЬДИИ                                            ║
   ║                                                                      ║
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
    renderGameSelectForClanAdmin(); renderAllianceSelects();
    if (clan) { $('adminClanGame').value = clan.game_id || 'wosb'; $('adminClanAlliance').value = clan.alliance_id || ''; }
    $('adminCurrentPass').value = clan?.password || '—';
    $('adminCurrentAdminPass').value = clan?.admin_password || '—';
    $('adminNewPass').value = ''; $('adminNewAdminPass').value = '';
    $('adminDiscord').value = clan?.discord || '';
    const phoneEl = $('adminPhone'); if (phoneEl) phoneEl.value = clan?.phone || '';
    $('adminNews').value = clan?.news || '';
    $('adminRules').value = clan?.rules || '';
    $('adminNicks').value = clan?.admin_nicks || '';
    $('adminMembers').value = clan?.members_list || '';
    const imgEl = $('adminClanImage');
    const previewWrap = $('adminClanImagePreview');
    const previewImg = $('adminClanImagePreviewImg');
    const nameEl = $('adminClanImageName');
    const fileEl = $('adminClanImageFile');
    if (fileEl) fileEl.value = '';
    if (clan?.image && clan.image.startsWith('data:')) {
        clanLogoData = clan.image;
        if (imgEl) imgEl.value = '';
        if (previewImg) previewImg.src = clan.image.startsWith('data:image/') ? clan.image : '';
        if (previewWrap) previewWrap.hidden = false;
        if (nameEl) nameEl.textContent = clan.image.startsWith('data:video/') ? 'Загруженное видео' : 'Загруженный файл';
    } else {
        clanLogoData = null;
        if (imgEl) imgEl.value = clan?.image || '';
        if (previewWrap) previewWrap.hidden = true;
        if (nameEl) nameEl.textContent = '';
    }
    const flagEl = $('adminClanFlag'); if (flagEl) flagEl.value = clan?.flag || 'neutral';
    updateFlagPreview('adminClanFlag', 'adminClanFlagPreview');
    const leaderEl = $('adminLeaderNick');
    if (leaderEl) leaderEl.value = clan?.leader_nick || '';
    $('adminPanelMsg').textContent = '';
}
on('saveAdminSettings', 'click', async () => {
    const cid = val('adminClanSelect'); if (!cid) return;
    const clan = clansCache[cid]; if (!clan) return;
    const msg = $('adminPanelMsg');
    const newPass = val('adminNewPass').trim();
    const newAdminPass = val('adminNewAdminPass').trim();
    const finalImage = clanLogoData || val('adminClanImage').trim() || null;
    const payload = {
        discord: val('adminDiscord').trim() || null,
        phone: val('adminPhone').trim() || null,
        news: val('adminNews') || null,
        rules: val('adminRules'),
        game_id: val('adminClanGame') || null,
        alliance_id: val('adminClanAlliance') || null,
        admin_nicks: val('adminNicks') || null,
        members_list: val('adminMembers') || null,
        image: finalImage,
        flag: val('adminClanFlag') || 'neutral',
        leader_nick: val('adminLeaderNick').trim() || null,
        updated_at: new Date().toISOString()
    };
    if (newPass) payload.password = newPass;
    if (newAdminPass) payload.admin_password = newAdminPass;
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
    const clan = clansCache[cid]; if (!clan) return alert('Гильдия не найдена');
    if (!confirm(`Удалить гильдию «${clan.name}»?`)) return;
    const typed = prompt(`Введи название для подтверждения:\n«${clan.name}»`);
    if (typed !== clan.name) return alert('Не совпадает');
    const btn = $('deleteClanBtn'); btn.disabled = true; btn.textContent = '⏳…';
    try {
        for (const t of TABS) await supabase.from(t).delete().eq('clan', cid);
        await supabase.from('events').delete().eq('clan', cid).eq('is_shared', false);
        await supabase.from('treasury').delete().eq('clan', cid);
        await supabase.from('trades').delete().eq('clan', cid);
        await supabase.from('builds').delete().eq('clan', cid).eq('is_shared', false);
        const { error } = await supabase.from('clans').delete().eq('id', cid);
        if (error) throw error;
        delete clansCache[cid];
        if (currentClan === cid) { currentClan = null; ['guild_last_clan','guild_unlocked','guild_my_clan'].forEach(k => localStorage.removeItem(k)); }
        renderHomeCards(); renderAdminClanSelect(); renderScopeSelects(); renderContacts();
        renderTradeClanSelect(); renderTradeClanFilters(); renderAlliancesAdmin(); applyBg();
        $('adminPanelMsg').textContent = '✔ Удалено'; $('adminPanelMsg').style.color = '#6ee7a7';
    } catch (err) { $('adminPanelMsg').textContent = 'Ошибка: ' + err.message; $('adminPanelMsg').style.color = '#ff7a7a'; }
    finally { btn.disabled = false; btn.textContent = '🗑 Удалить гильдию'; }
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   42.  ➕  ДОБАВЛЕНИЕ ГИЛЬДИИ                                         ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
on('openAddClan', 'click', () => {
    ['newClanId','newClanName','newClanDesc','newClanRules','newClanPass','newClanAdminPass','newClanDiscord','newClanImage','newClanBg','newClanLeaderNick','newClanPhone'].forEach(id => { const el = $(id); if (el) el.value = ''; });
    const flagEl = $('newClanFlag'); if (flagEl) flagEl.value = 'neutral';
    updateFlagPreview('newClanFlag', 'newClanFlagPreview');
    renderNewClanGameSelect(); renderAllianceSelects();
    $('newClanAlliance').value = ''; $('addClanMsg').textContent = '';
    newClanLogoData = null;
    const _p = $('newClanImagePreview'); if (_p) _p.hidden = true;
    const _n = $('newClanImageName'); if (_n) _n.textContent = '';
    const _f = $('newClanImageFile'); if (_f) _f.value = '';
    $('addClanModal').hidden = false; $('newClanId').focus();
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
    if (clansCache[id]) { msg.textContent = 'ID занят'; msg.style.color = '#ff7a7a'; return; }
    const finalImage = newClanLogoData || val('newClanImage').trim() || null;
    const payload = {
        id, name, game_id: game,
        description: val('newClanDesc').trim(),
        rules: val('newClanRules'),
        password: pass, admin_password: adminPass || null,
        alliance_id: alliance || null,
        discord: val('newClanDiscord').trim() || null,
        phone: val('newClanPhone').trim() || null,
        image: finalImage,
        flag: val('newClanFlag') || 'neutral',
        leader_nick: val('newClanLeaderNick').trim() || null,
        bg: val('newClanBg').trim() || 'images/bg-main.jpg'
    };
    const { error } = await supabase.from('clans').insert(payload);
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    clansCache[id] = payload;
    renderHomeCards(); renderAdminClanSelect(); renderScopeSelects(); renderContacts();
    renderTradeClanSelect(); renderTradeClanFilters(); renderApplyClanSelect(); renderAlliancesAdmin();
    msg.textContent = '✔ Гильдия создана'; msg.style.color = '#6ee7a7';
    setTimeout(() => { $('addClanModal').hidden = true; }, 800);
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   43.  ⚙️  НАСТРОЙКИ САЙТА                                           ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadSettings() {
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'main').single();
    if (error) return;
    settingsCache = data;
}
function renderSiteFields() {
    const s = settingsCache || {};
    $('adminWebhook').value = s.discord_webhook || '';
    const rssEl = $('adminNewsRss');
    if (rssEl) rssEl.value = s.news_rss_url || 'https://vk.ru/@worldofseabattle';
    $('adminSiteMsg').textContent = '';
}
on('saveSiteSettings', 'click', async () => {
    const msg = $('adminSiteMsg'); msg.style.color = '';
    const rssEl = $('adminNewsRss');
    const payload = {
        discord_webhook: val('adminWebhook').trim() || null,
        news_rss_url: rssEl ? (rssEl.value.trim() || null) : null,
        updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('site_settings').update(payload).eq('id', 'main');
    if (error) { msg.textContent = 'Ошибка: ' + error.message; msg.style.color = '#ff7a7a'; return; }
    settingsCache = Object.assign({ id: 'main' }, settingsCache || {}, payload);
    msg.textContent = '✔ Сохранено'; msg.style.color = '#6ee7a7';
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   44.  📊  СТАТИСТИКА                                                ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
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
            { label: 'Нейтралов', value: n.count || 0, ico: '🟡' },
            { label: 'В личном', value: p.count || 0, ico: '🟠' },
            { label: 'Билды ПВП', value: b1.count || 0, ico: '⚔️' },
            { label: 'Билды ПБ', value: b2.count || 0, ico: '🛡' },
            { label: 'Гильдий', value: c.count || 0, ico: '🏰' },
            { label: 'Сделок', value: t.count || 0, ico: '💰' }
        ];
        stats.forEach(s => {
            const el = document.createElement('div');
            el.className = 'stat-card';
            el.innerHTML = `<div class="stat-value">${s.ico} ${s.value}</div><div class="stat-label">${s.label}</div>`;
            row.appendChild(el);
        });
    } catch (err) { }
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   45.  🔑  ПАРОЛЬ-ПОЛЯ (👁)                                          ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
document.querySelectorAll('.pwd-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const input = $(targetId);
        if (!input) return;
        if (input.type === 'password') {
            input.type = 'text';
            btn.textContent = '🙈';
        } else {
            input.type = 'password';
            btn.textContent = '👁';
        }
    });
});
/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   46.  👤  ПРОФИЛЬ ИГРОКА                                            ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function openProfile(nickname) {
    if (!nickname) return;
    $('profileNickname').textContent = nickname;
    const statsEl = $('profileStats');
    statsEl.innerHTML = '<div class="empty">Загрузка…</div>';
    $('profileModal').hidden = false;
    try {
        const [en, fr, ne, pe, tb, ts] = await Promise.all([
            supabase.from('enemies').select('id', { count: 'exact', head: true }).eq('nickname', nickname),
            supabase.from('friends').select('id', { count: 'exact', head: true }).eq('nickname', nickname),
            supabase.from('neutral').select('id', { count: 'exact', head: true }).eq('nickname', nickname),
            supabase.from('personal').select('id', { count: 'exact', head: true }).eq('nickname', nickname),
            supabase.from('trades').select('id', { count: 'exact', head: true }).eq('nickname', nickname).eq('type', 'buy'),
            supabase.from('trades').select('id', { count: 'exact', head: true }).eq('nickname', nickname).eq('type', 'sell')
        ]);
        const stats = [
            { label: '🔴 В списках врагов', value: en.count || 0 },
            { label: '🟢 В списках друзей', value: fr.count || 0 },
            { label: '⚪ В нейтралитете', value: ne.count || 0 },
            { label: '🟡 В «не трогать»', value: pe.count || 0 },
            { label: '🛒 Заявок на покупку', value: tb.count || 0 },
            { label: '💰 Заявок на продажу', value: ts.count || 0 }
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
        statsEl.innerHTML = stats.map(s => `<div class="profile-stat-row"><span class="profile-stat-label">${s.label}</span><span class="profile-stat-value">${s.value}</span></div>`).join('');
    } catch (err) { statsEl.innerHTML = `<div class="empty">Ошибка: ${err.message}</div>`; }
}
on('closeProfile', 'click', () => { $('profileModal').hidden = true; });
on('profileModal', 'click', e => { if (e.target.id === 'profileModal') $('profileModal').hidden = true; });

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   47.  🔔  УВЕДОМЛЕНИЯ                                                ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
async function loadNotifications() {
    const nick = getViewerNick();
    if (!nick) { notifications = []; renderNotifications(); return; }
    const { data, error } = await supabase.from('notifications').select('*').eq('user_nickname', nick).order('created_at', { ascending: false }).limit(50);
    if (error) return;
    notifications = data || []; renderNotifications();
}
function renderNotifications() {
    const list = $('notifList'); if (!list) return;
    const unread = notifications.filter(n => !n.is_read).length;
    ['notifBadge', 'notifBadge2'].forEach(id => {
        const badge = $(id); if (!badge) return;
        if (unread > 0) { badge.textContent = unread > 99 ? '99+' : unread; badge.hidden = false; }
        else badge.hidden = true;
    });
    ['notifBell', 'notifBell2'].forEach(id => {
        const bell = $(id); if (!bell) return;
        bell.classList.toggle('has-notif', unread > 0);
    });
    if (!notifications.length) { list.innerHTML = '<p class="empty" style="padding:20px;text-align:center;">Уведомлений пока нет</p>'; return; }
    const icons = { event: '📅', trade: '🪙', application: '📝', chat: '💬', system: '⚙️' };
    list.innerHTML = notifications.map(n => `
        <div class="notif-item ${n.is_read ? '' : 'unread'}" data-id="${n.id}">
            <div class="notif-item-icon">${icons[n.type] || '🔔'}</div>
            <div class="notif-item-body">
                <div class="notif-item-title">${escapeHtml(n.title)}</div>
                ${n.body ? `<div class="notif-item-text">${escapeHtml(n.body)}</div>` : ''}
                <div class="notif-item-time">${tradeTimeAgo(n.created_at)}</div>
            </div>
        </div>`).join('');
    list.querySelectorAll('.notif-item').forEach(el => {
        el.addEventListener('click', async () => {
            const id = el.dataset.id;
            const n = notifications.find(x => String(x.id) === String(id));
            if (!n) return;
            if (!n.is_read) {
                await supabase.from('notifications').update({ is_read: true }).eq('id', id);
                n.is_read = true; renderNotifications();
            }
            $('notifPanel').hidden = true;
        });
    });
}
async function createNotification(userNickname, type, title, body, link) {
    if (!userNickname) return;
    try { await supabase.from('notifications').insert({ user_nickname: userNickname, type, title, body: body || null, link: link || null }); } catch (e) { }
}
function openNotifPanel() { $('notifPanel').hidden = false; loadNotifications(); }
function closeNotifPanel() { $('notifPanel').hidden = true; }
on('notifBell', 'click', e => { e.stopPropagation(); $('notifPanel').hidden ? openNotifPanel() : closeNotifPanel(); });
on('notifBell2', 'click', e => { e.stopPropagation(); $('notifPanel').hidden ? openNotifPanel() : closeNotifPanel(); });
document.addEventListener('click', e => {
    const panel = $('notifPanel'); if (!panel || panel.hidden) return;
    if (e.target.closest('#notifPanel')) return;
    if (e.target.closest('#notifBell') || e.target.closest('#notifBell2')) return;
    closeNotifPanel();
});
on('notifMarkAllRead', 'click', async () => {
    const nick = getViewerNick(); if (!nick) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_nickname', nick).eq('is_read', false);
    ['notifBell', 'notifBell2'].forEach(id => { const b = $(id); if (b) b.classList.remove('has-notif'); });
    loadNotifications();
});

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   48.  💭  ЧАТ (гильдия / общий / главы / личный / голос)            ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function setChatMode(mode) {
    chatMode = mode;
    document.querySelectorAll('.chat-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
    const privTab = $('chatPrivateTab');
    if (privTab) { if (chatPrivateWith) { privTab.hidden = false; privTab.textContent = '✉️ ' + chatPrivateWith; } else privTab.hidden = true; }
    const leadersTab = $('chatLeadersTab');
    if (leadersTab) leadersTab.hidden = !isClanLeader();
    const voiceTab = $('chatVoiceTab'); if (voiceTab) voiceTab.hidden = false;
    const clearBtn = $('chatClear'); if (clearBtn) clearBtn.hidden = (!isAdmin && !canEditClan(currentClan)) || mode === 'voice';
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
        else if (mode === 'leaders') input.placeholder = 'Чат глав гильдий...';
        else input.placeholder = 'Чат гильдии...';
    }
    loadChatMessages(); initChatRealtime();
}
let jitsiApi = null, jitsiLoading = false;
function buildVoiceRoomName() {
    if (voiceRoomOverride) return voiceRoomOverride;
    if (chatMode === 'leaders') return 'wosb_leaders_hall';
    if (!currentClan) return 'wosb_common_hall';
    return 'wosb_guild_' + String(currentClan).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}
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
    const container = $('chatVoiceContainer'); if (!container || jitsiApi) return;
    ensureJitsiApi(() => {
        container.innerHTML = '';
        jitsiApi = new window.JitsiMeetExternalAPI('meet.jit.si', {
            roomName: buildVoiceRoomName(), parentNode: container, width: '100%', height: '100%',
            userInfo: { displayName: getViewerNick() || 'Гость' },
            configOverwrite: {
                startWithVideoMuted: true, startWithAudioMuted: false, prejoinPageEnabled: false,
                disableDeepLinking: true, p2p: { enabled: false },
                toolbarButtons: ['microphone','camera','desktop','chat','raisehand','tileview','settings','hangup']
            },
            interfaceConfigOverwrite: { SHOW_JITSI_WATERMARK: false, SHOW_WATERMARK_FOR_GUESTS: false, DEFAULT_BACKGROUND: '#0a0d12' }
        });
        jitsiApi.addEventListener('videoConferenceLeft', () => stopVoiceChat());
        voiceActive = true;
    });
}
function stopVoiceChat() {
    if (jitsiApi) { try { jitsiApi.dispose(); } catch (e) { } jitsiApi = null; }
    const c = $('chatVoiceContainer'); if (c) c.innerHTML = '';
    voiceActive = false;
}
async function loadChatMessages() {
    const container = $('chatMessages'); if (!container) return;
    if (chatMode === 'guild' && !currentClan) { container.innerHTML = '<p class="empty" style="text-align:center;padding:20px;">🏰 Зайдите в гильдию.</p>'; chatMessages = []; return; }
    if (chatMode === 'private' && !chatPrivateWith) { container.innerHTML = '<p class="empty" style="text-align:center;padding:20px;">Выберите получателя.</p>'; chatMessages = []; return; }
    if (chatMode === 'leaders' && !isClanLeader()) { container.innerHTML = '<p class="empty" style="text-align:center;padding:20px;">🎖 Только для глав гильдий.</p>'; chatMessages = []; return; }
    container.innerHTML = '<p class="empty" style="text-align:center;">Загрузка…</p>';
    const myNick = getViewerNick();
    let query = supabase.from('chat_messages').select('*');
    if (chatMode === 'guild') query = query.eq('clan_id', currentClan).is('recipient', null);
    else if (chatMode === 'general') query = query.is('clan_id', null).is('recipient', null);
    else if (chatMode === 'leaders') query = query.eq('clan_id', LEADERS_ROOM).is('recipient', null);
    else if (chatMode === 'private') {
        const other = chatPrivateWith, me = myNick || '__no_nick__';
        query = query.or(`and(nickname.eq.${me},recipient.eq.${other}),and(nickname.eq.${other},recipient.eq.${me})`);
    }
    const { data, error } = await query.order('created_at', { ascending: true }).limit(100);
    if (error) { container.innerHTML = `<p class="empty">Ошибка: ${error.message}</p>`; return; }
    chatMessages = data || []; renderChatMessages();
}
function renderChatMessages() {
    const container = $('chatMessages'); if (!container) return;
    if (!chatMessages.length) { container.innerHTML = '<p class="empty" style="text-align:center;padding:20px;">Сообщений пока нет.</p>'; return; }
    const myNick = getViewerNick().toLowerCase();
    container.innerHTML = chatMessages.map(m => {
        const isMine = myNick && (m.nickname || '').toLowerCase() === myNick;
        const d = new Date(m.created_at);
        const time = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
        const dateStr = d.toLocaleDateString('ru-RU');
        const today = new Date().toLocaleDateString('ru-RU');
        const timeLabel = dateStr === today ? time : `${dateStr} ${time}`;
        const privBadge = m.recipient ? ' ✉️' : '';
        return `
            <div class="chat-message ${isMine ? 'mine' : ''} ${m.recipient ? 'private' : ''}">
                <div class="chat-message-head">
                    <span class="chat-message-author" data-nick="${escapeHtml(m.nickname)}">${escapeHtml(m.nickname)}${privBadge}</span>
                    <span class="chat-message-time">${timeLabel}</span>
                </div>
                <div class="chat-message-text">${escapeHtml(m.text)}</div>
            </div>`;
    }).join('');
    container.scrollTop = container.scrollHeight;
    container.querySelectorAll('.chat-message-author').forEach(el => el.addEventListener('click', () => openProfile(el.dataset.nick)));
}
async function sendChatMessage() {
    const input = $('chatInput'); const text = input.value.trim();
    if (!text) return;
    if (chatMode === 'guild' && !currentClan) { alert('Зайдите в гильдию.'); return; }
    if (chatMode === 'private' && !chatPrivateWith) { alert('Выберите получателя'); return; }
    if (chatMode === 'leaders' && !isClanLeader()) { alert('Только для глав гильдий'); return; }
    let nick = getViewerNick();
    if (!nick) {
        nick = prompt('Введите ваш ник для чата:');
        if (!nick || nick.trim().length < 2) return;
        nick = nick.trim();
        localStorage.setItem(VIEWER_NICK_KEY, nick); sendHeartbeat();
    }
    const payload = { nickname: nick, text };
    if (chatMode === 'guild') payload.clan_id = currentClan;
    else if (chatMode === 'general') { payload.clan_id = null; payload.recipient = null; }
    else if (chatMode === 'leaders') { payload.clan_id = LEADERS_ROOM; payload.recipient = null; }
    else if (chatMode === 'private') { payload.clan_id = null; payload.recipient = chatPrivateWith; }
    $('chatSend').disabled = true;
    const { error } = await supabase.from('chat_messages').insert(payload);
    $('chatSend').disabled = false;
    if (error) { alert('Ошибка: ' + error.message); return; }
    input.value = '';
}
async function clearChat() {
    if (!isAdmin && !canEditClan(currentClan)) return;
    let label;
    if (chatMode === 'general') label = 'ОБЩИЙ чат';
    else if (chatMode === 'private') label = `личные с «${chatPrivateWith}»`;
    else if (chatMode === 'leaders') label = 'чат глав гильдий';
    else label = `чат гильдии «${clansCache[currentClan]?.name || currentClan}»`;
    if (!confirm(`Очистить ${label}?`)) return;
    let query = supabase.from('chat_messages').delete();
    const myNick = getViewerNick();
    if (chatMode === 'guild') query = query.eq('clan_id', currentClan).is('recipient', null);
    else if (chatMode === 'general') query = query.is('clan_id', null).is('recipient', null);
    else if (chatMode === 'leaders') query = query.eq('clan_id', LEADERS_ROOM).is('recipient', null);
    else if (chatMode === 'private') {
        const other = chatPrivateWith;
        query = query.or(`and(nickname.eq.${myNick},recipient.eq.${other}),and(nickname.eq.${other},recipient.eq.${myNick})`);
    }
    const { error } = await query;
    if (error) { alert('Ошибка: ' + error.message); return; }
    chatMessages = []; renderChatMessages();
}
function openChat(mode, opts = {}) {
    const clearBtn = $('chatClear'); if (clearBtn) clearBtn.hidden = !isAdmin && !canEditClan(currentClan);
    $('chatPanel').hidden = false;
    if (mode === 'voice') { voiceRoomOverride = opts.room || null; setChatMode('voice'); }
    else if (mode === 'private' && chatPrivateWith) setChatMode('private');
    else if (mode === 'general') setChatMode('general');
    else if (mode === 'leaders') setChatMode('leaders');
    else if (mode === 'guild') setChatMode('guild');
    else setChatMode(currentClan ? 'guild' : 'general');
}
function openPrivateChat(nickname) {
    if (!nickname) return;
    chatPrivateWith = nickname; openChat('private');
    if (!$('screen-admin').hidden) showScreen('home');
    const lp = $('screen-leader'); if (lp && !lp.hidden) lp.hidden = true;
}
function closeChat() {
    $('chatPanel').hidden = true;
    if (chatChannel) { supabase.removeChannel(chatChannel); chatChannel = null; }
    stopVoiceChat();
}
on('openChatBtn', 'click', () => openChat('guild'));
on('openGeneralChatBtn', 'click', () => openChat('general'));
on('openVoiceChatBtn', 'click', () => openChat('voice'));
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
            const myNick = getViewerNick();
            if (chatMode === 'guild') { if (m.clan_id !== currentClan || m.recipient) return; }
            else if (chatMode === 'general') { if (m.clan_id !== null || m.recipient) return; }
            else if (chatMode === 'leaders') { if (m.clan_id !== LEADERS_ROOM || m.recipient) return; }
            else if (chatMode === 'private') {
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
        }).subscribe();
}

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   49.  📰  НОВОСТИ VK                                                 ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function openVkNewsModal() {
    const modal = $('vkNewsModal'); if (!modal) return;
    modal.classList.remove('vk-news-fullscreen');
    modal.hidden = false; document.body.style.overflow = 'hidden'; loadNews();
}
function closeVkNewsModal() {
    const modal = $('vkNewsModal'); if (!modal) return;
    modal.classList.remove('vk-news-fullscreen');
    modal.hidden = true; document.body.style.overflow = '';
}
async function loadNews() {
    const container = $('vkNewsList'); if (!container) return;
    container.innerHTML = '<div class="vk-news-loading">Загрузка новостей…</div>';
    const srcLink = $('vkNewsSourceLink');
    const sourceUrl = settingsCache?.news_rss_url || `https://vk.com/@${VK_DOMAIN}`;
    if (srcLink) srcLink.href = sourceUrl;
    let domain = VK_DOMAIN;
    try {
        const u = new URL(sourceUrl);
        if (u.pathname.startsWith('/@')) domain = u.pathname.slice(2);
        else if (u.pathname.startsWith('/club')) domain = 'club' + u.pathname.replace('/club', '');
        else if (u.pathname.startsWith('/public')) domain = 'public' + u.pathname.replace('/public', '');
    } catch (e) { }
    try {
        const rssUrl = `https://vk.com/${domain}?act=rss`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;
        const res = await fetch(proxyUrl, { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const text = await res.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');
        const items = xml.querySelectorAll('item');
        if (!items.length) { container.innerHTML = '<div class="vk-news-loading">Новостей не найдено.</div>'; return; }
        container.innerHTML = '';
        const count = Math.min(items.length, VK_POSTS_COUNT);
        for (let i = 0; i < count; i++) {
            const item = items[i];
            const title = item.querySelector('title')?.textContent || 'Без заголовка';
            const link = item.querySelector('link')?.textContent || '#';
            const pubDate = item.querySelector('pubDate')?.textContent || '';
            const desc = item.querySelector('description')?.textContent || '';
            const date = pubDate ? new Date(pubDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
            const tmp = document.createElement('div');
            tmp.innerHTML = desc;
            const cleanDesc = tmp.textContent.replace(/\s+/g, ' ').trim().slice(0, 200);
            const card = document.createElement('article');
            card.className = 'vk-news-item';
            card.innerHTML = `
                <div class="vk-news-header"><span class="vk-news-date">📅 ${escapeHtml(date)}</span></div>
                ${cleanDesc ? `<div class="vk-news-text">${escapeHtml(cleanDesc)}${cleanDesc.length >= 200 ? '…' : ''}</div>` : ''}
                <div class="vk-news-footer"><span class="vk-news-link">Читать полностью →</span></div>`;
            card.addEventListener('click', () => openVkNewsFullscreen({ title, date, link, desc }));
            container.appendChild(card);
        }
    } catch (err) {
        console.warn('VK news error:', err);
        container.innerHTML = `<div class="vk-news-loading">Не удалось загрузить новости. Откройте <a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener" style="color:var(--accent);">сообщество ВКонтакте →</a></div>`;
    }
}
function openVkNewsFullscreen(news) {
    const modal = $('vkNewsModal'); if (!modal) return;
    const body = $('vkNewsList');
    modal.classList.add('vk-news-fullscreen');
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    const tmp = document.createElement('div');
    tmp.innerHTML = news.desc;
    tmp.querySelectorAll('script, style, object, embed').forEach(el => el.remove());
    body.innerHTML = `
        <div class="vk-news-fullscreen-content">
            <div class="vk-news-date" style="margin-bottom:12px;">${escapeHtml(news.date)}</div>
            <h1 style="font-size:28px;margin-bottom:20px;color:var(--text);">${escapeHtml(news.title)}</h1>
            <div class="vk-news-fulltext-body">${tmp.innerHTML}</div>
            <div style="margin-top:28px;padding-top:20px;border-top:1px solid var(--border);">
                <a href="${escapeHtml(news.link)}" target="_blank" rel="noopener" class="vk-news-link" style="font-size:16px;">Открыть в ВКонтакте →</a>
            </div>
        </div>`;
    const closeBtn = $('closeVkNews');
    const restoreFn = () => {
        modal.classList.remove('vk-news-fullscreen');
        modal.hidden = true;
        document.body.style.overflow = '';
        body.innerHTML = '<div class="vk-news-loading">Загрузка…</div>';
        closeBtn.removeEventListener('click', restoreFn);
        modal.removeEventListener('click', outsideClickFn);
    };
    const outsideClickFn = (e) => { if (e.target === modal) restoreFn(); };
    closeBtn.addEventListener('click', restoreFn);
    modal.addEventListener('click', outsideClickFn);
}
on('openVkNewsBtn', 'click', openVkNewsModal);
on('closeVkNews', 'click', closeVkNewsModal);
on('vkNewsModal', 'click', e => { if (e.target.id === 'vkNewsModal') closeVkNewsModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { const m = $('vkNewsModal'); if (m && !m.hidden) closeVkNewsModal(); } });

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   50.  🎖️  ПАНЕЛЬ ГЛАВЫ ГИЛЬДИИ                                       ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
function updateLeaderButtonsVisibility() {
    const show = isClanLeader();
    ['leaderPanelBtn', 'leaderPanelBtn2', 'leaderPanelBtn3'].forEach(id => {
        const btn = $(id); if (btn) btn.hidden = !show;
    });
    const chatLeadersTab = $('chatLeadersTab');
    if (chatLeadersTab) chatLeadersTab.hidden = !show;
}
function openLeaderPanel() {
    const clanId = getLeaderClanId();
    if (!clanId) { alert('У вас нет привязанной гильдии.'); return; }
    const nameEl = $('leaderClanName');
    if (nameEl) nameEl.textContent = clansCache[clanId]?.name || clanId;
    showScreen('leader');
    renderLeaderEvents(clanId);
    renderLeaderAlliances(clanId);
}
function closeLeaderPanel() { showScreen('home'); }
on('leaderBackBtn', 'click', closeLeaderPanel);
['leaderPanelBtn', 'leaderPanelBtn2', 'leaderPanelBtn3'].forEach(id => on(id, 'click', openLeaderPanel));
async function renderLeaderEvents(clanId) {
    const container = $('leaderEventsList'); if (!container) return;
    container.innerHTML = '<div class="empty">Загрузка…</div>';
    const { data: shared, error: e1 } = await supabase.from('events').select('*').eq('is_shared', true).order('event_date', { ascending: true });
    if (e1) { container.innerHTML = `<div class="empty">Ошибка: ${escapeHtml(e1.message)}</div>`; return; }
    const { data: accepted, error: e2 } = await supabase.from('clan_events').select('event_id').eq('clan_id', clanId);
    if (e2) console.warn('clan_events load error:', e2.message);
    const acceptedIds = new Set((accepted || []).map(x => x.event_id));
    if (!shared?.length) { container.innerHTML = '<div class="empty">Общих событий пока нет</div>'; return; }
    const mNames = ['ЯНВ','ФЕВ','МАР','АПР','МАЯ','ИЮН','ИЮЛ','АВГ','СЕН','ОКТ','НОЯ','ДЕК'];
    container.innerHTML = '';
    shared.forEach(ev => {
        const isAccepted = acceptedIds.has(ev.id);
        const d = new Date(ev.event_date);
        const isPast = d.getTime() < Date.now();
        const card = document.createElement('div');
        card.className = 'event-card' + (isPast ? ' past' : '');
        card.innerHTML = `
            <div class="event-date-block">
                <div class="event-day">${String(d.getDate()).padStart(2,'0')}</div>
                <div class="event-month">${mNames[d.getMonth()]}</div>
            </div>
            <div class="event-info">
                <div class="event-title"><span class="event-badge shared">🌐 Общий</span>${escapeHtml(ev.title)}</div>
                <div class="event-time">🕐 ${d.toLocaleDateString('ru-RU')} в ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}</div>
                ${ev.description ? `<div class="event-desc">${escapeHtml(ev.description)}</div>` : ''}
            </div>
            <div class="event-actions">
                <button data-action="${isAccepted ? 'leave' : 'accept'}" class="${isAccepted ? 'ghost' : ''}">
                    ${isAccepted ? '✅ Принято — отменить' : '➕ Принять участие'}
                </button>
            </div>`;
        card.querySelector('[data-action]').addEventListener('click', async () => {
            if (isAccepted) await supabase.from('clan_events').delete().eq('clan_id', clanId).eq('event_id', ev.id);
            else await supabase.from('clan_events').insert({ clan_id: clanId, event_id: ev.id, accepted_by: getViewerNick() || null });
            renderLeaderEvents(clanId);
        });
        container.appendChild(card);
    });
}
async function renderLeaderAlliances(clanId) {
    const incCont = $('leaderAllianceIncoming');
    const outCont = $('leaderAllianceOutgoing');
    if (incCont) incCont.innerHTML = '<div class="empty">Загрузка…</div>';
    if (outCont) outCont.innerHTML = '<div class="empty">Загрузка…</div>';
    const { data: incoming } = await supabase.from('alliance_requests').select('*').eq('to_clan', clanId).eq('status', 'pending').order('created_at', { ascending: false });
    const { data: outgoing } = await supabase.from('alliance_requests').select('*').eq('from_clan', clanId).eq('status', 'pending').order('created_at', { ascending: false });
    if (incCont) {
        incCont.innerHTML = '';
        if (!incoming?.length) incCont.innerHTML = '<div class="empty">Входящих заявок нет</div>';
        else incoming.forEach(r => {
            const card = document.createElement('div');
            card.className = 'application-card pending';
            const fromClan = clansCache[r.from_clan]?.name || r.from_clan;
            card.innerHTML = `
                <div class="application-head">
                    <div class="application-nick">🏰 ${escapeHtml(fromClan)}</div>
                    <div class="application-date">${new Date(r.created_at).toLocaleString('ru-RU')}</div>
                </div>
                ${r.message ? `<div class="application-why">${escapeHtml(r.message)}</div>` : ''}
                <div class="application-actions">
                    <button class="approve">✅ Принять союз</button>
                    <button class="reject">❌ Отклонить</button>
                </div>`;
            card.querySelector('.approve').addEventListener('click', () => respondAllianceRequest(r.id, 'accepted', clanId));
            card.querySelector('.reject').addEventListener('click', () => respondAllianceRequest(r.id, 'rejected', clanId));
            incCont.appendChild(card);
        });
    }
    if (outCont) {
        outCont.innerHTML = '';
        if (!outgoing?.length) outCont.innerHTML = '<div class="empty">Исходящих заявок нет</div>';
        else outgoing.forEach(r => {
            const card = document.createElement('div');
            card.className = 'application-card';
            const toClan = clansCache[r.to_clan]?.name || r.to_clan;
            card.innerHTML = `
                <div class="application-head">
                    <div class="application-nick">🏰 ${escapeHtml(toClan)}</div>
                    <div class="application-date">${new Date(r.created_at).toLocaleString('ru-RU')}</div>
                </div>
                ${r.message ? `<div class="application-why">${escapeHtml(r.message)}</div>` : ''}
                <div class="application-actions"><button class="delete">🗑 Отменить</button></div>`;
            card.querySelector('.delete').addEventListener('click', async () => {
                if (!confirm('Отменить исходящую заявку?')) return;
                await supabase.from('alliance_requests').delete().eq('id', r.id);
                renderLeaderAlliances(clanId);
            });
            outCont.appendChild(card);
        });
    }
}
async function respondAllianceRequest(id, status, clanId) {
    const msg = status === 'accepted' ? 'Принять союз?' : 'Отклонить заявку?';
    if (!confirm(msg)) return;
    const { data: req } = await supabase.from('alliance_requests').select('*').eq('id', id).single();
    if (!req) return;
    await supabase.from('alliance_requests').update({ status, responded_at: new Date().toISOString() }).eq('id', id);
    if (status === 'accepted') {
        let allyId = clansCache[req.from_clan]?.alliance_id || clansCache[req.to_clan]?.alliance_id;
        if (!allyId) {
            allyId = 'union_' + Date.now().toString(36);
            await supabase.from('alliances').insert({
                id: allyId,
                name: `${clansCache[req.from_clan]?.name || req.from_clan} & ${clansCache[req.to_clan]?.name || req.to_clan}`,
                description: 'Автоматически сформирован'
            });
        }
        await supabase.from('clans').update({ alliance_id: allyId }).eq('id', req.from_clan);
        await supabase.from('clans').update({ alliance_id: allyId }).eq('id', req.to_clan);
        await loadAlliances(); await loadClans();
    }
    await createNotification(req.from_clan, 'system',
        status === 'accepted' ? 'Союз заключён' : 'Заявка на союз отклонена',
        `Гильдия ${clansCache[clanId]?.name || clanId} ${status === 'accepted' ? 'приняла союз' : 'отклонила союз'}`,
        null);
    renderLeaderAlliances(clanId);
}
on('leaderOfferAllianceBtn', 'click', () => {
    const sel = $('leaderAlliancePickerSelect'); if (!sel) return;
    const myClanId = getLeaderClanId();
    if (!myClanId) { alert('Нет привязки к гильдии'); return; }
    const myAlliance = clansCache[myClanId]?.alliance_id;
    sel.innerHTML = '';
    let count = 0;
    Object.values(clansCache).forEach(c => {
        if (c.id === myClanId) return;
        if (myAlliance && c.alliance_id === myAlliance) return;
        const o = document.createElement('option');
        o.value = c.id; o.textContent = c.name;
        sel.appendChild(o); count++;
    });
    if (!count) sel.innerHTML = '<option value="">— Нет доступных гильдий —</option>';
    $('leaderAlliancePickerMsg').value = '';
    $('leaderAlliancePickerError').textContent = '';
    $('leaderAlliancePickerModal').hidden = false;
});
on('leaderAlliancePickerCancel', 'click', () => { $('leaderAlliancePickerModal').hidden = true; });
on('leaderAlliancePickerModal', 'click', e => { if (e.target.id === 'leaderAlliancePickerModal') $('leaderAlliancePickerModal').hidden = true; });
on('leaderAlliancePickerSend', 'click', async () => {
    const toClan = val('leaderAlliancePickerSelect');
    const message = val('leaderAlliancePickerMsg').trim();
    const err = $('leaderAlliancePickerError');
    err.textContent = '';
    const myClanId = getLeaderClanId();
    if (!myClanId) { err.textContent = 'Нет привязки к гильдии'; return; }
    if (!toClan) { err.textContent = 'Выберите гильдию'; return; }
    if (toClan === myClanId) { err.textContent = 'Нельзя предложить союз своей гильдии'; return; }
    const { data: existing } = await supabase.from('alliance_requests').select('id').eq('from_clan', myClanId).eq('to_clan', toClan).eq('status', 'pending').maybeSingle();
    if (existing) { err.textContent = 'Заявка уже отправлена'; return; }
    $('leaderAlliancePickerSend').disabled = true;
    const { error } = await supabase.from('alliance_requests').insert({ from_clan: myClanId, to_clan: toClan, message: message || null, status: 'pending' });
    $('leaderAlliancePickerSend').disabled = false;
    if (error) { err.textContent = 'Ошибка: ' + error.message; return; }
    await createNotification(toClan, 'system', 'Заявка на союз', `Гильдия «${clansCache[myClanId]?.name || myClanId}» предлагает союз`, null);
    $('leaderAlliancePickerModal').hidden = true;
    renderLeaderAlliances(myClanId);
});
on('leaderOpenChatBtn', 'click', () => openChat('leaders'));
on('leaderOpenChatTop', 'click', () => openChat('leaders'));
on('leaderOpenVoiceBtn', 'click', () => openChat('voice', { room: 'wosb_leaders_hall' }));
on('leaderOpenVoiceTop', 'click', () => openChat('voice', { room: 'wosb_leaders_hall' }));

/* ╔══════════════════════════════════════════════════════════════════════╗
   ║                                                                      ║
   ║   51.  🚀  СТАРТ                                                      ║
   ║                                                                      ║
   ╚══════════════════════════════════════════════════════════════════════╝ */
(async () => {
    const verEl = document.querySelector('.footer-right');
    if (verEl) verEl.textContent = 'v' + APP_VERSION;
    initTheme();
    const { data: { session } } = await supabase.auth.getSession();
    currentSession = session;
    await loadSiteAdmins();
    await loadGames();
    await loadAlliances();
    await loadClans();
    await loadSettings();
    await loadPartners();
    renderApplyClanSelect();
    await loadFaq();
    await loadTactics();
    await loadShips();
    await loadBuildItems();
    await loadResourcePrices();
    await loadFactions();
    await loadPorts();
    await loadRanks();
    await loadRecipes();
    await loadDiscounts();
    await loadMapSettings();
    fillScShipSelect();
    fillScFactionSelect();
    fillScCities();
    currentMapView = (mapSettings?.default_view) || 'detailed';
    await loadStats();
    initTradeCategorySelect();
    initTradeCategoryFilters();
    updateTradeFormTotal();
    renderTradeClanSelect();
    renderTradeClanFilters();
    await renderTrades();
    await loadNotifications();
    initShipBuilders();
    onBuildItemTypeChange();
    applyAdminUI();
    updateFlagPreview('newClanFlag', 'newClanFlagPreview');
    updateFlagPreview('adminClanFlag', 'adminClanFlagPreview');
    onDiscountTypeChange();
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
        if (onlineSection && onlineSection.classList.contains('active') && isAdmin) renderAdminOnlineList();
        const clanOnlineSection = $('section-online');
        if (clanOnlineSection && clanOnlineSection.classList.contains('active') && canEditClan(currentClan)) {
            renderClanOnlineList();
        }
    }, 15000);
})();
