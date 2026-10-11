/* ==========================================
   Camilla na Cozinha - script.js
   Unidade 4: JavaScript e interatividade

   O que este arquivo faz:
   1. Destacar um cartão e sortear uma receita
   2. Favoritar receitas (e contar quantas são favoritas)
   3. Buscar receitas e filtrar por categoria
   4. Validar o formulário de sugestão
   ========================================== */


/* ==========================================
   PARTE 1 - DESTACAR E SORTEAR
   ========================================== */

// Rola até o começo do cartão e deixa a borda coral por 2 segundos
function destacar(cartao) {
  cartao.scrollIntoView({ behavior: "smooth", block: "start" });

  cartao.classList.add("destaque");
  setTimeout(function () {
    cartao.classList.remove("destaque");
  }, 2000);
}

// Sorteia uma receita entre as que estão aparecendo na tela
function sortearReceita() {
  // só os botões "Ver receita" de cartões que NÃO estão escondidos pela busca
  var botoes = document.querySelectorAll(".receita:not(.escondido) .btn-ver");

  if (botoes.length === 0) {
    alert("Nenhuma receita para sortear. Limpe a busca e tente de novo.");
    return;                                       // para a função aqui
  }

  var numero = Math.floor(Math.random() * botoes.length);   // de 0 até (total - 1)
  var cartao = botoes[numero].closest(".receita");
  destacar(cartao);
}


/* ==========================================
   PARTE 2 - FAVORITOS
   ========================================== */

var favoritos = [];   // lista com os ids das receitas favoritas

// lê os favoritos guardados no navegador (se existirem)
try {
  favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
} catch (erro) {
  favoritos = [];
}

// monta a frase do contador, de acordo com a quantidade
function frasePorQuantidade(total) {
  if (total === 0) {
    return "Você ainda não tem receitas favoritas.";
  } else if (total === 1) {
    return "Você tem 1 receita favorita.";
  } else {
    return "Você tem " + total + " receitas favoritas.";
  }
}

// atualiza os botões, os cartões e o contador
function mostrarFavoritos() {
  var botoes = document.querySelectorAll(".btn-favorito");

  botoes.forEach(function (botao) {
    var id = botao.dataset.receita;
    var ehFavorita = favoritos.includes(id);

    botao.textContent = ehFavorita ? "Favoritada" : "Favoritar";
    botao.classList.toggle("ativo", ehFavorita);
    document.getElementById(id).classList.toggle("favorita", ehFavorita);
  });

  document.getElementById("contador-favoritas").textContent =
    frasePorQuantidade(favoritos.length);
}

// liga ou desliga o favorito de uma receita
function alternarFavorito(id) {
  if (favoritos.includes(id)) {
    favoritos = favoritos.filter(function (item) {
      return item !== id;                         // tira da lista
    });
  } else {
    favoritos.push(id);                           // coloca na lista
  }

  try {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
  } catch (erro) {
    // se o navegador não deixar guardar, vale só até recarregar a página
  }

  mostrarFavoritos();
}


/* ==========================================
   PARTE 3 - BUSCA E FILTRO
   ========================================== */

// tira acentos e letras maiúsculas ("Abóbora" vira "abobora")
function limparTexto(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// diz se um cartão combina com o que foi digitado e com a categoria escolhida
function combinaComBusca(textoDoCartao, categoriaDoCartao, busca, categoriaEscolhida) {
  var combinaTexto = limparTexto(textoDoCartao).includes(limparTexto(busca));
  var combinaCategoria = categoriaEscolhida === "todas" || categoriaDoCartao === categoriaEscolhida;

  return combinaTexto && combinaCategoria;
}

// mostra ou esconde cada cartão
function filtrarReceitas() {
  var busca = document.getElementById("campo-busca").value.trim();
  var categoria = document.getElementById("filtro-categoria").value;

  var cartoes = document.querySelectorAll(".receita");
  var visiveis = 0;

  cartoes.forEach(function (cartao) {
    var aparece = combinaComBusca(cartao.textContent, cartao.dataset.categoria, busca, categoria);

    cartao.classList.toggle("escondido", !aparece);
    if (aparece) {
      visiveis = visiveis + 1;
    }
  });

  // esconde os grupos (Salgados, Sopas...) que ficaram sem nenhum cartão
  document.querySelectorAll(".grupo").forEach(function (grupo) {
    var temCartao = grupo.querySelector(".receita:not(.escondido)") !== null;
    grupo.classList.toggle("escondido", !temCartao);
  });

  // escreve o resultado na tela
  var resultado = document.getElementById("resultado-busca");
  if (visiveis === 0) {
    resultado.textContent = "Nenhuma receita encontrada.";
  } else {
    resultado.textContent = "Mostrando " + visiveis + " de " + cartoes.length + " receitas.";
  }
}

// limpa a busca e mostra tudo de novo
function limparBusca() {
  document.getElementById("campo-busca").value = "";
  document.getElementById("filtro-categoria").value = "todas";
  filtrarReceitas();
}


/* ==========================================
   PARTE 4 - VALIDAÇÃO DO FORMULÁRIO
   ========================================== */

// confere os campos e devolve uma lista com os erros (vazia = tudo certo)
function conferirCampos(nome, email, mensagem) {
  var erros = [];

  if (nome === "") {
    erros.push("Digite seu nome.");
  }

  if (email === "" || !email.includes("@") || !email.includes(".")) {
    erros.push("Digite um e-mail válido, como voce@exemplo.com.");
  }

  if (mensagem.length < 10) {
    erros.push("Conte a receita com pelo menos 10 letras.");
  }

  return erros;
}

// roda quando a pessoa clica em "Enviar sugestão"
function validarFormulario(evento) {
  var nome = document.getElementById("nome").value.trim();
  var email = document.getElementById("email").value.trim();
  var mensagem = document.getElementById("mensagem").value.trim();

  var erros = conferirCampos(nome, email, mensagem);
  var aviso = document.getElementById("aviso-form");

  if (erros.length > 0) {
    evento.preventDefault();                      // NÃO deixa enviar
    aviso.textContent = erros.join(" ");
    aviso.className = "aviso erro";
  } else {
    aviso.textContent = "Tudo certo! Abrindo o seu e-mail...";
    aviso.className = "aviso ok";                 // deixa enviar
  }
}


/* ==========================================
   PARTE 5 - LIGANDO TUDO AOS BOTÕES E CAMPOS
   ========================================== */

document.getElementById("btn-sortear").addEventListener("click", sortearReceita);

document.querySelectorAll(".btn-ver").forEach(function (botao) {
  botao.addEventListener("click", function () {
    destacar(document.getElementById(botao.dataset.receita));
  });
});

document.querySelectorAll(".btn-favorito").forEach(function (botao) {
  botao.addEventListener("click", function () {
    alternarFavorito(botao.dataset.receita);
  });
});

document.getElementById("campo-busca").addEventListener("input", filtrarReceitas);
document.getElementById("filtro-categoria").addEventListener("change", filtrarReceitas);
document.getElementById("btn-limpar").addEventListener("click", limparBusca);

document.querySelector("#sugestao form").addEventListener("submit", validarFormulario);

// ao abrir a página:
mostrarFavoritos();
filtrarReceitas();
