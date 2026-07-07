<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json");

include("../conexion.php");

$data = json_decode(file_get_contents("php://input"), true);

if(!$data){
 echo json_encode(["error"=>"No se recibieron datos"]);
 exit;
}

$id = $data['id_usuario'];
$nombre = $data['nombre_usuario'];
$correo = $data['correo_usuario'];
$telefono = $data['telefono_usuario'];
$cedula = $data['cedula_usuario'];
$direccion = $data['direccion_usuario'];
$rol = $data['id_rol'];

$sql = "UPDATE tabla_usuario SET
nombre_usuario='$nombre',
correo_usuario='$correo',
telefono_usuario='$telefono',
cedula_usuario='$cedula',
direccion_usuario='$direccion',
id_rol='$rol'
WHERE id_usuario='$id'";

if($conexion->query($sql)){
 echo json_encode(["mensaje"=>"Usuario actualizado correctamente"]);
}else{
 echo json_encode(["error"=>"No se pudo actualizar"]);
}

?>