<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include "../conexion.php";

$data = json_decode(file_get_contents("php://input"), true);

$correo = $data["correo"] ?? "";

if($correo==""){

 echo json_encode([
  "success"=>false,
  "mensaje"=>"Ingrese el correo"
 ]);

 exit();

}

$sql = "SELECT cedula_usuario, nombre_usuario
        FROM tabla_usuario
        WHERE correo_usuario=?";

$stmt = $conexion->prepare($sql);
$stmt->bind_param("s",$correo);
$stmt->execute();

$resultado = $stmt->get_result();

if($resultado->num_rows > 0){

$fila = $resultado->fetch_assoc();

echo json_encode([
"success"=>true,
"usuario"=>$fila["cedula_usuario"],
"nombre"=>$fila["nombre_usuario"]
]);

}else{

echo json_encode([
"success"=>false,
"mensaje"=>"Correo no encontrado"
]);

}

?>