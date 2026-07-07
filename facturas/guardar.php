<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

include("../conexion.php");

$data = json_decode(file_get_contents("php://input"), true);

if(
  !isset($data["cliente"]) ||
  !isset($data["id_usuario"]) ||
  !isset($data["productos"])
){
  echo json_encode(["success"=>false,"mensaje"=>"Datos incompletos"]);
  exit;
}

$cliente = $data["cliente"];
$id_usuario = $data["id_usuario"];
$productos = $data["productos"];

$subtotalFactura = isset($data["subtotal"]) ? (float)$data["subtotal"] : 0;
$ivaFactura = isset($data["iva"]) ? (float)$data["iva"] : 0;
$totalFactura = isset($data["total"]) ? (float)$data["total"] : ($subtotalFactura + $ivaFactura);

$conexion->query("ALTER TABLE tabla_factura ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) NOT NULL DEFAULT 0");
$conexion->query("ALTER TABLE tabla_factura ADD COLUMN IF NOT EXISTS iva DECIMAL(12,2) NOT NULL DEFAULT 0");
$conexion->query("ALTER TABLE tabla_factura ADD COLUMN IF NOT EXISTS total DECIMAL(12,2) NOT NULL DEFAULT 0");

// INSERT FACTURA
$sql = "INSERT INTO tabla_factura (id_cliente,id_usuario,fecha_emision,subtotal,iva,total) 
VALUES ('$cliente','$id_usuario',CURDATE(),'$subtotalFactura','$ivaFactura','$totalFactura')";

if (!$conexion->query($sql)) {
  echo json_encode(["success"=>false,"mensaje"=>$conexion->error]);
  exit;
}

$id_factura = $conexion->insert_id;

// DETALLE + INVENTARIO
foreach($productos as $p){

  $id_producto = $p["id_producto"];
  $cantidad = $p["cantidad"];
  $precio = $p["precio"];
  $subtotal_detalle = $cantidad * $precio;

  // Buscar precio de compra real del producto
  $consultaProducto = $conexion->query("
    SELECT precio_compra, precio_salida
    FROM tabla_productos
    WHERE id_productos = '$id_producto'
  ");

  if (!$consultaProducto || $consultaProducto->num_rows === 0) {
    echo json_encode([
      "success"=>false,
      "mensaje"=>"No se encontró el producto con ID $id_producto"
    ]);
    exit;
  }

  $productoBD = $consultaProducto->fetch_assoc();

  $precio_compra = $productoBD["precio_compra"] ?? 0;

  if (!$precio || $precio == 0) {
    $precio = $productoBD["precio_salida"] ?? 0;
  }

  if (!$conexion->query("INSERT INTO tabla_detalle_factura
    (id_factura,id_productos,cantidad,precio_unitario,subtotal)
    VALUES ('$id_factura','$id_producto','$cantidad','$precio','$subtotal_detalle')
  ")) {
    echo json_encode(["success"=>false,"mensaje"=>$conexion->error]);
    exit;
  }

  // Registrar salida en inventario con precio compra real
  if (!$conexion->query("INSERT INTO tabla_inventario
    (id_productos,cantidad,tipo_movimiento,precio_entrada,precio_venta,fecha_movimiento,observacion)
    VALUES ('$id_producto','$cantidad','salida','$precio_compra','$precio',NOW(),'Factura #$id_factura')
  ")) {
    echo json_encode(["success"=>false,"mensaje"=>$conexion->error]);
    exit;
  }
}

echo json_encode([
  "success"=>true,
  "id_factura"=>$id_factura
]);
?>