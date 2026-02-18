const SUPABASE_URL = 'https://glrkrhayqppureihpwnq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdscmtyaGF5cXBwdXJlaWhwd25xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzOTk0MzcsImV4cCI6MjA4Njk3NTQzN30.O2bH1P57b05TkR5F0oQEZhReQ6dAEm7GdYHMtKqpKhk';

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-entrar').addEventListener('click', handleLogin);
    document.getElementById('btn-logout').addEventListener('click', handleLogout);
    document.getElementById('btn-novo-evento').addEventListener('click', () => {
        if (!currentUser.can_edit) return alert("Você tem apenas permissão de visualização.");
        document.getElementById('event-modal').classList.remove('hidden');
    });
    document.getElementById('btn-cancelar').addEventListener('click', () => document.getElementById('event-modal').classList.add('hidden'));
    document.getElementById('btn-salvar').addEventListener('click', saveEvent);
    
    checkSession();
});

async function checkSession() {
    const { data: { session } } = await client.auth.getSession();
    if (session) {
        await loadUserProfile(session.user.id);
    } else {
        document.getElementById('login-screen').classList.remove('hidden');
    }
}

async function handleLogin() {
    const userHandle = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    if(!userHandle || !pass) return alert("Preencha os campos!");
    
    const email = `${userHandle.trim()}@calendario.com`;
    const { data, error } = await client.auth.signInWithPassword({ email, password: pass });

    if (error) alert("Erro: " + error.message);
    else loadUserProfile(data.user.id);
}

async function loadUserProfile(userId) {
    const { data } = await client.from('profiles').select('*').eq('id', userId).single();
    if (data) {
        currentUser = data;
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-header').classList.remove('hidden');
        document.getElementById('main-content').classList.remove('hidden');
        document.getElementById('display-user').innerText = data.username;
        if (data.is_admin) document.getElementById('admin-link').classList.remove('hidden');
        initCalendar();
        subscribeRealtime();
    }
}

function initCalendar() {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    const daysInMonth = 31; // Simplificado para teste
    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        day.innerHTML = `<span>${i}</span><div class="day-events" id="day-${i}"></div>`;
        grid.appendChild(day);
    }
    loadEvents();
}

async function loadEvents() {
    const { data } = await client.from('events').select(`*, profiles:created_by(username, color)`);
    if (data) {
        document.querySelectorAll('.day-events').forEach(el => el.innerHTML = '');
        data.forEach(ev => {
            const day = new Date(ev.start_time).getDate();
            const container = document.getElementById(`day-${day}`);
            if (container) {
                const tag = document.createElement('div');
                tag.className = 'event-tag';
                tag.style.backgroundColor = ev.profiles?.color || '#3b82f6';
                tag.innerText = ev.title;
                container.appendChild(tag);
            }
        });
    }
}

function subscribeRealtime() {
    client.channel('any').on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, loadEvents).subscribe();
}

async function saveEvent() {
    const title = document.getElementById('event-name').value;
    const start = document.getElementById('event-start').value;
    const end = document.getElementById('event-end').value;
    if (!title || !start || !end) return alert("Preencha todos os campos");

    const { error } = await client.from('events').insert([{
        title, start_time: start, end_time: end, created_by: currentUser.id, updated_by: currentUser.id
    }]);
    if (error) alert(error.message);
    else {
        document.getElementById('event-modal').classList.add('hidden');
        document.getElementById('event-name').value = '';
    }
}

function handleLogout() { client.auth.signOut().then(() => location.reload()); }
