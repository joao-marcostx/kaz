import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import style from "./Cadastro.module.css";

const Cadastro = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();
    if (!email || !senha) {
      alert("Preencha todos os campos");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/usuarios", {
        email,
        senha,
      });

      if (response.status === 201) {
        alert("Cadastro realizado com sucesso!");
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar usuário");
    }
  };

  return (
    <div className={style.container}>
      <form className={style.formulario} onSubmit={handleCadastro}>
        <h2>Cadastro</h2>
        <input
          className={style.input}
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className={style.input}
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <button className={style.button}>Cadastrar</button>

        <div className={style.trocar}>
          Já tem conta?
          <button onClick={() => navigate("/")}>Faça login</button>
        </div>
      </form>
    </div>
  );
};

export default Cadastro;
