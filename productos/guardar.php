<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include("../conexion.php");

$data = json_decode(file_get_contents("php://input"), true);

if(!$data){
 echo json_encode([
  "success"=>false,
  "error"=>"No llegaron datos"
 ]);
 exit;
}

$nombre = $data["nombre_producto"];
$descripcion = $data["descripcion_producto"];
$precio = $data["precio_salida"];
$precio_compra = $data["precio_compra"];
$stock_ingresado = isset($data["stock_minimo"]) ? intval($data["stock_minimo"]) : 0; // 🔥 Captura el número que pusiste en el input "Stock" de tu formulario
$id_proveedor = $data["id_proveedor"];

if($nombre=="" || $precio=="" || $precio_compra=="" || $id_proveedor==""){
 echo json_encode([
  "success"=>false,
  "error"=>"Campos vacíos"
 ]);
 exit;
}

// 1. Insertamos el producto en la tabla_productos (dejamos stock_minimo en 0 o el valor ingresado)
$sql = "INSERT INTO tabla_productos
(nombre_producto, descripcion_producto, precio_salida, precio_compra, stock_minimo, id_proveedor)
VALUES
('$nombre', '$descripcion', '$precio', '$precio_compra', '$stock_ingresado', '$id_proveedor')";

$resultado = $conexion->query($sql);

if(!$resultado){
 echo json_encode([
  "success"=>false,
  "error"=>$conexion->error,
  "sql"=>$sql
 ]);
 exit;
}

// 2. Obtenemos el ID del producto que se acaba de crear
$id_producto_nuevo = mysqli_insert_id($conexion);

// 3. 🔥 ¡Aquí está la solución! Insertamos ese mismo número en la tabla de inventario como una 'entrada'
if($stock_ingresado > 0){
 $sql_movimiento = "INSERT INTO tabla_inventario 
 (id_productos, cantidad, tipo_movimiento, precio_entrada, precio_venta, fecha_movimiento)
 VALUES 
 ('$id_producto_nuevo', '$stock_ingresado', 'entrada', '$precio_compra', '$precio', NOW())";
 
 $resultado_movimiento = $conexion->query($sql_movimiento);
 
 if(!$resultado_movimiento){
  echo json_encode([
   "success"=>true,
   "id"=>$id_producto_nuevo,
   "warning"=>"Producto creado, pero hubo un error al impactar el stock en el inventario: " . $conexion->error
  ]);
  exit;
 }
}

// Respuesta exitosa para React
echo json_encode([
 "success"=>true,
 "id"=>$id_producto_nuevo
]);

?>