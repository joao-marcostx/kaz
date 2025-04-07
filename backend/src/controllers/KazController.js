export const responderKaz = (req, res) => {
    const { mensagem } = req.body;
  
    // ola
    const texto = mensagem.toLowerCase();
  
    let resposta = "Desculpe, não entendi. Pode repetir?";
  
    if (texto.includes("oi") || texto.includes("olá")) {
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
    }
  
    res.json({ resposta });
  };
  