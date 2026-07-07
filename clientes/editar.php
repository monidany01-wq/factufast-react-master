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

$id = $data['id_cliente'] ?? '';
$nit = $data['nit_cliente'] ?? '';
$nombre = $data['nombre_cliente'] ?? '';
$direccion = $data['direccion_cliente'] ?? '';
$ciudad = $data['ciudad_cliente'] ?? '';
$correo = $data['correo_cliente'] ?? '';
$telefono = $data['telefono_cliente'] ?? '';

$sql = "UPDATE tabla_cliente SET
nit_cliente='$nit',
nombre_cliente='$nombre',
direccion_cliente='$direccion',
ciudad_cliente='$ciudad',
correo_cliente='$correo',
telefono_cliente='$telefono'
WHERE id_cliente='$id'";

if($conexion->query($sql)){
    echo json_encode(["mensaje"=>"Cliente actualizado"]);
}else{
    echo json_encode(["error"=>$conexion->error]);
}

?>