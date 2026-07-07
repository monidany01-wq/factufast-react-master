<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include "../conexion.php";

$data = json_decode(file_get_contents("php://input"), true);

$cedula = $data["usuario"];
$nuevaClave = $data["clave"];

/* VALIDAR DATOS */

if($cedula=="" || $nuevaClave==""){

 echo json_encode([
  "success"=>false,
  "mensaje"=>"Datos incompletos"
 ]);

 exit();

}

/* ENCRIPTAR CONTRASEÑA */

$claveSegura = password_hash($nuevaClave, PASSWORD_DEFAULT);

/* ACTUALIZAR */

$sql = "UPDATE tabla_usuario 
SET contrasena_usuario='$claveSegura'
WHERE cedula_usuario='$cedula'";

if($conexion->query($sql)){

 echo json_encode([
  "success"=>true,
  "mensaje"=>"Contraseña actualizada"
 ]);

}else{

 echo json_encode([
  "success"=>false,
  "error"=>$conexion->error
 ]);

}

?>