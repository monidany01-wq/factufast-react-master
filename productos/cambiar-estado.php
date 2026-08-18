<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") exit;

require_once "../conexion.php";

$data = json_decode(file_get_contents("php://input"), true);
$id_productos = isset($data["id_productos"]) ? (int)$data["id_productos"] : 0;
$estado = $data["estado"] ?? "";

if ($id_productos <= 0 || !in_array($estado, ["activo", "inactivo"], true)) {
    echo json_encode(["success" => false, "error" => "Datos no válidos"]);
    exit;
}

try {
    $stmt = $conexion->prepare(
        "UPDATE tabla_productos SET estado = ? WHERE id_productos = ?"
    );
    $stmt->bind_param("si", $estado, $id_productos);
    $stmt->execute();

    echo json_encode(["success" => true]);
} catch (Throwable $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}