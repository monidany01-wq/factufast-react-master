/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import './Listados.css';

function Inventario() {

  const [productos,setProductos] = useState([]);
  const [inventario,setInventario] = useState([]);
  const [historial,setHistorial] = useState([]);

  const [producto,setProducto] = useState("");
  const [productoTexto,setProductoTexto] = useState("");
  const [cantidad,setCantidad] = useState("");
  const [productoFiltro,setProductoFiltro] = useState("");

  const [precioCompra,setPrecioCompra] = useState("");
  const [precioVenta,setPrecioVenta] = useState("");

  const [idMovimiento,setIdMovimiento] = useState(null);

  const [fechaInicio,setFechaInicio] = useState("");
  const [fechaFin,setFechaFin] = useState("");
  const [busqueda,setBusqueda] = useState("");
  const [sugerencias,setSugerencias] = useState([]);


  const usuario = JSON.parse(sessionStorage.getItem("usuario") || "{}");
  const rol = usuario.rol || "";

  const esEmpleado = rol === "Empleado";
  const esGerente = rol === "Gerente 1";
  const puedeModificar = !esEmpleado;
  const puedeEditarHistorial = esGerente || rol === "Administrador";



  useEffect(()=>{

    obtenerProductos();
    obtenerInventario();

  },[]);



  const obtenerProductos = ()=>{

    fetch("http://localhost/factufast-api/productos/listar.php")
    .then(res=>res.json())
    .then(data=>setProductos(data || []))
    .catch(()=>alert("Error al cargar productos"));

  };



  const obtenerInventario = ()=>{

    fetch(`http://localhost/factufast-api/inventario/listar.php?ts=${Date.now()}`)
    .then(res=>res.json())
    .then(data=>{

      setInventario(data.inventario || []);
      setHistorial(data.historial || []);

    })
    .catch(()=>alert("Error cargando inventario"));

  };



  const seleccionarProducto = (id, nombre = "")=>{

    setProducto(id);
    setProductoTexto(nombre);

    const prod = productos.find(
      p=>String(p.id_productos) === String(id)
    );


    if(prod){

      setPrecioCompra(
        prod.precio_compra ??
        prod.precio_entrada ??
        prod.precio_costo ??
        ""
      );


      setPrecioVenta(
        prod.precio_salida ??
        prod.precio_venta ??
        ""
      );

    }

  };

  const manejarCambioProducto = (valor) => {
    setProductoTexto(valor);

    if (!valor) {
      setProducto("");
      setPrecioCompra("");
      setPrecioVenta("");
      setSugerencias([]);
      return;
    }

    const texto = valor.toLowerCase();
    const filtradas = productos.filter((p) =>
      String(p.nombre_producto || "")
        .toLowerCase()
        .includes(texto)
    );

    setSugerencias(filtradas.slice(0, 6));

    const prod = filtradas[0];
    if (prod && String(prod.nombre_producto || "").toLowerCase() === texto) {
      seleccionarProducto(prod.id_productos, prod.nombre_producto);
    } else {
      setProducto("");
    }
  };




  const guardarMovimiento = (e)=>{

    e.preventDefault();

    if (!window.confirm("¿Estás seguro que deseas registrar este movimiento?")) return;


    if(!producto)
      return alert("Seleccione un producto");


    if(!cantidad || Number(cantidad)<=0)
      return alert("Cantidad inválida");



    fetch("http://localhost/factufast-api/inventario/guardar.php",{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },


      body:JSON.stringify({

        id_producto:producto,

        cantidad:cantidad,

        tipo_movimiento:"entrada",


        precio_entrada:precioCompra,

        precio_compra:precioCompra,


        precio_venta:precioVenta

      })


    })

    .then(res=>res.json())

    .then(()=>{

      alert("Entrada registrada");

      limpiarFormulario();

      obtenerInventario();

    })

    .catch(()=>alert("Error guardando movimiento"));

  };





  const editarMovimiento = (mov)=>{


    setIdMovimiento(mov.id_movimiento);

    setProducto(
      String(mov.id_producto ?? mov.id_productos)
    );


    setCantidad(mov.cantidad);


    setPrecioCompra(
      mov.precio_entrada ??
      mov.precio_compra ??
      ""
    );


    setPrecioVenta(
      mov.precio_venta ??
      mov.precio_salida ??
      ""
    );


  };





  const actualizarMovimiento = (e)=>{

    e.preventDefault();

    if (!window.confirm("¿Estás seguro que deseas actualizar este movimiento?")) return;


    fetch("http://localhost/factufast-api/inventario/editar.php",{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },


      body:JSON.stringify({

        id_movimiento:idMovimiento,

        id_producto:producto,

        cantidad:cantidad,


        tipo_movimiento:"entrada",


        precio_entrada:precioCompra,

        precio_compra:precioCompra,


        precio_venta:precioVenta

      })

    })


    .then(res=>res.json())

    .then(()=>{

      alert("Movimiento actualizado");

      limpiarFormulario();

      obtenerInventario();

    });

  };





  const eliminarMovimiento=(id)=>{


    if(!window.confirm("¿Eliminar movimiento?"))
      return;


    fetch("http://localhost/factufast-api/inventario/eliminar.php",{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },


      body:JSON.stringify({id})

    })

    .then(res=>res.json())

    .then(()=>obtenerInventario());

  };





  const buscarMovimientos=()=>{


    fetch("http://localhost/factufast-api/inventario/buscar.php",{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },


      body:JSON.stringify({

        producto:productoFiltro,

        fecha_inicio:fechaInicio,

        fecha_fin:fechaFin

      })

    })


    .then(res=>res.json())

    .then(data=>setHistorial(data));

  };


  const limpiarFormulario=()=>{

    setProducto("");
    setProductoTexto("");

    setCantidad("");

    setPrecioCompra("");

    setPrecioVenta("");

    setIdMovimiento(null);

  };
  const historialFiltrado = historial.filter((mov)=>{

  const texto = busqueda.toLowerCase();

  return (
    mov.nombre_producto?.toLowerCase().includes(texto) ||
    mov.tipo_movimiento?.toLowerCase().includes(texto)
  );

});

  const exportarExcel = async () => {

  const workbook = new ExcelJS.Workbook();

  const worksheet = workbook.addWorksheet("Inventario");

  worksheet.columns = [
    { header: "Producto", key: "producto", width: 30 },
    { header: "Cantidad", key: "cantidad", width: 15 },
    { header: "Tipo", key: "tipo", width: 15 },
    { header: "Precio Compra", key: "compra", width: 20 },
    { header: "Precio Venta", key: "venta", width: 20 },
    { header: "Ganancia", key: "ganancia", width: 20 },
    { header: "Fecha", key: "fecha", width: 25 }
  ];
    worksheet.getRow(1).font = {
    bold:true
  };

  historial.forEach((mov) => {

    const compra = Number(
      mov.precio_entrada ??
      mov.precio_compra ??
      0
    );

    const venta = Number(
      mov.precio_venta ??
      0
    );

    const ganancia =
      (venta - compra) *
      Number(mov.cantidad);

    worksheet.addRow({
      producto: mov.nombre_producto,
      cantidad: mov.cantidad,
      tipo: mov.tipo_movimiento,
      compra,
      venta,
      ganancia,
      fecha: mov.fecha_movimiento
    });

  });
    const totalEntradas = historial
  .filter(m => m.tipo_movimiento === "entrada")
  .reduce(
    (total,m)=> total + Number(m.cantidad),
    0
  );


  const totalSalidas = historial
  .filter(m => m.tipo_movimiento === "salida")
  .reduce(
    (total,m)=> total + Number(m.cantidad),
    0
  );


  worksheet.addRow([]);


  worksheet.addRow({
    producto:"TOTAL ENTRADAS",
    cantidad:totalEntradas
  });


  worksheet.addRow({
    producto:"TOTAL SALIDAS",
    cantidad:totalSalidas
  });

  const buffer = await workbook.xlsx.writeBuffer();

  saveAs(
    new Blob([buffer]),
    `Inventario_${new Date().toISOString().slice(0,10)}.xlsx`
  );

};





