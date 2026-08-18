import React, { useEffect, useState } from "react";
import "./Listados.css";

function ListadoFacturas() {

  const [facturas, setFacturas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModalMotivo, setMostrarModalMotivo] = useState(false);
  const [motivoSeleccionado, setMotivoSeleccionado] = useState(null);

  const usuarioObj = JSON.parse(sessionStorage.getItem("usuario") || "{}");
  const rol = usuarioObj.rol || "";
  const puedeAnular = ["Gerente 1", "Administrador", "Empleado"].includes(rol);

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

  const verMotivo = (factura) => {
    setMotivoSeleccionado(factura);
    setMostrarModalMotivo(true);
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



              {puedeAnular && f.estado !== "ANULADA" && (

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

                <>
                  <button
                    onClick={() => verMotivo(f)}
                    style={{
                      backgroundColor: "#475569",
                      color:"white",
                      marginLeft:"5px",
                      padding: "6px 10px",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                    title="Ver motivo de anulación"
                  >
                    👁️ Ver motivo
                  </button>
                </>

              )}


            </td>


          </tr>

        ))}


        </tbody>


      </table>

      {mostrarModalMotivo && motivoSeleccionado && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "30px",
            maxWidth: "500px",
            width: "90%",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)"
          }}>
            <h2 style={{ marginTop: 0, marginBottom: "20px" }}>
              Motivo de Anulación
            </h2>
            <p><strong>Factura #:</strong> {motivoSeleccionado.id_factura}</p>
            <p><strong>Cliente:</strong> {motivoSeleccionado.nombre_cliente}</p>
            <p><strong>Anulada por:</strong> {motivoSeleccionado.usuario_anula || "No registrado"}</p>
            <p><strong>Fecha de anulación:</strong> {motivoSeleccionado.fecha_anulacion || "No registrada"}</p>
            <div style={{
              backgroundColor: "#f3f4f6",
              padding: "15px",
              borderRadius: "6px",
              marginTop: "15px"
            }}>
              <p><strong>Motivo:</strong></p>
              <p style={{ marginTop: "10px", whiteSpace: "pre-wrap" }}>
                {motivoSeleccionado.motivo_anulacion || "No se especificó motivo"}
              </p>
            </div>
            <button
              onClick={() => setMostrarModalMotivo(false)}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                width: "100%"
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>

  );

}


export default ListadoFacturas;