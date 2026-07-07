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

$nombre = $conexion->real_escape_string($data['nombre_usuario'] ?? '');
$correo = $conexion->real_escape_string($data['correo_usuario'] ?? '');
$telefono = $conexion->real_escape_string($data['telefono_usuario'] ?? '');
$cedula = $conexion->real_escape_string($data['cedula_usuario'] ?? '');
$direccion = $conexion->real_escape_string($data['direccion_usuario'] ?? '');
$id_rol = $conexion->real_escape_string($data['id_rol'] ?? '3');

$sql = "INSERT INTO tabla_usuario
(nombre_usuario,correo_usuario,telefono_usuario,cedula_usuario,direccion_usuario,id_rol)
VALUES
('$nombre','$correo','$telefono','$cedula','$direccion','$id_rol')";

if($conexion->query($sql)){
  echo json_encode(["mensaje"=>"Usuario registrado", "ok"=>true]);
}else{
  echo json_encode(["error"=>$conexion->error, "ok"=>false]);
}

?>
