<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include("../conexion.php");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id_productos"];
$nombre = $data["nombre_producto"];
$descripcion = $data["descripcion_producto"];
$precio = $data["precio_salida"];
$precio_compra = $data["precio_compra"];
$stock = $data["stock_minimo"];
$proveedor = $data["id_proveedor"];

$sql = "UPDATE tabla_productos SET
nombre_producto='$nombre',
descripcion_producto='$descripcion',
precio_salida='$precio',
precio_compra='$precio_compra',
id_proveedor='$proveedor'
WHERE id_productos='$id'";

$resultado = $conexion->query($sql);

echo json_encode(["success"=>$resultado]);

?>