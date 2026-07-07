<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include("../conexion.php");


// 🔥 INVENTARIO ACTUAL
$sql_inventario = "

SELECT 
p.id_productos,
p.nombre_producto,
p.iva,

IFNULL(SUM(
CASE
WHEN i.tipo_movimiento='entrada' THEN i.cantidad
WHEN i.tipo_movimiento='salida' THEN -i.cantidad
END
),0) AS stock,

IFNULL(MAX(i.precio_venta),0) AS precio_venta,

IFNULL(SUM(
CASE
WHEN i.tipo_movimiento='entrada' THEN i.cantidad
WHEN i.tipo_movimiento='salida' THEN -i.cantidad
END
),0) * IFNULL(MAX(i.precio_venta),0) AS valor_inventario

FROM tabla_productos p

LEFT JOIN tabla_inventario i
ON p.id_productos=i.id_productos

GROUP BY p.id_productos,p.nombre_producto,p.iva

ORDER BY p.nombre_producto

";

$resultado = $conexion->query($sql_inventario);

$inventario=[];

while($fila=$resultado->fetch_assoc()){
  $inventario[]=$fila;
}


// 🔥 HISTORIAL DE MOVIMIENTOS
$sql_historial = "

SELECT
i.id_movimiento,
i.id_productos,
p.nombre_producto,
i.cantidad,
i.tipo_movimiento,
i.precio_entrada,
i.precio_venta,
(i.precio_venta - i.precio_entrada) * i.cantidad AS ganancia,
DATE_FORMAT(i.fecha_movimiento,'%d-%m-%Y') AS fecha_movimiento

FROM tabla_inventario i

INNER JOIN tabla_productos p
ON p.id_productos = i.id_productos

ORDER BY i.fecha_movimiento DESC

";

$resultado2 = $conexion->query($sql_historial);

$historial=[];

while($fila=$resultado2->fetch_assoc()){
  $historial[]=$fila;
}


// 🔥 RESPUESTA FINAL
echo json_encode([
  "inventario"=>$inventario,
  "historial"=>$historial
]);

?>