return(

<div className="container">


{puedeModificar && (

<>
<div
  style={{
    display:"flex",
    alignItems:"center",
    gap:"10px",
    marginBottom:"15px",
    flexWrap:"nowrap"
  }}
>

  <input
    type="date"
    value={fechaInicio}
    onChange={(e)=>setFechaInicio(e.target.value)}
    style={{
      width:"140px",
      padding:"8px"
    }}
  />


  <span>Hasta</span>


  <input
    type="date"
    value={fechaFin}
    onChange={(e)=>setFechaFin(e.target.value)}
    style={{
      width:"140px",
      padding:"8px"
    }}
  />


  <button
    onClick={buscarMovimientos}
    style={{
      padding:"8px 15px"
    }}
  >
    Buscar
  </button>


  <button
    onClick={exportarExcel}
    style={{
      padding:"8px 15px"
    }}
  >
    Descargar Excel
  </button>


</div>
<h2>
{ idMovimiento ? "Editar entrada":"Registrar entrada"}
</h2>


<form onSubmit={idMovimiento ? actualizarMovimiento : guardarMovimiento}>


<div style={{ width:"100%", maxWidth:"320px", marginBottom:"10px", position:"relative" }}>
  <input
    type="text"
    placeholder="Escribe el nombre del producto"
    value={productoTexto}
    onChange={(e) => manejarCambioProducto(e.target.value)}
    style={{
      width:"100%",
      padding:"10px 12px",
      border:"1px solid #cbd5e1",
      borderRadius:"8px",
      outline:"none",
      boxShadow:"0 1px 2px rgba(15, 23, 42, 0.06)",
      boxSizing:"border-box"
    }}
  />

  {sugerencias.length > 0 && (
    <div style={{
      position:"absolute",
      top:"calc(100% + 2px)",
      left:0,
      right:0,
      zIndex:20,
      border:"1px solid #e2e8f0",
      background:"#fff",
      maxHeight:"160px",
      overflowY:"auto",
      borderRadius:"8px",
      boxShadow:"0 8px 18px rgba(15, 23, 42, 0.12)"
    }}>
      {sugerencias.map((p) => (
        <div
          key={p.id_productos}
          onClick={() => seleccionarProducto(p.id_productos, p.nombre_producto)}
          style={{
            padding:"10px 12px",
            cursor:"pointer",
            borderBottom:"1px solid #f8fafc",
            background:"#fff"
          }}
        >
          <strong style={{ display:"block", color:"#0f172a" }}>{p.nombre_producto}</strong>
          <span style={{ fontSize:"12px", color:"#64748b" }}>
            {p.stock != null ? `Stock: ${p.stock}` : "Producto disponible"}
          </span>
        </div>
      ))}
    </div>
  )}
</div>



<input

type="number"

placeholder="Cantidad"

value={cantidad}

onChange={(e)=>setCantidad(e.target.value)}

/>



<button type="submit">

Guardar

</button>


</form>

</>

)}




<h2>Inventario Actual</h2>


<table>

<thead>

<tr>

<th>Producto</th>

<th>Stock Actual</th>

</tr>

</thead>


<tbody>


{inventario.map((prod,i)=>(

<tr key={i}>

<td>{prod.nombre_producto}</td>

<td>{prod.stock}</td>

</tr>

))}


</tbody>

</table>





<h2>Historial de Movimientos</h2>
<input

type="text"

placeholder="Buscar producto o movimiento..."

value={busqueda}

onChange={(e)=>setBusqueda(e.target.value)}

style={{
  width:"300px",
  padding:"8px",
  marginBottom:"15px"
}}

/>



<table>

<thead>

<tr>

<th>Producto</th>

<th>Cantidad</th>

<th>Tipo</th>

{!esEmpleado && <th>Compra</th>}

<th>Venta</th>

{!esEmpleado && <th>Ganancia</th>}

<th>Fecha</th>

{puedeEditarHistorial && <th>Acciones</th>}

</tr>

</thead>



<tbody>


{historialFiltrado.map((mov,i)=>{

const compra = Number(
mov.precio_entrada ??
mov.precio_compra ??
0
);


const venta = Number(
mov.precio_venta ??
0
);


const ganancia =
(venta-compra) *
Number(mov.cantidad);



return(

<tr key={i}>


<td>{mov.nombre_producto}</td>

<td>{mov.cantidad}</td>

<td>{mov.tipo_movimiento}</td>

{!esEmpleado && (
  <td>
    ${compra.toLocaleString("es-CO")}
  </td>
)}

<td>
${venta.toLocaleString("es-CO")}
</td>

{!esEmpleado && (
  <td>
    ${ganancia.toLocaleString("es-CO")}
  </td>
)}

<td>
{mov.fecha_movimiento}
</td>

{puedeEditarHistorial && mov.tipo_movimiento !== "salida" && (

<td>

<button onClick={()=>editarMovimiento(mov)}>
Editar
</button>

<button
  className="btn-danger"
  onClick={()=>eliminarMovimiento(mov.id_movimiento)}
  style={{marginLeft:"6px"}}
>

Eliminar

</button>

</td>

)}

{puedeEditarHistorial && mov.tipo_movimiento === "salida" && (
  <td>
    <span style={{ color: "#64748b", fontSize: "12px" }}>Protegido</span>
  </td>
)}


</tr>

)


})}


</tbody>


</table>


</div>

);

}


export default Inventario;