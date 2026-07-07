<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include("../conexion.php");

$buscar = $_GET["buscar"];

$sql = "SELECT * FROM tabla_proveedor 
WHERE nombre_proveedor LIKE '%$buscar%'";

$resultado = $conexion->query($sql);

$datos = [];

while($fila = $resultado->fetch_assoc()){
 $datos[] = $fila;
}

echo json_encode($datos);

?>