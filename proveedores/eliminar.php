<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include("../conexion.php");

$id = $_GET["id"];

// Validar que no sea el PROVEEDOR GENERAL
$query_check = "SELECT nombre_proveedor FROM tabla_proveedor WHERE id_proveedor='$id'";
$result_check = $conexion->query($query_check);
$proveedor = $result_check->fetch_assoc();

if($proveedor && $proveedor['nombre_proveedor'] === "PROVEEDOR GENERAL"){
    echo json_encode(["error" => "No se puede eliminar el Proveedor General"]);
    exit;
}

// Verificar si hay productos usando este proveedor
$query_productos = "SELECT COUNT(*) as count FROM tabla_productos WHERE id_proveedor='$id'";
$result_productos = $conexion->query($query_productos);
$productos = $result_productos->fetch_assoc();

if($productos['count'] > 0){
    echo json_encode(["error" => "No se puede eliminar. Hay " . $productos['count'] . " producto(s) asociado(s) a este proveedor"]);
    exit;
}

$sql = "DELETE FROM tabla_proveedor WHERE id_proveedor='$id'";

if($conexion->query($sql)){
 echo json_encode(["success"=>true]);
}else{
 echo json_encode(["success"=>false, "error"=>$conexion->error]);
}

?>