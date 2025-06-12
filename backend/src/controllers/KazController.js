import axios from "axios";
import mysql from "mysql2/promise";
import db from "../conexao.js";
import { responderPorDocumento, buscarRespostaDocumento } from "../models/DocumentoModels.js";

const conexao = mysql.createPool(db);
const idUsuario = 1; // ID fixo para testes

// Dicionário de sinônimos simples
const sinonimos = {
  "oi": ["olá", "ola", "e aí", "opa", "bom dia", "boa tarde", "boa noite"],
  "horas": ["que horas são", "sabe a hora", "horário", "tem horas"],
  "frase motivacional": ["me diga algo", "motivação", "mensagem positiva"],
  "data": ["data atual", "qual é a data", "hoje é que dia", "dia de hoje"],
  "nome": ["seu nome", "como você se chama", "quem é você"],
  "clima": ["tempo", "previsão do tempo", "clima de"],
  "calculo": ["quanto é", "calcule", "some", "subtraia", "multiplica", "divida"],
};

// Função para verificar se algum sinônimo está presente
function contemSinonimo(texto, palavraBase) {
  const lista = sinonimos[palavraBase] || [];
  return (
    texto.includes(palavraBase) ||
    lista.some((sinonimo) => texto.includes(sinonimo))
  );
}

export const responderKaz = async (req, res) => {
  const { mensagem } = req.body;
  if (!mensagem || typeof mensagem !== "string") {
    return res.status(400).json({ erro: "Mensagem inválida ou ausente." });
  }
  const texto = mensagem.toLowerCase().trim();

  // 1. Tenta buscar resposta nos documentos
  const respostaDoc = await buscarRespostaDocumento(mensagem);
  if (respostaDoc) {
    return res.json({ resposta: respostaDoc });
  }

  // 2. Se não encontrou, usa as respostas automáticas
  let resposta = "Desculpe, não entendi. Pode repetir?";

  if (contemSinonimo(texto, "oi")) {
    resposta = "Olá! Em que posso te ajudar?";
  } else if (contemSinonimo(texto, "horas")) {
    const horaAtual = new Date().toLocaleTimeString("pt-BR");
    resposta = `Agora são ${horaAtual}`;
  } else if (contemSinonimo(texto, "frase motivacional")) {
    const frases = [
      "Você é incrível!",
      "Acredite no seu potencial!",
      "Tudo vai dar certo!",
      "O sucesso é a soma de pequenos esforços repetidos todos os dias.",
      "Você é mais forte do que imagina.",
      "Desistir não é uma opção.",
    ];
    resposta = frases[Math.floor(Math.random() * frases.length)];
  } else if (contemSinonimo(texto, "data")) {
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    resposta = `Hoje é ${dataAtual}`;
  } else if (contemSinonimo(texto, "nome")) {
    resposta = "Meu nome é Kaz, o seu assistente virtual!";
  } else if (contemSinonimo(texto, "clima")) {
    const cidade = texto.split("clima de")[1]?.trim() || texto.split("tempo em")[1]?.trim();
    if (cidade) {
      resposta = await buscarClimaPorCidade(cidade);
    } else {
      resposta = "Por favor, informe o nome da cidade após 'clima de'.";
    }
  }

  return res.json({ resposta });
};

// Função auxiliar: Clima
const buscarClimaPorCidade = async (cidade) => {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      cidade
    )}&appid=${process.env.API_CLIMA}&units=metric&lang=pt`;

    const resposta = await axios.get(url);
    const dados = resposta.data;

    return `O clima em ${dados.name} está ${dados.weather[0].description}, com temperatura de ${dados.main.temp}°C, umidade de ${dados.main.humidity}% e ventos de ${dados.wind.speed} m/s.`;
  } catch (erro) {
    console.error("Erro ao buscar clima:", erro.message);
    return "Não consegui encontrar o clima da cidade informada. Verifique o nome e tente novamente.";
  }
};

// Função auxiliar: Cálculo
const calcularExpressao = (texto) => {
  try {
    let expressao = texto
      .replace("calcule", "")
      .replace("quanto é", "")
      .replace("multiplica", "*")
      .replace("por", "*")
      .replace("divida", "/")
      .replace("some", "+")
      .replace("subtraia", "-")
      .replace("com", "+")
      .replace("de", "-")
      .replace(/[^0-9\+\-\*\/\.\(\)\s]/g, "")
      .trim();

    const resultado = eval(expressao);
    return `O resultado é ${resultado}`;
  } catch (erro) {
    console.error("Erro ao calcular expressão:", erro.message);
    return "Não consegui entender a conta que você quis fazer.";
  }
};
