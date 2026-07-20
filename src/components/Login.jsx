import './Login.css';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

function Login(){

const [usuario,setUsuario]=useState("");
const [contrasena,setContrasena]=useState("");
const [verContrasena,setVerContrasena]=useState(false);

const navigate=useNavigate();

const handleSubmit=async(e)=>{

e.preventDefault();

try{

const response=await fetch(
"http://localhost/factufast-api/login.php",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
usuario,
contrasena
})
}
);

const data=await response.json();

console.log(data);

if(data.success){

const usuarioObj={
id:data.id_usuario,
nombre:data.nombre_usuario,
rol:data.nombre_rol
};

localStorage.setItem(
"usuario",
JSON.stringify(usuarioObj)
);

if(data.nombre_rol==="Gerente 1"){

navigate("/gerente");

}else if(data.nombre_rol==="Administrador"){

navigate("/admin");

}else if(data.nombre_rol==="Empleado"){

navigate("/empleado");

}else{

navigate("/");

}

}else{

alert(data.mensaje);

}

}catch(error){

console.error(error);

alert("Error conectando con el servidor");

}

};

return(

<div
style={{
minHeight:"100vh",
background:"#1a1a1a",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontFamily:"Arial, Helvetica, sans-serif"
}}
>

<div
style={{
background:"#2b2b2b",
border:"1px solid #8A7700",
borderRadius:"10px",
padding:"40px",
width:"100%",
maxWidth:"400px",
boxShadow:"0 8px 30px rgba(0,0,0,0.5)"
}}
>

<div
style={{
textAlign:"center",
marginBottom:"20px"
}}
>

<img
src={logo}
alt="logo"
style={{
width:"55px",
marginBottom:"8px"
}}
/>

<h1
style={{
color:"#C9BD86",
fontSize:"28px",
letterSpacing:"2px",
margin:0
}}
>
FACTUFAST
</h1>

<p
style={{
color:"#aaa",
fontSize:"13px"
}}
>
Sistema administrativo
</p>

</div>

<h2
style={{
color:"#C9BD86",
textAlign:"center",
marginBottom:"25px"
}}
>
Iniciar Sesión
</h2>

<form onSubmit={handleSubmit}>

<label
style={{
color:"#fff",
fontSize:"14px",
display:"block",
marginBottom:"6px"
}}
>
Usuario
</label>

<input

type="text"

value={usuario}

onChange={(e)=>{

const valor=e.target.value;

if(/^\d*$/.test(valor)){

setUsuario(valor);

}

}}

inputMode="numeric"

pattern="[0-9]*"

maxLength="20"

style={{
width:"100%",
padding:"11px",
background:"#3b3b3b",
border:"1px solid #555",
borderRadius:"5px",
color:"#fff",
marginBottom:"14px",
boxSizing:"border-box"
}}

required

/>

<label
style={{
color:"#fff",
fontSize:"14px",
display:"block",
marginBottom:"6px"
}}
>
Contraseña
</label>

<div style={{ position: "relative", marginBottom: "20px" }}>
  <input
    type={verContrasena ? "text" : "password"}
    value={contrasena}
    onChange={(e)=>setContrasena(e.target.value)}
    style={{
      width:"100%",
      padding:"11px",
      background:"#3b3b3b",
      border:"1px solid #555",
      borderRadius:"5px",
      color:"#fff",
      boxSizing:"border-box",
      paddingRight:"75px"
    }}
    required
  />
  <button
    type="button"
    onClick={() => setVerContrasena(!verContrasena)}
    style={{
      position:"absolute",
      right:"12px",
      top:"50%",
      transform:"translateY(-50%)",
      background:"none",
      border:"none",
      color:"#C9BD86",
      cursor:"pointer",
      fontSize:"12px",
      fontWeight:"bold",
      padding: 0
    }}
  >
    {verContrasena ? "Ocultar" : "Mostrar"}
  </button>
</div>

<button

type="submit"

style={{
width:"100%",
padding:"12px",
background:"#C9BD86",
color:"#1a1a1a",
border:"none",
borderRadius:"5px",
fontWeight:"bold",
cursor:"pointer",
fontSize:"15px"
}}

>
Ingresar
</button>

<div
style={{
textAlign:"center",
marginTop:"18px",
fontSize:"13px"
}}
>

<Link
to="/recuperar-clave"
style={{
color:"#C9BD86",
textDecoration:"underline",
display:"block",
marginBottom:"10px"
}}
>
¿Olvidaste tu contraseña?
</Link>

<Link
to="/crear-contrasena"
style={{
color:"#C9BD86",
textDecoration:"underline",
display:"block"
}}
>
Crear contraseña inicial
</Link>

</div>

<button

type="button"

onClick={()=>navigate("/")}

style={{
width:"100%",
padding:"10px",
background:"transparent",
color:"#C9BD86",
border:"1px solid #C9BD86",
borderRadius:"5px",
fontWeight:"bold",
cursor:"pointer",
marginTop:"18px"
}}

>
Salir
</button>

</form>

</div>

</div>

);

}

export default Login;