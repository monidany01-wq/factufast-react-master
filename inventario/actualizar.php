<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include("../conexion.php");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id_movimiento"];

$sql = "UPDATE tabla_inventario SET
cantidad='".$data["cantidad"]."',
tipo_movimiento='".$data["tipo_movimiento"]."',
precio_entrada='".$data["precio_compra"]."',
precio_venta='".$data["precio_venta"]."'
WHERE id_movimiento='$id'";

$conexion->query($sql);

echo json_encode(["success"=>true]);
?>