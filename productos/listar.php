<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once "../conexion.php";

$sql = "
SELECT
    p.id_productos,
    p.nombre_producto,
    p.descripcion_producto,
    p.precio_salida,
    p.precio_compra,
    p.stock_minimo,
    p.iva,
    p.estado,
    pr.nombre_proveedor,

    IFNULL(SUM(
        CASE
            WHEN i.tipo_movimiento = 'entrada' THEN i.cantidad
            WHEN i.tipo_movimiento = 'salida' THEN -i.cantidad
            ELSE 0
        END
    ), 0) AS stock

FROM tabla_productos p

LEFT JOIN tabla_proveedor pr
    ON p.id_proveedor = pr.id_proveedor

LEFT JOIN tabla_inventario i
    ON p.id_productos = i.id_productos

GROUP BY
    p.id_productos,
    p.nombre_producto,
    p.descripcion_producto,
    p.precio_salida,
    p.precio_compra,
    p.stock_minimo,
    p.iva,
    p.estado,
    pr.nombre_proveedor

ORDER BY p.nombre_producto
";

$resultado = $conexion->query($sql);

if (!$resultado) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $conexion->error
    ]);
    exit;
}

$datos = [];

while ($fila = $resultado->fetch_assoc()) {
    $datos[] = $fila;
}

echo json_encode($datos);