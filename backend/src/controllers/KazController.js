import axios from "axios";
import mysql from "mysql2/promise";
import db from "../conexao.js";

const conexao = mysql.createPool(db);
const idUsuario = 1; // Ajuste conforme sua lógica de autenticação

export const responderKaz = async (req, res) => {
  const { mensagem } = req.body;

  if (!mensagem || typeof mensagem !== "string") {
    return res.status(400).json({ erro: "Mensagem inválida ou ausente." });
  }

  const texto = mensagem.toLowerCase().trim();
  console.log("Mensagem recebida:", texto);

  try {
    // 1) Buscar última mensagem parecida do usuário
    const [msgUsuario] = await conexao.execute(
      `SELECT id, mensagem, data_envio FROM conversas 
       WHERE id_usuario = ? AND remetente = 'usuario' AND mensagem LIKE ? 
       ORDER BY data_envio  DESC LIMIT 1`,
      [idUsuario, `%${texto}%`]
    );

    if (msgUsuario.length > 0) {
      const dataMsgUsuario = msgUsuario[0].data;

      // 2) Buscar a resposta do Kaz após essa mensagem
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

  // Resposta padrão
  let resposta = "Desculpe, não entendi. Pode repetir?";

  if (texto.includes("oi") || texto.includes("olá") || texto.includes("ola")) {
    resposta = "Olá! Em que posso te ajudar?";
  } else if (texto.includes("horas") || texto.includes("qual a hora")) {
    const horaAtual = new Date().toLocaleTimeString("pt-BR");
    resposta = `Agora são ${horaAtual}`;
  } else if (
    texto.includes("me diga algo") ||
    texto.includes("frase motivacional")
  ) {
    const frases = [
      "Você é incrível!",
      "Acredite no seu potencial!",
      "Tudo vai dar certo!",
      "O sucesso é a soma de pequenos esforços repetidos todos os dias.",
      "Você é mais forte do que imagina.",
      "Desistir não é uma opção.",
    ];
    resposta = frases[Math.floor(Math.random() * frases.length)];
  } else if (texto.includes("qual a data") || texto.includes("data atual")) {
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    resposta = `Hoje é ${dataAtual}`;
  } else if (texto.includes("qual é o seu nome") || texto.includes("nome")) {
    resposta = "Meu nome é Kaz, o seu assistente virtual!";
  } else if (texto.includes("clima de") || texto.includes("clima")) {
    const cidade = texto.split("clima de")[1]?.trim();
    if (cidade) {
      resposta = await buscarClimaPorCidade(cidade);
    } else {
      resposta = "Por favor, informe o nome da cidade após 'clima de'.";
    }
  } else if (
    texto.match(/\d+[\+\-\*\/\%\^\(\)\s]*\d+/) ||
    texto.includes("calcule") ||
    texto.includes("quanto é") ||
    texto.includes("some") ||
    texto.includes("subtraia") ||
    texto.includes("multiplica") ||
    texto.includes("divida")
  ) {
    resposta = calcularExpressao(texto);
  } else if (texto.includes("quem descobriu o brasil")) {
    resposta =
      "O Brasil foi oficialmente descoberto por Pedro Álvares Cabral em 22 de abril de 1500.";
  } else if (texto.includes("capital do brasil")) {
    resposta = "A capital do Brasil é Brasília.";
  } else if (texto.includes("planeta mais próximo do sol")) {
    resposta = "O planeta mais próximo do Sol é Mercúrio.";
  } else if (texto.includes("velocidade da luz")) {
    resposta =
      "A velocidade da luz no vácuo é de aproximadamente 299.792.458 metros por segundo.";
  } else if (texto.includes("qual a raiz quadrada de 144")) {
    resposta = "A raiz quadrada de 144 é 12.";
  } else if (texto.includes("quem foi albert einstein")) {
    resposta =
      "Albert Einstein foi um físico teórico alemão, autor da teoria da relatividade geral.";
  } else if (texto.includes("qual a fórmula da água") || texto.includes("formula da agua")) {
    resposta = "A fórmula da água é H2O.";
  } else if (texto.includes("estados")) {
    resposta = "O Brasil possui 26 estados e 1 Distrito Federal.";
  }

  return res.json({ resposta });
};

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

const calcularExpressao = (texto) => {
  try {
    let expressao = texto
      .replace("calcule", "")
      .replace("quanto é", "")
      .replace("multiplica", "")
      .replace("por", "*")
      .replace("divida", "")
      .replace("por", "/")
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
