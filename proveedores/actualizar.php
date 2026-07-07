<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include("../conexion.php");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id_proveedor"];
$nit = $data["NIT"];
$nombre = $data["nombre_proveedor"];
$ciudad = $data["ciudad_proveedor"];
$direccion = $data["direccion_proveedor"];
$correo = $data["correo_proveedor"];
$telefono = $data["telefono_proveedor"];

// Validar que no sea el PROVEEDOR GENERAL
$query_check = "SELECT nombre_proveedor FROM tabla_proveedor WHERE id_proveedor='$id'";
$result_check = $conexion->query($query_check);
$proveedor = $result_check->fetch_assoc();

if($proveedor && $proveedor['nombre_proveedor'] === "PROVEEDOR GENERAL"){
    echo json_encode(["error" => "No se puede modificar el Proveedor General"]);
    exit;
}

$sql = "UPDATE tabla_proveedor SET
NIT='$nit',
nombre_proveedor='$nombre',
ciudad_proveedor='$ciudad',
direccion_proveedor='$direccion',
correo_proveedor='$correo',
telefono_proveedor='$telefono'
WHERE id_proveedor='$id'";

if($conexion->query($sql)){
 echo json_encode(["success"=>true]);
}else{
 echo json_encode(["success"=>false]);
}
?>
