<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include("../conexion.php");

$data = json_decode(file_get_contents("php://input"), true);

$id = intval($data['id'] ?? 0);

if (!$id) {
    echo json_encode(["success" => false, "error" => "ID de movimiento requerido"]);
    exit;
}

$result = $conexion->query("SELECT observacion FROM tabla_inventario WHERE id_movimiento='$id'");

if (!$result) {
    echo json_encode(["success" => false, "error" => "Error al consultar el movimiento"]);
    exit;
}

$row = $result->fetch_assoc();

if (!$row) {
    echo json_encode(["success" => false, "error" => "Movimiento no encontrado"]);
    exit;
}

$observacion = trim((string)$row['observacion']);

if ($observacion !== "") {
    echo json_encode([
        "success" => false,
        "error" => "No se puede eliminar un movimiento asociado a una factura: $observacion"
    ]);
    exit;
}

$deleted = $conexion->query("DELETE FROM tabla_inventario WHERE id_movimiento='$id'");

echo json_encode(["success" => (bool)$deleted]);
?>