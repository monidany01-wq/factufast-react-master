<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include("../conexion.php");

$data = json_decode(file_get_contents("php://input"), true);

$nit = trim($data["NIT"] ?? "");
$nombre = trim($data["nombre_proveedor"] ?? "");
$ciudad = trim($data["ciudad_proveedor"] ?? "");
$direccion = trim($data["direccion_proveedor"] ?? "");
$correo = trim($data["correo_proveedor"] ?? "");
$telefono = trim($data["telefono_proveedor"] ?? "");

// Validación básica
if($nit=="" || $nombre=="" || $ciudad=="" || $direccion=="" || $correo=="" || $telefono==""){
  echo json_encode(["success"=>false, "msg"=>"Campos obligatorios"]);
  exit;
}

$sql = "INSERT INTO tabla_proveedor
(NIT,nombre_proveedor,ciudad_proveedor,direccion_proveedor,correo_proveedor,telefono_proveedor)
VALUES
('$nit','$nombre','$ciudad','$direccion','$correo','$telefono')";

if($conexion->query($sql)){
  echo json_encode(["success"=>true]);
}else{
  echo json_encode(["success"=>false, "error"=>$conexion->error]);
}
?>