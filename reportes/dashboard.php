<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include("../conexion.php");

$response=[];

/* VENTAS DEL MES */

$sqlVentasMes="

SELECT 

SUM(cantidad*precio_venta) AS ventas_mes

FROM tabla_inventario

WHERE tipo_movimiento='salida'
AND MONTH(fecha_movimiento)=MONTH(CURDATE())
AND YEAR(fecha_movimiento)=YEAR(CURDATE())

";

$resVentas=mysqli_query($conexion,$sqlVentasMes);
$ventasMes=mysqli_fetch_assoc($resVentas);


/* GANANCIA DEL MES */

$sqlGananciaMes="

SELECT 

SUM((precio_venta-precio_entrada)*cantidad) AS ganancia_mes

FROM tabla_inventario

WHERE tipo_movimiento='salida'
AND MONTH(fecha_movimiento)=MONTH(CURDATE())
AND YEAR(fecha_movimiento)=YEAR(CURDATE())

";

$resGanancia=mysqli_query($conexion,$sqlGananciaMes);
$gananciaMes=mysqli_fetch_assoc($resGanancia);


/* VALOR INVENTARIO */

$sqlInventario="

SELECT 

SUM(
CASE
WHEN tipo_movimiento='entrada' THEN cantidad*precio_venta
WHEN tipo_movimiento='salida' THEN -cantidad*precio_venta
ELSE 0
END
) AS valor_inventario

FROM tabla_inventario

";

$resInventario=mysqli_query($conexion,$sqlInventario);
$inventario=mysqli_fetch_assoc($resInventario);


/* PRODUCTOS MÁS VENDIDOS */

$sqlProductos="

SELECT 

p.nombre_producto,
SUM(i.cantidad) AS vendidos

FROM tabla_inventario i

INNER JOIN tabla_productos p
ON i.id_productos=p.id_productos

WHERE i.tipo_movimiento='salida'

GROUP BY p.nombre_producto

ORDER BY vendidos DESC

LIMIT 5

";

$resProductos=mysqli_query($conexion,$sqlProductos);

$productos=[];

while($fila=mysqli_fetch_assoc($resProductos)){
$productos[]=$fila;
}

$response=[

"ventas_mes"=>$ventasMes,
"ganancia_mes"=>$gananciaMes,
"inventario"=>$inventario,
"productos"=>$productos

];

echo json_encode($response);

?>