<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include("../conexion.php");

$id = $_GET['id'];

$sql = "DELETE FROM tabla_factura WHERE id_factura = '$id'";

if ($conexion->query($sql)) {
    echo json_encode(["success"=>true]);
} else {
    echo json_encode([
        "success"=>false,
        "error"=>$conexion->error
    ]);
}
?>