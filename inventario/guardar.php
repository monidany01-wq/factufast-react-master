<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

include("../conexion.php");

$data = json_decode(file_get_contents("php://input"), true);

$id_producto   = $data["id_producto"] ?? "";
$cantidad      = $data["cantidad"] ?? "";
$tipo          = $data["tipo_movimiento"] ?? "entrada";
$precio_compra = $data["precio_compra"] ?? ($data["precio_entrada"] ?? 0);
$precio_venta  = $data["precio_venta"] ?? 0;

if (!$id_producto || !$cantidad) {
    echo json_encode([
        "success" => false,
        "error" => "Datos incompletos"
    ]);
    exit;
}

if ($cantidad <= 0) {
    echo json_encode([
        "success" => false,
        "error" => "La cantidad debe ser mayor a 0"
    ]);
    exit;
}

if ($tipo !== "entrada") {
    echo json_encode([
        "success" => false,
        "error" => "Desde inventario solo se permiten entradas"
    ]);
    exit;
}

$id_producto   = mysqli_real_escape_string($conexion, $id_producto);
$cantidad      = mysqli_real_escape_string($conexion, $cantidad);
$tipo          = mysqli_real_escape_string($conexion, $tipo);
$precio_compra = mysqli_real_escape_string($conexion, $precio_compra);
$precio_venta  = mysqli_real_escape_string($conexion, $precio_venta);

$sql = "INSERT INTO tabla_inventario 
(id_productos, cantidad, tipo_movimiento, precio_entrada, precio_venta, fecha_movimiento)
VALUES 
('$id_producto', '$cantidad', '$tipo', '$precio_compra', '$precio_venta', NOW())";

if (!mysqli_query($conexion, $sql)) {
    echo json_encode([
        "success" => false,
        "error" => "Error insertando movimiento: " . mysqli_error($conexion)
    ]);
    exit;
}

$updateProducto = "UPDATE tabla_productos SET 
    precio_compra = '$precio_compra',
    precio_salida = '$precio_venta'
    WHERE id_productos = '$id_producto'";

if (!mysqli_query($conexion, $updateProducto)) {
    echo json_encode([
        "success" => false,
        "error" => "Error actualizando producto: " . mysqli_error($conexion)
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "mensaje" => "Entrada registrada correctamente"
]);
?>