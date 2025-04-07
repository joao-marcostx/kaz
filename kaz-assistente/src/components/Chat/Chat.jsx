import React, { useState } from "react";
import axios from "axios";
import styles from "./Chat.module.css";

const Chat = () => {
  const [mensagem, setMensagem] = useState("");
  const [conversa, setConversa] = useState([]);

  const enviarMensagem = async (e) => {
    e.preventDefault();
    if (!mensagem.trim()) return;

    const novaConversa = [...conversa, { remetente: "Você", texto: mensagem }];

    try {
      const response = await axios.post("http://localhost:3001/kaz", {
        mensagem,
      });

      novaConversa.push({ remetente: "Kaz", texto: response.data.resposta });
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      novaConversa.push({
        remetente: "Kaz",
        texto: "Erro ao se comunicar com o servidor.",
      });
    }

    setConversa(novaConversa);
    setMensagem("");
  };

  return (
    <div className={styles.container}>
      <h2>Assistente Kaz</h2>
      <div className={styles.chatBox}>
        {conversa.map((msg, index) => (
          <div
            key={index}
            className={
              msg.remetente === "Você" ? styles.usuario : styles.kaz
            }
          >
            <strong>{msg.remetente}:</strong> {msg.texto}
          </div>
        ))}
      </div>
      <form onSubmit={enviarMensagem} className={styles.formulario}>
        <input
          type="text"
          placeholder="Digite sua mensagem..."
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
};

export default Chat;
