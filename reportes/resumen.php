<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include("../conexion.php");

/* INVENTARIO ACTUAL */

$sqlInventario="

SELECT
p.nombre_producto,

IFNULL(SUM(
CASE
WHEN i.tipo_movimiento='entrada' THEN i.cantidad
WHEN i.tipo_movimiento='salida' THEN -i.cantidad
END
),0) AS stock,

IFNULL(MAX(i.precio_venta),0) AS precio_venta,
IFNULL(MAX(i.precio_entrada),0) AS precio_compra

FROM tabla_productos p

LEFT JOIN tabla_inventario i
ON p.id_productos=i.id_productos

GROUP BY p.id_productos

HAVING stock > 0

";

$r1=$conexion->query($sqlInventario);

$inventario=[];
$totalInventario=0;
$gananciaPotencial=0;

while($fila=$r1->fetch_assoc()){

  $valorInventario=$fila["stock"]*$fila["precio_venta"];

  $gananciaProducto=($fila["precio_venta"]-$fila["precio_compra"])*$fila["stock"];

  $totalInventario+=$valorInventario;
  $gananciaPotencial+=$gananciaProducto;

  $inventario[]=$fila;

}

/* GANANCIA REAL POR VENTAS */

$sqlVentas="

SELECT

p.nombre_producto,

SUM(
(df.precio_unitario - p.precio_compra) * df.cantidad
) AS ganancia

FROM tabla_detalle_factura df

INNER JOIN tabla_factura f
ON f.id_factura = df.id_factura

INNER JOIN tabla_productos p
ON p.id_productos = df.id_productos

WHERE f.estado IS NULL
   OR f.estado != 'ANULADA'

GROUP BY p.nombre_producto

";

$r2=$conexion->query($sqlVentas);

$ganancias=[];
$totalGanancia=0;

while($fila=$r2->fetch_assoc()){

  $totalGanancia+=$fila["ganancia"];

  $ganancias[]=$fila;

}

/* STOCK BAJO */

$sqlStock="

SELECT
p.nombre_producto,

IFNULL(SUM(
CASE
WHEN i.tipo_movimiento='entrada' THEN i.cantidad
WHEN i.tipo_movimiento='salida' THEN -i.cantidad
END
),0) AS stock

FROM tabla_productos p

LEFT JOIN tabla_inventario i
ON p.id_productos=i.id_productos

GROUP BY p.id_productos

HAVING stock<=3 AND stock>0

";

$r3=$conexion->query($sqlStock);

$stockBajo=[];

while($fila=$r3->fetch_assoc()){
  $stockBajo[]=$fila;
}

echo json_encode([

  "inventario"=>$inventario,

  "ganancias"=>$ganancias,

  "stock_bajo"=>$stockBajo,

  "totales"=>[

    "valor_inventario"=>$totalInventario,

    "ganancia_potencial"=>$gananciaPotencial,

    "ganancia_total"=>$totalGanancia

  ]

]);

?>