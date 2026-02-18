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
