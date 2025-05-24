import db from "../conexao.js";

import mysql from "mysql2/promise";

const conexao = mysql.createPool(db);

export const criarTarefa = async (req, res) => {
  const sql = `INSERT INTO tarefas (titulo, descricao) VALUES (?, ?)`;
  const params = [req.body.titulo, req.body.descricao];

  try {
    await conexao.query(sql, params);
    return res.status(201).json({ mensagem: "Tarefa criada com sucesso!" });
  } catch (error) {
    console.error({
      mensagem: "Erro servidor",
      code: error.code,
      sql: error.sqlMessage,
    });

    return res.status(500).json({
      mensagem: "Erro ao criar tarefa",
      erro: error.message,
    });
  }
};

export const mostrarTarefas = async (req, res) => {
  const sql = `SELECT * FROM tarefas`;

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
      mensagem: "Erro ao mostrar tarefas",
      erro: error.message,
    });
  }
};

export const deletarTarefa = async (req, res) => {
  const sql = `DELETE FROM tarefas WHERE id_tarefas = ?`;
  const params = [req.params.id_tarefas];

  try {
    await conexao.query(sql, params);
    return res.status(200).json({ mensagem: "Tarefa deletada com sucesso!" });
  } catch (error) {
    console.error({
      mensagem: "Erro servidor",
      code: error.code,
      sql: error.sqlMessage,
    });

    return res.status(500).json({
      mensagem: "Erro ao deletar tarefa",
      erro: error.message,
    });
  }
};

export const listarUmTrarefa = async (req, res) => {
  const sql = `SELECT * FROM tarefas WHERE id_tarefas = ?`;
  const params = [req.params.id_tarefas];

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
      mensagem: "Erro ao deletar tarefa",
      erro: error.message,
    });
  }
};

export const editarTarefa = async (req, res) => {
  const sql = `UPDATE tarefas SET titulo = ?, descricao = ? WHERE id_tarefas = ?`;
  const params = [req.body.titulo, req.body.descricao, req.params.id_tarefas];

  try {
    await conexao.query(sql, params);
    return res.status(200).json({ mensagem: "Tarefa editada com sucesso!" });
  } catch (error) {
    console.error({
      mensagem: "Erro servidor",
      code: error.code,
      sql: error.sqlMessage,
    });

    return res.status(500).json({
      mensagem: "Erro ao editar tarefa",
      erro: error.message,
    });
  }
};
