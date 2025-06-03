import express from "express";
import cors from "cors";
import dotenv from 'dotenv';


import { loginUsuario, cadastrarUsuario, climaPorCidade } from "./models/LoginModels.js";
import { responderKaz } from "./controllers/KazController.js";
import { criarTarefa, deletarTarefa, editarTarefa, listarUmTrarefa, mostrarTarefas } from "./models/TarefasModels.js";
import { deletarConversa, listarConversasPorUsuario, ListarumaConversa, mostrarConversas, responderIA, salvarConversa } from "./models/ConversaModule.js";

const app = express();
const porta = 3001;
dotenv.config();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ mensagem: "Bem-vindo ao Kaz Assistente!" });
});

app.post("/usuarios", cadastrarUsuario); // Rota de cadastro
app.post("/login", loginUsuario);        // Rota de login
app.post("/kaz", responderKaz);
// tarefas
app.post("/tarefas", criarTarefa);
app.get("/mostrarTarefas", mostrarTarefas);
app.get("/mostrarumatarefa/:id_tarefas", listarUmTrarefa);
app.put("/editarTarefa/:id_tarefas", editarTarefa);
app.delete("/deletar-tarefa/:id_tarefas", deletarTarefa);
// conversas
app.post("/salvar", salvarConversa)
app.get("/mostrandoconversa", mostrarConversas)
app.get("/mostrandoconversa/:id", ListarumaConversa)
app.get("/conversas/:id_usuario", listarConversasPorUsuario);
app.delete("/deletarconversa/:id_usuario", deletarConversa);
// clima
app.get("/clima", climaPorCidade);
// resposta inteligente
app.post("/kaz-inteligente", responderIA);
console.log("Token:", process.env.HUGGINGFACE_API_TOKEN);
console.log("Token:", process.env.API_CLIMA);





app.listen(porta, () => {
  console.log(`Servidor rodando na porta http://localhost:${porta}`);
});
