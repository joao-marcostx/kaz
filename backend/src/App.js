import express from "express";
import cors from "cors";
import { loginUsuario, cadastrarUsuario } from "./models/LoginModels.js";
import { responderKaz } from "./controllers/KazController.js";

const app = express();
const porta = 3001;

app.use(cors());
app.use(express.json());

app.post("/usuarios", cadastrarUsuario); // Rota de cadastro
app.post("/login", loginUsuario);        // Rota de login
app.post("/kaz", responderKaz);

app.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`);
});
