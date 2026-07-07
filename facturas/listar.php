<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include("../conexion.php");

$sql = "SELECT f.id_factura, f.fecha_emision,
               c.nombre_cliente,
               CASE
                 WHEN f.total IS NOT NULL AND f.total <> 0 THEN f.total
                 ELSE SUM(d.subtotal)
               END AS total,
               f.estado
        FROM tabla_factura f
        JOIN tabla_cliente c ON f.id_cliente = c.id_cliente
        JOIN tabla_detalle_factura d ON f.id_factura = d.id_factura
        GROUP BY f.id_factura
        ORDER BY f.id_factura DESC";

$resultado = mysqli_query($conexion, $sql);
$datos = [];

while ($row = mysqli_fetch_assoc($resultado)) {
    $datos[] = $row;
}

echo json_encode($datos);
?>