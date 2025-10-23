// Função para mostrar alertas personalizados
function mostrarAlerta(mensagem, tipo = 'danger') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${tipo} alert-dismissible fade show alert-custom`;
  alertDiv.innerHTML = `
    ${mensagem}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Função para validar e processar funcionários
function validarFuncionarios(input) {
  // Remove espaços extras no início e fim
  input = input.trim();
  
  // Se estiver vazio, retorna erro
  if (!input) {
    return { valido: false, mensagem: 'Digite pelo menos um funcionário!' };
  }
  
  // Divide por vírgulas OU espaços (aceita ambos os formatos)
  let funcionariosArray;
  
  // Se tem vírgula, divide por vírgula
  if (input.includes(',')) {
    funcionariosArray = input.split(',')
      .map(f => f.trim())
      .filter(f => f !== '');
  } else {
    // Se não tem vírgula, divide por espaços
    funcionariosArray = input.split(/\s+/)
      .map(f => f.trim())
      .filter(f => f !== '');
  }
  
  // Verifica se tem mais de 10 funcionários
  if (funcionariosArray.length > 10) {
    return { 
      valido: false, 
      mensagem: `Você digitou ${funcionariosArray.length} nomes. O limite é 10 funcionários!`,
      quantidade: funcionariosArray.length
    };
  }
  
  // Verifica se cada nome tem pelo menos 3 caracteres E no máximo 15 caracteres
  for (let i = 0; i < funcionariosArray.length; i++) {
    const nome = funcionariosArray[i];
    
    if (nome.length < 3) {
      return {
        valido: false,
        mensagem: 'Cada nome de funcionário deve ter no mínimo 3 caracteres!',
        quantidade: funcionariosArray.length
      };
    }
    
    if (nome.length > 50) {
      return {
        valido: false,
        mensagem: `O nome "${nome.substring(0, 30)}..." é muito longo (máx 15 caracteres por nome)!`,
        quantidade: funcionariosArray.length
      };
    }
  }
  
  // Verifica se há nomes duplicados
  const nomesUnicos = new Set(funcionariosArray.map(n => n.toLowerCase()));
  if (nomesUnicos.size !== funcionariosArray.length) {
    return {
      valido: false,
      mensagem: 'Há nomes de funcionários duplicados! Cada funcionário deve ser único.',
      quantidade: funcionariosArray.length
    };
  }
  
  // Se passou por todas as validações
  return {
    valido: true,
    funcionarios: funcionariosArray,
    quantidade: funcionariosArray.length
  };
}

// Atualizar contador em tempo real
document.getElementById('funcionariosProjeto').addEventListener('input', function(e) {
  const input = e.target.value;
  
  // Bloqueia se houver uma sequência de mais de 15 caracteres sem espaço ou vírgula
  const palavras = input.split(/[\s,]+/);
  const palavraLonga = palavras.find(p => p.length > 15);
  
  if (palavraLonga) {
    // Remove o último caractere digitado
    e.target.value = input.slice(0, -1);
    
    const contador = document.getElementById('contadorFuncionarios');
    contador.className = 'contador-funcionarios contador-erro';
    contador.innerHTML = '✗ Nome muito longo! Use ESPAÇO ou VÍRGULA para separar os nomes (máx 15 caracteres por nome)';
    return;
  }
  
  const resultado = validarFuncionarios(input);
  const contador = document.getElementById('contadorFuncionarios');
  
  if (input.trim() === '') {
    contador.innerHTML = '';
    return;
  }
  
  if (resultado.valido) {
    contador.className = 'contador-funcionarios contador-ok';
    contador.innerHTML = `✓ ${resultado.quantidade} funcionário(s) detectado(s)`;
  } else {
    contador.className = 'contador-funcionarios contador-erro';
    contador.innerHTML = `✗ ${resultado.mensagem}`;
  }
});

// Função para carregar os projetos do LocalStorage
function carregarProjetos() {
  const projetos = JSON.parse(localStorage.getItem('projetos')) || [];
  const tbody = document.querySelector('#tabelaProjetos tbody');
  tbody.innerHTML = '';

  if (projetos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-muted">Nenhum projeto cadastrado ainda.</td></tr>';
    return;
  }

  projetos.forEach((projeto, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${projeto.nome}</td>
      <td>${projeto.descricao}</td>
      <td>${projeto.funcionarios}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="excluirProjeto(${index})">Excluir</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Função para salvar um novo projeto
document.getElementById('formProjeto').addEventListener('submit', function(event) {
  event.preventDefault();
  
  const nome = document.getElementById('nomeProjeto').value.trim();
  const descricao = document.getElementById('descricaoProjeto').value.trim();
  const funcionariosInput = document.getElementById('funcionariosProjeto').value;

  // Validar funcionários
  const validacao = validarFuncionarios(funcionariosInput);
  
  if (!validacao.valido) {
    mostrarAlerta(validacao.mensagem, 'danger');
    return;
  }

  // Se passou na validação, salva o projeto
  if (nome && descricao) {
    const projetos = JSON.parse(localStorage.getItem('projetos')) || [];
    projetos.push({
      nome,
      descricao,
      funcionarios: validacao.funcionarios.join(', ')
    });
    
    localStorage.setItem('projetos', JSON.stringify(projetos));
    mostrarAlerta('Projeto cadastrado com sucesso!', 'success');
    this.reset();
    document.getElementById('contadorFuncionarios').innerHTML = '';
    carregarProjetos();
  }
});

// Função para excluir um projeto
function excluirProjeto(index) {
  if (confirm('Tem certeza que deseja excluir este projeto?')) {
    const projetos = JSON.parse(localStorage.getItem('projetos')) || [];
    projetos.splice(index, 1);
    localStorage.setItem('projetos', JSON.stringify(projetos));
    mostrarAlerta('Projeto excluído com sucesso!', 'warning');
    carregarProjetos();
  }
}

// Carregar projetos ao abrir a página
carregarProjetos();