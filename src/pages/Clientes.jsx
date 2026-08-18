/* eslint-disable no-unused-vars */
import React, {
  useEffect,
  useState,
} from 'react';

import './Listados.css';

function Clientes(){

  const [clientes,setClientes] = useState([]);
  const [busqueda,setBusqueda] = useState("");
  const [nombre,setNombre] = useState("");
  const [documento,setDocumento] = useState("");
  const [telefono,setTelefono] = useState("");
  const [correo,setCorreo] = useState("");
  const [direccion,setDireccion] = useState("");
  const [ciudad,setCiudad] = useState("");

  const [idEditar,setIdEditar] = useState(null);

  const ciudadesColombia = [
    "Bogotá",
    "Medellín",
    "Cali",
    "Barranquilla",
    "Cartagena",
    "Bucaramanga",
    "Pereira",
    "Manizales",
    "Ibagué",
    "Cúcuta",
    "Santa Marta",
    "Neiva",
    "Sincelejo",
    "Montería",
    "Pasto"
  ];

  useEffect(()=>{
    listarClientes();
  },[]);


  function listarClientes(){

    fetch("http://localhost/factufast-api/clientes/listar.php")
    .then(res=>res.json())
    .then(data=>{
      setClientes(data);
    });

  }


  function validarCliente(){
    if(!nombre.trim()) return "El nombre es obligatorio.";
    if(!documento.trim()) return "El documento es obligatorio.";
    if(!/^[0-9]{6,15}$/.test(documento.trim())) return "El documento debe contener entre 6 y 15 dígitos.";
    if(!telefono.trim()) return "El teléfono es obligatorio.";
    if(!/^[0-9]{7,15}$/.test(telefono.trim())) return "El teléfono debe contener solo dígitos y tener entre 7 y 15 caracteres.";
    if(!correo.trim()) return "El correo es obligatorio.";
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) return "El correo no es válido.";
    if(!direccion.trim()) return "La dirección es obligatoria.";
    if(!ciudad.trim()) return "La ciudad es obligatoria.";
    
    // Validar que el documento no exista en otro cliente
    const documentoExistente = clientes.find(c => 
      c.nit_cliente === documento.trim() && 
      c.id_cliente !== idEditar // Permitir el mismo documento si se está editando el mismo cliente
    );
    if(documentoExistente) {
      return "Este número de documento ya existe en otro cliente.";
    }
    
    return "";
  }

  function registrarCliente(e){

    e.preventDefault();

    if (!window.confirm("¿Estás seguro que deseas registrar este cliente?")) return;

    const error = validarCliente();
    if(error){
      alert(error);
      return;
    }

    fetch("http://localhost/factufast-api/clientes/guardar.php",{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({

        nit_cliente:documento,
        nombre_cliente:nombre,
        direccion_cliente:direccion,
        ciudad_cliente:ciudad,
        correo_cliente:correo,
        telefono_cliente:telefono

      })

    })

    .then(res=>res.json())
    .then(data=>{

      alert(data.mensaje);

      listarClientes();

      limpiar();

    });

  }


  function eliminarCliente(id){

  const cliente = clientes.find(c => c.id_cliente === id);

  if(cliente?.nombre_cliente === "CONSUMIDOR FINAL"){
    alert("No se puede eliminar el cliente Consumidor Final");
    return;
  }

  if(!window.confirm("¿Eliminar cliente?")) return;

  fetch("http://localhost/factufast-api/clientes/eliminar.php",{

    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },

    body:JSON.stringify({
      id_cliente:id
    })

  })

  .then(res=>res.json())
  .then(data=>{

    if(data.error){
      alert(data.error);
      return;
    }

    alert(data.mensaje);

    listarClientes();

  });

}

