<?php

error_reporting(E_ALL);
ini_set('display_errors',1);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include "conexion.php";


if($conexion->connect_error){

echo json_encode([
"success"=>false,
"mensaje"=>"Error conexión BD"
]);

exit();

}



$nombre = $_POST["nombre"] ?? "";
$correo = $_POST["correo"] ?? "";
$direccion = $_POST["direccion"] ?? "";
$telefono = $_POST["telefono"] ?? "";
$cedula = $_POST["cedula"] ?? "";
$contrasena = $_POST["contrasena"] ?? "";



if(!$nombre || !$correo || !$direccion || !$telefono || !$cedula || !$contrasena){

echo json_encode([
"success"=>false,
"mensaje"=>"Datos incompletos"
]);

exit();

}



$passwordHash = password_hash($contrasena,PASSWORD_DEFAULT);



$rol = 3;



$sql = "INSERT INTO tabla_usuario
(nombre_usuario,direccion_usuario,correo_usuario,telefono_usuario,cedula_usuario,contrasena_usuario,id_rol)

VALUES

('$nombre','$direccion','$correo','$telefono','$cedula','$passwordHash','$rol')";




if($conexion->query($sql)){


echo json_encode([
"success"=>true
]);


}else{


echo json_encode([
"success"=>false,
"mensaje"=>$conexion->error
]);


}



$conexion->close();


?>