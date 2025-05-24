import db from "../conexao.js";
import mysql from "mysql2/promise";
import axios from "axios";


const conexao = mysql.createPool(db);

// Cadastro
// Cadastro de usuário
export const cadastrarUsuario = async (req, res) => {
    const { email, senha } = req.body;
  
    const sql = `INSERT INTO usuarios (email, senha) VALUES (?, ?)`;
    const params = [email, senha];
  
    try {
      await conexao.query(sql, params);
      return res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
    } catch (error) {
      console.error({
        mensagem: "Erro servidor",
        code: error.code,
        sql: error.sqlMessage,
      });
  
      return res.status(500).json({
        mensagem: "Erro ao cadastrar usuário",
        erro: error.message,
      });
    }
  };
  
  // Login de usuário
  export const loginUsuario = async (req, res) => {
    const { email, senha } = req.body;
  
    const sql = `SELECT * FROM usuarios WHERE email = ? AND senha = ?`;
    const params = [email, senha];
  
    try {
      const [rows] = await conexao.query(sql, params);
  
      if (rows.length > 0) {
        return res.status(200).json({ mensagem: "Login efetuado com sucesso!" });
      } else {
        return res.status(401).json({ mensagem: "Email ou senha inválidos." });
      }
    } catch (error) {
      console.error({
        mensagem: "Erro servidor",
        code: error.code,
        sql: error.sqlMessage,
      });
  
      return res.status(500).json({
        mensagem: "Erro ao fazer login",
        erro: error.message,
      });
    }
  };
  export const climaPorCidade = async (req, res) => {
  const { cidade } = req.body;

  

  try {
    const apiKey = "";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      cidade
    )}&appid=${apiKey}&units=metric&lang=pt`;

    const resposta = await axios.get(url);
    const dados = resposta.data;

    const clima = {
      cidade: dados.name,
      temperatura: dados.main.temp,
      descricao: dados.weather[0].description,
      umidade: dados.main.humidity,
      vento: dados.wind.speed,
    };

    res.json(clima);
  } catch (erro) {
    console.error("Erro ao buscar clima:", erro.message);
    res.status(500).json({ erro: "Erro ao buscar clima" });
  }
};