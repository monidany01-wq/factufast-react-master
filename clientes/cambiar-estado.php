<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

require_once "../conexion.php";

$data = json_decode(file_get_contents("php://input"), true);

$id_cliente = isset($data["id_cliente"]) ? (int)$data["id_cliente"] : 0;
$estado = $data["estado"] ?? "";

if ($id_cliente <= 0 || !in_array($estado, ["activo", "inactivo"], true)) {
    echo json_encode(["success" => false, "error" => "Datos no válidos"]);
    exit;
}

try {
    $stmt = $conexion->prepare(
        "UPDATE tabla_cliente SET estado = ? WHERE id_cliente = ?"
    );

    if (!$stmt) {
        throw new Exception($conexion->error);
    }

    $stmt->bind_param("si", $estado, $id_cliente);

    if (!$stmt->execute()) {
        throw new Exception($stmt->error);
    }

    echo json_encode(["success" => true]);
} catch (Throwable $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
