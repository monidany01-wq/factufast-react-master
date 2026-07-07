<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include("../conexion.php");

$id = $_GET["id"];

// 🔹 DATOS DE LA FACTURA
$sqlFactura = "SELECT f.*, c.nombre_cliente 
FROM tabla_factura f
INNER JOIN tabla_cliente c ON f.id_cliente = c.id_cliente
WHERE f.id_factura = '$id'";

$resFactura = $conexion->query($sqlFactura);
$factura = $resFactura->fetch_assoc();


// 🔹 DETALLE (SIN ARRIESGAR ERROR)
$sqlDetalle = "SELECT d.*, p.nombre_producto 
FROM tabla_detalle_factura d
LEFT JOIN tabla_productos p 
ON d.id_productos = p.id_productos
WHERE d.id_factura = '$id'";

$resDetalle = $conexion->query($sqlDetalle);

$detalle = [];

while($row = $resDetalle->fetch_assoc()){

    // 🔥 AQUÍ HACEMOS LA MAGIA (sin romper BD)
    if(isset($row["precio"])){
        $row["precio_venta"] = $row["precio"];
    }

    $detalle[] = $row;
}


// 🔹 RESPUESTA FINAL
echo json_encode([
    "factura" => $factura,
    "detalle" => $detalle
]);

?>