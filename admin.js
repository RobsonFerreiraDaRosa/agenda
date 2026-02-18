const SUPABASE_URL = 'https://glrkrhayqppureihpwnq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Use a anon key aqui

const adminClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', fetchUsers);

async function fetchUsers() {
    const { data: profiles, error } = await adminClient
        .from('profiles')
        .select('*')
        .order('username', { ascending: true });

    if (error) return console.error(error);
    renderUserTable(profiles);
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

    if (!username || !password) return alert("Preencha tudo!");

    // Chama a Edge Function que você criou no painel do Supabase
    const { data, error } = await adminClient.functions.invoke('create-user', {
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
    if (error) alert("Erro ao atualizar: " + error.message);
}

async function deleteUser(id) {
    if (!confirm("Excluir usuário?")) return;
    // Para deletar você precisará de uma Edge Function também ou usar a Service Key (não seguro)
    alert("Funcionalidade de exclusão deve ser via Edge Function para segurança.");
}
