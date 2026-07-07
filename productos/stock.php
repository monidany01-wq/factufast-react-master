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

IFNULL(SUM(
CASE
WHEN i.tipo_movimiento = 'entrada' THEN i.cantidad
WHEN i.tipo_movimiento = 'salida' THEN -i.cantidad
ELSE 0
END
),0) AS stock_producto,

IFNULL(MAX(i.precio_venta),0) AS precio_producto

FROM tabla_productos p

LEFT JOIN tabla_inventario i
ON p.id_productos = i.id_productos

GROUP BY p.id_productos, p.nombre_producto

ORDER BY p.nombre_producto

";

$resultado = mysqli_query($conexion,$sql);

$datos = [];

while($fila = mysqli_fetch_assoc($resultado)){
    $datos[] = $fila;
}

echo json_encode($datos);

?>