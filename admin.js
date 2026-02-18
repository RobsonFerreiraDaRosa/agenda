const SUPABASE_URL = 'https://glrkrhayqppureihpwnq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdscmtyaGF5cXBwdXJlaWhwd25xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzOTk0MzcsImV4cCI6MjA4Njk3NTQzN30.O2bH1P57b05TkR5F0oQEZhReQ6dAEm7GdYHMtKqpKhk';

const adminClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', fetchUsers);

async function fetchUsers() {
    const { data: profiles, error } = await adminClient
        .from('profiles')
        .select('*')
        .order('username', { ascending: true });

    if (error) console.error(error);
    else renderUserTable(profiles);
}

function renderUserTable(users) {
    const tbody = document.getElementById('user-table-body');
    if(!tbody) return;
    tbody.innerHTML = users.map(user => `
        <tr>
            <td><strong>${user.username}</strong></td>
            <td><input type="checkbox" ${user.is_admin ? 'checked' : ''} onchange="updateToggle('${user.id}', 'is_admin', this.checked)"></td>
            <td><input type="checkbox" ${user.can_edit ? 'checked' : ''} onchange="updateToggle('${user.id}', 'can_edit', this.checked)"></td>
            <td><input type="color" value="${user.color}" onchange="updateToggle('${user.id}', 'color', this.value)"></td>
            <td><button onclick="deleteUser('${user.id}')" class="btn-danger">Remover</button></td>
        </tr>
    `).join('');
}

async function createUser() {
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const isAdmin = document.getElementById('new-is-admin').checked;
    const canEdit = document.getElementById('new-can-edit').checked;

    if (!username || !password) return alert("Preencha os campos!");

    const { error } = await adminClient.functions.invoke('create-user', {
        body: { username, password, isAdmin, canEdit }
    });

    if (error) alert("Erro: " + error.message);
    else {
        alert("Usuário criado com sucesso!");
        fetchUsers();
    }
}

async function updateToggle(id, field, value) {
    const { error } = await adminClient.from('profiles').update({ [field]: value }).eq('id', id);
    if (error) alert("Erro: " + error.message);
}

async function deleteUser(id) {
    if (confirm("Deseja excluir este usuário?")) {
        alert("A exclusão deve ser configurada via Edge Function por segurança.");
    }
}
