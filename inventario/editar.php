<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include("../conexion.php");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id_movimiento"];
$cantidad = $data["cantidad"];
$precio_compra = $data["precio_entrada"];
$precio_venta = $data["precio_venta"];

$sql = "UPDATE tabla_inventario

SET
cantidad='$cantidad',
precio_entrada='$precio_compra',
precio_venta='$precio_venta'

WHERE id_movimiento='$id'";

$resultado = $conexion->query($sql);

echo json_encode([
"success"=>$resultado
]);

?>