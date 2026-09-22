import { supabase } from './supabase.js';

console.log('🚀 WosbGame v1.0 start');

async function count(table) {
    const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
    if (error) {
        console.error(`❌ ${table}:`, error.message);
        return 'ошибка';
    }
    return count;
}

(async () => {
    document.getElementById('gamesCount').textContent  = await count('games');
    document.getElementById('clansCount').textContent  = await count('clans_public');
    document.getElementById('chatCount').textContent   = await count('chat_messages');
    document.getElementById('notifCount').textContent  = await count('notifications');
    console.log('✅ Проверка завершена');
})();