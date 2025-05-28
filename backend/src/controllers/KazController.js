import axios from "axios";

export const responderKaz = async (req, res) => {
  const { mensagem } = req.body;

  if (!mensagem || typeof mensagem !== "string") {
    return res.status(400).json({ erro: "Mensagem inválida ou ausente." });
  }

  const texto = mensagem.toLowerCase().trim();
  console.log("Mensagem recebida:", texto);

  let resposta = "Desculpe, não entendi. Pode repetir?";

  if (
    texto.includes("oi") ||
    texto.includes("olá") ||
    texto.includes("ola")
  ) {
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
  } else if (
    texto.includes("qual a data") ||
    texto.includes("data atual")
  ) {
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    resposta = `Hoje é ${dataAtual}`;
  } else if (texto.includes("qual é o seu nome" ) || texto.includes("nome")) {
    resposta = "Meu nome é Kaz, o seu assistente virtual!";
  } else if (texto.includes("clima de") || texto.includes("clima") ) {
    const cidade = texto.split("clima de")  [1]?.trim();
    if (cidade) {
      resposta = await buscarClimaPorCidade(cidade);
    } else {
      resposta = "Por favor, informe o nome da cidade após 'clima de'.";
    }
  }

  res.json({ resposta });
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
