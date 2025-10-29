const API_URL = "http://localhost:8080/api/projeto"; 

function mostrarAlerta(mensagem, tipo = 'danger') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${tipo} alert-dismissible fade show alert-custom position-fixed top-0 start-50 translate-middle-x mt-3`;
  alertDiv.style.zIndex = 2000;
  alertDiv.innerHTML = `
    ${mensagem}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 5000);
}

async function carregarProjetos() {
  const tbody = document.querySelector('#tabelaProjetos tbody');
  tbody.innerHTML = '<tr><td colspan="4" class="text-muted">Carregando...</td></tr>';

  try {
    const resposta = await fetch(API_URL);
    if (!resposta.ok) throw new Error('Erro ao buscar projetos.');

    const projetos = await resposta.json();

    if (projetos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-muted">Nenhum projeto cadastrado ainda.</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    projetos.forEach(projeto => {
      const funcionariosNomes = projeto.funcionarios?.map(f => f.funcionario?.nome ?? '—').join(', ') || '—';
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${projeto.id}</td>
        <td>${projeto.descricao}</td>
        <td>${funcionariosNomes}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="excluirProjeto(${projeto.id})">Excluir</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (erro) {
    console.error(erro);
    tbody.innerHTML = '<tr><td colspan="4" class="text-danger">Erro ao carregar projetos.</td></tr>';
  }
}

document.getElementById('formProjeto').addEventListener('submit', async function (event) {
  event.preventDefault();

  const descricao = document.getElementById('descricaoProjeto').value.trim();
  const funcionariosInput = document.getElementById('funcionariosProjeto').value.trim();

  if (!descricao || !funcionariosInput) {
    mostrarAlerta('Preencha todos os campos obrigatórios!', 'warning');
    return;
  }

  const funcionarios = funcionariosInput.split(';')
    .map(f => f.trim())
    .filter(f => f.length > 0);

  if (funcionarios.length === 0) {
    mostrarAlerta('Informe pelo menos um funcionário!', 'danger');
    return;
  }
  const novoProjeto = {
    descricao: descricao,
    dataInicio: new Date().toISOString(),
    dataFim: null,
    funcionarios: funcionarios
  };

  try {
    const respostaProjeto = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoProjeto)
    });

    if (!respostaProjeto.ok) {
      throw new Error('Erro ao criar projeto');
    }

    mostrarAlerta('Projeto criado com sucesso!', 'success');
    this.reset();
    carregarProjetos(); 
  } catch (erro) {
    console.error(erro);
    mostrarAlerta('Erro ao criar projeto.', 'danger');
  }
});

async function excluirProjeto(id) {
  if (!confirm('Tem certeza que deseja excluir este projeto?')) return;

  try {
    const resposta = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!resposta.ok) throw new Error('Erro ao excluir projeto');
    mostrarAlerta('Projeto excluído com sucesso!', 'warning');
    carregarProjetos();
  } catch (erro) {
    console.error(erro);
    mostrarAlerta('Erro ao excluir projeto.', 'danger');
  }
}

carregarProjetos();
