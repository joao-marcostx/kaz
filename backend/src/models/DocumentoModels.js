import db from "../conexao.js";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import textract from "textract";

const conexao = mysql.createPool(db);

const idUsuario = 1; // Exemplo de ID de usuário, deve ser dinâmico conforme a autenticação

// Salvar documento
export const uploadDocumento = async (req, res) => {
  const arquivo = req.file;
  if (!arquivo) return res.status(400).json({ erro: "Nenhum arquivo enviado." });

  const ext = path.extname(arquivo.originalname).toLowerCase();
  let conteudo = "";

  try {
    if (ext === ".txt") {
      conteudo = fs.readFileSync(arquivo.path, "utf8");
    } else if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(arquivo.path);
      try {
        const data = await pdfParse(dataBuffer);
        conteudo = data.text;
      } catch (pdfError) {
        return res.status(400).json({ erro: "Erro ao ler PDF. O arquivo pode estar corrompido ou em formato não suportado." });
      }
    } else if (ext === ".docx") {
      conteudo = await new Promise((resolve, reject) => {
        textract.fromFileWithPath(arquivo.path, (error, text) => {
          if (error) reject(error);
          else resolve(text);
        });
      });
    } else {
      return res.status(400).json({ erro: "Formato não suportado." });
    }

    await conexao.query(
      "INSERT INTO documentos (titulo, conteudo) VALUES (?, ?)",
      [arquivo.originalname, conteudo]
    );

    res.json({ mensagem: "Documento salvo com sucesso!" });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao processar o documento." });
  }
};

// Buscar resposta baseada em documentos
export const responderPorDocumento = async (req, res) => {
  const { pergunta } = req.body;
  if (!pergunta) return res.status(400).json({ erro: "Pergunta não enviada." });

  try {
    // Busca simples: encontra o trecho mais parecido
    const [docs] = await conexao.query("SELECT conteudo FROM documentos");
    let melhorTrecho = "";
    let maiorSimilaridade = 0;

    docs.forEach(doc => {
      const frases = doc.conteudo.split(/[.!?]/);
      frases.forEach(frase => {
        const similaridade = frase.toLowerCase().includes(pergunta.toLowerCase()) ? 1 : 0;
        if (similaridade > maiorSimilaridade) {
          maiorSimilaridade = similaridade;
          melhorTrecho = frase;
        }
      });
    });

    console.log("Melhor trecho encontrado:", melhorTrecho, "Score:", maiorSimilaridade);

    if (maiorSimilaridade > 0) {
      res.json({ resposta: melhorTrecho.trim() });
    } else {
      res.json({ resposta: "Não encontrei uma resposta nos documentos." });
    }
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao buscar resposta." });
  }
};

export const buscarRespostaDocumento = async (pergunta) => {
  if (!pergunta) return null;
  try {
    const [docs] = await conexao.query("SELECT conteudo FROM documentos");
    let melhorTrecho = "";
    let maiorSimilaridade = 0;

    docs.forEach(doc => {
      const frases = doc.conteudo.split(/[.!?]/);
      frases.forEach(frase => {
        // Similaridade simples: conta quantas palavras da pergunta aparecem na frase
        let score = 0;
        const palavrasPergunta = pergunta.toLowerCase().split(/\s+/);
        palavrasPergunta.forEach(palavra => {
          if (frase.toLowerCase().includes(palavra)) score++;
        });
        if (score > maiorSimilaridade) {
          maiorSimilaridade = score;
          melhorTrecho = frase;
        }
      });
    });

    // Retorna se encontrou pelo menos uma palavra em comum
    if (maiorSimilaridade > 0) {
      return melhorTrecho.trim();
    } else {
      return null;
    }
  } catch (erro) {
    return null;
  }
};