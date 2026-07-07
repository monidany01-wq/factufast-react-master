<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include("../conexion.php");

$sql="

SELECT 

MONTH(fecha_movimiento) AS mes,

SUM(cantidad*precio_venta) AS ventas

FROM tabla_inventario

WHERE tipo_movimiento='salida'

GROUP BY MONTH(fecha_movimiento)

ORDER BY mes

";

$resultado=mysqli_query($conexion,$sql);

$datos=[];

while($fila=mysqli_fetch_assoc($resultado)){
$datos[]=$fila;
}

echo json_encode($datos);

?>