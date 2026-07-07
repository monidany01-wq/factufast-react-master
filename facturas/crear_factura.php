<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include("../conexion.php");

$data = json_decode(file_get_contents("php://input"), true);

$id_cliente  = $data['id_cliente'];
$id_producto = $data['id_producto'];
$cantidad    = $data['cantidad'];
$precio      = $data['precio'];

mysqli_begin_transaction($conexion);

try {

  // 1️⃣ Obtener stock actual (bloqueo)
  $res = mysqli_query($conexion,"
    SELECT stock_producto, precio_compra
    FROM tabla_productos
    WHERE id_productos='$id_producto'
    FOR UPDATE
  ");

  $prod = mysqli_fetch_assoc($res);

  if(!$prod || $cantidad > $prod['stock_producto']){
    throw new Exception("Stock insuficiente");
  }

  // 2️⃣ Tomar precio de compra real del producto
  $precio_compra = $prod['precio_compra'] ?? 0;

  $total = $cantidad * $precio;

  // 3️⃣ Crear factura
  mysqli_query($conexion,"
    INSERT INTO tabla_factura
    (id_cliente,id_productos,cantidad,precio_unitario,total,fecha)
    VALUES
    ('$id_cliente','$id_producto','$cantidad','$precio','$total',NOW())
  ");

  // 4️⃣ Registrar salida en inventario CON precio_compra real
  mysqli_query($conexion,"
    INSERT INTO tabla_inventario
    (id_productos,cantidad,tipo_movimiento,precio_entrada,precio_venta,fecha_movimiento)
    VALUES
    ('$id_producto','$cantidad','salida','$precio_compra','$precio',NOW())
  ");

  // 5️⃣ Actualizar stock
  mysqli_query($conexion,"
    UPDATE tabla_productos
    SET stock_producto = stock_producto - $cantidad
    WHERE id_productos='$id_producto'
  ");

  mysqli_commit($conexion);

  $id_factura = mysqli_insert_id($conexion);

  echo json_encode([
    "estado"    => "ok",
    "mensaje"   => "Factura creada correctamente",
    "id_factura"=> $id_factura
  ]);

} catch(Exception $e){

  mysqli_rollback($conexion);

  echo json_encode([
    "estado"  => "error",
    "mensaje" => $e->getMessage()
  ]);
}
?>