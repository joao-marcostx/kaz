import Cardtarefas from "./Cardtarefas";
import style from "./Tarefas.module.css";
import { useNavigate } from "react-router-dom";

const Tarefas = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className={style.container}>
        <h1>Tarefas</h1>
        <button onClick={() => navigate("/cadastro")}>Cadastrar Tarefa</button>

        <div> 
            <Cardtarefas />
        </div>
      </div>
    </div>
  );
};

export default Tarefas;
