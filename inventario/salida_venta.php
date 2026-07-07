<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include("../conexion.php");

$data = json_decode(file_get_contents("php://input"), true);

$id_producto = $data['id_producto'];
$cantidad = $data['cantidad'];
$precio_venta = $data['precio'];

mysqli_begin_transaction($conexion);

try {

  // obtener producto
  $sql = "SELECT stock_producto, precio_producto 
          FROM tabla_productos 
          WHERE id_productos='$id_producto' FOR UPDATE";

  $res = mysqli_query($conexion, $sql);
  $producto = mysqli_fetch_assoc($res);

  if(!$producto){
    throw new Exception("Producto no existe");
  }

  $stock = $producto['stock_producto'];

  if($cantidad > $stock){
    throw new Exception("No hay stock suficiente");
  }

  // actualizar stock
  $nuevo_stock = $stock - $cantidad;

  mysqli_query($conexion,"
    UPDATE tabla_productos
    SET stock_producto='$nuevo_stock'
    WHERE id_productos='$id_producto'
  ");

  // registrar inventario
  mysqli_query($conexion,"
    INSERT INTO tabla_inventario
    (id_productos,cantidad,tipo_movimiento,precio_entrada,precio_venta,fecha_movimiento)
    VALUES
    ('$id_producto','$cantidad','salida','0','$precio_venta',NOW())
  ");

  mysqli_commit($conexion);

  echo json_encode([
    "estado"=>"ok",
    "mensaje"=>"Salida registrada y stock actualizado"
  ]);

} catch (Exception $e){

  mysqli_rollback($conexion);

  echo json_encode([
    "estado"=>"error",
    "mensaje"=>$e->getMessage()
  ]);

}