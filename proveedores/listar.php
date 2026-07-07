<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include("../conexion.php");

$sql = "SELECT * FROM tabla_proveedor";

$resultado = $conexion->query($sql);

$proveedores = [];

while($fila = $resultado->fetch_assoc()){
    $proveedores[] = $fila;
}

echo json_encode($proveedores);

?>