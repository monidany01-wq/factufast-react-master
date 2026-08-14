/* eslint-disable no-unused-vars */
import React, {
  useEffect,
  useState,
} from 'react';

import './Listados.css';

function Productos(){

const [productos,setProductos]     = useState([]);
const [proveedores,setProveedores] = useState([]);
const [nombre,setNombre]           = useState("");
const [descripcion,setDescripcion] = useState("");
const [precioCompra,setPrecioCompra] = useState("");
const [precioSalida,setPrecioSalida] = useState("");
const [stock,setStock]             = useState("");
const [stockAnterior,setStockAnterior] = useState("");
const [proveedor,setProveedor]     = useState("");
const [editando,setEditando]       = useState(false);
const [idProducto,setIdProducto]   = useState(null);
const [busqueda,setBusqueda]       = useState("");

const usuarioObj = JSON.parse(sessionStorage.getItem("usuario") || "{}");
const rol        = usuarioObj.rol || "";
const esGerente  = rol === "Gerente 1";
const esAdmin    = rol === "Administrador";


useEffect(()=>{

  obtenerProductos();
  obtenerProveedores();

},[]);



const obtenerProductos = ()=>{

  fetch("http://localhost/factufast-api/productos/listar.php")
  .then(res=>res.json())
  .then(data=>setProductos(data || []));

};



const obtenerProveedores = ()=>{

  fetch("http://localhost/factufast-api/proveedores/listar.php")
  .then(res=>res.json())
  .then(data=>setProveedores(data || []));

};



const obtenerIdProveedorProducto = (prod)=>{

  if(prod.id_proveedor){

    return String(prod.id_proveedor);

  }


  const encontrado = proveedores.find((prov)=>

    prov.nombre_proveedor === prod.nombre_proveedor

  );


  return encontrado ? String(encontrado.id_proveedor) : "";

};



const registrarProducto = (e)=>{

e.preventDefault();

 if (!window.confirm("¿Estás seguro que deseas registrar este producto?")) return;


if(!nombre || !precioCompra || !precioSalida || !proveedor){

alert("Complete los campos requeridos");

return;

}


fetch("http://localhost/factufast-api/productos/guardar.php",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

nombre_producto:nombre,

descripcion_producto:descripcion,

precio_salida:precioSalida,

precio_compra:precioCompra,

stock_minimo:stock,

id_proveedor:proveedor

})

})

.then(res=>res.json())

.then(async(data)=>{
obtenerProductos();
limpiarFormulario();


});


};



const eliminarProducto = (id)=>{


if(!window.confirm("¿Eliminar producto?")) return;


fetch("http://localhost/factufast-api/productos/eliminar.php",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({id})

})

.then(res=>res.json())

.then(data=>{


if(!data.success){

alert(data.error);

return;

}


obtenerProductos();


});


};



const editarProducto = (prod)=>{


setEditando(true);

setIdProducto(prod.id_productos);

setNombre(prod.nombre_producto || "");

setDescripcion(prod.descripcion_producto || "");

setPrecioCompra(prod.precio_compra || "");

setPrecioSalida(prod.precio_salida || "");

setStock(prod.stock_minimo || "");

setProveedor(obtenerIdProveedorProducto(prod));


};



const actualizarProducto = (e)=>{

e.preventDefault();

 if (!window.confirm("¿Estás seguro que deseas actualizar este producto?")) return;


fetch("http://localhost/factufast-api/productos/actualizar.php",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

id_productos:idProducto,

nombre_producto:nombre,

descripcion_producto:descripcion,

precio_salida:precioSalida,

precio_compra:precioCompra,

stock_minimo:stock,

id_proveedor:proveedor

})

})

.then(res=>res.json())

.then(()=>{

obtenerProductos();

limpiarFormulario();

});


};const limpiarFormulario = ()=>{

setNombre("");

setDescripcion("");

setPrecioCompra("");

setPrecioSalida("");

setStock("");

setProveedor("");

setEditando(false);

setIdProducto(null);

};



const textoBusqueda = busqueda.toLowerCase();

const productosFiltrados = productos.filter(prod =>

  String(prod.nombre_producto || "")
  .toLowerCase()
  .includes(textoBusqueda)

  ||

  String(prod.descripcion_producto || "")
  .toLowerCase()
  .includes(textoBusqueda)

  ||

  String(prod.nombre_proveedor || "")
  .toLowerCase()
  .includes(textoBusqueda)

);



return(

<div className="container">


<h2>Productos</h2>

<p>Administra y consulta el stock de productos.</p>



<form onSubmit={editando ? actualizarProducto : registrarProducto}>


<input

placeholder="Nombre producto *"

value={nombre}

onChange={(e)=>setNombre(e.target.value)}

/>



<input

placeholder="Descripción"

value={descripcion}

onChange={(e)=>setDescripcion(e.target.value)}

/>



{(esGerente || esAdmin) && (

<input

type="number"

placeholder="Precio compra *"

value={precioCompra}

onChange={(e)=>setPrecioCompra(e.target.value)}

/>

)}



{(esGerente || esAdmin) && (

<input

type="number"

placeholder="Precio salida *"

value={precioSalida}

onChange={(e)=>setPrecioSalida(e.target.value)}

/>

)}

{(esGerente || esAdmin) && !editando && (

<input

type="number"

placeholder="Stock"

value={stock}

onChange={(e)=>setStock(e.target.value)}

/>

)}



<select

value={proveedor}

onChange={(e)=>setProveedor(e.target.value)}

>


<option value="">

Seleccione proveedor *

</option>


{proveedores.map((prov)=>(


<option

key={prov.id_proveedor}

value={String(prov.id_proveedor)}

>

{prov.nombre_proveedor}

</option>


))}


</select>



<button type="submit">

{editando ? "Actualizar" : "Registrar producto"}

</button>



</form>



<input

placeholder="Buscar producto por nombre, descripción o proveedor"

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

<th>ID</th>

<th>Nombre</th>

<th>Descripción</th>

<th>Precio entrada</th>

<th>Precio venta</th>

<th>Stock</th>

<th>Proveedor</th>

<th>Acciones</th>

</tr>

</thead>



<tbody>


{productosFiltrados.length ? (


productosFiltrados.map((prod)=>(


<tr key={prod.id_productos}>


<td>{prod.id_productos}</td>


<td>{prod.nombre_producto}</td>


<td>{prod.descripcion_producto}</td>


<td>

${Number(
prod.precio_compra ?? 0
).toLocaleString("es-CO")}

</td>


<td>

${Number(
prod.precio_salida ?? 0
).toLocaleString("es-CO")}

</td>


<td>

{prod.stock_minimo}

</td>


<td>

{prod.nombre_proveedor}

</td>



<td>


<button

type="button"

onClick={()=>editarProducto(prod)}

>

Editar

</button>



<button

type="button"

className="btn-danger"

onClick={()=>eliminarProducto(prod.id_productos)}

style={{marginLeft:"6px"}}

>

Eliminar

</button>


</td>


</tr>


))


) : (


<tr>

<td colSpan="8">

No hay productos para mostrar

</td>

</tr>


)}



</tbody>


</table>



</div>

);

}


export default Productos;