import axios from "axios";
import mysql from "mysql2/promise";
import db from "../conexao.js";
import { buscarRespostaDocumento } from "../models/DocumentoModels.js";

const conexao = mysql.createPool(db);
const idUsuario = 1;

// Sinônimos para interpretação
const sinonimos = {
  "oi": ["olá", "ola", "e aí", "opa", "bom dia", "boa tarde", "boa noite", "kaz"],
  "horas": ["que horas são", "sabe a hora", "horário", "tem horas"],
  "frase motivacional": ["me diga algo", "motivação", "mensagem positiva"],
  "data": ["data atual", "qual é a data", "hoje é que dia", "dia de hoje"],
  "nome": ["seu nome", "como você se chama", "quem é você"],
  "clima": ["tempo", "previsão do tempo", "clima de", "tempo em"],
  "calculo": ["quanto é", "calcule", "some", "subtraia", "multiplica", "divida", "vezes", "dividido por", "mais", "menos"],
  "desenvolvedor": ["programador", "dev", "desenvolvedor", "engenheiro de software"],
};

function contemSinonimo(texto, palavraBase) {
  const lista = sinonimos[palavraBase] || [];
  return texto.includes(palavraBase) || lista.some(s => texto.includes(s));
}

export const responderKaz = async (req, res) => {
  const { mensagem } = req.body;
  if (!mensagem || typeof mensagem !== "string") {
    return res.status(400).json({ erro: "Mensagem inválida ou ausente." });
  }

  const texto = mensagem.toLowerCase().trim();
  let resposta = null;

  // Busca no histórico
  try {
    const [msgUsuario] = await conexao.execute(
      `SELECT id, mensagem, data_envio FROM conversas 
       WHERE id_usuario = ? AND remetente = 'usuario' AND mensagem LIKE ? 
       ORDER BY data_envio DESC LIMIT 1`,
      [idUsuario, `%${texto}%`]
    );

    if (msgUsuario.length > 0) {
      const dataMsgUsuario = msgUsuario[0].data_envio;
      const [respostaKaz] = await conexao.execute(
        `SELECT mensagem FROM conversas 
         WHERE id_usuario = ? AND remetente = 'kaz' AND data_envio > ? 
         ORDER BY data_envio ASC LIMIT 1`,
        [idUsuario, dataMsgUsuario]
      );
      if (respostaKaz.length > 0) {
        return res.json({ resposta: respostaKaz[0].mensagem });
      }
    }
  } catch (erro) {
    console.error("Erro ao consultar histórico de conversas:", erro.message);
  }

  // Respostas padrão e interpretadas
  if (contemSinonimo(texto, "oi")) {
    resposta = "Olá! Em que posso te ajudar?";
  } else if (contemSinonimo(texto, "desenvolvedor")) {
    resposta = "Meu desenvolvedor ainda está aprendendo, então posso estar em evolução.";
  } else if (contemSinonimo(texto, "horas")) {
    resposta = `Agora são ${new Date().toLocaleTimeString("pt-BR")}`;
  } else if (contemSinonimo(texto, "frase motivacional")) {
    const frases = [
      "Você é incrível!", "Acredite no seu potencial!", "Tudo vai dar certo!",
      "O sucesso é a soma de pequenos esforços repetidos todos os dias.",
      "Você é mais forte do que imagina.", "Desistir não é uma opção."
    ];
    resposta = frases[Math.floor(Math.random() * frases.length)];
  } else if (contemSinonimo(texto, "data")) {
    resposta = `Hoje é ${new Date().toLocaleDateString("pt-BR")}`;
  } else if (contemSinonimo(texto, "nome")) {
    resposta = "Meu nome é Kaz, o seu assistente virtual!";
  } else if (contemSinonimo(texto, "clima")) {
    const cidade = texto.split("clima de")[1]?.trim() || texto.split("tempo em")[1]?.trim();
    resposta = cidade ? await buscarClimaPorCidade(cidade) : "Por favor, informe a cidade após 'clima de'.";
  } else if (
    contemSinonimo(texto, "calculo") ||
    texto.match(/\d+[\+\-\*\/\%\^\(\)\s]*\d+/)
  ) {
    resposta = calcularExpressao(texto);
  } else if (texto.includes("quem descobriu o brasil")) {
    resposta = "O Brasil foi oficialmente descoberto por Pedro Álvares Cabral em 22 de abril de 1500.";
  } else if (texto.includes("capital do brasil")) {
    resposta = "A capital do Brasil é Brasília.";
  } else if (texto.includes("planeta mais próximo do sol")) {
    resposta = "O planeta mais próximo do Sol é Mercúrio.";
  } else if (texto.includes("velocidade da luz")) {
    resposta = "A velocidade da luz no vácuo é de aproximadamente 299.792.458 metros por segundo.";
  } else if (texto.includes("qual a raiz quadrada de 144")) {
    resposta = "A raiz quadrada de 144 é 12.";
  } else if (texto.includes("quem foi albert einstein")) {
    resposta = "Albert Einstein foi um físico teórico alemão, autor da teoria da relatividade geral.";
  } else if (texto.includes("qual a fórmula da água") || texto.includes("formula da agua")) {
    resposta = "A fórmula da água é H2O.";
  } else if (texto.includes("estados")) {
    resposta = "O Brasil possui 26 estados e 1 Distrito Federal.";
  }

  // Caso não tenha encontrado resposta
  if (!resposta) {
    const respostaDoc = await buscarRespostaDocumento(mensagem);
    resposta = respostaDoc && !respostaDoc.startsWith("Não encontrei")
      ? respostaDoc
      : "Desculpe, não entendi. Pode repetir?";
  }

  return res.json({ resposta });
};

// Função para previsão do tempo
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
    return "Não consegui encontrar o clima da cidade informada.";
  }
};

// Função para interpretar e calcular expressões
const calcularExpressao = (texto) => {
  try {
    const mapaOperadores = {
      "mais": "+", "menos": "-", "vezes": "*", "multiplica": "*", "multiplicado por": "*",
      "dividido por": "/", "divida": "/", "por": "*", "somar": "+", "subtrair": "-",
      "com": "+", "de": "-"
    };

    let expressao = texto.toLowerCase();

    for (const [palavra, operador] of Object.entries(mapaOperadores)) {
      expressao = expressao.replaceAll(palavra, operador);
    }

    expressao = expressao
      .replace("quanto é", "")
      .replace("calcule", "")
      .replace("calculo", "")
      .replace(/[^0-9+\-*/().,\s]/g, "")
      .replace(",", ".")
      .trim();

    if (!/^[\d+\-*/().\s]+$/.test(expressao)) {
      throw new Error("Expressão inválida.");
    }

    const resultado = Function(`"use strict"; return (${expressao})`)();
    if (isNaN(resultado)) throw new Error("Resultado não numérico.");

    return `O resultado é ${resultado}`;
  } catch (erro) {
    console.error("Erro ao calcular expressão:", erro.message);
    return "Não consegui entender ou calcular a expressão que você digitou.";
  }
};
