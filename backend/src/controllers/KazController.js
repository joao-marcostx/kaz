import axios from "axios";
import db from "../conexao.js";
import mysql from "mysql2/promise";

const conexao = mysql.createPool(db);

const idUsuario = 52; // Ajuste conforme o usuário logado, se tiver autenticação

export const responderKaz = async (req, res) => {
  const { mensagem } = req.body;

  if (!mensagem || typeof mensagem !== "string") {
    return res.status(400).json({ erro: "Mensagem inválida ou ausente." });
  }

  const texto = mensagem.toLowerCase().trim();
  console.log("Mensagem recebida:", texto);

  try {
    // 1) Buscar última mensagem do usuário parecida com a mensagem atual
    const [msgUsuario] = await conexao.execute(
      `SELECT id, mensagem, data FROM conversas 
       WHERE id_usuario = ? AND remetente = 'usuario' AND mensagem LIKE ? 
       ORDER BY data DESC LIMIT 1`,
      [idUsuario, `%${texto}%`]
    );

    if (msgUsuario.length > 0) {
      const dataMsgUsuario = msgUsuario[0].data;

      // 2) Buscar resposta do Kaz que veio logo depois da mensagem do usuário
      const [respostaKaz] = await conexao.execute(
        `SELECT mensagem FROM conversas 
         WHERE id_usuario = ? AND remetente = 'kaz' AND data > ? 
         ORDER BY data ASC LIMIT 1`,
        [idUsuario, dataMsgUsuario]
      );

      if (respostaKaz.length > 0) {
        return res.json({ resposta: respostaKaz[0].mensagem });
      }
    }
  } catch (erro) {
    console.error("Erro ao consultar histórico de conversas:", erro.message);
  }

  // Se não achou resposta aprendida, respondo com respostas padrão
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
  }

  // Salvar mensagem do usuário e resposta do Kaz no banco para aprendizado
  

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
