import db from "../conexao.js";
import mysql from "mysql2/promise";
import axios from "axios";

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

export const deletarConversa = async (req, res) => {
  const sql = "DELETE FROM conversas WHERE id_usuario = ?";
  const params = [req.params.id_usuario];

  try {
    await conexao.query(sql, params);
    return res.status(200).json({ mensagem: "Conversa deletada com sucesso!" });
  } catch (error) {
    console.error({
      mensagem: "Erro servidor",
      code: error.code,
      sql: error.sqlMessage,
    });
    return res.status(500).json({
      mensagem: "Erro ao deletar conversa",
      erro: error.message,
    });
  }
};



export const uploadArquivo = async (req, res) => {
  const arquivo = req.file;

  if (!arquivo) return res.status(400).json({ erro: 'Nenhum arquivo enviado' });

  const ext = path.extname(arquivo.originalname).toLowerCase();
  let conteudo = '';

  try {
    if (ext === '.txt') {
      conteudo = fs.readFileSync(arquivo.path, 'utf8');
    } else if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(arquivo.path);
      const data = await pdfParse(dataBuffer);
      conteudo = data.text;
    } else if (ext === '.docx') {
      conteudo = await new Promise((resolve, reject) => {
        textract.fromFileWithPath(arquivo.path, (error, text) => {
          if (error) reject(error);
          else resolve(text);
        });
      });
    } else {
      return res.status(400).json({ erro: 'Formato não suportado' });
    }

    const resumo = conteudo.substring(0, 2000); // por enquanto resumindo pelo tamanho

    await pool.query(
      'INSERT INTO documentos (titulo, conteudo) VALUES (?, ?)',
      [arquivo.originalname, resumo]
    );

    res.json({ mensagem: 'Documento enviado e salvo com sucesso.' });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao processar o documento' });
  }
};




export const responderIA = async (req, res) => {
  const pergunta = req.body.pergunta?.trim();

  if (!pergunta) {
    return res.status(400).json({ erro: "Mensagem inválida ou ausente." });
  }

  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/google/flan-t5-base",
      { inputs: pergunta },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
        },
      }
    );

    const resposta = response.data?.[0]?.generated_text || "Não entendi sua pergunta.";
    res.json({ resposta });

  } catch (error) {
    console.error("Erro ao consultar a Hugging Face:", error.response?.data || error.message);
    res.status(500).json({ erro: "Erro ao processar resposta inteligente." });
  }
};