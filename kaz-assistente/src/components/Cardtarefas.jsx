import React, { useState, useEffect } from "react";
import style from "./Card.module.css";

const Cardtarefas = (props) => {
  const [tarefas, setTarefas] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/mostrarTarefas")
      .then((response) => response.json())
      .then((data) => {
        setTarefas(data);
      })
      .catch((error) => {
        console.error("Erro ao buscar tarefas:", error);
      });
  }, []);

  return (
    <div  >
      <h1>{props.titulo}</h1>
      <p>{props.descricao}</p>

      <h2>Tarefas Cadastradas:</h2>
      <div className={style.container}>
        {tarefas.map((tarefa, tr) => (
            <div className={style.card}>
          <h4 key={tr}>{tarefa.titulo}</h4> <br></br><p>{tarefa.descricao}</p>
            </div>
        ))}
        </div>
    
    </div>
  );
};

export default Cardtarefas;