const cambiarEstadoCliente = (cliente) => {

  if(cliente.nombre_cliente === "CONSUMIDOR FINAL"){
    alert("No se puede cambiar estado del cliente Consumidor Final");
    return;
  }

  const nuevoEstado = (cliente.estado || "activo") === "activo" ? "inactivo" : "activo";
  
  if (!window.confirm(`¿Cambiar estado a ${nuevoEstado}?`)) return;

  fetch("http://localhost/factufast-api/clientes/cambiar-estado.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id_cliente: cliente.id_cliente,
      estado: nuevoEstado
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      listarClientes();
    } else {
      alert(data.error || "Error cambiando estado");
    }
  })
  .catch(err => {
    console.error(err);
    alert("Error cambiando estado del cliente");
  });
};

  function editarCliente(cliente){

  if(cliente.nombre_cliente === "CONSUMIDOR FINAL"){
    alert("No se puede editar Consumidor Final");
    return;
  }

  setIdEditar(cliente.id_cliente);
  setNombre(cliente.nombre_cliente);
  setDocumento(cliente.nit_cliente);
  setTelefono(cliente.telefono_cliente);
  setCorreo(cliente.correo_cliente);
  setDireccion(cliente.direccion_cliente);
  setCiudad(cliente.ciudad_cliente || "");

}


  function actualizarCliente(e){

    e.preventDefault();

    if (!window.confirm("¿Estás seguro que deseas actualizar este cliente?")) return;

    const error = validarCliente();
    if(error){
      alert(error);
      return;
    }

    fetch("http://localhost/factufast-api/clientes/editar.php",{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({

        id_cliente:idEditar,
        nit_cliente:documento,
        nombre_cliente:nombre,
        direccion_cliente:direccion,
        ciudad_cliente:ciudad,
        correo_cliente:correo,
        telefono_cliente:telefono

      })

    })

    .then(res=>res.json())
    .then(data=>{

      alert(data.mensaje);

      listarClientes();

      limpiar();

      setIdEditar(null);

    });

  }


  function limpiar(){

    setNombre("");
    setDocumento("");
    setTelefono("");
    setCorreo("");
    setDireccion("");
    setCiudad("");

  }
 const clientesFiltrados = clientes.filter(cliente=>

  cliente.nombre_cliente?.toLowerCase()
  .includes(busqueda.toLowerCase())

  ||

  cliente.nit_cliente?.toLowerCase()
  .includes(busqueda.toLowerCase())

  ||

  cliente.ciudad_cliente?.toLowerCase()
  .includes(busqueda.toLowerCase())

);


  return(

    <div className="container">

      <h2>Clientes</h2>
          <p>Administra y consulta la información de los clientes.</p>

      <form onSubmit={idEditar ? actualizarCliente : registrarCliente}>

        <input
          type="text"
          placeholder="Nombre *"
          value={nombre}
          onChange={(e)=>setNombre(e.target.value)}
          required
        />

       <input
  type="text"
  placeholder="Documento *"
  value={documento}
  onChange={(e) => setDocumento(e.target.value.replace(/\D/g, ""))}
  inputMode="numeric"
  pattern="[0-9]*"
  required
/>

      <input
  type="tel"
  placeholder="Teléfono *"
  value={telefono}
  onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
  inputMode="numeric"
  pattern="[0-9]*"
  required
/>

        <input
          type="email"
          placeholder="Correo *"
          value={correo}
          onChange={(e)=>setCorreo(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Dirección *"
          value={direccion}
          onChange={(e)=>setDireccion(e.target.value)}
          required
        />

        <select
          value={ciudad}
          onChange={(e)=>setCiudad(e.target.value)}
          required
        >
          <option value="">Ciudad *</option>
          {ciudadesColombia.map((ciudadItem)=>(
            <option key={ciudadItem} value={ciudadItem}>
              {ciudadItem}
            </option>
          ))}
        </select>

        <button type="submit">
          {idEditar ? "Actualizar Cliente" : "Registrar Cliente"}
        </button>

      </form>

      <hr/>

      <h3>Lista de Clientes</h3>
      <input

placeholder="Buscar cliente por nombre, documento o ciudad"

value={busqueda}

onChange={(e)=>setBusqueda(e.target.value)}

style={{
  width:"300px",
  padding:"8px",
  marginBottom:"15px"
}}

/>

      <table border="1">

        <thead>

          <tr>
            <th>ID Cliente</th>
            <th>Nombre</th>
            <th>NIT/CEDULA</th>
            <th>Telefono</th>
            <th>Correo</th>
            <th>Direccion</th>
            <th>Ciudad</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>

        </thead>

        <tbody>

          {clientesFiltrados.length ? (
            clientesFiltrados.map((cliente)=>(


            <tr key={cliente.id_cliente}>

              <td>{cliente.id_cliente}</td>
              <td>{cliente.nombre_cliente}</td>
              <td>{cliente.nit_cliente}</td>
              <td>{cliente.telefono_cliente}</td>
              <td>{cliente.correo_cliente}</td>
              <td>{cliente.direccion_cliente}</td>
              <td>{cliente.ciudad_cliente || ""}</td>

              <td style={{
                color: (cliente.estado || "activo") === "activo" ? "#22c55e" : "#ef4444",
                fontWeight: "bold"
              }}>
                {(cliente.estado || "activo").toUpperCase()}
              </td>

              <td>

  {cliente.nombre_cliente !== "CONSUMIDOR FINAL" && (
    <>
      <button onClick={()=>editarCliente(cliente)}>
        Editar
      </button>

      <button
        onClick={()=>cambiarEstadoCliente(cliente)}
        style={{
          marginLeft: '6px',
          backgroundColor: (cliente.estado || "activo") === "activo" ? "#ef4444" : "#22c55e",
          color:"white"
        }}
      >
        {(cliente.estado || "activo") === "activo" ? "Desactivar" : "Activar"}
      </button>
    </>
  )}

</td>

            </tr>

))

) : (

<tr>
<td colSpan="9">
No hay clientes para mostrar
</td>
</tr>

)}
        </tbody>


      </table>

    </div>

  );

}

export default Clientes;