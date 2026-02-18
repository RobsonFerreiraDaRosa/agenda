// admin.js - VERSÃO SEGURA
const SUPABASE_URL = 'https://glrkrhayqppureihpwnq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdscmtyaGF5cXBwdXJlaWhwd25xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzOTk0MzcsImV4cCI6MjA4Njk3NTQzN30.O2bH1P57b05TkR5F0oQEZhReQ6dAEm7GdYHMtKqpKhk';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function createUser() {
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const isAdmin = document.getElementById('new-is-admin').checked;
    const canEdit = document.getElementById('new-can-edit').checked;

    if (!username || !password) return alert("Preencha tudo!");

    // Chamando a Edge Function em vez de tentar criar direto pelo JS
    const { data, error } = await _supabase.functions.invoke('create-user', {
        body: { username, password, isAdmin, canEdit }
    });

    if (error) {
        alert("Erro na Função: " + error.message);
    } else {
        alert("Usuário criado com segurança via Edge Function!");
        location.reload();
    }
}

// O restante das funções (fetchUsers, updateToggle) permanece usando o _supabase padrão
// Certifique-se de que as Policies (RLS) no SQL permitem que o usuário logado
// como admin faça o SELECT e UPDATE na tabela profiles.
// Carregar lista ao iniciar
document.addEventListener('DOMContentLoaded', fetchUsers);

async function fetchUsers() {
    const { data: profiles, error } = await _admin
        .from('profiles')
        .select('*')
        .order('username', { ascending: true });

    if (error) return console.error(error);
    renderUserTable(profiles);
}

function renderUserTable(users) {
    const tbody = document.getElementById('user-table-body');
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

// FUNÇÃO MESTRE: Criar Usuário no Auth e no Profile
async function createUser() {
    const user = document.getElementById('new-username').value;
    const pass = document.getElementById('new-password').value;
    const isAdmin = document.getElementById('new-is-admin').checked;
    const canEdit = document.getElementById('new-can-edit').checked;

    if (!user || !pass) return alert("Preencha todos os campos!");

    const email = `${user}@calendario.com`;

    // 1. Cria no Auth do Supabase
    const { data, error: authError } = await _admin.auth.admin.createUser({
        email: email,
        password: pass,
        email_confirm: true
    });

    if (authError) {
        alert("Erro no Auth: " + authError.message);
        return;
    }

    // 2. O Trigger SQL que criamos anteriormente já deve criar o profile automaticamente.
    // Mas vamos forçar uma atualização das permissões que marcamos no formulário:
    await _admin.from('profiles').update({
        is_admin: isAdmin,
        can_edit: canEdit
    }).eq('id', data.user.id);

    alert(`Usuário ${user} criado com sucesso!`);
    location.reload();
}

async function updateToggle(id, field, value) {
    const { error } = await _admin.from('profiles').update({ [field]: value }).eq('id', id);
    if (error) alert("Erro ao atualizar: " + error.message);
}

async function deleteUser(id) {
    if (!confirm("Tem certeza que deseja remover este usuário? Isso é irreversível.")) return;
    
    // Remove do Auth (O Cascade no SQL removerá o profile)
    const { error } = await _admin.auth.admin.deleteUser(id);
    if (error) alert(error.message);
    else fetchUsers();
}
