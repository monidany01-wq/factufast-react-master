<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

include("../conexion.php");

$data = json_decode(file_get_contents("php://input"), true);

if(!$data){
 echo json_encode(["error"=>"No llegaron datos"]);
 exit;
}

$nit = $data['nit_cliente'];
$nombre = $data['nombre_cliente'];
$direccion = $data['direccion_cliente'];
$ciudad = $data['ciudad_cliente'] ?? '';
$correo = $data['correo_cliente'];
$telefono = $data['telefono_cliente'];

$sql = "INSERT INTO tabla_cliente
(nit_cliente,nombre_cliente,direccion_cliente,ciudad_cliente,correo_cliente,telefono_cliente)
VALUES
('$nit','$nombre','$direccion','$ciudad','$correo','$telefono')";

if($conexion->query($sql)){
 echo json_encode(["mensaje"=>"Cliente registrado"]);
}else{
 echo json_encode(["error"=>$conexion->error]);
}

?>