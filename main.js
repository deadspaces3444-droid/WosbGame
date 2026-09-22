import { supabase } from './supabase.js';

console.log('🚀 WosbGame v1.0 start');

// Проверка связи с БД и новых таблиц
(async () => {
    const checks = [
        { name: 'games',         q: supabase.from('games').select('*', { count: 'exact', head: true }) },
        { name: 'clans_public',  q: supabase.from('clans_public').select('*', { count: 'exact', head: true }) },
        { name: 'chat_messages', q: supabase.from('chat_messages').select('*', { count: 'exact', head: true }) },
        { name: 'notifications', q: supabase.from('notifications').select('*', { count: 'exact', head: true }) }
    ];

    for (const { name, q } of checks) {
        const { count, error } = await q;
        if (error) console.error(`❌ ${name}:`, error.message);
        else console.log(`✅ ${name}: ${count} записей`);
    }
})();