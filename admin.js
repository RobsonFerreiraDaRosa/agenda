const SUPABASE_URL = 'https://glrkrhayqppureihpwnq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdscmtyaGF5cXBwdXJlaWhwd25xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzOTk0MzcsImV4cCI6MjA4Njk3NTQzN30.O2bH1P57b05TkR5F0oQEZhReQ6dAEm7GdYHMtKqpKhk';

const adminClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-create-user').addEventListener('click', createUser);
    fetchUsers();
});

async function fetchUsers() {
    const { data: profiles, error } = await adminClient.from('profiles').select('*').order('username');
    if (profiles) {
        document.getElementById('user-table-body').innerHTML = profiles.map(user => `
            <tr>
                <td><strong>${user.username}</strong></td>
                <td><input type="checkbox" ${user.is_admin ? 'checked' : ''} onchange="updateUser('${user.id}', 'is_admin', this.checked)"></td>
                <td><input type="checkbox" ${user.can_edit ? 'checked' : ''} onchange="updateUser('${user.id}', 'can_edit', this.checked)"></td>
                <td><input type="color" value="${user.color}" onchange="updateUser('${user.id}', 'color', this.value)"></td>
                <td><button onclick="deleteUser('${user.id}')" class="btn-danger">Remover</button></td>
            </tr>
        `).join('');
    }
}

async function createUser() {
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const isAdmin = document.getElementById('new-is-admin').checked;
    const canEdit = document.getElementById('new-can-edit').checked;

    const { data, error } = await adminClient.functions.invoke('create-user', {
        body: { username, password, isAdmin, canEdit }
    });

    if (error) alert("Erro: " + error.message);
    else { alert("Sucesso!"); fetchUsers(); }
}

async function updateUser(id, field, value) {
    await adminClient.from('profiles').update({ [field]: value }).eq('id', id);
}

async function deleteUser(id) {
    if (confirm("Confirmar exclusão?")) alert("Ação bloqueada. Use uma Edge Function para deletar do Auth.");
}
