import db from "../conexao.js";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import textract from "textract";
import natural from "natural";

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

const stopwords = [
  "o", "a", "os", "as", "de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas",
  "um", "uma", "uns", "umas", "e", "é", "que", "para", "por", "com", "sem", "ao", "à", "se",
  "sua", "seu", "suas", "seus", "ou", "como", "mas", "também", "já", "não", "sim", "sobre"
];

export const buscarRespostaDocumento = async (pergunta) => {
  if (!pergunta) return null;
  try {
    const [docs] = await conexao.query("SELECT conteudo FROM documentos");
    const tokenizer = new natural.WordTokenizer();
    const perguntaTokens = tokenizer.tokenize(pergunta.toLowerCase())
      .filter(t => t.length > 2 && !stopwords.includes(t));

    let frasesPontuadas = [];

    docs.forEach(doc => {
      const frases = doc.conteudo.split(/[.!?]/);
      frases.forEach((frase, idx) => {
        const fraseTokens = tokenizer.tokenize(frase.toLowerCase());
        let pontuacao = 0;

        perguntaTokens.forEach(token => {
          if (fraseTokens.includes(token)) pontuacao += 2;
        });

        if (frase.toLowerCase().includes(pergunta.toLowerCase())) pontuacao += 5;
        if (perguntaTokens.length > 0 && perguntaTokens.every(token => fraseTokens.includes(token))) pontuacao += 5;

        if (frase.trim().length > 10) {
          frasesPontuadas.push({ frase: frase.trim(), pontuacao, idx, frases });
        }
      });
    });

    // Ordena por pontuação (maior primeiro)
    const frasesOrdenadas = frasesPontuadas
      .sort((a, b) => b.pontuacao - a.pontuacao);

    if (frasesOrdenadas.length > 0 && frasesOrdenadas[0].pontuacao > 0) {
      const melhor = frasesOrdenadas[0];
      const { idx, frases, pontuacao } = melhor;
      const contexto = [];

      // Critério: só pega vizinhas se a pontuação for próxima (diferença máxima de 2 pontos)
      const diffMax = 2;

      // Frase anterior
      if (idx > 0) {
        const anterior = frases[idx - 1].trim();
        const anteriorTokens = tokenizer.tokenize(anterior.toLowerCase());
        let pontAnterior = 0;
        perguntaTokens.forEach(token => {
          if (anteriorTokens.includes(token)) pontAnterior += 2;
        });
        if (anterior.length > 10 && Math.abs(pontAnterior - pontuacao) <= diffMax && pontAnterior > 0) {
          contexto.push(anterior);
        }
      }

      // Sempre adiciona a melhor frase
      contexto.push(melhor.frase);

      // Frase seguinte
      if (idx < frases.length - 1) {
        const proxima = frases[idx + 1].trim();
        const proximaTokens = tokenizer.tokenize(proxima.toLowerCase());
        let pontProxima = 0;
        perguntaTokens.forEach(token => {
          if (proximaTokens.includes(token)) pontProxima += 2;
        });
        if (proxima.length > 10 && Math.abs(pontProxima - pontuacao) <= diffMax && pontProxima > 0) {
          contexto.push(proxima);
        }
      }

      // Se só a melhor frase for relevante, retorna só ela
      return contexto.join(" ");
    } else {
      return "Não encontrei uma resposta relevante nos documentos.";
    }
  } catch (erro) {
    return "Erro ao buscar resposta nos documentos.";
  }
};