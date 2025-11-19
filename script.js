// Espera o carregamento completo do DOM antes de executar qualquer lógica
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname; // Caminho atual da URL
  const formEntrega = document.getElementById("formEntrega"); // Formulário da entrega (caso exista)

  // ========================================
  // LÓGICA DA PÁGINA DE CADASTRO
  // ========================================
  if (path.includes("cadastro.html")) {
    const inputNome = document.getElementById("nome");
    const btnNome = document.getElementById("entrarNome");
    const btnAnonimo = document.getElementById("entrarAnonimo");

    // Função para entrar com nome ou como Anônimo
    function entrarComNome(nome) {
      const nomeFinal = nome && nome.trim() !== "" ? nome.trim() : "Anônimo";
      localStorage.setItem("usuarioNome", nomeFinal); // Salva nome no localStorage
      window.location.href = "dashboard.html"; // Redireciona para o dashboard
    }

    // Botão: Entrar com nome digitado
    if (btnNome && inputNome) {
      btnNome.addEventListener("click", () => {
        entrarComNome(inputNome.value);
      });
    }

    // Botão: Entrar como Anônimo
    if (btnAnonimo) {
      btnAnonimo.addEventListener("click", () => {
        entrarComNome("Anônimo");
      });
    }
  }

  // ========================================
  // LÓGICA DA PÁGINA DO DASHBOARD
  // ========================================
  if (path.includes("dashboard.html")) {
    const nomeUsuario = localStorage.getItem("usuarioNome") || "Anônimo";
    const nomeElemento = document.getElementById("nomeUsuario");
    const pontosElemento = document.getElementById("pontos");
    const tabelaHistorico = document.querySelector("#tabelaHistorico tbody");

    // Mostra o nome do usuário na tela
    if (nomeElemento) nomeElemento.textContent = nomeUsuario;

    // Se não existir pontuação, inicializa com 0
    if (!localStorage.getItem(`pontos_${nomeUsuario}`)) {
      localStorage.setItem(`pontos_${nomeUsuario}`, "0");
    }

    // Mostra os pontos atuais
    if (pontosElemento) {
      pontosElemento.textContent = localStorage.getItem(
        `pontos_${nomeUsuario}`
      );
    }

    // ----------------------------------------
    // REGISTRO DE ENTREGA DE RESÍDUO
    // ----------------------------------------
    if (formEntrega) {
      formEntrega.addEventListener("submit", (e) => {
        e.preventDefault();

        const tipo = document.getElementById("tipo").value;
        const quantidade = parseFloat(
          document.getElementById("quantidade").value
        );

        // Validação básica
        if (!tipo || isNaN(quantidade) || quantidade <= 0) {
          alert("Preencha todos os campos corretamente!");
          return;
        }

        // Tabela de pontos por tipo
        const pontosPorKg = {
          plastico: 10,
          papel: 5,
          vidro: 8,
          metal: 12,
        };

        // Tipo inválido
        if (!pontosPorKg.hasOwnProperty(tipo)) {
          alert("Tipo de resíduo inválido.");
          return;
        }

        // Cálculo de pontos ganhos
        const pontosGanhos = quantidade * pontosPorKg[tipo];

        // Atualiza pontos do usuário
        let pontosAtuais =
          parseFloat(localStorage.getItem(`pontos_${nomeUsuario}`)) || 0;
        pontosAtuais += pontosGanhos;
        localStorage.setItem(`pontos_${nomeUsuario}`, pontosAtuais.toString());

        if (pontosElemento) {
          pontosElemento.textContent = pontosAtuais.toString();
        }

        // Atualiza histórico
        const historico =
          JSON.parse(localStorage.getItem(`historico_${nomeUsuario}`)) || [];

        const novaEntrega = {
          tipo,
          quantidade,
          pontos: pontosGanhos,
          data: new Date().toLocaleString("pt-BR"),
        };

        historico.push(novaEntrega);
        localStorage.setItem(
          `historico_${nomeUsuario}`,
          JSON.stringify(historico)
        );

        exibirHistorico(); // Atualiza histórico imediatamente
        exibirRecompensas(); // Atualiza catálogo de recompensas
        formEntrega.reset(); // Limpa formulário

        alert(`Entrega registrada! Você ganhou ${pontosGanhos} pontos.`);
      });

      atualizarCatalogo(); // Garante renderização correta ao carregar
    }

    // ----------------------------------------
    // EXIBIÇÃO DO HISTÓRICO
    // ----------------------------------------
    function exibirHistorico() {
      const historico =
        JSON.parse(localStorage.getItem(`historico_${nomeUsuario}`)) || [];
      tabelaHistorico.innerHTML = ""; // Limpa tabela

      if (historico.length === 0) {
        const linha = tabelaHistorico.insertRow();
        const celula = linha.insertCell();
        celula.colSpan = 4;
        celula.textContent = "Nenhuma entrega registrada ainda.";
        celula.style.textAlign = "center";
        celula.style.color = "#777";
        return;
      }

      historico.forEach((entrada) => {
        const linha = tabelaHistorico.insertRow();
        linha.insertCell().textContent = entrada.data;
        linha.insertCell().textContent = entrada.tipo;
        linha.insertCell().textContent = entrada.quantidade;
        linha.insertCell().textContent = entrada.pontos;
      });
    }

    // ----------------------------------------
    // 🎁 CATÁLOGO DE RECOMPENSAS
    // ----------------------------------------
    const recompensas = [
      { nome: "Camiseta Ecológica", custo: 50 },
      { nome: "Caneca Sustentável", custo: 30 },
      { nome: "Ecobag Reutilizável", custo: 20 },
    ];

    // Exibe as recompensas com base na pontuação atual
    function exibirRecompensas() {
      const container = document.getElementById("listaRecompensas");
      container.innerHTML = ""; // Limpa conteúdo antigo

      const pontosUsuario =
        parseFloat(localStorage.getItem(`pontos_${nomeUsuario}`)) || 0;

      recompensas.forEach((item) => {
        const div = document.createElement("div");
        div.className = "recompensa-item";

        const info = document.createElement("div");
        info.className = "recompensa-info";
        info.innerHTML = `<strong>${item.nome}</strong><span>${item.custo} pontos</span>`;

        const botao = document.createElement("button");
        botao.className = "recompensa-botao";
        botao.textContent = "Resgatar";
        botao.setAttribute("data-custo", item.custo);
        botao.disabled = pontosUsuario < item.custo;

        // Evento de resgate
        botao.addEventListener("click", () => {
          const confirmacao = confirm(
            `Deseja realmente resgatar "${item.nome}" por ${item.custo} pontos?`
          );

          if (confirmacao) {
            const novosPontos = pontosUsuario - item.custo;
            localStorage.setItem(
              `pontos_${nomeUsuario}`,
              novosPontos.toString()
            );
            pontosElemento.textContent = novosPontos;

            alert(`Você resgatou "${item.nome}" com sucesso!`);

            atualizarCatalogo(); // 🛠️ Corrige o bug de manter botões verdes após resgate
          }
        });

        div.appendChild(info);
        div.appendChild(botao);
        container.appendChild(div);
      });

      atualizarCatalogo(); // Habilita/desabilita os botões corretamente
    }

    // Atualiza estado dos botões (disponível ou não)
    function atualizarCatalogo() {
      const pontosUsuario =
        parseFloat(localStorage.getItem(`pontos_${nomeUsuario}`)) || 0;
      const botoes = document.querySelectorAll(".recompensa-botao");

      botoes.forEach((botao) => {
        const custo = parseInt(botao.getAttribute("data-custo"));
        if (pontosUsuario >= custo) {
          botao.disabled = false;
          botao.classList.add("disponivel");
        } else {
          botao.disabled = true;
          botao.classList.remove("disponivel");
        }
      });
    }

    // Inicializa o dashboard
    exibirHistorico(); // Carrega histórico
    exibirRecompensas(); // Carrega catálogo
    atualizarCatalogo(); // Ajusta botões de resgate
  }
});
