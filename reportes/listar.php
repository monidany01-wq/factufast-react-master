<?php

error_reporting(E_ALL);
ini_set('display_errors',1);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include("../conexion.php");

$response=[];

/* TOTAL INVENTARIO */

$sqlInventario="

SELECT 

SUM(
CASE
WHEN tipo_movimiento='entrada' THEN cantidad*precio_venta
WHEN tipo_movimiento='salida' THEN -cantidad*precio_venta
ELSE 0
END
) AS valor_inventario

FROM tabla_inventario

";

$resInventario=mysqli_query($conexion,$sqlInventario);
$inventario=mysqli_fetch_assoc($resInventario);


/* GANANCIA TOTAL */

$sqlGanancia="

SELECT 

SUM(
CASE
WHEN tipo_movimiento='salida' 
THEN (precio_venta-precio_entrada)*cantidad

WHEN tipo_movimiento='entrada' 
AND observacion LIKE 'Anulación factura #%'
THEN -((precio_venta-precio_entrada)*cantidad)

ELSE 0
END
) AS ganancia_total

FROM tabla_inventario

";

$resGanancia=mysqli_query($conexion,$sqlGanancia);
$ganancia=mysqli_fetch_assoc($resGanancia);


/* GANANCIA POR PRODUCTO */

$sqlProductos="

SELECT 

p.nombre_producto,

SUM(
CASE
WHEN i.tipo_movimiento='salida'
THEN (i.precio_venta-i.precio_entrada)*i.cantidad

WHEN i.tipo_movimiento='entrada'
AND i.observacion LIKE 'Anulación factura #%'
THEN -((i.precio_venta-i.precio_entrada)*i.cantidad)

ELSE 0
END
) AS ganancia_producto

FROM tabla_inventario i

INNER JOIN tabla_productos p
ON i.id_productos=p.id_productos

GROUP BY p.nombre_producto

ORDER BY ganancia_producto DESC

";

$resProductos=mysqli_query($conexion,$sqlProductos);

$productos=[];

while($fila=mysqli_fetch_assoc($resProductos)){
  $productos[]=$fila;
}

$response=[
  "inventario"=>$inventario,
  "ganancia"=>$ganancia,
  "productos"=>$productos
];

echo json_encode($response);

?>