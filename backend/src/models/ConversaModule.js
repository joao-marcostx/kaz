import db from "../conexao.js";
import mysql from "mysql2/promise";

const conexao = mysql.createPool(db);

export const salvarConversa = async (req, res) => {
  const { id_usuario, remetente, mensagem } = req.body;

  if (!id_usuario || !remetente || !mensagem) {
    return res
      .status(400)
      .json({ mensagem: "Todos os campos devem ser preenchidos." });
  }
  const sql =
    "INSERT INTO conversas (id_usuario, remetente, mensagem) VALUES (?, ?, ?)";
  const params = [id_usuario, remetente, mensagem];

  try {
    await conexao.query(sql, params);
    return res.status(201).json({ mensagem: "Mensagem enviada com sucesso!" });
  } catch (error) {
    console.error({
      mensagem: "Erro servidor",
      code: error.code,
      sql: error.sqlMessage,
    });
    return res.status(500).json({
      mensagem: "Erro ao enviar mensagem",
      erro: error.message,
    });
  }
};

export const mostrarConversas = async (req, res) => {
  const sql = "SELECT * FROM conversas";

  try {
    const [rows] = await conexao.query(sql);
    return res.status(200).json(rows);
  } catch (error) {
    console.error({
      mensagem: "Erro servidor",
      code: error.code,
      sql: error.sqlMessage,
    });
    return res.status(500).json({
      mensagem: "Erro ao mostrar conversas",
      erro: error.message,
    });
  }
};

export const ListarumaConversa = async (req, res) => {
  const sql = "SELECT * FROM conversas WHERE id_usuario = ?";
  const params = [req.params.id_usuario];

  try {
    const [rows] = await conexao.query(sql, params);
    return res.status(200).json(rows);
  } catch (error) {
    console.error({
      mensagem: "Erro servidor",
      code: error.code,
      sql: error.sqlMessage,
    });
    return res.status(500).json({
      mensagem: "Erro ao mostrar conversas",
      erro: error.message,
    });
  }
};
export const listarConversasPorUsuario = async (req, res) => {
  const { id_usuario } = req.params;

  const sql = "SELECT * FROM conversas WHERE id_usuario = ?";
  try {
    const [rows] = await conexao.query(sql, [id_usuario]);
    return res.status(200).json(rows);
  } catch (error) {
    console.error({
      mensagem: "Erro servidor",
      code: error.code,
      sql: error.sqlMessage,
    });
    return res.status(500).json({
      mensagem: "Erro ao buscar conversas do usuário",
      erro: error.message,
    });
  }
};
