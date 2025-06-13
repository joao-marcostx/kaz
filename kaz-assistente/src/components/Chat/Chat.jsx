import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
  Send, 
  Trash2, 
  Upload, 
  Bot, 
  User, 
  FileText, 
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MessageSquare,
  Calendar
} from "lucide-react";
import styles from './Chat.module.css';

const Chat = () => {
  const [mensagem, setMensagem] = useState("");
  const [conversa, setConversa] = useState([]);
  const [arquivo, setArquivo] = useState(null);
  const [mensagemUpload, setMensagemUpload] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatBoxRef = useRef(null);
  const fileInputRef = useRef(null);

  const idUsuario = 1;

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

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [conversa, isTyping]);

  const enviarMensagem = async (e) => {
    e.preventDefault();
    if (!mensagem.trim() || isLoading) return;

    setIsLoading(true);
    setIsTyping(true);
    const novaConversa = [...conversa, { remetente: "Você", texto: mensagem }];
    setConversa(novaConversa);
    const mensagemAtual = mensagem;
    setMensagem("");

    try {
      const response = await axios.post("http://localhost:3001/kaz", {
        mensagem: mensagemAtual,
      });

      const respostaKaz = response.data.resposta;

      await axios.post("http://localhost:3001/salvar", {
        id_usuario: idUsuario,
        remetente: "usuario",
        mensagem: mensagemAtual,
      });

      await axios.post("http://localhost:3001/salvar", {
        id_usuario: idUsuario,
        remetente: "kaz",
        mensagem: respostaKaz,
      });

      setTimeout(() => {
        setIsTyping(false);
        setConversa(prev => [...prev, { remetente: "Kaz", texto: respostaKaz }]);
      }, 1000);

    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setTimeout(() => {
        setIsTyping(false);
        setConversa(prev => [...prev, {
          remetente: "Kaz",
          texto: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
        }]);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const deletarConversa = async () => {
    try {
      await axios.delete(`http://localhost:3001/deletarconversa/${idUsuario}`);
      setConversa([]);
      setMensagemUpload("");
    } catch (error) {
      console.error("Erro ao deletar conversa:", error);
    }
  };

  const handleArquivo = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setArquivo(file);
      setMensagemUpload("");
    }
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
      setArquivo(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setMensagemUpload("Erro ao enviar documento.");
    }
  };

  const TypingIndicator = () => (
    <div className={styles.typingIndicator}>
      <div className={`${styles.messageAvatar} ${styles.messageAvatarBot}`}>
        <Bot size={16} color="white" />
      </div>
      <div className={styles.typingBubble}>
        <div className={styles.typingDots}>
          <div className={styles.typingDot}></div>
          <div className={styles.typingDot}></div>
          <div className={styles.typingDot}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.chatWrapper}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <div className={styles.avatar}>
                <Sparkles size={24} color="white" />
              </div>
              <div className={styles.headerText}>
                <h1>Assistente Kaz</h1>
                <p>Seu assistente inteligente</p>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button
                onClick={deletarConversa}
                className={styles.deleteButton}
                title="Deletar conversa"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div ref={chatBoxRef} className={styles.chatArea}>
          {conversa.length === 0 ? (
            <div className={styles.emptyState}>
              <MessageSquare size={64} color="rgba(59, 130, 246, 0.5)" />
              <h3>Bem-vindo ao Chat!</h3>
              <p>Comece uma conversa com o Assistente Kaz</p>
            </div>
          ) : (
            conversa.map((msg, index) => (
              <div
                key={index}
                className={`${styles.messageContainer} ${
                  msg.remetente === "Você" ? styles.messageContainerUser : ""
                }`}
              >
                <div className={`${styles.messageAvatar} ${
                  msg.remetente === "Você" 
                    ? styles.messageAvatarUser
                    : styles.messageAvatarBot
                }`}>
                  {msg.remetente === "Você" ? (
                    <User size={16} color="white" />
                  ) : (
                    <Bot size={16} color="white" />
                  )}
                </div>
                <div className={`${styles.messageBubble} ${
                  msg.remetente === "Você"
                    ? styles.messageBubbleUser
                    : styles.messageBubbleBot
                }`}>
                  <p className={styles.messageText}>{msg.texto}</p>
                </div>
              </div>
            ))
          )}
          {isTyping && <TypingIndicator />}
        </div>

        {/* Input Area */}
        <div className={styles.inputArea}>
          <form onSubmit={enviarMensagem} className={styles.inputForm}>
            <div className={styles.inputRow}>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  placeholder="Digite sua mensagem..."
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  disabled={isLoading}
                  className={styles.messageInput}
                />
              </div>
              <button
                type="submit"
                disabled={!mensagem.trim() || isLoading}
                className={styles.sendButton}
              >
                <Send size={16} />
                <span>Enviar</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
              <button
                type="button"
                onClick={() => setMensagem("")}
                className={styles.actionButton}
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={() => window.location.href = "/tarefas"}
                className={styles.actionButton}
              >
                <Calendar size={16} />
                <span>Ver Tarefas</span>
              </button>
            </div>
          </form>

          {/* File Upload */}
          <div className={styles.uploadArea}>
            <form onSubmit={handleUpload} className={styles.uploadForm}>
              <div className={styles.uploadRow}>
                <div className={styles.uploadInputWrapper}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleArquivo}
                    accept=".txt,.pdf,.docx"
                    className={styles.fileInput}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!arquivo}
                  className={styles.uploadButton}
                >
                  <Upload size={16} />
                  <span>Upload</span>
                </button>
              </div>
              
              {mensagemUpload && (
                <div className={`${styles.statusMessage} ${
                  mensagemUpload.includes("Erro") 
                    ? styles.statusMessageError 
                    : styles.statusMessageSuccess
                }`}>
                  {mensagemUpload.includes("Erro") ? (
                    <AlertCircle size={16} />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  <span>{mensagemUpload}</span>
                </div>
              )}
              
              {arquivo && (
                <div className={styles.fileSelected}>
                  <FileText size={16} />
                  <span>Arquivo selecionado: {arquivo.name}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;