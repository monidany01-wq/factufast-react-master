<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include("../conexion.php");

$sql = "SELECT * FROM tabla_cliente ORDER BY id_cliente DESC";

$resultado = $conexion->query($sql);

$clientes = [];

while($fila = $resultado->fetch_assoc()){
    $clientes[] = $fila;
}

echo json_encode($clientes);

?>