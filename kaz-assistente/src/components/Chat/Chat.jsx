import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Chat.module.css";

const Chat = () => {
  const [mensagem, setMensagem] = useState("");
  const [conversa, setConversa] = useState([]);

  const idUsuario = 1; // por enquanto fixo

  useEffect(() => {
    const carregarConversas = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/conversas/${idUsuario}`);
        const mensagens = response.data.map((msg) => ({
          remetente: msg.remetente === "kaz" ? "Kaz" : "Você",
          texto: msg.mensagem,
        }));
        setConversa(mensagens);
      } catch (error) {
        console.error("Erro ao carregar conversas:", error);
      }
    };

    carregarConversas();
  }, []);

  const enviarMensagem = async (e) => {
    e.preventDefault();
    if (!mensagem.trim()) return;

    const novaConversa = [...conversa, { remetente: "Você", texto: mensagem }];

    try {
      const response = await axios.post("http://localhost:3001/kaz", {
        mensagem: mensagem,
      });

      const respostaKaz = response.data.resposta;

      await axios.post("http://localhost:3001/salvar", {
        id_usuario: idUsuario,
        remetente: "usuario",
        mensagem,
      });

      await axios.post("http://localhost:3001/salvar", {
        id_usuario: idUsuario,
        remetente: "kaz",
        mensagem: respostaKaz,
      });

      novaConversa.push({ remetente: "Kaz", texto: respostaKaz });
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

  const deletarConversa = async () => {
    console.log("Deletando conversa...");
    try {
      await axios.delete(`http://localhost:3001/deletarconversa/${idUsuario}`);
      setConversa([]);
    } catch (error) {
      console.error("Erro ao deletar conversa:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Assistente Kaz</h2>
      <div className={styles.chatBox}>
        {conversa.map((msg, index) => (
          <div
            key={index}
            className={msg.remetente === "Você" ? styles.usuario : styles.kaz}
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
        <button type="button" onClick={deletarConversa}>Deletar Conversa</button>
        <button type="submit" onClick={() => setMensagem("")}>limpar</button>
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
};

export default Chat;
