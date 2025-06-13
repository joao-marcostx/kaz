import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Chat.module.css";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const [mensagem, setMensagem] = useState("");
  const [conversa, setConversa] = useState([]);

  const idUsuario = 1; // por enquanto fixo
  const navigate = useNavigate();

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

  const [arquivo, setArquivo] = useState(null);
  const [mensagemUpload, setMensagemUpload] = useState("");

  const handleArquivo = (e) => {
    setArquivo(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!arquivo) {
      setMensagemUpload("Selecione um arquivo para enviar.");
      return;
    }
    const formData = new FormData();
    formData.append("arquivo", arquivo);

    try {
      const response = await axios.post(
        "http://localhost:3001/upload-documento",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setMensagemUpload(response.data.mensagem);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setMensagemUpload("Erro ao enviar documento.");
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
        
        <button type="submit">Enviar</button>
        <button type="button" onClick={deletarConversa}>Deletar Conversa</button>
        <button type="submit" onClick={() => setMensagem("")}>limpar</button>
        <button type="submit" onClick={() => navigate("/tarefas ")}>ver suas tarefas</button>
      </form>
      <div>
        <form onSubmit={handleUpload}>
          <input type="file" onChange={handleArquivo} accept=".txt,.pdf,.docx" />
          <button type="submit">Enviar Documento</button>
        </form>
        {mensagemUpload && <p>{mensagemUpload}</p>}
      </div>
    </div>
  );
};

export default Chat;
