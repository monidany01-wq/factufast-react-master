import React, { useEffect, useState } from "react";
import "./Listados.css";

function ListadoFacturas() {

  const [facturas, setFacturas] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const usuarioObj = JSON.parse(sessionStorage.getItem("usuario") || "{}");
  const rol = usuarioObj.rol || "";
  const esGerente = rol === "Gerente 1";

  const listarFacturas = () => {

    fetch("http://127.0.0.1/factufast-api/facturas/listar.php")
    .then((res)=>res.json())
    .then((data)=>setFacturas(data))
    .catch((err)=>{
      console.error(err);
      alert("Error cargando facturas");
    });

  };


  useEffect(()=>{
    listarFacturas();
  },[]);



  const abrirFactura = (idFactura) => {
    window.open(`/factura/${idFactura}`, "_blank");
  };


  const abrirAnularFactura = (idFactura) => {
    window.open(`/factura/anular/${idFactura}`, "_blank");
  };


  const facturasFiltradas = facturas.filter((f)=>{

    const texto = busqueda.toLowerCase();

    return (
      String(f.id_factura).includes(texto) ||
      String(f.nombre_cliente || "").toLowerCase().includes(texto) ||
      String(f.estado || "").toLowerCase().includes(texto)
    );

  });



  return (

    <div className="page-listados">

      <div style={{
  marginBottom:"16px"
}}>

<h2 style={{marginBottom:"10px"}}>
  LISTADO DE FACTURAS
</h2>


<input

type="text"

placeholder="Buscar factura por cliente o estado"

value={busqueda}

onChange={(e)=>setBusqueda(e.target.value)}

style={{
  width:"220px",
  padding:"8px"
}}

/>


<button
type="button"
onClick={listarFacturas}
style={{
  marginLeft:"10px"
}}
>
  Actualizar
</button>


</div>



      <table>

        <thead>

          <tr>

            <th>ID</th>
            <th>Fecha emisión</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>

          </tr>

        </thead>



        <tbody>


        {facturasFiltradas.map((f)=>(

          <tr key={f.id_factura}>


            <td>{f.id_factura}</td>


            <td>{f.fecha_emision}</td>


            <td>{f.nombre_cliente}</td>


            <td>
              ${Number(f.total || 0).toLocaleString("es-CO")}
            </td>


            <td style={{
              color:f.estado === "ANULADA" ? "red" : "green"
            }}>

              {f.estado || "ACTIVA"}

            </td>


            <td>


              <button onClick={()=>abrirFactura(f.id_factura)}>
                Ver
              </button>



              {esGerente && f.estado !== "ANULADA" && (

                <button

                  onClick={()=>abrirAnularFactura(f.id_factura)}

                  style={{
                    backgroundColor:"red",
                    color:"white",
                    marginLeft:"5px"
                  }}

                >

                  Anular

                </button>

              )}



              {f.estado === "ANULADA" && (

                <span style={{
                  color:"red",
                  marginLeft:"10px"
                }}>

                  ANULADA

                </span>

              )}


            </td>


          </tr>

        ))}


        </tbody>


      </table>


    </div>

  );

}


export default ListadoFacturas;