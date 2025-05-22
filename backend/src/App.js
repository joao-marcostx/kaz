import express from "express";
import cors from "cors";
import { loginUsuario, cadastrarUsuario } from "./models/LoginModels.js";
import { responderKaz } from "./controllers/KazController.js";
import { criarTarefa, deletarTarefa, editarTarefa, listarUmTrarefa, mostrarTarefas } from "./models/TarefasModels.js";

const app = express();
const porta = 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mensagem: "Bem-vindo ao Kaz Assistente!" });
});

app.post("/usuarios", cadastrarUsuario); // Rota de cadastro
app.post("/login", loginUsuario);        // Rota de login
app.post("/kaz", responderKaz);
app.post("/tarefas", criarTarefa);
app.get("/mostrarTarefas", mostrarTarefas);
app.get("/mostrarumatarefa/:id_tarefas", listarUmTrarefa);
app.put("/editarTarefa/:id_tarefas", editarTarefa);
app.delete("/deletar-tarefa/:id_tarefas", deletarTarefa);



app.listen(porta, () => {
  console.log(`Servidor rodando na porta http://localhost:${porta}`);
});
