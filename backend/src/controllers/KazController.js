export const responderKaz = (req, res) => {
  const { mensagem } = req.body;

  // ola
  const texto = mensagem.toLowerCase();

  let resposta = "Desculpe, não entendi. Pode repetir?";
  if (
    texto.includes("oi") ||
    texto.includes("olá") ||
    texto.includes("ola") ||
    texto.includes("ola ") ||
    texto.includes("olá ") ||
    texto.includes("oi ") ||
    texto.includes("ola, ") ||
    texto.includes("olá, ") ||
    texto.includes("oi, ")
  ) {
    resposta = "Olá! Em que posso te ajudar?";
  } else if (texto.includes("horas")) {
    const horaAtual = new Date().toLocaleTimeString("pt-BR");
    resposta = `Agora são ${horaAtual}`;
  } else if (texto.includes("me diga algo")) {
    const frases = [
      "Você é incrível!",
      "Acredite no seu potencial!",
      "Tudo vai dar certo!",
    ];
    resposta = frases[Math.floor(Math.random() * frases.length)];
  } else if (texto.includes("qual a data")) {
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    resposta = `Hoje é ${dataAtual}`;
  } else if (texto.includes("qual a hora")) {
    const horaAtual = new Date().toLocaleTimeString("pt-BR");
    resposta = `Agora é ${horaAtual}`;
  } else if (texto.includes("qual a temperatura")) {
    const temperatura = 25;
    resposta = `A temperatura atual é ${temperatura} graus Celsius.`;
  } else if (texto.includes("qual a velocidade do vento")) {
    const velocidade = 10;
    resposta = `A velocidade do vento atual é ${velocidade} m/s.`;
  } else if (texto.includes("qual a pressao atmosferica")) {
    const pressao = 1013.25;
    resposta = `A pressão atmosferica atual é ${pressao} hPa.`;
  } else if (texto.includes("qual é o seu nome ?")) {
    resposta = "Meu nome é Kaz o seu assistente virtual!";
  }

  res.json({ resposta });
};
