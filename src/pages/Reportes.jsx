/* eslint-disable react-hooks/exhaustive-deps, no-unused-vars */
import React,{useCallback,useEffect,useMemo,useState} from 'react';

import {
BarElement,
CategoryScale,
Chart as ChartJS,
Legend,
LinearScale,
Title,
Tooltip,
} from 'chart.js';

import {Bar} from 'react-chartjs-2';
import ExcelJS from "exceljs";
import {saveAs} from "file-saver";
import './Reportes.css';

ChartJS.register(CategoryScale,LinearScale,BarElement,Title,Tooltip,Legend);

const API_REPORTES=
process.env.REACT_APP_API_REPORTES ||
'http://localhost/factufast-api/reportes/resumen.php';

const formatoMoneda=(valor)=>
Number(valor||0).toLocaleString('es-CO',{
style:'currency',
currency:'COP',
maximumFractionDigits:0
});

const limpiarNumero=(valor)=>Number(valor||0);


function Reportes(){

const [totales,setTotales]=useState({
valor_inventario:0,
ganancia_total:0
});

const [ganancias,setGanancias]=useState([]);
const [stockBajo,setStockBajo]=useState([]);
const [facturasFiltradas,setFacturasFiltradas]=useState([]);

const [resumenFacturas,setResumenFacturas]=useState({
total_ventas:0,
cantidad_facturas:0
});

const [fechaInicio,setFechaInicio]=useState('');
const [fechaFin,setFechaFin]=useState('');

const [cargando,setCargando]=useState(true);
const [error,setError]=useState('');


const cargarReportes=async()=>{

setCargando(true);
setError('');

try{

const respuesta=await fetch(API_REPORTES);

const data=await respuesta.json();


setTotales({

valor_inventario:
limpiarNumero(data?.totales?.valor_inventario),

ganancia_total:
limpiarNumero(data?.totales?.ganancia_total)

});


setGanancias(
Array.isArray(data?.ganancias)
?data.ganancias
:[]
);


setStockBajo(
Array.isArray(data?.stock_bajo)
?data.stock_bajo
:[]
);


}catch(err){

setError(err.message);

}finally{

setCargando(false);

}

};



const calcularResumenFacturas=(facturas)=>{


const activas=facturas.filter(
(f)=>(f.estado||"ACTIVA")!=="ANULADA"
);


return{

total_ventas:activas.reduce(
(total,f)=>total+Number(f.total_pagado ?? f.total ?? 0),0
),

cantidad_facturas:activas.length

};


};



const cargarFacturasPorFecha=async()=>{


try{


const respuesta=await fetch(
"http://localhost/factufast-api/facturas/listar.php"
);


const data=await respuesta.json();


const todas=Array.isArray(data)?data:[];


const filtradas=todas.filter((f)=>{


const fecha=String(f.fecha_emision).slice(0,10);


if(fechaInicio && fecha<fechaInicio)
return false;


if(fechaFin && fecha>fechaFin)
return false;


return true;


});


setFacturasFiltradas(filtradas);

setResumenFacturas(
calcularResumenFacturas(filtradas)
);


}catch(error){

setFacturasFiltradas([]);

}finally{

}

};



const actualizarReportes=useCallback(async()=>{
await Promise.all([
cargarReportes(),
cargarFacturasPorFecha()
]);
}, [fechaInicio, fechaFin]);

useEffect(()=>{
actualizarReportes();
}, [actualizarReportes]);



const dataGrafica=useMemo(()=>({

labels:ganancias.map(
(p)=>p.nombre_producto
),

datasets:[{

label:'Ganancia por producto',

data:ganancias.map(
(p)=>limpiarNumero(p.ganancia)
),

backgroundColor:'#b59b00',
borderRadius:6

}]


}),[ganancias]);


const opcionesGrafica={

responsive:true,

maintainAspectRatio:false,

plugins:{

legend:{
position:'top'
},

title:{
display:true,
text:'Ganancias reales por producto'
}

}

};
const descargarReporteFacturas=async()=>{

const workbook=new ExcelJS.Workbook();

const hoja=workbook.addWorksheet("Facturas");


hoja.columns=[

{header:"ID Factura",key:"id",width:15},
{header:"Fecha emisión",key:"fecha",width:20},
{header:"Cliente",key:"cliente",width:30},
{header:"Total",key:"total",width:20},
{header:"Estado",key:"estado",width:20}

];


hoja.getRow(1).font={
bold:true
};


facturasFiltradas.forEach((f)=>{

hoja.addRow({

id:f.id_factura,

fecha:f.fecha_emision,

cliente:f.nombre_cliente,

total:Number(f.total_pagado ?? f.total ?? 0),

estado:f.estado||"ACTIVA"

});


});


const buffer=await workbook.xlsx.writeBuffer();


saveAs(
new Blob([buffer]),
`Reporte_facturas_${fechaInicio||"inicio"}_${fechaFin||"fin"}.xlsx`
);


};



return(

<div className="gerente-container">


<div className="reportes-header">

<h2>Reportes del Negocio</h2>

<p>
Información actualizada desde la base de datos de FactuFast.
</p>

</div>



<div
className="reportes-filtro"
style={{
marginBottom:"24px",
display:"flex",
gap:"16px",
alignItems:"center"
}}
>


<div
style={{
display:"flex",
gap:"15px"
}}
>


<div
style={{
display:"flex",
flexDirection:"column"
}}
>

<label>
Desde
</label>


<input
type="date"
value={fechaInicio}
onChange={(e)=>setFechaInicio(e.target.value)}
/>


</div>



<div
style={{
display:"flex",
flexDirection:"column"
}}
>

<label>
Hasta
</label>


<input
type="date"
value={fechaFin}
onChange={(e)=>setFechaFin(e.target.value)}
/>


</div>


</div>



<button
type="button"
className="btn-registrar"
onClick={descargarReporteFacturas}
>

Descargar reporte de facturas

</button>


</div>



{error&&
<div className="reporte-error">
{error}
</div>
}



{cargando?

<p>Cargando reportes...</p>

:


<>


<section className="reportes-resumen">


<article>

<span>
Valor total inventario
</span>

<strong>
{formatoMoneda(totales.valor_inventario)}
</strong>

</article>


<article>

<span>
Ganancia total
</span>

<strong>
{formatoMoneda(totales.ganancia_total)}
</strong>

</article>


<article>

<span>
Ventas totales
</span>

<strong>
{formatoMoneda(resumenFacturas.total_ventas)}
</strong>

</article>


<article>

<span>
Cantidad facturas
</span>

<strong>
{resumenFacturas.cantidad_facturas}
</strong>

</article>


</section>



<h3>
Facturas del rango seleccionado
</h3>


<table>

<thead>

<tr>

<th>ID</th>
<th>Fecha emisión</th>
<th>Cliente</th>
<th>Total</th>
<th>Estado</th>

</tr>

</thead>


<tbody>


{facturasFiltradas.map((f)=>(


<tr key={f.id_factura}>


<td>
{f.id_factura}
</td>


<td>
{f.fecha_emision}
</td>


<td>
{f.nombre_cliente}
</td>


<td>
{formatoMoneda(f.total_pagado ?? f.total ?? 0)}
</td>


<td>
{f.estado||"ACTIVA"}
</td>


</tr>


))}


</tbody>


</table>



<h3>
Ganancia por Producto
</h3>


<table>

<thead>

<tr>

<th>
Producto
</th>

<th>
Ganancia
</th>

</tr>

</thead>


<tbody>


{ganancias.map((p)=>(

<tr key={p.nombre_producto}>

<td>
{p.nombre_producto}
</td>

<td>
{formatoMoneda(p.ganancia)}
</td>

</tr>


))}


</tbody>

</table>



<h3>
Grafica de Ganancias
</h3>


<div className="reportes-grafica">

<Bar
data={dataGrafica}
options={opcionesGrafica}
/>

</div>



<h3>
Productos con Stock Bajo
</h3>


<table>

<thead>

<tr>

<th>
Producto
</th>

<th>
Stock
</th>

</tr>

</thead>


<tbody>


{stockBajo.map((p)=>(


<tr key={p.nombre_producto}>


<td>
{p.nombre_producto}
</td>


<td>
{p.stock}
</td>


</tr>


))}


</tbody>


</table>


</>


}


</div>

);

}


export default Reportes;