<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include("../conexion.php");

$id = $_GET["id"] ?? "";

if (!$id) {
    echo json_encode([
        "success" => false,
        "error" => "ID de factura no recibido"
    ]);
    exit;
}

$id = intval($id);

$factura = $conexion->query("
    SELECT estado
    FROM tabla_factura
    WHERE id_factura = $id
");

if (!$factura || $factura->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "error" => "Factura no encontrada"
    ]);
    exit;
}

$facturaData = $factura->fetch_assoc();

if ($facturaData["estado"] === "ANULADA") {
    echo json_encode([
        "success" => false,
        "error" => "La factura ya está anulada"
    ]);
    exit;
}

$detalles = $conexion->query("
    SELECT 
        df.id_productos,
        df.cantidad,
        df.precio_unitario,
        p.precio_compra
    FROM tabla_detalle_factura df
    INNER JOIN tabla_productos p ON p.id_productos = df.id_productos
    WHERE df.id_factura = $id
");

if (!$detalles) {
    echo json_encode([
        "success" => false,
        "error" => $conexion->error
    ]);
    exit;
}

$conexion->begin_transaction();

try {
    while ($detalle = $detalles->fetch_assoc()) {
        $id_producto = intval($detalle["id_productos"]);
        $cantidad = intval($detalle["cantidad"]);
        $precio_venta = floatval($detalle["precio_unitario"]);
        $precio_compra = floatval($detalle["precio_compra"]);

        $conexion->query("
            UPDATE tabla_productos
            SET stock_minimo = stock_minimo + $cantidad
            WHERE id_productos = $id_producto
        ");

        if ($conexion->error) {
            throw new Exception($conexion->error);
        }

        $conexion->query("
            INSERT INTO tabla_inventario
            (id_productos, cantidad, tipo_movimiento, precio_entrada, precio_venta, fecha_movimiento, observacion)
            VALUES
            ($id_producto, $cantidad, 'entrada', $precio_compra, $precio_venta, NOW(), 'Anulación factura #$id')
        ");

        if ($conexion->error) {
            throw new Exception($conexion->error);
        }

    }

    $conexion->query("
        UPDATE tabla_factura
        SET estado = 'ANULADA'
        WHERE id_factura = $id
    ");

    if ($conexion->error) {
        throw new Exception($conexion->error);
    }

    $conexion->commit();

    echo json_encode([
        "success" => true,
        "mensaje" => "Factura anulada correctamente. El inventario fue actualizado."
    ]);

} catch (Exception $e) {
    $conexion->rollback();

    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>