import Cardtarefas from "./Cardtarefas";
import style from "./Tarefas.module.css";

const Tarefas = () => {
  return (
    <div>
      <div className={style.container}>
        <h1>Tarefas</h1>
        <div> 
            <Cardtarefas />
        </div>
      </div>
    </div>
  );
};

export default Tarefas;
