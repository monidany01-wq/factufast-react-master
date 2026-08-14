/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


function SessionTimeout(){

const navigate = useNavigate();

const tiempo = 15 * 60 * 1000; // 15 minutos


useEffect(()=>{


let temporizador;


const cerrarSesion = ()=>{

localStorage.removeItem("usuario");

navigate("/");

};


const reiniciarTiempo = ()=>{

clearTimeout(temporizador);

temporizador = setTimeout(
cerrarSesion,
tiempo
);

};



window.addEventListener(
"mousemove",
reiniciarTiempo
);

window.addEventListener(
"keydown",
reiniciarTiempo
);

window.addEventListener(
"click",
reiniciarTiempo
);



reiniciarTiempo();



return ()=>{

clearTimeout(temporizador);

window.removeEventListener(
"mousemove",
reiniciarTiempo
);

window.removeEventListener(
"keydown",
reiniciarTiempo
);

window.removeEventListener(
"click",
reiniciarTiempo
);

};


},[]);



return null;


}


export default SessionTimeout;