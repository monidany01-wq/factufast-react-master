<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include("../conexion.php");
// ... resto igual
$nit = $_GET["nit"] ?? "";

$sql = "SELECT f.id_factura, f.fecha_emision, f.estado
FROM tabla_factura f
INNER JOIN tabla_cliente c ON f.id_cliente = c.id_cliente
WHERE c.nit_cliente = '$nit'
ORDER BY f.fecha_emision DESC";

$res = $conexion->query($sql);
$facturas = [];
while ($row = $res->fetch_assoc()) {
    $facturas[] = $row;
}

echo json_encode($facturas);
?>