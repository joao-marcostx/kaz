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
  let { cidade } = req.body;

  // Expressão regular para tentar extrair o nome da cidade no fim da frase
  const regex = /clima (?:em|de|da|do)?\s*([\w\s]+)$/i;
  const match = cidade.match(regex);

  if (match) {
    cidade = match[1].trim();
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      cidade
    )}&appid=${process.env.API_CLIMA}&units=metric&lang=pt`;

    const resposta = await axios.get(url);
    const dados = resposta.data;

    return {
      cidade: dados.name,
      temperatura: dados.main.temp,
      descricao: dados.weather[0].description,
      umidade: dados.main.humidity,
      vento: dados.wind.speed,
    };
  } catch (erro) {
    throw new Error("Cidade não encontrada ou erro ao buscar clima.");
  }

};
