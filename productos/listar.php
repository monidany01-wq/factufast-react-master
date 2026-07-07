<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include("../conexion.php");

$sql = "

SELECT 
p.id_productos,
p.nombre_producto,
p.descripcion_producto,
p.precio_salida,
p.precio_compra,
p.stock_minimo,
pr.nombre_proveedor

FROM tabla_productos p

LEFT JOIN tabla_proveedor pr
ON p.id_proveedor = pr.id_proveedor

ORDER BY p.nombre_producto

";

$resultado = mysqli_query($conexion,$sql);

$datos = [];

while($fila = mysqli_fetch_assoc($resultado)){
    $datos[] = $fila;
}

echo json_encode($datos);

?>