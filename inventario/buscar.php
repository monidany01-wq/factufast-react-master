<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include("../conexion.php");

$data = json_decode(file_get_contents("php://input"), true);

$producto = $data["producto"] ?? "";
$fecha_inicio = $data["fecha_inicio"] ?? "";
$fecha_fin = $data["fecha_fin"] ?? "";

$sql = "SELECT

p.nombre_producto,
i.cantidad,
i.tipo_movimiento,
i.precio_entrada,
i.precio_venta,
(i.precio_venta - i.precio_entrada) * i.cantidad AS ganancia,
i.fecha_movimiento

FROM tabla_inventario i

INNER JOIN tabla_productos p
ON p.id_productos = i.id_productos

WHERE 1=1";

if($producto != ""){
$sql .= " AND i.id_productos='$producto'";
}

if($fecha_inicio != "" && $fecha_fin != ""){
$sql .= " AND DATE(i.fecha_movimiento) BETWEEN '$fecha_inicio' AND '$fecha_fin'";
}

$sql .= " ORDER BY i.fecha_movimiento DESC";

$resultado = $conexion->query($sql);

$datos = [];

while($fila = $resultado->fetch_assoc()){
$datos[] = $fila;
}

echo json_encode($datos);

?>