import React, { useState } from "react";
import style from "./Login.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !senha) {
      alert("Preencha todos os campos");
      return;
    }
    try {
      const response = await axios.post("http://localhost:3001/login", {
        email,
        senha,
      });

      if (response.status === 200) {
        alert("Login efetuado com sucesso");
        navigate("/assistente"); // Redireciona para o Kaz
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      alert("Erro ao tentar realizar o login");
    }
  };

  return (
    <div>
      <form className={style.fr} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <button>Entrar</button>
      </form>

      <p style={{ textAlign: "center", marginTop: "10px" }}>
        Não tem conta?{" "}
        <button onClick={() => navigate("/cadastro")}>Cadastre-se</button>
      </p>
    </div>
  );
};

export default Login;
