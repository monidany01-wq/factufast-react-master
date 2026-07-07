<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

include("../conexion.php");

$data = json_decode(file_get_contents("php://input"), true);

$id_factura = $data['id_factura'];
$id_producto = $data['id_producto'];
$cantidad = $data['cantidad'];
$precio = $data['precio'];
$subtotal = $data['subtotal'];

$sql = "INSERT INTO tabla_detalle_factura
(id_factura,id_producto,cantidad,precio,subtotal)
VALUES
('$id_factura','$id_producto','$cantidad','$precio','$subtotal')";

if($conexion->query($sql)){

echo json_encode(["mensaje"=>"Producto agregado"]);

}else{

echo json_encode(["error"=>$conexion->error]);

}

?>