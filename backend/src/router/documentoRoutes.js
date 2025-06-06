import { Router } from 'express';
const router = Router();
import multer, { diskStorage } from 'multer';
import { extname } from 'path';
import { readFileSync } from 'fs';
import pdfParse from 'pdf-parse';
import { fromFileWithPath } from 'textract';
import db from "../conexao.js";
import mysql from "mysql2/promise";

// Crie a pool de conexão
const conexao = mysql.createPool(db);

// Configurar o multer para upload
const storage = diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const ext = extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

router.post('/upload-doc', upload.single('documento'), async (req, res) => {
  const arquivo = req.file;

  if (!arquivo) return res.status(400).json({ erro: 'Nenhum arquivo enviado' });

  const ext = extname(arquivo.originalname).toLowerCase();
  let conteudo = '';

  try {
    if (ext === '.txt') {
      conteudo = readFileSync(arquivo.path, 'utf8');
    } else if (ext === '.pdf') {
      const dataBuffer = readFileSync(arquivo.path);
      const data = await pdfParse(dataBuffer);
      conteudo = data.text;
    } else if (ext === '.docx') {
      conteudo = await new Promise((resolve, reject) => {
        fromFileWithPath(arquivo.path, (error, text) => {
          if (error) reject(error);
          else resolve(text);
        });
      });
    } else {
      return res.status(400).json({ erro: 'Formato não suportado' });
    }

    const resumo = conteudo.substring(0, 2000); // por enquanto resumindo pelo tamanho

    // Use a pool de conexão para inserir no banco
    await conexao.query(
      'INSERT INTO documentos (titulo, conteudo) VALUES (?, ?)',
      [req.body.titulo, resumo]
    );

    res.json({ mensagem: 'Documento enviado e salvo com sucesso.' });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao processar o documento' });
  }
});

export default router;