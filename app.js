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
