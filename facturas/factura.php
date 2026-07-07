<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include("../conexion.php");

$id = $_GET['id'];

$sql = "SELECT 
f.*,
c.*,
u.nombre_usuario AS nombre_usuario

FROM tabla_factura f

JOIN tabla_cliente c 
ON f.id_cliente = c.id_cliente

LEFT JOIN tabla_usuario u
ON f.id_usuario = u.id_usuario

WHERE f.id_factura = '$id'";


$resultado = mysqli_query($conexion, $sql);


if(!$resultado){
    echo json_encode([
        "error" => mysqli_error($conexion)
    ]);
    exit;
}


if ($row = mysqli_fetch_assoc($resultado)) {
    echo json_encode($row);
} else {
    echo json_encode(null);
}

?>